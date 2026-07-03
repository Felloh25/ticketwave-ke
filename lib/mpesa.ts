// Server-side only — never import this from a "use client" file.
// Handles talking to Safaricom's Daraja API (M-Pesa).

const BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

/**
 * Gets a short-lived OAuth token from Daraja using the Consumer Key/Secret.
 * Required before any other Daraja call.
 */
export async function getMpesaAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get M-Pesa access token: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Formats a Kenyan phone number into the 2547XXXXXXXX format Daraja expects.
 * Accepts 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX, or 7XXXXXXXX.
 */
export function formatPhoneForMpesa(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
}

function darajaTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export type StkPushResult = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
};

/**
 * Triggers the STK push — the "enter your M-Pesa PIN" prompt that pops up
 * on the customer's phone. amount is a whole number of KES (M-Pesa doesn't
 * support decimals). accountReference shows up on the customer's phone.
 */
export async function initiateStkPush({
  phone,
  amount,
  accountReference,
  description,
}: {
  phone: string;
  amount: number;
  accountReference: string;
  description: string;
}): Promise<StkPushResult> {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const callbackUrl = process.env.MPESA_CALLBACK_URL!;
  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
    "base64"
  );

  const accessToken = await getMpesaAccessToken();
  const formattedPhone = formatPhoneForMpesa(phone);

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference.slice(0, 12),
      TransactionDesc: description.slice(0, 13),
    }),
  });

  const data = await res.json();

  if (!res.ok || data.errorCode) {
    throw new Error(data.errorMessage || "STK push request failed");
  }

  return data as StkPushResult;
}
