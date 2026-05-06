import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogIn, LogOut, Menu, Shield, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  onMenuToggle: () => void;
}

const TICKER_TEXT =
  "Gramin Dak Sevak (GDS) Online Engagement Special Drive Schedule 1 | Notification Date: 01.06.2025  ✤   |   Gramin Dak Sevak (GDS) Online Engagement Special Drive Schedule 2 | Notification Date: 01.10.2025  ✤   |   Gramin Dak Sevak (GDS) Online Engagement Special Drive Schedule 3 | Notification Date: 15.01.2026  ✤   |   List-I of Shortlisted Candidates Published  ✤   |   Applications are invited for Gramin Dak Sevak Posts - Special Drive  ✤   |   Important: Edit/Correction Window is open from 18-02-2026 to 19-02-2026  ✤";

export function Header({ onMenuToggle }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className="w-full z-50 bg-white border-b border-gray-300 shadow-sm"
      data-ocid="portal-header"
    >
      {/* TOP BAR: Government of India */}
      <div className="w-full bg-[#154360] px-3 sm:px-5 py-1.5 flex items-center justify-between gap-3 min-h-[32px]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Indian flag tricolor bar */}
          <div className="flex flex-col w-5 h-4 rounded-sm overflow-hidden shrink-0 border border-white/20">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#138808]" />
          </div>
          <div className="flex flex-col min-w-0 gap-0.5">
            <span className="text-white text-[11px] sm:text-xs font-semibold tracking-wide whitespace-nowrap leading-none">
              भारत सरकार &nbsp;/&nbsp; GOVERNMENT OF INDIA
            </span>
            <span className="text-white/75 text-[9px] sm:text-[10px] tracking-wide leading-none hidden sm:block">
              Department of Post, Ministry of Communication, New Delhi - 110001
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-white text-[11px] border border-white/40 px-2.5 py-1 rounded hover:bg-white/15 active:bg-white/25 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              data-ocid="logout-btn"
            >
              <LogOut className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            /* LOGIN DROPDOWN */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 text-white text-[11px] border border-white/40 px-2.5 py-1 rounded hover:bg-white/15 active:bg-white/25 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                data-ocid="login-btn"
              >
                <LogIn className="h-3 w-3 shrink-0" />
                <span className="whitespace-nowrap">Login / Register</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200 shrink-0",
                    dropdownOpen && "rotate-180",
                  )}
                />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-48 rounded-md shadow-xl border border-gray-200 bg-white z-50 overflow-hidden"
                  role="menu"
                  aria-label="Login options"
                >
                  {/* Candidate Login */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate({ to: "/login" });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-orange-50 hover:text-[#B22222] active:bg-orange-100 transition-colors duration-150 border-b border-gray-100 focus-visible:ring-2 focus-visible:ring-[#B22222] focus-visible:outline-none"
                    data-ocid="candidate-login-option"
                  >
                    <User className="h-3.5 w-3.5 text-[#B22222] shrink-0" />
                    <span>Candidate Login</span>
                  </button>

                  {/* Admin Login */}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate({ to: "/admin/login" });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-red-50 hover:text-[#990000] active:bg-red-100 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#990000] focus-visible:outline-none"
                    data-ocid="admin-login-option"
                  >
                    <Shield className="h-3.5 w-3.5 text-[#990000] shrink-0" />
                    <span>Admin Login</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN HEADER ROW */}
      <div className="w-full bg-white px-3 sm:px-5 py-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 shrink-0 focus-visible:ring-2 focus-visible:ring-[#B22222] focus-visible:outline-none"
            aria-label="Toggle sidebar"
            data-ocid="sidebar-toggle"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>

          {/* LEFT: Ashoka Stambh */}
          <Link
            to="/"
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222] rounded"
            aria-label="Home – National Emblem of India"
          >
            <AshokaStambh className="h-14 sm:h-18 md:h-20 w-auto" />
          </Link>

          {/* CENTER-LEFT: India Post Logo */}
          <div className="flex items-center shrink-0 border-r border-gray-200 pr-2 sm:pr-4 mr-1">
            <IndiaPostLogo className="h-16 sm:h-22 md:h-24 w-auto max-w-[90px] sm:max-w-[130px]" />
          </div>

          {/* CENTER: Main Title */}
          <div className="flex-1 text-center min-w-0 px-1 sm:px-3">
            <h1
              className="text-[#B22222] font-bold text-lg sm:text-2xl lg:text-3xl leading-tight tracking-wide truncate-none"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontStyle: "normal",
                fontWeight: 700,
              }}
            >
              Department of Post
            </h1>
            <p
              className="text-[#B22222] font-semibold text-sm sm:text-base lg:text-lg leading-snug tracking-wide mt-0.5"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontStyle: "normal",
                fontWeight: 600,
              }}
            >
              Ministry of Communication, New Delhi - 110001
            </p>
            <p
              className="text-gray-500 text-[10px] sm:text-xs mt-1 leading-snug hidden sm:block"
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontStyle: "normal",
              }}
            >
              O/o The Chief Postmaster General, MP Circle, Regional Office
              Jabalpur
            </p>
          </div>

          {/* RIGHT: Swachh Bharat + Digital India */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0 border-l border-gray-200 pl-3 lg:pl-4">
            <SwachhBharatLogo className="h-12 lg:h-14 w-auto" />
            <DigitalIndiaLogo className="h-12 lg:h-14 w-auto" />
          </div>
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <div className="w-full bg-[#B22222] border-t border-[#9a1e1e]">
        <nav
          className="flex items-stretch overflow-x-auto scrollbar-none px-1 sm:px-2"
          aria-label="Portal navigation"
        >
          <NavLink href="/" label="Home" />
          <NavLink href="/notifications" label="Notifications" />
          <NavLink href="/circle-posts" label="Vacant Posts" />
          <NavLink href="/login" label="Apply Online" />
          <NavLink href="/grievance" label="Helpdesk" />
        </nav>
      </div>

      {/* RED MARQUEE TICKER */}
      <div
        className="w-full overflow-hidden bg-[#cc0000]"
        data-ocid="ticker-bar"
      >
        <div className="flex items-stretch">
          <div className="shrink-0 px-3 py-1 text-white text-[10px] font-bold uppercase tracking-widest border-r border-white/20 whitespace-nowrap flex items-center bg-[#990000]">
            Latest
          </div>
          <div className="flex-1 overflow-hidden py-1 px-2">
            <span
              className="text-white text-xs whitespace-nowrap animate-marquee-ticker inline-block"
              style={{ willChange: "transform" }}
            >
              {TICKER_TEXT}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Nav Link Helper ──────────────────────────────────────────────────────────
function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-white text-xs font-semibold px-3 sm:px-4 py-2.5 whitespace-nowrap hover:bg-[#9a1e1e] active:bg-[#7a1515] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset border-r border-[#9a1e1e]/50 last:border-r-0"
    >
      {label}
    </a>
  );
}

// ─── Logo Sub-components ──────────────────────────────────────────────────────

function AshokaStambh({ className }: { className?: string }) {
  return (
    <img
      src="/assets/generated/ashoka-emblem-transparent.dim_200x220.png"
      alt="राष्ट्रीय प्रतीक — Ashoka Stambh (National Emblem of India)"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

function IndiaPostLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/images/india-post-logo.jpg"
      alt="India Post — Department of Posts, Government of India"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

function SwachhBharatLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/swachh-bharat.svg"
      alt="Swachh Bharat Mission — स्वच्छ भारत अभियान"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

function DigitalIndiaLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/digital-india.svg"
      alt="Digital India Programme — Government of India"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}
