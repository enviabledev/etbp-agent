"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ShiftReportPage() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [date]);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/agent/shift-report", { params: { report_date: date } });
      setData(res.data);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4 no-print">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 rounded-lg text-xl">←</button>
        <h1 className="text-lg font-bold">Shift Report</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="ml-auto h-10 px-3 border rounded-lg text-sm" />
        <button onClick={() => window.print()} className="h-10 px-4 bg-[#0057FF] text-white rounded-lg text-sm font-medium">Print</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-[#0057FF] border-t-transparent rounded-full" /></div>
      ) : data ? (
        <div className="max-w-4xl mx-auto px-6 py-6 print-area">
          {/* Print header */}
          <div className="text-center mb-6 hidden print:block">
            <p className="font-bold text-lg">ENVIABLE TRANSPORT — SHIFT REPORT</p>
            <p className="text-sm">{data.agent_name} | {date}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border p-4"><span className="text-sm text-gray-500">Bookings</span><p className="text-2xl font-bold">{data.total_bookings}</p></div>
            <div className="bg-white rounded-xl border p-4"><span className="text-sm text-gray-500">Passengers</span><p className="text-2xl font-bold">{data.total_passengers}</p></div>
            <div className="bg-white rounded-xl border p-4"><span className="text-sm text-gray-500">Check-ins</span><p className="text-2xl font-bold">{data.total_checkins}</p></div>
            <div className="bg-white rounded-xl border p-4"><span className="text-sm text-gray-500">Total Revenue</span><p className="text-2xl font-bold">₦{data.revenue?.total?.toLocaleString()}</p></div>
          </div>

          {/* Revenue breakdown */}
          <div className="bg-white rounded-xl border p-5 mb-6">
            <h3 className="font-bold mb-3">Revenue Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">Cash</span><p className="font-bold">₦{data.revenue?.cash?.toLocaleString()}</p></div>
              <div><span className="text-gray-500">POS</span><p className="font-bold">₦{data.revenue?.pos?.toLocaleString()}</p></div>
              <div><span className="text-gray-500">Transfer</span><p className="font-bold">₦{data.revenue?.transfer?.toLocaleString()}</p></div>
            </div>
          </div>

          {/* Bookings table */}
          <div className="bg-white rounded-xl border overflow-hidden mb-6">
            <div className="px-5 py-3 border-b"><h3 className="font-bold">Bookings ({data.bookings?.length || 0})</h3></div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b"><tr>
                <th className="text-left px-5 py-2 text-xs uppercase text-gray-500">Ref</th>
                <th className="text-left px-5 py-2 text-xs uppercase text-gray-500">Route</th>
                <th className="text-left px-5 py-2 text-xs uppercase text-gray-500">Pax</th>
                <th className="text-left px-5 py-2 text-xs uppercase text-gray-500">Amount</th>
                <th className="text-left px-5 py-2 text-xs uppercase text-gray-500">Method</th>
                <th className="text-left px-5 py-2 text-xs uppercase text-gray-500">Time</th>
              </tr></thead>
              <tbody className="divide-y">
                {(data.bookings || []).map((b: any) => (
                  <tr key={b.reference}>
                    <td className="px-5 py-2 font-mono font-bold">{b.reference}</td>
                    <td className="px-5 py-2">{b.route_name || "—"}</td>
                    <td className="px-5 py-2">{b.passengers}</td>
                    <td className="px-5 py-2">₦{b.amount?.toLocaleString()}</td>
                    <td className="px-5 py-2 capitalize">{b.payment_method}</td>
                    <td className="px-5 py-2 text-gray-500">{b.created_at?.substring(11, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cancellations */}
          {data.cancellations?.length > 0 && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-3 border-b"><h3 className="font-bold text-red-600">Cancellations ({data.cancellations.length})</h3></div>
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {data.cancellations.map((c: any) => (
                    <tr key={c.reference}>
                      <td className="px-5 py-2 font-mono">{c.reference}</td>
                      <td className="px-5 py-2">{c.route_name}</td>
                      <td className="px-5 py-2">₦{c.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Shift times */}
          {data.start_time && (
            <div className="mt-6 text-sm text-gray-500 text-center">
              Shift: {data.start_time?.substring(11, 16)} — {data.end_time?.substring(11, 16)}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
