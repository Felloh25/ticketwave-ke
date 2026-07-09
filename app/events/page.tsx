"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Event = {
  id: number;
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
const areas = ["All Areas", "Nairobi", "Mombasa", "Kisumu", "Eldoret", "Nakuru", "Machakos"];
const timeFilters = ["Any Time", "Today", "This Weekend", "Next Week"];

const tagColors: Record<string, string> = {
  Music: "bg-green-400 text-black",
  Tech: "bg-purple-500 text-white",
  Food: "bg-orange-400 text-black",
  Sports: "bg-blue-400 text-white",
  Art: "bg-pink-400 text-white",
  Comedy: "bg-yellow-400 text-black",
  Networking: "bg-purple-400 text-white",
};

const fallbackByTag: Record<string, string> = {
  Music: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
  Tech: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
  Food: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
  Sports: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&q=80",
  Comedy: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&q=80",
  Art: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80",
  Networking: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
};

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseEventDate(dateStr: string): Date | null {
  const match = dateStr.match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!match) return null;
  const month = MONTHS[match[1]];
  const day = parseInt(match[2]);
  if (month === undefined || isNaN(day)) return null;
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, month, day);
  if (candidate.getTime() < now.getTime() - 1000 * 60 * 60 * 24 * 180) {
    year += 1;
  }
  return new Date(year, month, day);
}

function matchesTimeFilter(dateStr: string, filter: string): boolean {
  if (filter === "Any Time") return true;
  const eventDate = parseEventDate(dateStr);
  if (!eventDate) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  const diffDays = Math.round((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (filter === "Today") return diffDays === 0;

  if (filter === "This Weekend") {
    const dayOfWeek = today.getDay();
    const daysUntilSat = (6 - dayOfWeek + 7) % 7;
    const daysUntilSun = (7 - dayOfWeek) % 7 || 7;
    return diffDays === daysUntilSat || diffDays === daysUntilSun || (diffDays >= 0 && diffDays <= daysUntilSun && dayOfWeek === 6);
  }

  if (filter === "Next Week") {
    return diffDays >= 7 && diffDays <= 14;
  }

  return true;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeArea, setActiveArea] = useState("All Areas");
  const [activeTime, setActiveTime] = useState("Any Time");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

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
    const matchArea = activeArea === "All Areas" || event.location.toLowerCase().includes(activeArea.toLowerCase());
    const matchTime = matchesTimeFilter(event.date, activeTime);
    const matchSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchArea && matchTime && matchSearch;
  });

  async function handleShare(e: React.MouseEvent, event: Event) {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = window.location.origin + "/events/" + event.id;
    const shareText = "Check out " + event.title + " on " + event.date + " at " + event.location + " — book your ticket on TicketWave KE!";

    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: shareText, url: shareUrl });
      } catch (err) {}
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
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Search events or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-11 pr-6 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-400/50 transition"
          />
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition " +
                (activeCategory === cat
                  ? "bg-green-400 text-black"
                  : "border border-white/10 text-gray-400 hover:text-white")}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setActiveArea(area)}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 " +
                (activeArea === area
                  ? "bg-purple-400 text-black"
                  : "border border-white/10 text-gray-400 hover:text-white")}>
              📍 {area}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-10">
          {timeFilters.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTime(tf)}
              className={"px-4 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1 " +
                (activeTime === tf
                  ? "bg-blue-400 text-black"
                  : "border border-white/10 text-gray-400 hover:text-white")}>
              🕐 {tf}
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
            <p className="text-gray-500 text-sm">Try a different search, category, area or time</p>
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackByTag[event.tag] || fallbackByTag["Networking"];
                    }}
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