"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type PastEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  tag: string;
  image_url: string;
  archived_at: string;
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

export default function GalleryPage() {
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPastEvents() {
      const { data, error } = await supabase
        .from("past_events")
        .select("*")
        .order("archived_at", { ascending: false });
      if (error) {
        console.error("Error:", error);
      } else {
        setPastEvents(data || []);
      }
      setLoading(false);
    }
    fetchPastEvents();
  }, []);

  function daysRemaining(archivedAt: string) {
    const archived = new Date(archivedAt);
    const expiresAt = new Date(archived);
    expiresAt.setDate(expiresAt.getDate() + 7);
    const now = new Date();
    const diff = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* HEADER */}
      <section className="px-6 py-16 border-b border-white/10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-400/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-purple-400 border border-purple-400/30 bg-purple-400/10 px-4 py-1.5 rounded-full mb-4">
            Memory Lane
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Past Events Gallery
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Relive the experiences that happened on TicketWave KE. Events stay here for 7 days before being archived.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {loading && (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading past events...</p>
          </div>
        )}

        {!loading && pastEvents.length === 0 && (
          <div className="text-center py-24">
            <span className="text-5xl mb-4 block">🕰️</span>
            <h3 className="text-white font-semibold mb-2">No past events yet</h3>
            <p className="text-gray-500 text-sm">Once events finish, they will appear here for a week.</p>
          </div>
        )}

        {!loading && pastEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden opacity-80 hover:opacity-100 transition">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover grayscale-[40%]"
                  />
                  <span className={"absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full " + (tagColors[event.tag] || "bg-gray-400 text-black")}>
                    {event.tag}
                  </span>
                  <span className="absolute top-3 right-3 text-xs font-bold bg-black/70 text-white px-3 py-1 rounded-full">
                    Ended
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-white mb-2 leading-snug">
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
                    <span className="text-xs text-gray-500">
                      {daysRemaining(event.archived_at)} days left in gallery
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}