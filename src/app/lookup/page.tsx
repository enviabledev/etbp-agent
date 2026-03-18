"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LookupPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState("");

  async function search() {
    if (!query.trim()) return;
    setLoading(true); setError(""); setBooking(null);
    try {
      const { data } = await api.get(`/api/v1/agent/bookings/${query.trim().toUpperCase()}`);
      setBooking(data);
    } catch { setError("Booking not found"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 rounded-lg text-xl">←</button>
        <h1 className="text-lg font-bold">Booking Lookup</h1>
      </div>
      <div className="max-w-xl mx-auto px-6 py-6">
        <div className="flex gap-3 mb-6">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Booking reference (e.g., ETB-XXXXX)"
            className="flex-1 h-14 px-4 rounded-xl border text-base uppercase focus:border-[#0057FF] outline-none" onKeyDown={e => e.key === "Enter" && search()} />
          <button onClick={search} disabled={loading} className="h-14 px-6 bg-[#0057FF] text-white rounded-xl font-medium disabled:opacity-50">
            {loading ? "..." : "Search"}
          </button>
        </div>
        {error && <p className="text-red-600 text-center">{error}</p>}
        {booking && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono text-2xl font-bold">{booking.reference}</p>
                <p className="text-sm text-gray-500">{booking.route_name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${booking.status === "confirmed" ? "bg-green-100 text-green-700" : booking.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                {booking.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="text-gray-500">Date</span><p className="font-medium">{booking.departure_date}</p></div>
              <div><span className="text-gray-500">Time</span><p className="font-medium">{booking.departure_time?.slice(0, 5)}</p></div>
              <div><span className="text-gray-500">Passengers</span><p className="font-medium">{booking.passenger_count}</p></div>
              <div><span className="text-gray-500">Amount</span><p className="font-bold">₦{booking.total_amount?.toLocaleString()}</p></div>
            </div>
            {booking.passengers?.map((p: any, i: number) => (
              <div key={i} className="flex justify-between py-2 border-t text-sm">
                <span>{p.name}</span>
                <span className="text-gray-500">Seat {p.seat || "—"} • {p.checked_in ? "✓" : "Pending"}</span>
              </div>
            ))}
            {booking.payment && (
              <div className="mt-4 pt-4 border-t text-sm">
                <span className="text-gray-500">Payment: </span><span className="capitalize">{booking.payment.method} — {booking.payment.status}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
