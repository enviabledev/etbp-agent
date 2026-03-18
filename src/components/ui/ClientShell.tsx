"use client";
import { useEffect } from "react";
import OfflineBanner from "./OfflineBanner";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}
