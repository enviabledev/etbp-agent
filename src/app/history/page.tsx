"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/v1/agent/history").then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#0057FF] border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 rounded-lg text-xl">←</button>
        <h1 className="text-lg font-bold">Today&apos;s Bookings</h1>
        <div className="ml-auto text-right">
          <p className="text-sm text-gray-500">{data?.count || 0} bookings</p>
          <p className="font-bold text-lg">₦{(data?.total_revenue || 0).toLocaleString()}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Ref</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Route</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Passengers</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.items || []).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No bookings today</td></tr>
              ) : (data?.items || []).map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-bold">{b.reference}</td>
                  <td className="px-5 py-3 text-sm">{b.route_name || "—"}</td>
                  <td className="px-5 py-3">{b.passenger_count}</td>
                  <td className="px-5 py-3 font-medium">₦{b.total_amount?.toLocaleString()}</td>
                  <td className="px-5 py-3"><span className="text-xs capitalize px-2 py-1 rounded bg-gray-100">{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
