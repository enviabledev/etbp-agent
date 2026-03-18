import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./print.css";
import ClientShell from "@/components/ui/ClientShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Enviable Transport — Terminal Agent Portal",
  description: "POS-style booking and check-in for terminal agents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
