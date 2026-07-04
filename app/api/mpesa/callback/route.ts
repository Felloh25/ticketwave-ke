import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Safaricom calls this URL automatically after the customer enters their
// PIN (or cancels/times out). It is NOT called by our own frontend.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ error: "Invalid callback payload" }, { status: 400 });
    }

    const checkoutRequestId = callback.CheckoutRequestID;
    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;

    // Logged so you can see the exact reason in Vercel's function logs.
    console.log("M-Pesa callback received:", JSON.stringify(callback));

    if (resultCode === 0) {
      // Payment succeeded — pull the receipt number out of the metadata array.
      const items: { Name: string; Value: string | number }[] =
        callback.CallbackMetadata?.Item || [];
      const getValue = (name: string) =>
        items.find((i) => i.Name === name)?.Value;

      const mpesaReceipt = getValue("MpesaReceiptNumber");

      await getSupabaseAdmin()
        .from("orders")
        .update({
          payment_status: "completed",
          mpesa_receipt: mpesaReceipt ? String(mpesaReceipt) : null,
          payment_result_desc: resultDesc,
        })
        .eq("checkout_request_id", checkoutRequestId);
    } else {
      // User cancelled, entered wrong PIN, timed out, insufficient funds, etc.
      // resultDesc holds Safaricom's human-readable reason — saved so it's
      // visible directly in the Supabase table instead of only in logs.
      await getSupabaseAdmin()
        .from("orders")
        .update({ payment_status: "failed", payment_result_desc: resultDesc })
        .eq("checkout_request_id", checkoutRequestId);
    }

    // Safaricom just needs a 200 response acknowledging receipt.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback error:", err);
    // Still return 200 so Safaricom doesn't endlessly retry a broken payload.
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
