"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const benefits = [
  {
    emoji: "🚀",
    title: "Reach Thousands",
    desc: "Get your event in front of thousands of young Kenyans actively looking for experiences.",
    color: "border-green-400/20 hover:border-green-400/60",
    accent: "text-green-400",
  },
  {
    emoji: "🎟️",
    title: "Sell Tickets Online",
    desc: "Accept payments via M-Pesa, card and more. Get paid directly to your account.",
    color: "border-purple-400/20 hover:border-purple-400/60",
    accent: "text-purple-400",
  },
  {
    emoji: "📊",
    title: "Track Your Sales",
    desc: "Real-time dashboard showing ticket sales, revenue and attendee numbers.",
    color: "border-green-400/20 hover:border-green-400/60",
    accent: "text-green-400",
  },
  {
    emoji: "✅",
    title: "Easy Verification",
    desc: "Scan tickets at the gate with our mobile app. No printing needed.",
    color: "border-purple-400/20 hover:border-purple-400/60",
    accent: "text-purple-400",
  },
  {
    emoji: "📣",
    title: "Free Promotion",
    desc: "We promote your event on our platform and social media channels at no extra cost.",
    color: "border-green-400/20 hover:border-green-400/60",
    accent: "text-green-400",
  },
  {
    emoji: "💬",
    title: "Dedicated Support",
    desc: "Our team is available to help you set up and manage your event from start to finish.",
    color: "border-purple-400/20 hover:border-purple-400/60",
    accent: "text-purple-400",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up as an event planner in minutes. No setup fee required.",
    color: "text-green-400",
  },
  {
    step: "02",
    title: "List your event",
    desc: "Fill in your event details — date, venue, ticket price and description.",
    color: "text-purple-400",
  },
  {
    step: "03",
    title: "Get approved",
    desc: "Our team reviews your event within 24 hours and publishes it live.",
    color: "text-green-400",
  },
  {
    step: "04",
    title: "Start selling",
    desc: "Your event goes live and tickets start selling. Watch the sales roll in.",
    color: "text-purple-400",
  },
];

const faqs = [
  {
    q: "How much does it cost to list an event?",
    a: "Listing your event on TicketWave KE is completely free. We only charge a small service fee on paid tickets sold.",
  },
  {
    q: "How do I receive my payments?",
    a: "Payments are sent directly to your M-Pesa or bank account within 48 hours after your event ends.",
  },
  {
    q: "How long does event approval take?",
    a: "Our team reviews and approves events within 24 hours of submission.",
  },
  {
    q: "Can I edit my event after it goes live?",
    a: "Yes, you can edit event details anytime from your planner dashboard. Major changes may require re-approval.",
  },
  {
    q: "What types of events can I list?",
    a: "All types — concerts, hackathons, food festivals, sports, comedy, networking events and more.",
  },
];

export default function PlannersPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventName: "",
    eventType: "",
    eventDate: "",
    eventLocation: "",
    eventPrice: "",
    expectedAttendance: "",
    eventDescription: "",
    eventImage: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("planner_applications")
      .insert([{
        name: form.name,
        email: form.email,
        phone: form.phone,
        event_name: form.eventName,
        event_type: form.eventType,
        event_date: form.eventDate,
        event_location: form.eventLocation,
        event_price: parseInt(form.eventPrice) || 0,
        expected_attendance: parseInt(form.expectedAttendance) || 0,
        description: form.eventDescription,
        event_image: form.eventImage,
        message: form.message,
      }]);
    if (error) {
      console.error("Error saving application:", error);
      alert("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  const inputClass = "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* HERO */}
      <section className="relative px-6 py-24 text-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-purple-400 border border-purple-400/30 bg-purple-400/10 px-4 py-1.5 rounded-full mb-6">
            For Event Planners
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
            Grow your event.<br />
            <span className="text-green-400">Reach more people.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join hundreds of event planners already using TicketWave KE to sell tickets,
            manage attendees and grow their audience across Kenya.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#apply" className="bg-green-400 text-black px-8 py-3.5 rounded-full text-sm font-bold hover:bg-green-300 transition">
              Apply as a Planner
            </a>
            <a href="#how-it-works" className="border border-white/20 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/5 transition">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-3 border-b border-white/10">
        <div className="flex flex-col items-center justify-center py-12 border-r border-white/10">
          <span className="text-4xl font-bold text-green-400">200+</span>
          <span className="text-sm text-gray-500 mt-2">Active Planners</span>
        </div>
        <div className="flex flex-col items-center justify-center py-12 border-r border-white/10">
          <span className="text-4xl font-bold text-green-400">50K+</span>
          <span className="text-sm text-gray-500 mt-2">Tickets Sold</span>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <span className="text-4xl font-bold text-green-400">47</span>
          <span className="text-sm text-gray-500 mt-2">Counties Covered</span>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="px-6 py-20 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-2">Why list on TicketWave KE?</h2>
            <p className="text-gray-500 text-sm">Everything you need to run a successful event</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className={"bg-white/5 border rounded-2xl p-6 transition " + b.color}>
                <span className="text-3xl mb-4 block">{b.emoji}</span>
                <h3 className={"font-bold text-lg mb-2 " + b.accent}>{b.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-20 border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-2">How it works</h2>
            <p className="text-gray-500 text-sm">Get your event live in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <span className={"text-5xl font-bold mb-4 opacity-30 " + item.color}>
                  {item.step}
                </span>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-2">Frequently asked questions</h2>
            <p className="text-gray-500 text-sm">Everything you need to know</p>
          </div>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="text-white font-medium text-sm">{faq.q}</span>
                  <span className="text-green-400 text-xl">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply" className="px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Apply as a Planner</h2>
            <p className="text-gray-500 text-sm">Fill in the form and we will get back to you within 24 hours</p>
          </div>

          {submitted ? (
            <div className="bg-green-400/10 border border-green-400/30 rounded-2xl p-10 text-center">
              <span className="text-5xl mb-4 block">🎉</span>
              <h3 className="text-green-400 font-bold text-xl mb-2">Application Received!</h3>
              <p className="text-gray-400 text-sm">
                Thanks for applying! Our team will review your application and get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-5">

              <h3 className="text-white font-bold text-lg mb-2">Your Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Felix Muthoka"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</label>
                  <input
                    required
                    type="email"
                    placeholder="mrfelloh254@gmail.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="+254 7XXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="border-t border-white/10 pt-5">
                <h3 className="text-white font-bold text-lg mb-5">Event Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Event Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Name of your event"
                    value={form.eventName}
                    onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Event Type</label>
                  <select
                    required
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-400/50 transition">
                    <option value="">Select type...</option>
                    <option>Music & Concert</option>
                    <option>Tech & Hackathon</option>
                    <option>Food & Drinks</option>
                    <option>Sports & Fitness</option>
                    <option>Art & Culture</option>
                    <option>Comedy & Theatre</option>
                    <option>Networking</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Event Date and Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-400/50 transition"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Location / Venue</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Carnivore, Nairobi"
                    value={form.eventLocation}
                    onChange={(e) => setForm({ ...form, eventLocation: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ticket Price (KES)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="0 for free events"
                    value={form.eventPrice}
                    onChange={(e) => setForm({ ...form, eventPrice: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Expected Attendance</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={form.expectedAttendance}
                    onChange={(e) => setForm({ ...form, expectedAttendance: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Event Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/your-event-poster.jpg"
                  value={form.eventImage}
                  onChange={(e) => setForm({ ...form, eventImage: e.target.value })}
                  className={inputClass}
                />
                {form.eventImage && (
                  <img
                    src={form.eventImage}
                    alt="Event preview"
                    className="w-full h-40 object-cover rounded-xl mt-2 border border-white/10"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <p className="text-xs text-gray-600">Paste a link to your event poster or banner. If left empty we will use a default image.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Event Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what your event is about..."
                  value={form.eventDescription}
                  onChange={(e) => setForm({ ...form, eventDescription: e.target.value })}
                  className={inputClass + " resize-none"}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Additional Message</label>
                <textarea
                  rows={3}
                  placeholder="Anything else you want us to know..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className={inputClass + " resize-none"}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-400 text-black py-3.5 rounded-full font-bold text-sm hover:bg-green-300 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Submitting..." : "Submit Application"}
              </button>

            </form>
          )}
        </div>
      </section>

    </div>
  );
}