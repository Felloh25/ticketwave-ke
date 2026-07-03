"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  tag: string;
  image_url: string;
  status: string;
};

const tagColors: Record<string, string> = {
  Music: "bg-green-400 text-black",
  Tech: "bg-purple-500 text-white",
  Food: "bg-orange-400 text-black",
  Sports: "bg-blue-400 text-white",
  Art: "bg-pink-400 text-white",
  Comedy: "bg-yellow-400 text-black",
  Networking: "bg-purple-400 text-white",
};

function TicketsPageContent() {
  const searchParams = useSearchParams();
  const preselectedTitle = searchParams.get("event");

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    payment: "mpesa",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
      } else {
        const list = data || [];
        setEvents(list);

        // If we arrived via a "Get tickets" link from the events page,
        // preselect that event and skip straight to ticket selection.
        if (preselectedTitle) {
          const match = list.find((e) => e.title === preselectedTitle);
          if (match) {
            setSelectedEvent(match);
            setStep(2);
          }
        }
      }
      setLoadingEvents(false);
    }
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = selectedEvent ? selectedEvent.price * quantity : 0;

  const [paymentStage, setPaymentStage] = useState<
    "idle" | "waiting" | "failed"
  >("idle");
  const [paymentError, setPaymentError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvent) return;

    setLoading(true);
    setPaymentError("");

    // Free events skip M-Pesa entirely — just confirm immediately.
    if (total === 0) {
      const { error } = await supabase.from("orders").insert([{
        event_title: selectedEvent.title,
        ticket_type: "Regular",
        quantity: quantity,
        total: total,
        name: form.name,
        email: form.email,
        phone: form.phone,
        payment_method: form.payment,
        payment_status: "completed",
      }]);
      setLoading(false);
      if (error) {
        alert("Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
      return;
    }

    if (form.payment === "card") {
      alert("Card payments aren't available yet — please choose M-Pesa for now.");
      setLoading(false);
      return;
    }

    // 1. Create the order first (payment_status defaults to "pending"),
    //    so we have an ID to link the M-Pesa transaction to.
    const { data: order, error: insertError } = await supabase
      .from("orders")
      .insert([{
        event_title: selectedEvent.title,
        ticket_type: "Regular",
        quantity: quantity,
        total: total,
        name: form.name,
        email: form.email,
        phone: form.phone,
        payment_method: form.payment,
        payment_status: "pending",
      }])
      .select()
      .single();

    if (insertError || !order) {
      console.error("Error saving order:", insertError);
      alert("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Trigger the STK push — this makes the M-Pesa PIN prompt pop up
    //    on the customer's phone.
    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          phone: form.phone,
          amount: total,
          eventTitle: selectedEvent.title,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start payment");
      }

      setLoading(false);
      setPaymentStage("waiting");
      pollPaymentStatus(order.id);
    } catch (err) {
      console.error("STK push error:", err);
      setPaymentError(
        err instanceof Error ? err.message : "Failed to start payment"
      );
      setPaymentStage("failed");
      setLoading(false);
    }
  }

  // 3. Poll our own /api/mpesa/status endpoint every 3s to see whether
  //    Safaricom's callback has confirmed the payment yet. Gives up after
  //    ~2 minutes (most STK prompts time out around then anyway).
  function pollPaymentStatus(orderId: string) {
    const maxAttempts = 40;
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/mpesa/status?orderId=${orderId}`);
        const data = await res.json();

        if (data.payment_status === "completed") {
          clearInterval(interval);
          setSubmitted(true);
        } else if (data.payment_status === "failed") {
          clearInterval(interval);
          setPaymentError("Payment was cancelled or declined. Please try again.");
          setPaymentStage("failed");
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPaymentError("We didn't receive confirmation in time. If money left your account, contact support — otherwise please try again.");
          setPaymentStage("failed");
        }
      } catch (err) {
        console.error("Status poll error:", err);
      }
    }, 3000);
  }

  const inputClass = "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition w-full";

  if (loadingEvents) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-white font-semibold mb-2">No events available right now</p>
          <p className="text-gray-500 text-sm">Check back soon — new events are added regularly.</p>
        </div>
      </div>
    );
  }

  if (paymentStage === "waiting" && selectedEvent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="bg-white/5 border border-green-400/30 rounded-2xl p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-green-400/20 border-t-green-400 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Check your phone</h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            We&apos;ve sent an M-Pesa prompt to <span className="text-green-400">{form.phone}</span>.
            Enter your PIN to complete payment of{" "}
            <span className="text-white font-medium">KES {total.toLocaleString()}</span>.
          </p>
          <p className="text-gray-600 text-xs">This page will update automatically once payment is confirmed.</p>
        </div>
      </div>
    );
  }

  if (paymentStage === "failed") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="bg-white/5 border border-red-500/30 rounded-2xl p-12 text-center max-w-md w-full">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Not Completed</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">{paymentError}</p>
          <button
            onClick={() => { setPaymentStage("idle"); setPaymentError(""); }}
            className="bg-green-400 text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition w-full">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (submitted && selectedEvent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="bg-white/5 border border-green-400/30 rounded-2xl p-12 text-center max-w-md w-full">
          <span className="text-6xl mb-6 block">🎟️</span>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Ticket Confirmed!</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Your ticket for <span className="text-white font-medium">{selectedEvent.title}</span> has been booked.
            Check your email at <span className="text-green-400">{form.email}</span> for your e-ticket.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 text-xs">Event</span>
              <span className="text-white text-xs font-medium">{selectedEvent.title}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 text-xs">Quantity</span>
              <span className="text-white text-xs font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-gray-500 text-xs">Total Paid</span>
              <span className="text-green-400 text-xs font-bold">
                {total === 0 ? "Free" : "KES " + total.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setQuantity(1); setSelectedEvent(null); }}
            className="bg-green-400 text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition w-full">
            Book Another Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* HEADER */}
      <section className="relative px-6 py-16 text-center border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-400/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-green-400 border border-green-400/30 bg-green-400/10 px-4 py-1.5 rounded-full mb-4">
            Get Tickets
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            Book your experience
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Secure your spot at the best events across Kenya. Instant e-ticket delivery.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {["Select Event", "Quantity", "Your Details"].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition " +
                  (step >= i + 1 ? "bg-green-400 text-black" : "bg-white/10 text-gray-500")}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={"text-xs font-medium transition " +
                  (step === i + 1 ? "text-white" : "text-gray-600")}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className="w-12 h-px bg-white/10" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* MAIN CONTENT */}
          <div className="md:col-span-2">

            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <h2 className="text-white font-bold text-lg mb-6">Select an event</h2>
                <div className="flex flex-col gap-4">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setQuantity(1);
                      }}
                      className={"flex gap-4 items-center bg-white/5 border rounded-2xl p-4 text-left transition w-full " +
                        (selectedEvent?.id === event.id
                          ? "border-green-400/60 shadow-lg shadow-green-400/5"
                          : "border-white/10 hover:border-white/20")}>
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={"text-xs font-bold px-2 py-0.5 rounded-full mb-1 inline-block " + (tagColors[event.tag] || "bg-gray-400 text-black")}>
                          {event.tag}
                        </span>
                        <h3 className="text-white font-semibold text-sm truncate">{event.title}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{event.date}</p>
                        <p className="text-gray-500 text-xs">{event.location}</p>
                      </div>
                      <div className={"w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center " +
                        (selectedEvent?.id === event.id ? "border-green-400 bg-green-400" : "border-white/20")}>
                        {selectedEvent?.id === event.id && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => selectedEvent && setStep(2)}
                  disabled={!selectedEvent}
                  className="mt-6 bg-green-400 text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition w-full disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue to Quantity
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && selectedEvent && (
              <div>
                <button onClick={() => setStep(1)} className="text-gray-500 text-sm mb-6 flex items-center gap-2 hover:text-white transition">
                  Back to events
                </button>
                <h2 className="text-white font-bold text-lg mb-6">How many tickets?</h2>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-white font-medium text-sm">Regular Ticket</p>
                    <span className="text-green-400 font-bold text-sm">
                      {selectedEvent.price === 0 ? "Free" : "KES " + selectedEvent.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm mb-4">Quantity</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-full border border-white/10 text-white flex items-center justify-center hover:border-green-400/40 transition text-lg">
                      -
                    </button>
                    <span className="text-white font-bold text-lg w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="w-9 h-9 rounded-full border border-white/10 text-white flex items-center justify-center hover:border-green-400/40 transition text-lg">
                      +
                    </button>
                    <span className="text-gray-500 text-xs">Max 10 tickets</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="bg-green-400 text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition w-full">
                  Continue to Your Details
                </button>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && selectedEvent && (
              <div>
                <button onClick={() => setStep(2)} className="text-gray-500 text-sm mb-6 flex items-center gap-2 hover:text-white transition">
                  Back to quantity
                </button>
                <h2 className="text-white font-bold text-lg mb-6">Your details</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-400 uppercase tracking-wider">Full Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Kamau"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
                      <input
                        required
                        type="email"
                        placeholder="john@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Phone Number</label>
                    <input
                      required
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "mpesa", label: "M-Pesa", emoji: "📱", disabled: false },
                        { id: "card", label: "Card", emoji: "💳", disabled: true },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          disabled={method.disabled}
                          onClick={() => setForm({ ...form, payment: method.id })}
                          className={"relative flex items-center gap-3 border rounded-xl p-4 transition " +
                            (method.disabled
                              ? "border-white/5 opacity-40 cursor-not-allowed"
                              : form.payment === method.id
                              ? "border-green-400/60 bg-green-400/5"
                              : "border-white/10 hover:border-white/20")}>
                          <span className="text-xl">{method.emoji}</span>
                          <span className="text-white text-sm font-medium">{method.label}</span>
                          {method.disabled && (
                            <span className="absolute -top-2 -right-2 text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                              Soon
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-400 text-black py-3.5 rounded-full font-bold text-sm hover:bg-green-300 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? "Processing..." : total === 0
                      ? "Confirm Free Ticket"
                      : "Pay KES " + total.toLocaleString() + " via " + (form.payment === "mpesa" ? "M-Pesa" : "Card")}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div className="md:col-span-1">
            {selectedEvent ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                <h3 className="text-white font-bold mb-4">Order Summary</h3>
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="w-full h-32 object-cover rounded-xl mb-4"
                />
                <h4 className="text-white font-semibold text-sm mb-1">{selectedEvent.title}</h4>
                <p className="text-gray-500 text-xs mb-0.5">{selectedEvent.date}</p>
                <p className="text-gray-500 text-xs mb-4">{selectedEvent.location}</p>
                <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Price</span>
                    <span className="text-white text-xs font-medium">
                      {selectedEvent.price === 0 ? "Free" : "KES " + selectedEvent.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs">Quantity</span>
                    <span className="text-white text-xs font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/10 mt-1">
                    <span className="text-white text-sm font-bold">Total</span>
                    <span className="text-green-400 text-sm font-bold">
                      {total === 0 ? "Free" : "KES " + total.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-green-400">🔒</span>
                    Secure checkout — TicketWave KE
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-500 text-sm">
                Select an event to see your order summary
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    }>
      <TicketsPageContent />
    </Suspense>
  );
}
