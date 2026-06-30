"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaTiktok, FaXTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa6";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("contact_messages")
      .insert([{
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
      }]);
    if (error) {
      console.error("Error saving message:", error);
      alert("Something went wrong. Please try again.");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  const inputClass = "bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition w-full";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* HEADER */}
      <section className="relative px-6 py-20 text-center border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-400/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-green-400 border border-green-400/30 bg-green-400/10 px-4 py-1.5 rounded-full mb-4">
            Contact Us
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            Get in touch
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Have a question, suggestion or want to partner with us? We would love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* LEFT — CONTACT INFO */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Let us talk</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Whether you are an event organiser, a ticket buyer, or a potential partner,
                our team is ready to help you. Reach out through any of the channels below.
              </p>
            </div>

            {/* CONTACT CARDS */}
            <div className="flex flex-col gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-xl flex-shrink-0">
                  📧
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-white text-sm font-medium">mrfelloh254@gmail.com</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-xl flex-shrink-0">
                  📞
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="text-white text-sm font-medium">+254 741713619</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-xl flex-shrink-0">
                  📍
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Location</p>
                  <p className="text-white text-sm font-medium">Machakos, Kenya</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-400/10 border border-green-400/20 flex items-center justify-center text-xl flex-shrink-0">
                  🕐
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Working Hours</p>
                  <p className="text-white text-sm font-medium">Monday to Saturday, 7:30 AM to 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* SOCIAL LINKS */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Follow us</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-green-400/40 hover:text-green-400 transition">
                  <FaTiktok size={16} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-green-400/40 hover:text-green-400 transition">
                  <FaXTwitter size={16} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-green-400/40 hover:text-green-400 transition">
                  <FaInstagram size={16} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-green-400/40 hover:text-green-400 transition">
                  <FaWhatsapp size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — CONTACT FORM */}
          <div>
            {submitted ? (
              <div className="bg-green-400/10 border border-green-400/30 rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center">
                <span className="text-5xl mb-4 block">✅</span>
                <h3 className="text-green-400 font-bold text-xl mb-2">Message Sent!</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Thanks for reaching out! Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 text-xs text-green-400 border border-green-400/30 px-5 py-2 rounded-full hover:bg-green-400/10 transition">
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-5">
                <h3 className="text-white font-bold text-lg mb-2">Send us a message</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Your Name</label>
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
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Email</label>
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
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Subject</label>
                  <select
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-green-400/50 transition">
                    <option value="">Select a subject...</option>
                    <option>General Inquiry</option>
                    <option>Event Listing Support</option>
                    <option>Ticket Purchase Issue</option>
                    <option>Partnership Opportunity</option>
                    <option>Report a Problem</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 uppercase tracking-wider">Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={inputClass + " resize-none"}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-400 text-black py-3.5 rounded-full font-bold text-sm hover:bg-green-300 transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ STRIP */}
        <div className="mt-16 pt-16 border-t border-white/10">
          <h2 className="text-xl font-bold text-white mb-8 text-center">Quick answers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                q: "How do I buy a ticket?",
                a: "Browse events, click Get Ticket, choose your ticket type and pay via M-Pesa or card.",
                color: "text-green-400",
              },
              {
                q: "Can I get a refund?",
                a: "Refunds are available up to 48 hours before the event starts. Contact us to request one.",
                color: "text-purple-400",
              },
              {
                q: "How do I list my event?",
                a: "Go to the For Planners page, fill in the application form and our team will approve it within 24 hours.",
                color: "text-green-400",
              },
            ].map((item) => (
              <div key={item.q} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className={"font-bold text-sm mb-2 " + item.color}>{item.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}