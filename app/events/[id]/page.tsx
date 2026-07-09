"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .single();
      if (error) {
        console.error("Error:", error);
      } else {
        setEvent(data);
      }
      setLoading(false);
    }
    if (params.id) fetchEvent();
  }, [params.id]);

  async function handleShare() {
    if (!event) return;
    const shareUrl = window.location.href;
    const shareText = "Check out " + event.title + " on " + event.date + " at " + event.location + " — book your ticket on TicketWave KE!";
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: shareText, url: shareUrl });
      } catch (err) {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText + " " + shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-center px-6">
        <span className="text-5xl mb-4 block">🔍</span>
        <h1 className="text-white font-bold text-xl mb-2">Event not found</h1>
        <p className="text-gray-500 text-sm mb-6">This event may have been removed or does not exist.</p>
        <Link href="/events" className="bg-green-400 text-black px-6 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition">
          Browse All Events
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* BACK LINK */}
      <div className="px-6 pt-6 max-w-4xl mx-auto">
        <Link href="/events" className="text-gray-500 text-sm hover:text-white transition inline-flex items-center gap-1">
          ← Back to Events
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">

        {/* POSTER */}
        <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden mb-6">
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span className={"absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full " + (tagColors[event.tag] || "bg-gray-400 text-black")}>
            {event.tag}
          </span>
          <span className="absolute top-4 right-4 text-sm font-bold bg-black/70 backdrop-blur-sm text-green-400 px-4 py-2 rounded-full border border-green-400/30">
            {event.price === 0 ? "Free Entry" : "KES " + event.price.toLocaleString()}
          </span>
        </div>

        {/* TITLE + INFO */}
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-snug">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span>📅</span>
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span>📍</span>
            <span>{event.location}</span>
          </div>
        </div>

        {/* DESCRIPTION */}
        {event.description && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">About this event</h2>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row gap-3 sticky bottom-4">
          
          <a
            href={"/tickets?event=" + encodeURIComponent(event.title)}
            className="flex-1 text-center bg-green-400 text-black py-4 rounded-full font-bold text-sm hover:bg-green-300 hover:scale-105 transition-all shadow-lg shadow-green-400/20">
            Get Ticket — {event.price === 0 ? "Free" : "KES " + event.price.toLocaleString()}
          </a>
          <button
            onClick={handleShare}
            className="border border-white/10 text-white px-8 py-4 rounded-full text-sm font-semibold hover:bg-white/5 transition">
            {copied ? "Copied!" : "Share Event"}
          </button>
        </div>
      </div>
    </div>
  );
}