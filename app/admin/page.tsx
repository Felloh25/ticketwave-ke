"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Event = {
  id: number;
  title: string;
  date: string;
  location: string;
  price: number;
  tag: string;
  status: string;
  image_url: string;
  created_at: string;
};

type Order = {
  id: string;
  event_title: string;
  ticket_type: string;
  quantity: number;
  total: number;
  name: string;
  email: string;
  phone: string;
  payment_method: string;
  created_at: string;
};

type PlannerApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_name: string;
  event_type: string;
  event_date: string;
  event_location: string;
  event_price: number;
  expected_attendance: number;
  description: string;
  event_image: string;
  message: string;
  status: string;
  created_at: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

const fallbackImages: Record<string, string[]> = {
  Music: [
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
    "https://images.unsplash.com/photo-1571266028243-d220c6a7f2be?w=600&q=80",
  ],
  Tech: [
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80",
  ],
  Food: [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80",
  ],
  Sports: [
    "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=600&q=80",
    "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80",
  ],
  Comedy: [
    "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=600&q=80",
    "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&q=80",
  ],
  Art: [
    "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&q=80",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80",
  ],
  Networking: [
    "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=600&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
  ],
};

function getFallbackImage(tag: string): string {
  const options = fallbackImages[tag] || fallbackImages["Networking"];
  return options[Math.floor(Math.random() * options.length)];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<PlannerApplication[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authed) {
      fetchAll();
    }
  }, [authed]);

  async function fetchAll() {
    setLoading(true);
    const [eventsRes, ordersRes, appsRes, msgsRes] = await Promise.all([
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("planner_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    ]);
    setEvents(eventsRes.data || []);
    setOrders(ordersRes.data || []);
    setApplications(appsRes.data || []);
    setMessages(msgsRes.data || []);
    setLoading(false);
  }

  async function handleLogin() {
    setAuthLoading(true);
    const res = await fetch("/api/admin-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (data.success) {
      setAuthed(true);
    } else {
      alert("Wrong password!");
    }
    setAuthLoading(false);
  }

  async function updateEventStatus(id: number, status: string) {
    await supabase.from("events").update({ status }).eq("id", id);
    fetchAll();
  }

  async function updateApplicationStatus(id: string, status: string) {
    await supabase.from("planner_applications").update({ status }).eq("id", id);

    if (status === "approved") {
      const app = applications.find((a) => a.id === id);
      if (app) {
        const { data: existing } = await supabase
          .from("events")
          .select("id")
          .eq("title", app.event_name)
          .eq("status", "approved");

        if (existing && existing.length > 0) {
          alert("An event with this title already exists and is approved. Skipping duplicate creation.");
        } else {
          await supabase.from("events").insert([{
            title: app.event_name,
            description: app.description,
            date: app.event_date,
            location: app.event_location,
            price: app.event_price || 0,
            tag: app.event_type,
            image_url: app.event_image || getFallbackImage(app.event_type),
            status: "approved",
          }]);
        }
      }
    }
    fetchAll();
  }

  async function deleteEvent(id: number) {
    if (confirm("Are you sure you want to delete this event?")) {
      await supabase.from("events").delete().eq("id", id);
      fetchAll();
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 w-full max-w-sm text-center">
          <span className="text-4xl mb-4 block">🔐</span>
          <h1 className="text-white font-bold text-xl mb-2">Admin Access</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your admin password to continue</p>
          <input
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-400/50 transition mb-4"
          />
          <button
            onClick={handleLogin}
            disabled={authLoading}
            className="bg-green-400 text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition w-full disabled:opacity-50">
            {authLoading ? "Checking..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "events", label: "Events", count: events.length },
    { id: "orders", label: "Orders", count: orders.length },
    { id: "applications", label: "Applications", count: applications.length },
    { id: "messages", label: "Messages", count: messages.length },
  ];

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const pendingApps = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">Admin Dashboard</h1>
          <p className="text-gray-500 text-xs mt-0.5">TicketWave KE — Management Panel</p>
        </div>
        <button
          onClick={() => setAuthed(false)}
          className="text-xs text-gray-500 border border-white/10 px-4 py-2 rounded-full hover:border-white/20 transition">
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">Total Events</p>
            <p className="text-2xl font-bold text-white">{events.length}</p>
            {pendingEvents > 0 && (
              <p className="text-xs text-yellow-400 mt-1">{pendingEvents} pending review</p>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
            <p className="text-xs text-green-400 mt-1">All confirmed</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-green-400">
              KES {totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">Applications</p>
            <p className="text-2xl font-bold text-white">{applications.length}</p>
            {pendingApps > 0 && (
              <p className="text-xs text-yellow-400 mt-1">{pendingApps} pending review</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 " +
                (activeTab === tab.id
                  ? "bg-green-400 text-black"
                  : "border border-white/10 text-gray-400 hover:text-white")}>
              {tab.label}
              <span className={"text-xs px-1.5 py-0.5 rounded-full " +
                (activeTab === tab.id ? "bg-black/20" : "bg-white/10")}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-24">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading data...</p>
          </div>
        )}

        {!loading && activeTab === "events" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">All Events</h2>
              <span className="text-gray-500 text-xs">{events.length} total</span>
            </div>
            {events.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-sm">No events yet</div>
            )}
            {events.map((event) => (
              <div key={event.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-16 h-14 object-cover rounded-xl flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={"text-xs px-2 py-0.5 rounded-full font-medium " +
                        (event.status === "approved" ? "bg-green-400/20 text-green-400" :
                        event.status === "rejected" ? "bg-red-400/20 text-red-400" :
                        "bg-yellow-400/20 text-yellow-400")}>
                        {event.status}
                      </span>
                      <span className="text-gray-500 text-xs">{event.tag}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm truncate">{event.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{event.date} · {event.location}</p>
                    <p className="text-green-400 text-xs mt-0.5 font-medium">
                      {event.price === 0 ? "Free" : "KES " + event.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {event.status !== "approved" && (
                    <button
                      onClick={() => updateEventStatus(event.id, "approved")}
                      className="text-xs bg-green-400 text-black px-3 py-1.5 rounded-full font-bold hover:bg-green-300 transition">
                      Approve
                    </button>
                  )}
                  {event.status !== "rejected" && (
                    <button
                      onClick={() => updateEventStatus(event.id, "rejected")}
                      className="text-xs border border-red-400/30 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-400/10 transition">
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-xs border border-white/10 text-gray-500 px-3 py-1.5 rounded-full hover:border-red-400/30 hover:text-red-400 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === "orders" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">All Orders</h2>
              <span className="text-gray-500 text-xs">{orders.length} total</span>
            </div>
            {orders.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-sm">No orders yet</div>
            )}
            {orders.map((order) => (
              <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{order.event_title}</h3>
                    <p className="text-gray-500 text-xs mb-0.5">
                      {order.name} · {order.email} · {order.phone}
                    </p>
                    <p className="text-gray-500 text-xs mb-0.5">
                      {order.ticket_type} x{order.quantity} · via {order.payment_method}
                    </p>
                    <p className="text-xs text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-green-400 font-bold text-sm">
                      {order.total === 0 ? "Free" : "KES " + order.total.toLocaleString()}
                    </p>
                    <span className="text-xs bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">
                      confirmed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === "applications" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">Planner Applications</h2>
              <span className="text-gray-500 text-xs">{applications.length} total</span>
            </div>
            {applications.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-sm">No applications yet</div>
            )}
            {applications.map((app) => (
              <div key={app.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={"text-xs px-2 py-0.5 rounded-full font-medium " +
                        (app.status === "approved" ? "bg-green-400/20 text-green-400" :
                        app.status === "rejected" ? "bg-red-400/20 text-red-400" :
                        "bg-yellow-400/20 text-yellow-400")}>
                        {app.status}
                      </span>
                      <span className="text-gray-500 text-xs">{app.event_type}</span>
                    </div>
                    <div className="flex gap-4 items-start">
                      {app.event_image && (
                        <img
                          src={app.event_image}
                          alt={app.event_name}
                          className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="text-white font-semibold text-sm mb-1">{app.event_name}</h3>
                        <p className="text-gray-500 text-xs mb-0.5">
                          {app.name} · {app.email} · {app.phone}
                        </p>
                        <p className="text-gray-500 text-xs mb-0.5">
                          {app.event_date} · {app.event_location}
                        </p>
                        <p className="text-gray-500 text-xs mb-0.5">
                          {app.event_price === 0 ? "Free" : "KES " + app.event_price?.toLocaleString()} · {app.expected_attendance} expected attendees
                        </p>
                        <p className="text-gray-400 text-xs mt-2 leading-relaxed">{app.description}</p>
                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">{app.message}</p>
                        <p className="text-xs text-gray-600 mt-2">{formatDate(app.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {app.status !== "approved" && (
                      <button
                        onClick={() => updateApplicationStatus(app.id, "approved")}
                        className="text-xs bg-green-400 text-black px-3 py-1.5 rounded-full font-bold hover:bg-green-300 transition">
                        Approve
                      </button>
                    )}
                    {app.status !== "rejected" && (
                      <button
                        onClick={() => updateApplicationStatus(app.id, "rejected")}
                        className="text-xs border border-red-400/30 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-400/10 transition">
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === "messages" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold">Contact Messages</h2>
              <span className="text-gray-500 text-xs">{messages.length} total</span>
            </div>
            {messages.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-sm">No messages yet</div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{msg.name}</h3>
                    <p className="text-gray-500 text-xs">{msg.email}</p>
                  </div>
                  <span className="text-xs bg-purple-400/20 text-purple-400 px-2 py-0.5 rounded-full flex-shrink-0">
                    {msg.subject}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{msg.message}</p>
                <p className="text-xs text-gray-600 mt-3">{formatDate(msg.created_at)}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}