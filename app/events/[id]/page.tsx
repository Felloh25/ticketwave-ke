"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
};

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
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

function getVisitorId() {
  let id = localStorage.getItem("tw_visitor_id");
  if (!id) {
    id = "v_" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("tw_visitor_id", id);
  }
  return id;
}

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [similarEvents, setSimilarEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [counts, setCounts] = useState({ like: 0, dislike: 0, going: 0, remind: 0 });
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      const { data: eventData } = await supabase.from("events").select("*").eq("id", params.id).single();
      setEvent(eventData);

      if (eventData) {
        const { data: similar } = await supabase
          .from("events")
          .select("*")
          .eq("tag", eventData.tag)
          .eq("status", "approved")
          .neq("id", eventData.id)
          .limit(3);
        setSimilarEvents(similar || []);
      }

      const { data: reactionsData } = await supabase
        .from("event_reactions")
        .select("*")
        .eq("event_id", params.id);

      const newCounts = { like: 0, dislike: 0, going: 0, remind: 0 };
      const visitorId = getVisitorId();
      const mine = new Set<string>();
      (reactionsData || []).forEach((r: any) => {
        newCounts[r.reaction_type as keyof typeof newCounts]++;
        if (r.visitor_id === visitorId) mine.add(r.reaction_type);
      });
      setCounts(newCounts);
      setMyReactions(mine);

      const { data: reviewsData } = await supabase
        .from("event_reviews")
        .select("*")
        .eq("event_id", params.id)
        .order("created_at", { ascending: false });
      setReviews(reviewsData || []);

      setLoading(false);
    }
    if (params.id) fetchAll();
  }, [params.id]);

  async function toggleReaction(type: string) {
    const visitorId = getVisitorId();
    const hasIt = myReactions.has(type);

    if (hasIt) {
      await supabase
        .from("event_reactions")
        .delete()
        .eq("event_id", params.id)
        .eq("visitor_id", visitorId)
        .eq("reaction_type", type);
      setMyReactions((prev) => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });
      setCounts((prev) => ({ ...prev, [type]: Math.max(0, prev[type as keyof typeof prev] - 1) }));
    } else {
      // like/dislike are mutually exclusive
      if (type === "like" && myReactions.has("dislike")) await toggleReaction("dislike");
      if (type === "dislike" && myReactions.has("like")) await toggleReaction("like");

      await supabase.from("event_reactions").insert([{
        event_id: params.id,
        visitor_id: visitorId,
        reaction_type: type,
      }]);
      setMyReactions((prev) => new Set(prev).add(type));
      setCounts((prev) => ({ ...prev, [type]: prev[type as keyof typeof prev] + 1 }));
    }
  }

  async function handleShare() {
    if (!event) return;
    const shareUrl = window.location.href;
    const shareText = "Check out " + event.title + " on " + event.date + " at " + event.location + " — book your ticket on TicketWave KE!";
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: shareText, url: shareUrl });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText + " " + shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;
    setSubmittingReview(true);
    const { data, error } = await supabase
      .from("event_reviews")
      .insert([{
        event_id: params.id,
        name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      }])
      .select();
    if (!error && data) {
      setReviews([data[0], ...reviews]);
      setReviewForm({ name: "", rating: 5, comment: "" });
    }
    setSubmittingReview(false);
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

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

        {/* TITLE */}
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-snug">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span>📅</span><span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <span>📍</span><span>{event.location}</span>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-4 py-2">
              <span>⭐</span><span>{avgRating} ({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {/* REACTIONS */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => toggleReaction("like")}
            className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition " +
              (myReactions.has("like") ? "bg-green-400 text-black border-green-400" : "border-white/10 text-gray-400 hover:border-green-400/40 hover:text-green-400")}>
            👍 Like <span className="opacity-70">{counts.like}</span>
          </button>
          <button
            onClick={() => toggleReaction("dislike")}
            className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition " +
              (myReactions.has("dislike") ? "bg-red-400 text-black border-red-400" : "border-white/10 text-gray-400 hover:border-red-400/40 hover:text-red-400")}>
            👎 Dislike <span className="opacity-70">{counts.dislike}</span>
          </button>
          <button
            onClick={() => toggleReaction("going")}
            className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition " +
              (myReactions.has("going") ? "bg-purple-400 text-black border-purple-400" : "border-white/10 text-gray-400 hover:border-purple-400/40 hover:text-purple-400")}>
            🙋 Going <span className="opacity-70">{counts.going}</span>
          </button>
          <button
            onClick={() => toggleReaction("remind")}
            className={"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition " +
              (myReactions.has("remind") ? "bg-blue-400 text-black border-blue-400" : "border-white/10 text-gray-400 hover:border-blue-400/40 hover:text-blue-400")}>
            🔔 Remind Me <span className="opacity-70">{counts.remind}</span>
          </button>
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

        {/* LOCATION MAP */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Location</h2>
          <p className="text-gray-400 text-sm mb-3">{event.location}</p>
          
          <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(event.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-green-400 border border-green-400/30 px-4 py-2 rounded-full hover:bg-green-400/10 transition">
            📍 View on Google Maps
          </a>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row gap-3 mb-10">
          
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

        {/* REVIEWS SECTION */}
        <div className="mb-10">
          <h2 className="text-white font-bold text-lg mb-4">
            Reviews {reviews.length > 0 && "(" + reviews.length + ")"}
          </h2>

          {/* Review form */}
          <form onSubmit={handleReviewSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                type="text"
                placeholder="Your name"
                value={reviewForm.name}
                onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition"
              />
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-green-400/50 transition">
                <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                <option value={4}>⭐⭐⭐⭐ Good</option>
                <option value={3}>⭐⭐⭐ Average</option>
                <option value={2}>⭐⭐ Poor</option>
                <option value={1}>⭐ Bad</option>
              </select>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Share your thoughts about this event..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition resize-none"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="self-start bg-green-400 text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-green-300 transition disabled:opacity-50">
              {submittingReview ? "Posting..." : "Post Review"}
            </button>
          </form>

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{review.name}</span>
                    <span className="text-yellow-400 text-xs">{"⭐".repeat(review.rating)}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIMILAR EVENTS */}
        {similarEvents.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-lg mb-4">Similar Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similarEvents.map((se) => (
                <Link
                  key={se.id}
                  href={"/events/" + se.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-green-400/40 transition group">
                  <div className="relative h-32 overflow-hidden">
                    <img src={se.image_url} alt={se.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <span className={"absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full " + (tagColors[se.tag] || "bg-gray-400 text-black")}>
                      {se.tag}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm font-semibold mb-1 line-clamp-1">{se.title}</h3>
                    <p className="text-xs text-gray-500">{se.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}