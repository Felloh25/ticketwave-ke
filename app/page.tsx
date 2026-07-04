"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
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

const categories = [
  { name: "Music & Concerts", emoji: "🎵", count: "120+ events", color: "hover:border-green-400" },
  { name: "Tech & Hackathons", emoji: "💻", count: "45+ events", color: "hover:border-purple-400" },
  { name: "Food & Drinks", emoji: "🍔", count: "80+ events", color: "hover:border-orange-400" },
  { name: "Sports & Fitness", emoji: "⚽", count: "60+ events", color: "hover:border-blue-400" },
  { name: "Art & Culture", emoji: "🎨", count: "35+ events", color: "hover:border-pink-400" },
  { name: "Comedy & Theatre", emoji: "🎭", count: "28+ events", color: "hover:border-yellow-400" },
  { name: "Family & Kids", emoji: "👨‍👩‍👧", count: "40+ events", color: "hover:border-purple-400" },
  { name: "Education", emoji: "📚", count: "40+ events", color: "hover:border-green-400" },
];

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) {
        console.error("Error:", error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem("tw_welcome_seen");
    if (!seen) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  function closeModal() {
    setShowModal(false);
    localStorage.setItem("tw_welcome_seen", "true");
  }

  return (
    <div className="flex flex-col bg-[#0a0a0a]">

      {/* WELCOME MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl z-10">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
              ✕
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-400/10 border border-green-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🎟️
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to TicketWave<span className="text-green-400">KE</span>
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Create your free account to book tickets faster, save your favorite events, receive exclusive offers, and manage all your bookings in one place.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/register"
                onClick={closeModal}
                className="block w-full text-center bg-green-400 text-black py-3 rounded-full font-bold text-sm hover:bg-green-300 hover:scale-105 transition-all shadow-lg shadow-green-400/20">
                Sign Up — It is Free
              </Link>
              <button
                onClick={closeModal}
                className="w-full border border-white/10 text-gray-400 py-3 rounded-full text-sm hover:bg-white/5 hover:text-white transition">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden border-b border-white/10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-green-400 border border-green-400/30 bg-green-400/10 px-4 py-1.5 rounded-full mb-8">
            Kenya's growing events platform
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight mb-6 text-white">
            Discover Events.<br />
            <span className="text-green-400">Create Memories.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            TicketWave KE is Kenya's event ticketing platform discover events, book tickets via M-Pesa, and manage your account
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/events" className="bg-green-400 text-black px-8 py-3.5 rounded-full text-sm font-bold hover:bg-green-300 transition shadow-lg shadow-green-400/20">
              Browse Events
            </Link>
            <Link href="/register" className="border border-white/20 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:border-white/50 hover:bg-white/5 transition">
              Sign Up Free
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 justify-center mt-12 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1"><span className="text-green-400">✓</span> Free to browse</span>
            <span className="flex items-center gap-1"><span className="text-green-400">✓</span> Secure payments</span>
            <span className="flex items-center gap-1"><span className="text-green-400">✓</span> Instant tickets</span>
            <span className="flex items-center gap-1"><span className="text-green-400">✓</span> All 47 counties</span>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="grid grid-cols-3 border-b border-white/10">
        <div className="flex flex-col items-center justify-center py-14 border-r border-white/10">
          <span className="text-4xl font-bold text-green-400">500+</span>
          <span className="text-sm text-gray-500 mt-2 font-medium">Events Listed</span>
        </div>
        <div className="flex flex-col items-center justify-center py-14 border-r border-white/10">
          <span className="text-4xl font-bold text-green-400">50K+</span>
          <span className="text-sm text-gray-500 mt-2 font-medium">Tickets Sold</span>
        </div>
        <div className="flex flex-col items-center justify-center py-14">
          <span className="text-4xl font-bold text-green-400">47</span>
          <span className="text-sm text-gray-500 mt-2 font-medium">Counties Reached</span>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="px-6 py-20 w-full border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Browse by Category</h2>
              <p className="text-gray-500 text-sm">Something for everyone, every age</p>
            </div>
            <Link href="/events" className="text-sm font-medium text-green-400 hover:text-green-300 transition">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                href="/events"
                key={cat.name}
                className={"border border-white/10 rounded-2xl p-5 hover:bg-white/5 transition group bg-white/5 " + cat.color}>
                <span className="text-3xl mb-3 block">{cat.emoji}</span>
                <h3 className="font-semibold text-sm mb-1 text-white">{cat.name}</h3>
                <p className="text-xs text-gray-500">{cat.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS SECTION */}
      <section className="px-6 py-20 w-full border-b border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Upcoming Events</h2>
              <p className="text-gray-500 text-sm">Don't miss out on these experiences</p>
            </div>
            <Link href="/events" className="text-sm font-medium text-green-400 hover:text-green-300 transition">
              View all →
            </Link>
          </div>

          {loading && (
            <div className="text-center py-24">
              <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Loading events...</p>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-green-400/40 hover:shadow-lg hover:shadow-green-400/5 transition group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 brightness-90"
                    />
                    <span className={"absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full " + (tagColors[event.tag] || "bg-gray-400 text-black")}>
                      {event.tag}
                    </span>
                    {event.price === 0 && (
                      <span className="absolute top-3 right-3 text-xs font-bold bg-green-400 text-black px-3 py-1 rounded-full">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-white mb-2 group-hover:text-green-400 transition leading-snug">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-gray-600">📅</span>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mb-4">
                      <span className="text-gray-600">📍</span>
                      <p className="text-xs text-gray-500">{event.location}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-sm font-bold text-green-400">
                        {event.price === 0 ? "Free" : "KES " + event.price.toLocaleString()}
                      </span>
                      <Link href={"/tickets?event=" + encodeURIComponent(event.title)} className="text-xs bg-green-400 text-black px-4 py-2 rounded-full hover:bg-green-300 transition font-bold">
                        Get Ticket
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/events" className="border border-green-400/50 text-green-400 px-8 py-3 rounded-full text-sm font-semibold hover:bg-green-400 hover:text-black transition">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="px-6 py-20 w-full border-b border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">How it works</h2>
          <p className="text-gray-500 text-sm mb-14">Get your ticket in 3 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: "01", title: "Browse Events", desc: "Explore hundreds of events happening across Kenya filtered by category, date or location.", color: "text-green-400" },
              { step: "02", title: "Pick Your Ticket", desc: "Choose the event you love and select your ticket type. Free or paid, we have got you covered.", color: "text-purple-400" },
              { step: "03", title: "Show Up and Enjoy", desc: "Get your e-ticket instantly. Show it at the gate and enjoy the experience.", color: "text-green-400" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <span className={"text-6xl font-bold mb-4 opacity-30 " + item.color}>{item.step}</span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER SIGNUP */}
      <section className="px-6 py-14 border-b border-white/10 bg-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl font-bold text-white mb-2">Stay in the loop</h2>
          <p className="text-gray-400 text-sm mb-6">
            Get weekly event updates delivered to your inbox. Never miss out again.
          </p>
          {subscribed ? (
            <p className="text-green-400 font-semibold">You are subscribed! Thank you.</p>
          ) : (
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border border-white/10 rounded-full px-5 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-400/50 transition"
              />
              <button
                onClick={() => { if (email) setSubscribed(true); }}
                className="bg-green-400 text-black px-6 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition whitespace-nowrap">
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative px-6 py-24 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-purple-600/10 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Planning an event?
          </h2>
          <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
            List your event on TicketWave KE and reach people across Kenya looking for their next experience.
          </p>
          <Link href="/planners" className="bg-green-400 text-black px-8 py-3.5 rounded-full text-sm font-bold hover:bg-green-300 transition shadow-lg shadow-green-400/20">
            Get Started as a Planner
          </Link>
        </div>
      </section>

    </div>
  );
}