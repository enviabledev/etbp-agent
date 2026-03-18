"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import QRScanner from "@/components/agent/QRScanner";

export default function TripManifestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [manifest, setManifest] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [tripRes, manRes] = await Promise.all([
        api.get(`/api/v1/agent/trips/${id}`),
        api.get(`/api/v1/agent/trips/${id}/manifest`),
      ]);
      setTrip(tripRes.data);
      setManifest(manRes.data.passengers || []);
      setLoading(false);
    } catch { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, [load]);

  async function checkin(bookingId: string) {
    setCheckingIn(bookingId);
    try {
      await api.post(`/api/v1/agent/trips/${id}/checkin/${bookingId}`);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Check-in failed");
    } finally { setCheckingIn(null); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#0057FF] border-t-transparent rounded-full" /></div>;

  const filtered = search ? manifest.filter((p: any) => p.passenger_name?.toLowerCase().includes(search.toLowerCase()) || p.booking_ref?.includes(search.toUpperCase()) || p.seat_number?.includes(search)) : manifest;
  const checkedCount = manifest.filter((p: any) => p.checked_in).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 rounded-lg text-xl">←</button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{trip?.route?.name || "Trip"}</h1>
          <p className="text-sm text-gray-500">{trip?.departure_time?.slice(0, 5)} • {trip?.status} • {trip?.vehicle?.plate_number}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{checkedCount}<span className="text-gray-400 text-lg">/{manifest.length}</span></p>
          <p className="text-xs text-gray-500">checked in</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search passenger, ref, or seat..."
            className="w-full h-12 pl-4 pr-4 rounded-xl border border-gray-300 focus:border-[#0057FF] outline-none text-base" />
        </div>
        <button onClick={() => setScannerOpen(true)} className="h-12 px-4 bg-green-600 text-white rounded-xl font-medium flex items-center gap-2 whitespace-nowrap mb-4">📷 Scan QR</button>
        {trip?.status === "departed" && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 font-medium">🚌 This trip has departed — check-in is closed</div>}
        {trip?.status === "completed" && <div className="mb-4 p-3 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 font-medium">✅ Trip completed</div>}
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Seat</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Passenger</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Ref</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Payment</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No passengers</td></tr>
              ) : filtered.map((p: any) => (
                <tr key={`${p.booking_id}-${p.seat_number}`} className={p.checked_in ? "bg-green-50" : ""}>
                  <td className="px-5 py-3 font-bold">{p.seat_number || "—"}</td>
                  <td className="px-5 py-3 font-medium">{p.passenger_name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{p.phone || "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs">{p.booking_ref}</td>
                  <td className="px-5 py-3 text-sm">
                    {p.payment_status === "paid" ? (
                      <span className="text-green-600 font-medium capitalize">{p.payment_method || "Paid"}</span>
                    ) : (
                      <span className="text-red-600 font-medium">Unpaid (₦{p.amount_due?.toLocaleString()})</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {p.checked_in ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">✓ Checked in</span>
                    ) : p.payment_status !== "paid" ? (
                      <button onClick={async () => {
                        const method = prompt("Payment method? (cash / pos / transfer)");
                        if (!method) return;
                        try {
                          await api.post(`/api/v1/agent/bookings/${p.booking_ref}/pay`, { payment_method: method });
                          await load();
                        } catch (err: any) { alert(err?.response?.data?.detail || "Payment failed"); }
                      }} className="h-9 px-3 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600">
                        Collect Payment
                      </button>
                    ) : (
                      <button onClick={() => checkin(p.booking_id)} disabled={checkingIn === p.booking_id || ["departed","completed","cancelled"].includes(trip?.status)}
                        className="h-9 px-4 bg-[#0057FF] text-white text-sm font-medium rounded-lg hover:bg-[#0046CC] disabled:opacity-50">
                        {checkingIn === p.booking_id ? "..." : "Check in"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <QRScanner open={scannerOpen} onClose={() => { setScannerOpen(false); load(); }} manifest={manifest} tripId={id} onCheckin={checkin} />
    </div>
  );
}
