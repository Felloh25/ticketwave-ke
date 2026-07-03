"use client";
import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaTiktok, FaXTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/planners", label: "For Planners" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("ticketwave-welcome");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setShowWelcome(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeWelcome = () => {
    localStorage.setItem("ticketwave-welcome", "true");
    setShowWelcome(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <title>TicketWave KE | Discover Events and Book Tickets</title>
        <meta name="description" content="Discover, book, and manage unforgettable events across Kenya with TicketWave KE." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#0a0a0a] text-white">

        {/* NAVBAR */}
        <nav className={"sticky top-0 z-50 px-4 md:px-6 py-3 transition-all duration-300 " + (scrolled ? "border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl shadow-lg shadow-black/20" : "bg-transparent")}>
          <div className="mx-auto flex max-w-7xl items-center justify-between">

            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-xs">TW</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white md:text-xl">
                TicketWave<span className="text-green-400">KE</span>
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={"px-4 py-2 rounded-full text-sm transition " + (isActive(link.href)
                    ? "text-white bg-white/10 font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5")}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden md:block text-sm text-gray-400 hover:text-white transition px-3 py-2 rounded-full hover:bg-white/5">
                Login
              </Link>
              <Link
                href="/register"
                className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-black bg-green-400 px-4 py-2 rounded-full hover:bg-green-300 hover:scale-105 transition-all shadow-lg shadow-green-400/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                Sign Up
              </Link>
              <Link
                href="/tickets"
                className="text-xs md:text-sm font-bold text-black bg-green-400 px-3 md:px-4 py-2 rounded-full hover:bg-green-300 transition whitespace-nowrap md:hidden">
                Tickets
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-white/5 transition"
                aria-label="Toggle navigation">
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {menuOpen && (
            <div className="mx-auto mt-3 flex max-w-7xl flex-col gap-1 rounded-2xl border border-white/10 bg-[#111] p-2 md:hidden shadow-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={"rounded-xl px-4 py-3 text-sm transition " + (isActive(link.href)
                    ? "bg-white/10 text-white font-medium"
                    : "text-gray-400 hover:bg-white/5 hover:text-white")}>
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/10 mt-1 pt-1 flex flex-col gap-1">
                <Link href="/login" className="rounded-xl px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition">
                  Login
                </Link>
                <Link href="/register" className="rounded-xl px-4 py-3 text-sm font-bold text-black bg-green-400 hover:bg-green-300 transition text-center">
                  Sign Up Free
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* PAGE CONTENT */}
        <main className="flex-1">{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-[#0a0a0a] px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-4">

              {/* BRAND */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-black font-bold text-xs">TW</span>
                  </div>
                  <span className="text-xl font-bold text-white">
                    TicketWave<span className="text-green-400">KE</span>
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-gray-500 max-w-xs mb-6">
                  Kenya's modern event ticketing platform. Discover events, book tickets securely, and create unforgettable memories — for every age, across all 47 counties.
                </p>
                <div className="flex gap-3">
                  {[
                    { Icon: FaTiktok, label: "TikTok" },
                    { Icon: FaXTwitter, label: "Twitter" },
                    { Icon: FaInstagram, label: "Instagram" },
                    { Icon: FaWhatsapp, label: "WhatsApp" },
                  ].map(({ Icon, label }) => (
                    
                      key={label}
                      href="#"
                      title={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition hover:border-green-400/40 hover:text-green-400 hover:bg-green-400/5">
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
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

              {/* SUPPORT */}
              <div>
                <p className="mb-4 text-sm font-semibold text-white">Support</p>
                <div className="flex flex-col gap-2.5">
                  <Link href="/contact" className="text-sm text-gray-500 transition hover:text-white">Help Center</Link>
                  <Link href="/contact" className="text-sm text-gray-500 transition hover:text-white">Privacy Policy</Link>
                  <Link href="/contact" className="text-sm text-gray-500 transition hover:text-white">Terms of Service</Link>
                  <Link href="/register" className="text-sm text-gray-500 transition hover:text-white">Create Account</Link>
                </div>
                <div className="mt-6 bg-green-400/10 border border-green-400/20 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-green-400 mb-1">List your event</p>
                  <p className="text-xs text-gray-500 mb-3">Reach thousands of people across Kenya</p>
                  <Link href="/planners" className="text-xs font-bold text-black bg-green-400 px-4 py-2 rounded-full hover:bg-green-300 transition inline-block">
                    Get Started
                  </Link>
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

        {/* WELCOME MODAL */}
        {showWelcome && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeWelcome} />
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111] p-7 shadow-2xl shadow-black/50 z-10">
              <button
                onClick={closeWelcome}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-white hover:bg-white/10 transition text-sm">
                ✕
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-green-400/10 border border-green-400/20 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                  🎟️
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-0.5">Welcome</p>
                  <h2 className="text-lg font-bold text-white">Welcome to TicketWave<span className="text-green-400">KE</span></h2>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-400 mb-6">
                Create your free account to book tickets faster, save your favorite events, receive exclusive offers, and manage all your bookings in one place.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/register"
                  onClick={closeWelcome}
                  className="w-full text-center bg-green-400 text-black py-3 rounded-full font-bold text-sm hover:bg-green-300 hover:scale-105 transition-all shadow-lg shadow-green-400/20">
                  Sign Up
                </Link>
                <button
                  onClick={closeWelcome}
                  className="w-full border border-white/10 text-gray-400 py-3 rounded-full text-sm hover:bg-white/5 hover:text-white transition">
                  Maybe Later
                </button>
              </div>
              <p className="text-center text-xs text-gray-600 mt-4">
                Already have an account?{" "}
                <Link href="/login" onClick={closeWelcome} className="text-green-400 hover:underline">Login</Link>
              </p>
            </div>
          </div>
        )}

        {/* VERCEL ANALYTICS */}
        <Analytics />

      </body>
    </html>
  );
}