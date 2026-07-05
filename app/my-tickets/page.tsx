"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  event_title: string;
  ticket_type: string;
  quantity: number;
  total: number;
  payment_method: string;
  payment_status: string | null;
  mpesa_receipt: string | null;
  created_at: string;
};

export default function MyTicketsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      setUserEmail(email ?? null);

      if (!email) {
        setLoading(false);
        return;
      }

      // Orders are matched by email since checkout doesn't require login —
      // this shows anything bought using the same email as this account.
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusBadge(status: string | null) {
    if (status === "failed") {
      return <span className="text-xs bg-red-400/20 text-red-400 px-2 py-0.5 rounded-full">Failed</span>;
    }
    if (status === "pending") {
      return <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">Pending</span>;
    }
    return <span className="text-xs bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">Confirmed</span>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading your tickets...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">My Tickets</h1>
        <p className="text-gray-500 text-sm mb-10">
          {userEmail ? `Orders linked to ${userEmail}` : "Your ticket history"}
        </p>

        {orders.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <span className="text-5xl mb-4 block">🎟️</span>
            <h2 className="text-white font-semibold text-lg mb-2">No tickets yet</h2>
            <p className="text-gray-500 text-sm mb-6">
              Once you book a ticket using this account&apos;s email, it&apos;ll show up here.
            </p>
            <Link
              href="/events"
              className="inline-block bg-green-400 text-black px-6 py-3 rounded-full text-sm font-bold hover:bg-green-300 transition">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1">{order.event_title}</h3>
                    <p className="text-gray-500 text-xs mb-0.5">
                      {order.ticket_type} × {order.quantity} · via {order.payment_method}
                    </p>
                    <p className="text-xs text-gray-600">{formatDate(order.created_at)}</p>
                    {order.mpesa_receipt && (
                      <p className="text-xs text-gray-600 mt-1">Receipt: {order.mpesa_receipt}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-green-400 font-bold text-sm mb-1">
                      {order.total === 0 ? "Free" : "KES " + order.total.toLocaleString()}
                    </p>
                    {statusBadge(order.payment_status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
