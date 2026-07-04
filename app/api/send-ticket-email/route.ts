import { NextRequest, NextResponse } from "next/server";

type TicketEmailPayload = {
  email: string;
  name: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  quantity: number;
  total: number;
  ticketType: string;
};

function buildEmailHtml(data: TicketEmailPayload): string {
  const totalDisplay = data.total === 0 ? "Free" : `KES ${data.total.toLocaleString()}`;

  return `
  <div style="background:#0a0a0a;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:32px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
        <div style="width:32px;height:32px;background:#4ADE80;border-radius:8px;display:inline-block;text-align:center;line-height:32px;font-weight:bold;color:#000;">TW</div>
        <span style="color:#fff;font-size:18px;font-weight:bold;">TicketWave<span style="color:#4ADE80;">KE</span></span>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;">🎟️</div>
        <h1 style="color:#fff;font-size:22px;margin:8px 0;">Ticket Confirmed!</h1>
        <p style="color:#9ca3af;font-size:14px;">Hi ${data.name}, your ticket is booked.</p>
      </div>

      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;margin-bottom:16px;">
        <table style="width:100%;font-size:13px;color:#d1d5db;">
          <tr><td style="padding:6px 0;color:#6b7280;">Event</td><td style="padding:6px 0;text-align:right;color:#fff;font-weight:600;">${data.eventTitle}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Date</td><td style="padding:6px 0;text-align:right;">${data.eventDate}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Location</td><td style="padding:6px 0;text-align:right;">${data.eventLocation}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Ticket Type</td><td style="padding:6px 0;text-align:right;">${data.ticketType}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280;">Quantity</td><td style="padding:6px 0;text-align:right;">${data.quantity}</td></tr>
          <tr><td style="padding:10px 0 0;color:#6b7280;border-top:1px solid rgba(255,255,255,0.1);">Total Paid</td><td style="padding:10px 0 0;text-align:right;color:#4ADE80;font-weight:bold;border-top:1px solid rgba(255,255,255,0.1);">${totalDisplay}</td></tr>
        </table>
      </div>

      <p style="color:#6b7280;font-size:12px;text-align:center;">
        Please bring a valid ID to the event. See you there!
      </p>
    </div>
  </div>`;
}

export async function POST(request: NextRequest) {
  try {
    const payload: TicketEmailPayload = await request.json();

    if (!payload.email || !payload.eventTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set — skipping email send.");
      // Don't fail the whole checkout just because email isn't configured.
      return NextResponse.json({ skipped: true });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "TicketWave KE <onboarding@resend.dev>",
        to: [payload.email],
        subject: `Your ticket for ${payload.eventTitle} is confirmed!`,
        html: buildEmailHtml(payload),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return NextResponse.json({ error: data.message || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("send-ticket-email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
