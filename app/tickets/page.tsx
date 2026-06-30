"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const events = [
  {
    title: "Afro Topia Music Festival",
    date: "Sat, Jul 12 · 4:00 PM",
    location: "Kasarani, Nairobi",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80",
    tag: "Music",
    tagColor: "bg-green-400 text-black",
    tickets: [
      { type: "Regular", price: 500, desc: "General admission" },
      { type: "VIP", price: 1500, desc: "VIP lounge + free drinks" },
      { type: "VVIP", price: 3000, desc: "Front row + meet and greet" },
    ],
  },
  {
    title: "Nairobi Tech Hackathon",
    date: "Fri, Jul 18 · 9:00 AM",
    location: "iHub, Nairobi",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    tag: "Tech",
    tagColor: "bg-purple-500 text-white",
    tickets: [
      { type: "Regular", price: 0, desc: "Free entry" },
      { type: "Premium", price: 500, desc: "Premium seat + lunch" },
    ],
  },
  {
    title: "Nairobi Street Food Festival",
    date: "Sat, Jul 19 · 10:00 AM",
    location: "ASK Showgrounds, Nairobi",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
    tag: "Food",
    tagColor: "bg-orange-400 text-black",
    tickets: [
      { type: "Regular", price: 200, desc: "General admission" },
      { type: "Family", price: 600, desc: "Entry for 4 people" },
    ],
  },
  {
    title: "Blankets and Wine",
    date: "Sun, Jul 20 · 12:00 PM",
    location: "Nairobi Arboretum",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&q=80",
    tag: "Music",
    tagColor: "bg-green-400 text-black",
    tickets: [
      { type: "Regular", price: 1500, desc: "General admission" },
      { type: "VIP", price: 3500, desc: "VIP tent + drinks" },
    ],
  },
  {
    title: "Comedy Night Nairobi",
    date: "Fri, Jul 25 · 7:00 PM",
    location: "Carnivore, Nairobi",
    image: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80",
    tag: "Comedy",
    tagColor: "bg-yellow-400 text-black",
    tickets: [
      { type: "Regular", price: 800, desc: "General admission" },
      { type: "VIP", price: 2000, desc: "VIP table for 2 + dinner" },
    ],
  },
  {
    title: "Nairobi Marathon 2026",
    date: "Sun, Aug 3 · 6:00 AM",
    location: "Uhuru Park, Nairobi",
    image: "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=600&q=80",
    tag: "Sports",
    tagColor: "bg-blue-400 text-white",
    tickets: [
      { type: "5KM Run", price: 300, desc: "5KM fun run" },
      { type: "10KM Run", price: 500, desc: "10KM competitive run" },
      { type: "Full Marathon", price: 1000, desc: "42KM full marathon" },
    ],
  },
];

export default function TicketsPage() {
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [selectedTicket, setSelectedTicket] = useState(events[0].tickets[0]);
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

  const total = selectedTicket.price * quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("orders")
      .insert([{
        event_title: selectedEvent.title,
        ticket_type: selectedTicket.type,
        quantity: quantity,
        total: total,
        name: form.name,
        email: form.email,
        phone: form.phone,
        payment_method: form.payment,
      }]);
    if (error) {
      console.error("Error saving order:", error);
      alert("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  const inputClass = "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition w-full";

  if (submitted) {
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
              <span className="text-gray-500 text-xs">Ticket</span>
              <span className="text-white text-xs font-medium">{selectedTicket.type}</span>
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
            onClick={() => { setSubmitted(false); setStep(1); setQuantity(1); }}
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
          {["Select Event", "Choose Ticket", "Your Details"].map((label, i) => (
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
                      key={event.title}
                      onClick={() => {
                        setSelectedEvent(event);
                        setSelectedTicket(event.tickets[0]);
                        setQuantity(1);
                      }}
                      className={"flex gap-4 items-center bg-white/5 border rounded-2xl p-4 text-left transition w-full " +
                        (selectedEvent.title === event.title
                          ? "border-green-400/60 shadow-lg shadow-green-400/5"
                          : "border-white/10 hover:border-white/20")}>
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={"text-xs font-bold px-2 py-0.5 rounded-full mb-1 inline-block " + event.tagColor}>
                          {event.tag}
                        </span>
                        <h3 className="text-white font-semibold text-sm truncate">{event.title}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{event.date}</p>
                        <p className="text-gray-500 text-xs">{event.location}</p>
                      </div>
                      <div className={"w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center " +
                        (selectedEvent.title === event.title ? "border-green-400 bg-green-400" : "border-white/20")}>
                        {selectedEvent.title === event.title && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="mt-6 bg-green-400 text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition w-full">
                  Continue to Ticket Selection
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <button onClick={() => setStep(1)} className="text-gray-500 text-sm mb-6 flex items-center gap-2 hover:text-white transition">
                  Back to events
                </button>
                <h2 className="text-white font-bold text-lg mb-6">Choose your ticket</h2>
                <div className="flex flex-col gap-4 mb-6">
                  {selectedEvent.tickets.map((ticket) => (
                    <button
                      key={ticket.type}
                      onClick={() => setSelectedTicket(ticket)}
                      className={"flex items-center justify-between bg-white/5 border rounded-2xl p-5 text-left transition w-full " +
                        (selectedTicket.type === ticket.type
                          ? "border-green-400/60 shadow-lg shadow-green-400/5"
                          : "border-white/10 hover:border-white/20")}>
                      <div className="flex items-center gap-4">
                        <div className={"w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 " +
                          (selectedTicket.type === ticket.type ? "border-green-400 bg-green-400" : "border-white/20")}>
                          {selectedTicket.type === ticket.type && (
                            <div className="w-2 h-2 rounded-full bg-black" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{ticket.type}</p>
                          <p className="text-gray-500 text-xs">{ticket.desc}</p>
                        </div>
                      </div>
                      <span className="text-green-400 font-bold text-sm">
                        {ticket.price === 0 ? "Free" : "KES " + ticket.price.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
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
            {step === 3 && (
              <div>
                <button onClick={() => setStep(2)} className="text-gray-500 text-sm mb-6 flex items-center gap-2 hover:text-white transition">
                  Back to tickets
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
                        { id: "mpesa", label: "M-Pesa", emoji: "📱" },
                        { id: "card", label: "Card", emoji: "💳" },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setForm({ ...form, payment: method.id })}
                          className={"flex items-center gap-3 border rounded-xl p-4 transition " +
                            (form.payment === method.id
                              ? "border-green-400/60 bg-green-400/5"
                              : "border-white/10 hover:border-white/20")}>
                          <span className="text-xl">{method.emoji}</span>
                          <span className="text-white text-sm font-medium">{method.label}</span>
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-white font-bold mb-4">Order Summary</h3>
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-32 object-cover rounded-xl mb-4"
              />
              <h4 className="text-white font-semibold text-sm mb-1">{selectedEvent.title}</h4>
              <p className="text-gray-500 text-xs mb-0.5">{selectedEvent.date}</p>
              <p className="text-gray-500 text-xs mb-4">{selectedEvent.location}</p>
              <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Ticket Type</span>
                  <span className="text-white text-xs font-medium">{selectedTicket.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Price</span>
                  <span className="text-white text-xs font-medium">
                    {selectedTicket.price === 0 ? "Free" : "KES " + selectedTicket.price.toLocaleString()}
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
          </div>

        </div>
      </div>
    </div>
  );
}