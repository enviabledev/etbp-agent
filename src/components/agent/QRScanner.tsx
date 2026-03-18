"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  manifest: { booking_id: string; booking_ref: string; passenger_name: string; seat_number: string; checked_in: boolean }[];
  tripId: string;
  onCheckin: (bookingId: string) => Promise<void>;
}

type ScanResult = { type: "success" | "already" | "notfound" | "error"; message: string; detail?: string };

export default function QRScanner({ open, onClose, manifest, onCheckin }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [lastScanned, setLastScanned] = useState("");
  const checkedCount = manifest.filter(m => m.checked_in).length;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const scannerId = "qr-reader";
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        if (decodedText === lastScanned) return;
        setLastScanned(decodedText);

        const bookingRef = decodedText.replace(/^ETBP-/i, "").trim().toUpperCase();
        const entry = manifest.find(m => m.booking_ref.toUpperCase() === bookingRef || m.booking_ref.toUpperCase().includes(bookingRef));

        if (!entry) {
          setResult({ type: "notfound", message: "Booking not found on this trip", detail: bookingRef });
        } else if (entry.checked_in) {
          setResult({ type: "already", message: "Already checked in", detail: entry.passenger_name });
        } else {
          try {
            await onCheckin(entry.booking_id);
            // Simple beep
            try { const ctx = new AudioContext(); const osc = ctx.createOscillator(); osc.frequency.value = 800; osc.connect(ctx.destination); osc.start(); setTimeout(() => osc.stop(), 150); } catch {}
            setResult({ type: "success", message: entry.passenger_name, detail: `Seat ${entry.seat_number}` });
          } catch (e: any) {
            setResult({ type: "error", message: e?.toString() || "Check-in failed" });
          }
        }
        setTimeout(() => { setResult(null); setLastScanned(""); }, 2500);
      },
      () => {}
    ).catch(() => {});

    return () => { scanner.stop().catch(() => {}); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const resultColors = { success: "bg-green-600", already: "bg-amber-500", notfound: "bg-red-600", error: "bg-red-600" };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black text-white">
        <span className="font-bold">Scan Boarding Pass</span>
        <span className="text-sm">{checkedCount}/{manifest.length} checked in</span>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex-1 flex items-center justify-center relative">
        <div id="qr-reader" ref={containerRef} style={{ width: 350 }} />
        {result && (
          <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 ${resultColors[result.type]} text-white px-8 py-4 rounded-2xl text-center shadow-xl`}>
            <p className="text-lg font-bold">{result.type === "success" ? "✓" : result.type === "already" ? "⚠" : "✗"} {result.message}</p>
            {result.detail && <p className="text-sm opacity-80">{result.detail}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
