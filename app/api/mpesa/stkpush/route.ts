import { NextRequest, NextResponse } from "next/server";
import { initiateStkPush } from "@/lib/mpesa";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { orderId, phone, amount, eventTitle } = await request.json();

    if (!orderId || !phone || !amount) {
      return NextResponse.json(
        { error: "orderId, phone, and amount are required" },
        { status: 400 }
      );
    }

    const result = await initiateStkPush({
      phone,
      amount,
      accountReference: "TicketWaveKE",
      description: eventTitle || "Event ticket",
    });

    // Save the CheckoutRequestID so the callback (and our polling endpoint)
    // can match Safaricom's response back to this specific order.
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        checkout_request_id: result.CheckoutRequestID,
        payment_status: "pending",
      })
      .eq("id", orderId);

    if (error) {
      console.error("Failed to save checkout_request_id:", error);
    }

    return NextResponse.json({
      checkoutRequestId: result.CheckoutRequestID,
      message: result.CustomerMessage,
    });
  } catch (err) {
    console.error("STK push error:", err);
    const message = err instanceof Error ? err.message : "Payment request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
