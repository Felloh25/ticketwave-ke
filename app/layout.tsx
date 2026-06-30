"use client";
import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { FaTiktok, FaXTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa6";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">

        {/* NAVBAR */}
        <nav className="border-b border-white/10 px-4 md:px-6 py-4 sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-50">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg md:text-xl font-bold tracking-tight text-white flex-shrink-0">
              TicketWave<span className="text-green-400">KE</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm text-gray-400 hover:text-white transition">Home</Link>
              <Link href="/events" className="text-sm text-gray-400 hover:text-white transition">Events</Link>
              <Link href="/gallery" className="text-sm text-gray-400 hover:text-white transition">Gallery</Link>
              <Link href="/planners" className="text-sm text-gray-400 hover:text-white transition">For Planners</Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition">Contact</Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/tickets" className="bg-green-400 text-black text-xs md:text-sm px-3 md:px-5 py-2 rounded-full font-bold hover:bg-green-300 transition whitespace-nowrap">
                Get Tickets
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-white w-9 h-9 flex items-center justify-center border border-white/10 rounded-lg flex-shrink-0">
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden flex flex-col gap-1 mt-4 pb-2">
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition py-2 px-2 rounded-lg hover:bg-white/5">Home</Link>
              <Link href="/events" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition py-2 px-2 rounded-lg hover:bg-white/5">Events</Link>
              <Link href="/gallery" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition py-2 px-2 rounded-lg hover:bg-white/5">Gallery</Link>
              <Link href="/planners" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition py-2 px-2 rounded-lg hover:bg-white/5">For Planners</Link>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-sm text-gray-400 hover:text-white transition py-2 px-2 rounded-lg hover:bg-white/5">Contact</Link>
            </div>
          )}
        </nav>

        {/* PAGE CONTENT */}
        <main className="flex-1">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/10 px-6 py-10 bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">

              {/* BRAND */}
              <div className="max-w-xs">
                <span className="text-xl font-bold text-white">
                  TicketWave<span className="text-green-400">KE</span>
                </span>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                  Kenya's number one youth event platform. Discover, book and enjoy the best experiences across all 47 counties.
                </p>
              </div>

              {/* LINKS */}
              <div className="flex gap-16">
                <div>
                  <p className="text-white text-sm font-semibold mb-4">Platform</p>
                  <div className="flex flex-col gap-2">
                    <Link href="/" className="text-gray-500 text-sm hover:text-white transition">Home</Link>
                    <Link href="/events" className="text-gray-500 text-sm hover:text-white transition">Events</Link>
                    <Link href="/gallery" className="text-gray-500 text-sm hover:text-white transition">Gallery</Link>
                    <Link href="/tickets" className="text-gray-500 text-sm hover:text-white transition">Get Tickets</Link>
                  </div>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-4">Company</p>
                  <div className="flex flex-col gap-2">
                    <Link href="/planners" className="text-gray-500 text-sm hover:text-white transition">For Planners</Link>
                    <Link href="/contact" className="text-gray-500 text-sm hover:text-white transition">Contact</Link>
                  </div>
                </div>
              </div>

              {/* SOCIAL */}
              <div>
                <p className="text-white text-sm font-semibold mb-4">Follow us</p>
                <div className="flex gap-3">
                  <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-green-400/40 hover:text-green-400 transition">
                    <FaTiktok size={15} />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-green-400/40 hover:text-green-400 transition">
                    <FaXTwitter size={15} />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-green-400/40 hover:text-green-400 transition">
                    <FaInstagram size={15} />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:border-green-400/40 hover:text-green-400 transition">
                    <FaWhatsapp size={15} />
                  </a>
                </div>
              </div>

            </div>

            {/* BOTTOM */}
            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
              <p className="text-gray-500 text-xs">2026 TicketWave KE. All rights reserved.</p>
              <p className="text-gray-500 text-xs">
                Built by <span className="text-green-400 font-medium">Felix Muthoka</span>
              </p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}