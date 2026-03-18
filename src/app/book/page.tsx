"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTrip = searchParams.get("trip");

  const [step, setStep] = useState<"customer" | "trip" | "seats" | "confirm">("customer");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customer, setCustomer] = useState<any>(null);
  const [newCust, setNewCust] = useState({ first_name: "", last_name: "", phone: "" });
  const [searchingCust, setSearchingCust] = useState(false);
  const [custNotFound, setCustNotFound] = useState(false);

  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  async function searchCustomer() {
    if (!customerQuery.trim()) return;
    setSearchingCust(true); setCustNotFound(false);
    try {
      const { data } = await api.get("/api/v1/agent/customers/search", { params: { q: customerQuery.trim() } });
      if (data.items?.length > 0) { setCustomer(data.items[0]); } else { setCustomer(null); setCustNotFound(true); setNewCust({ ...newCust, phone: customerQuery.trim() }); }
    } catch { setCustNotFound(true); }
    finally { setSearchingCust(false); }
  }

  async function createCustomer() {
    try {
      const { data } = await api.post("/api/v1/agent/customers", newCust);
      setCustomer(data);
      if (preselectedTrip) { await loadTrip(preselectedTrip); setStep("seats"); } else { await loadTrips(); setStep("trip"); }
    } catch (err: any) { alert(err?.response?.data?.detail || "Failed"); }
  }

  async function loadTrips() { try { const { data } = await api.get("/api/v1/agent/trips"); setTrips(data.items || []); } catch {} }

  async function loadTrip(tripId: string) {
    try { const { data } = await api.get(`/api/v1/agent/trips/${tripId}`); setSelectedTrip(data); setSeats((data.seats || []).filter((s: any) => s.status === "available")); } catch {}
  }

  function toggleSeat(id: string) { setSelectedSeatIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }

  async function submitBooking() {
    if (!customer || !selectedTrip || selectedSeatIds.size === 0) return;
    setSubmitting(true);
    try {
      const seatsList = seats.filter((s: any) => selectedSeatIds.has(s.id));
      const { data } = await api.post("/api/v1/agent/bookings", {
        customer_id: customer.id, trip_id: selectedTrip.id,
        seats: seatsList.map((s: any) => ({ seat_id: s.id, passenger_name: `${customer.first_name} ${customer.last_name}`, passenger_phone: customer.phone })),
        payment_method: paymentMethod, payment_reference: paymentRef || undefined,
      });
      setBookingRef(data.reference);
    } catch (err: any) { alert(err?.response?.data?.detail || "Booking failed"); }
    finally { setSubmitting(false); }
  }

  if (bookingRef) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">Booking Confirmed</h2>
        <p className="text-4xl font-bold font-mono tracking-wider mb-6">{bookingRef}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push("/")} className="h-12 px-6 border rounded-xl font-medium">Dashboard</button>
          <button onClick={() => { setBookingRef(""); setStep("customer"); setCustomer(null); setSelectedSeatIds(new Set()); }}
            className="h-12 px-6 bg-[#0057FF] text-white rounded-xl font-medium">New Booking</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 rounded-lg text-xl">←</button>
        <h1 className="text-lg font-bold">New Booking</h1>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {step === "customer" && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">1. Find Customer</h2>
            <div className="flex gap-3 mb-4">
              <input value={customerQuery} onChange={e => setCustomerQuery(e.target.value)} placeholder="Phone or email"
                className="flex-1 h-12 px-4 rounded-xl border focus:border-[#0057FF] outline-none text-base" onKeyDown={e => e.key === "Enter" && searchCustomer()} />
              <button onClick={searchCustomer} disabled={searchingCust} className="h-12 px-6 bg-[#0057FF] text-white rounded-xl font-medium disabled:opacity-50">
                {searchingCust ? "..." : "Search"}
              </button>
            </div>
            {customer && (
              <div className="p-4 bg-green-50 rounded-lg mb-4">
                <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                <p className="text-sm text-gray-600">{customer.phone}</p>
                <button onClick={() => { if (preselectedTrip) { loadTrip(preselectedTrip); setStep("seats"); } else { loadTrips(); setStep("trip"); } }}
                  className="mt-3 h-10 px-4 bg-[#0057FF] text-white text-sm rounded-lg font-medium">Continue</button>
              </div>
            )}
            {custNotFound && (
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Not found. Create new:</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input value={newCust.first_name} onChange={e => setNewCust({...newCust, first_name: e.target.value})} placeholder="First name" className="h-12 px-4 rounded-xl border outline-none" />
                  <input value={newCust.last_name} onChange={e => setNewCust({...newCust, last_name: e.target.value})} placeholder="Last name" className="h-12 px-4 rounded-xl border outline-none" />
                </div>
                <input value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} placeholder="Phone" className="w-full h-12 px-4 rounded-xl border outline-none mb-3" />
                <button onClick={createCustomer} disabled={!newCust.first_name || !newCust.last_name || !newCust.phone}
                  className="h-10 px-4 bg-[#0057FF] text-white text-sm rounded-lg font-medium disabled:opacity-50">Create & Continue</button>
              </div>
            )}
          </div>
        )}

        {step === "trip" && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">2. Select Trip</h2>
            {trips.map((t: any) => (
              <div key={t.id} onClick={() => { loadTrip(t.id); setStep("seats"); }}
                className="p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
                <div><p className="font-medium">{t.route_name}</p><p className="text-sm text-gray-500">{t.departure_time?.slice(0, 5)} • {t.booked}/{t.total_seats} booked</p></div>
                <span className="text-xs capitalize px-2 py-1 rounded bg-gray-100">{t.status}</span>
              </div>
            ))}
          </div>
        )}

        {step === "seats" && selectedTrip && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">3. Select Seats — ₦{selectedTrip.price?.toLocaleString()}/seat</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {seats.map((s: any) => (
                <button key={s.id} onClick={() => toggleSeat(s.id)}
                  className={`w-14 h-14 rounded-xl font-bold text-sm border-2 ${selectedSeatIds.has(s.id) ? "bg-[#0057FF] text-white border-[#0057FF]" : "bg-gray-100 border-gray-300 hover:border-[#0057FF]"}`}>
                  {s.seat_number}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-4">{selectedSeatIds.size} seat(s) • ₦{(selectedSeatIds.size * (selectedTrip.price || 0)).toLocaleString()}</p>
            <button onClick={() => setStep("confirm")} disabled={selectedSeatIds.size === 0}
              className="h-12 px-6 bg-[#0057FF] text-white rounded-xl font-medium disabled:opacity-50">Continue to Payment</button>
          </div>
        )}

        {step === "confirm" && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-lg mb-4">4. Confirm & Pay</h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-gray-500">Customer</span><p className="font-medium">{customer?.first_name} {customer?.last_name}</p></div>
              <div><span className="text-gray-500">Route</span><p className="font-medium">{selectedTrip?.route?.name}</p></div>
              <div><span className="text-gray-500">Seats</span><p className="font-medium">{selectedSeatIds.size}</p></div>
              <div><span className="text-gray-500">Total</span><p className="font-bold text-lg">₦{(selectedSeatIds.size * (selectedTrip?.price || 0)).toLocaleString()}</p></div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Method</label>
              <div className="flex gap-3">
                {["cash", "pos", "transfer"].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`h-12 px-6 rounded-xl font-medium capitalize border-2 ${paymentMethod === m ? "border-[#0057FF] bg-blue-50 text-[#0057FF]" : "border-gray-300"}`}>{m}</button>
                ))}
              </div>
            </div>
            {paymentMethod !== "cash" && (
              <input value={paymentRef} onChange={e => setPaymentRef(e.target.value)} placeholder="Reference number" className="w-full h-12 px-4 rounded-xl border outline-none mb-4" />
            )}
            <button onClick={submitBooking} disabled={submitting}
              className="w-full h-14 bg-[#0057FF] text-white text-base font-semibold rounded-xl hover:bg-[#0046CC] disabled:opacity-50">
              {submitting ? "Processing..." : `Confirm — ₦${(selectedSeatIds.size * (selectedTrip?.price || 0)).toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
