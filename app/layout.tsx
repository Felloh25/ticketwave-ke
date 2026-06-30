import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "TicketWave KE",
  description: "Discover and book events across Kenya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">

        {/* NAVBAR */}
        <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md z-50">
          <Link href="/" className="text-xl font-bold tracking-tight text-white">
            TicketWave<span className="text-green-400">KE</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition">Home</Link>
            <Link href="/events" className="text-sm text-gray-400 hover:text-white transition">Events</Link>
            <Link href="/planners" className="text-sm text-gray-400 hover:text-white transition">For Planners</Link>
            <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition">Contact</Link>
          </div>
          <Link href="/tickets" className="bg-green-400 text-black text-sm px-5 py-2 rounded-full font-bold hover:bg-green-300 transition">
            Get Tickets
          </Link>
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