"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-16 border-b transition-all duration-200 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-[#e5e5e5]"
            : "bg-white border-transparent"
        }`}
      >
        <div className="max-w-300 mx-auto h-full flex items-center justify-between px-5 md:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-semibold text-foreground">
              Logo
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {["Product", "Customers", "Pricing", "Company"].map((item) => (
              <button
                key={item}
                className="px-3.5 py-2 text-[15px] font-medium text-foreground rounded-md border-[1.5px] border-transparent hover:border-border hover:shadow-[2px_2px_0_#0a0a0a] transition-all duration-150"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/register"
              className="text-[15px] font-medium text-foreground px-3 py-2"
            >
              Sign in
            </Link>
            <Link href="#" className="btn-primary text-sm">
              Book a demo
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="ml-0.5"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-background p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-16 md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-6">
            {["Product", "Customers", "Pricing", "Company"].map((item) => (
              <button
                key={item}
                className="text-2xl font-medium text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </button>
            ))}
            <div className="flex flex-col items-center gap-4 mt-6">
              <Link
                href="/register"
                className="text-xl font-medium text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                href="#"
                className="btn-primary"
                onClick={() => setMobileOpen(false)}
              >
                Book a demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
