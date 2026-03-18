"use client";
import { useState, useEffect } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const off = () => setIsOffline(true);
    const on = () => setIsOffline(false);
    window.addEventListener("offline", off);
    window.addEventListener("online", on);
    return () => { window.removeEventListener("offline", off); window.removeEventListener("online", on); };
  }, []);

  if (!isOffline) return null;
  return (
    <div className="bg-yellow-500 text-white text-center py-2 text-sm font-medium sticky top-0 z-50">
      You&apos;re offline — showing cached data. Some features are limited.
    </div>
  );
}
