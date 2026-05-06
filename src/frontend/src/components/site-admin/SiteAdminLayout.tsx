import {
  getSiteAdminUser,
  isSiteAdminTokenValid,
  removeSiteAdminToken,
} from "@/lib/site-admin-auth";
import { cn } from "@/lib/utils";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  Calendar,
  FileText,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Settings,
  UserPlus,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    to: "/site-admin/dashboard",
    icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    ocid: "site-admin-nav-dashboard",
  },
  {
    label: "Notifications",
    to: "/site-admin/notifications",
    icon: <Bell className="w-4 h-4 shrink-0" />,
    ocid: "site-admin-nav-notifications",
  },
  {
    label: "Official Letters",
    to: "/site-admin/letters",
    icon: <FileText className="w-4 h-4 shrink-0" />,
    ocid: "site-admin-nav-letters",
  },
  {
    label: "Tenders",
    to: "/site-admin/tenders",
    icon: <Briefcase className="w-4 h-4 shrink-0" />,
    ocid: "site-admin-nav-tenders",
  },
  {
    label: "Recruitment",
    to: "/site-admin/recruitment",
    icon: <UserPlus className="w-4 h-4 shrink-0" />,
    ocid: "site-admin-nav-recruitment",
  },
  {
    label: "Banners / Ticker",
    to: "/site-admin/banners",
    icon: <Image className="w-4 h-4 shrink-0" />,
    ocid: "site-admin-nav-banners",
  },
  {
    label: "Important Dates",
    to: "/site-admin/dates",
    icon: <Calendar className="w-4 h-4 shrink-0" />,
    ocid: "site-admin-nav-dates",
  },
  {
    label: "Candidate Settings",
    to: "/site-admin/candidate-settings",
    icon: <Settings className="w-4 h-4 shrink-0" />,
    ocid: "site-admin-nav-candidate-settings",
  },
];

// ─── Logo sub-components ──────────────────────────────────────────────────────

function AshokaStambh({ className }: { className?: string }) {
  return (
    <img
      src="/assets/generated/ashoka-emblem-transparent.dim_200x220.png"
      alt="Ashoka Stambh — National Emblem of India"
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
      alt="Swachh Bharat Mission"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

function DigitalIndiaLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/digital-india.svg"
      alt="Digital India Programme"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

// ─── Government Header ────────────────────────────────────────────────────────

function GovtHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <div
      className="w-full bg-card border-b border-border"
      data-ocid="site-admin-govt-header"
    >
      {/* TOP BAR */}
      <div className="w-full bg-[#154360] px-3 py-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex flex-col w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#138808]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-semibold tracking-wide">
              भारत सरकार &nbsp;/&nbsp; GOVERNMENT OF INDIA
            </span>
            <span className="text-white/80 text-[10px] tracking-wide leading-tight hidden sm:block">
              Department of Post, Ministry of Communication, New Delhi - 110001
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-300 text-[10px] tracking-wide font-semibold uppercase bg-blue-900/40 px-2 py-0.5 rounded hidden sm:inline">
            Website Admin Panel
          </span>
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden text-white/80 hover:text-white p-1 rounded transition-colors"
            aria-label="Toggle sidebar"
            data-ocid="site-admin-mobile-menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MAIN HEADER ROW */}
      <div className="w-full bg-card px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <AshokaStambh className="h-16 w-auto lg:h-20" />
          </div>
          <div className="flex items-center shrink-0 border-r border-border pr-4 mr-1">
            <IndiaPostLogo className="h-20 w-auto lg:h-28" />
          </div>
          <div className="flex-1 text-center min-w-0 px-2">
            <h1
              className="text-[#B22222] font-bold text-2xl lg:text-4xl leading-tight tracking-wide"
              style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700 }}
            >
              Department of Post
            </h1>
            <p
              className="text-[#B22222] font-semibold text-base lg:text-xl leading-tight tracking-wide"
              style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}
            >
              Ministry of Communication, New Delhi - 110001
            </p>
            <p
              className="text-muted-foreground text-xs lg:text-sm mt-1"
              style={{ fontFamily: '"DM Sans", sans-serif' }}
            >
              O/o The Chief Postmaster General, MP Circle, Regional Office
              Jabalpur
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0 border-l border-border pl-4">
            <SwachhBharatLogo className="h-12 w-auto lg:h-14" />
            <DigitalIndiaLogo className="h-12 w-auto lg:h-14" />
          </div>
        </div>
      </div>

      {/* BLUE TICKER — distinguishes from red admin Panel 1 */}
      <div className="w-full overflow-hidden bg-[#1e3a8a]">
        <div className="flex items-center">
          <div className="shrink-0 px-3 py-1 text-white text-xs font-bold uppercase tracking-widest border-r border-white/20 bg-[#1e40af]">
            Site Admin
          </div>
          <div className="flex-1 py-1 px-3">
            <span className="text-white text-xs font-medium">
              Website Content Management System — Secure Admin Area
              &nbsp;|&nbsp; Manage Notifications, Banners &amp; Dates
              &nbsp;|&nbsp; Regional Office Jabalpur
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-bar ──────────────────────────────────────────────────────────────────

function SiteAdminSubBar() {
  const user = getSiteAdminUser();

  function handleLogout() {
    removeSiteAdminToken();
    toast.success("Logged out successfully");
    window.location.href = "/site-admin/login";
  }

  return (
    <div
      className="w-full bg-[#0f172a] px-5 py-2 flex items-center justify-between"
      data-ocid="site-admin-subbar"
    >
      <div className="flex items-center gap-3">
        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="text-white text-xs font-semibold tracking-wide uppercase hidden sm:inline">
          GDS Portal — Website Content Control Panel
        </span>
        <a
          href="/"
          data-ocid="site-admin-subbar-home"
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs border border-white/20 px-2.5 py-0.5 rounded hover:bg-white/10 transition-colors ml-2"
          title="Go to Public Home Page"
        >
          <Home className="w-3 h-3" />
          <span className="hidden sm:inline">Home Page</span>
        </a>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white uppercase">
              {user?.username?.[0] ?? "S"}
            </span>
          </div>
          <span className="text-white/80 text-xs font-medium hidden sm:inline">
            {user?.username ?? "siteadmin"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="site-admin-subbar-logout"
          className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs border border-white/20 px-2.5 py-0.5 rounded hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

function SidebarNavItem({ item, isActive, onClick }: SidebarNavItemProps) {
  return (
    <Link
      to={item.to}
      data-ocid={item.ocid}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 font-medium",
        isActive
          ? "bg-blue-700/15 text-blue-700 font-semibold border-l-2 border-blue-700 pl-[10px]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent pl-[10px]",
      )}
    >
      {item.icon}
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SiteAdminSidebarProps {
  topOffset: number;
  isOpen: boolean;
  onClose: () => void;
}

function SiteAdminSidebar({
  topOffset,
  isOpen,
  onClose,
}: SiteAdminSidebarProps) {
  const { location } = useRouterState();
  const currentPath = location.pathname;

  function handleLogout() {
    removeSiteAdminToken();
    toast.success("Logged out successfully");
    window.location.href = "/site-admin/login";
  }

  const sidebarContent = (
    <>
      {/* Brand label */}
      <div className="px-4 py-3 border-b border-border bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-700 shrink-0" />
            <p className="text-[11px] text-blue-800 font-bold tracking-wide uppercase leading-tight">
              Website Admin Panel
            </p>
          </div>
          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-blue-100 text-blue-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-blue-600 mt-0.5">
          Content Control System
        </p>
      </div>

      {/* Home link */}
      <div className="px-2 pt-3">
        <a
          href="/"
          data-ocid="site-admin-sidebar-home"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 text-muted-foreground hover:text-foreground hover:bg-muted border border-dashed border-border/60 mb-2"
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className="truncate font-medium">Home Page</span>
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            currentPath === item.to ||
            (item.to !== "/site-admin/dashboard" &&
              currentPath.startsWith(item.to));
          return (
            <SidebarNavItem
              key={item.to}
              item={item}
              isActive={isActive}
              onClick={onClose}
            />
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="site-admin-nav-logout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 font-medium"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
          data-ocid="site-admin-sidebar-overlay"
        />
      )}

      {/* Desktop sidebar — always visible */}
      <aside
        className="hidden lg:flex fixed left-0 h-full w-64 flex-col border-r border-border bg-card z-30"
        style={{ top: topOffset }}
        data-ocid="site-admin-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar — slide in */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 flex flex-col border-r border-border bg-card z-50 transition-transform duration-200 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        data-ocid="site-admin-sidebar-mobile"
      >
        <div className="h-16 flex items-center px-4 border-b border-border bg-[#154360]">
          <span className="text-white text-sm font-bold tracking-wide">
            Website Admin Panel
          </span>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

// Measured height of the GovtHeader + SiteAdminSubBar stack (px)
const HEADER_HEIGHT = 240;

interface SiteAdminLayoutProps {
  children?: ReactNode;
}

export function SiteAdminLayout({ children }: SiteAdminLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(HEADER_HEIGHT);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSiteAdminTokenValid()) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/site-admin/login";
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Measure real header height after render
  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver(() => {
      setHeaderHeight(headerRef.current?.offsetHeight ?? HEADER_HEIGHT);
    });
    observer.observe(headerRef.current);
    setHeaderHeight(headerRef.current.offsetHeight);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Fixed top header stack */}
      <div
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 shadow-md"
      >
        <GovtHeader onMenuToggle={() => setMobileSidebarOpen((v) => !v)} />
        <SiteAdminSubBar />
      </div>

      <SiteAdminSidebar
        topOffset={headerHeight}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <main
        className="lg:ml-64 min-h-screen overflow-x-hidden"
        style={{ paddingTop: headerHeight }}
        data-ocid="site-admin-main-content"
      >
        <div className="w-full p-6">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}

export default SiteAdminLayout;
