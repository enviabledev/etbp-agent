"use client";

import { QRCodeSVG } from "qrcode.react";

interface ReceiptProps {
  reference: string;
  routeName: string;
  departureDate: string;
  departureTime: string;
  passengers: { name: string; seat: string }[];
  totalAmount: number;
  paymentMethod: string;
  agentName: string;
  terminalName: string;
  createdAt: string;
}

export default function BookingReceipt({ reference, routeName, departureDate, departureTime, passengers, totalAmount, paymentMethod, agentName, terminalName, createdAt }: ReceiptProps) {
  return (
    <div className="print-area bg-white p-4" style={{ width: 302, fontFamily: "monospace" }}>
      {/* Header */}
      <div className="text-center mb-3 pb-2 border-b border-dashed border-gray-400">
        <p className="text-sm font-bold">ENVIABLE TRANSPORT</p>
        <p className="text-xs text-gray-500">E-TICKET</p>
      </div>

      {/* QR */}
      <div className="flex justify-center mb-3">
        <QRCodeSVG value={`ETBP-${reference}`} size={120} />
      </div>

      {/* Reference */}
      <p className="text-center text-lg font-bold tracking-wider mb-3">{reference}</p>

      {/* Dashed line */}
      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Trip details */}
      <div className="text-xs space-y-1 mb-2">
        <p><span className="text-gray-500">Route:</span> {routeName}</p>
        <p><span className="text-gray-500">Date:</span> {departureDate}</p>
        <p><span className="text-gray-500">Time:</span> {departureTime}</p>
        <p><span className="text-gray-500">Seat(s):</span> {passengers.map(p => p.seat).join(", ")}</p>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Passengers */}
      <div className="text-xs space-y-1 mb-2">
        {passengers.map((p, i) => (
          <p key={i}><span className="text-gray-500">Passenger:</span> {p.name}</p>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Payment */}
      <div className="text-xs space-y-1 mb-2">
        <p><span className="text-gray-500">Amount:</span> <span className="font-bold">₦{totalAmount.toLocaleString()}</span></p>
        <p><span className="text-gray-500">Payment:</span> {paymentMethod.toUpperCase()}</p>
        <p><span className="text-gray-500">Status:</span> CONFIRMED</p>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2" />

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center space-y-0.5">
        <p>Agent: {agentName}</p>
        <p>Terminal: {terminalName}</p>
        <p>{createdAt}</p>
        <p className="mt-2 text-[10px]">Thank you for choosing Enviable Transport!</p>
      </div>
    </div>
  );
}
