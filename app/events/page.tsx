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
  status: string;
};

const categories = ["All", "Music", "Tech", "Food", "Sports", "Art", "Comedy", "Networking"];

const tagColors: Record<string, string> = {
  Music: "bg-green-400 text-black",
  Tech: "bg-purple-500 text-white",
  Food: "bg-orange-400 text-black",
  Sports: "bg-blue-400 text-white",
  Art: "bg-pink-400 text-white",
  Comedy: "bg-yellow-400 text-black",
  Networking: "bg-purple-400 text-white",
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error:", error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const filtered = events.filter((event) => {
    const matchCategory = activeCategory === "All" || event.tag === activeCategory;
    const matchSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  async function handleShare(e: React.MouseEvent, event: Event) {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = window.location.origin + "/events/" + event.id;
    const shareText = "Check out " + event.title + " on " + event.date + " at " + event.location + " — book your ticket on TicketWave KE!";

    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: shareText, url: shareUrl });
      } catch (err) {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText + " " + shareUrl);
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <section className="px-6 py-16 border-b border-white/10 text-center">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-green-400 border border-green-400/30 bg-green-400/10 px-4 py-1.5 rounded-full mb-4">
          All Events
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          What is Happening in Kenya
        </h1>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Browse, filter and book tickets for the best events across the country
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="relative mb-8">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Search events or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-11 pr-6 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-400/50 transition"
          />
        </div>

        <div className="flex gap-2 flex-wrap mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={"px-5 py-2 rounded-full text-sm font-medium transition " +
                (activeCategory === cat
                  ? "bg-green-400 text-black"
                  : "border border-white/10 text-gray-400 hover:text-white")}>
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading events...</p>
          </div>
        )}

        {!loading && (
          <p className="text-gray-500 text-sm mb-6">
            Showing <span className="text-green-400 font-semibold">{filtered.length}</span> events
          </p>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-white font-semibold mb-2">No events found</h3>
            <p className="text-gray-500 text-sm">Try a different search or category</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filtered.map((event) => (
              <Link
                href={"/events/" + event.id}
                key={event.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-green-400/40 transition group cursor-pointer block">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <span className={"absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full " + (tagColors[event.tag] || "bg-gray-400 text-black")}>
                    {event.tag}
                  </span>
                  <span className="absolute top-3 right-3 text-xs font-bold bg-black/70 backdrop-blur-sm text-green-400 px-3 py-1.5 rounded-full border border-green-400/30">
                    {event.price === 0 ? "Free Entry" : "KES " + event.price.toLocaleString()}
                  </span>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-base leading-snug drop-shadow-lg line-clamp-2">
                      {event.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-gray-600">📅</span>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-gray-600">📍</span>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <button
                      onClick={(e) => handleShare(e, event)}
                      className="flex items-center gap-1.5 text-xs text-gray-400 border border-white/10 px-3 py-1.5 rounded-full hover:border-green-400/40 hover:text-green-400 transition">
                      {copiedId === event.id ? "Copied" : "Share"}
                    </button>
                    <span className="text-xs bg-green-400 text-black px-4 py-2 rounded-full font-bold">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}