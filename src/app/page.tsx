"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import api from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/login"); return; }
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); router.push("/book"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "l") { e.preventDefault(); router.push("/lookup"); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  async function loadData() {
    try {
      const [profileRes, dashRes, tripsRes] = await Promise.all([
        api.get("/api/v1/agent/profile"),
        api.get("/api/v1/agent/dashboard"),
        api.get("/api/v1/agent/trips"),
      ]);
      setAgent(profileRes.data);
      setDashboard(dashRes.data);
      setTrips(tripsRes.data.items || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#0057FF] border-t-transparent rounded-full" /></div>;

  const statusColor = (s: string) => {
    if (s === "boarding") return "bg-green-100 text-green-700";
    if (s === "departed" || s === "en_route") return "bg-blue-100 text-blue-700";
    if (s === "completed") return "bg-gray-100 text-gray-600";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚌</span>
          <div>
            <p className="font-bold text-gray-900">{agent?.terminal?.name || "Terminal"}</p>
            <p className="text-xs text-gray-500">{agent?.first_name} {agent?.last_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/book")} className="h-12 px-6 bg-[#0057FF] text-white font-semibold rounded-xl hover:bg-[#0046CC] flex items-center gap-2">
            <span className="text-lg">+</span> New Booking
          </button>
          <button onClick={() => router.push("/lookup")} className="h-12 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium">Lookup</button>
          <button onClick={() => router.push("/history")} className="h-12 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium">History</button>
          <button onClick={() => router.push("/shift-report")} className="h-12 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 text-sm font-medium">Shift Report</button>
          <button onClick={async () => { const { logout } = await import("@/lib/auth"); await logout(); router.push("/login"); }}
            className="text-sm text-gray-500 hover:text-red-600">Logout</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Trips Today", value: dashboard?.trips_today || 0 },
            { label: "My Bookings", value: dashboard?.bookings_today || 0 },
            { label: "Revenue", value: `₦${(dashboard?.revenue_today || 0).toLocaleString()}` },
            { label: "Checked In", value: dashboard?.checked_in_today || 0 },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border p-5">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Departures</h2>
            <span className="text-xs text-gray-400">Auto-refreshes every 30s</span>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Time</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Route</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Vehicle</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Occupancy</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {trips.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No trips scheduled</td></tr>
              ) : trips.map((t: any) => (
                <tr key={t.id} className={t.status === "boarding" ? "bg-green-50" : ""}>
                  <td className="px-5 py-4 font-mono font-bold text-lg">{t.departure_time?.slice(0, 5)}</td>
                  <td className="px-5 py-4"><p className="font-medium">{t.route_name}</p><p className="text-xs text-gray-500">→ {t.destination}</p></td>
                  <td className="px-5 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColor(t.status)}`}>{t.status?.replace(/_/g, " ")}</span></td>
                  <td className="px-5 py-4 font-mono text-sm">{t.vehicle_plate || "—"}</td>
                  <td className="px-5 py-4"><span className="font-bold">{t.booked}</span><span className="text-gray-400">/{t.total_seats}</span>{t.checked_in > 0 && <span className="text-xs text-green-600 ml-1">({t.checked_in} in)</span>}</td>
                  <td className="px-5 py-4"><div className="flex gap-2">
                    <button onClick={() => router.push(`/trips/${t.id}`)} className="h-9 px-3 text-sm font-medium border rounded-lg hover:bg-gray-50">Manifest</button>
                    <button onClick={() => router.push(`/book?trip=${t.id}`)} className="h-9 px-3 text-sm font-medium bg-[#0057FF] text-white rounded-lg hover:bg-[#0046CC]">Book</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
