import { useAdminLogout } from "@/hooks/useAdminQueries";
import { getAdminUser, isTokenValid } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BadgeDollarSign,
  Bell,
  Briefcase,
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Receipt,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
    to: "/admin/dashboard",
    icon: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-dashboard",
  },
  {
    label: "Register Candidate",
    to: "/admin/register-candidate",
    icon: <UserPlus className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-register",
  },
  {
    label: "Supplementary Reg.",
    to: "/admin/supplementary",
    icon: <ClipboardList className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-supplementary",
  },
  {
    label: "Candidate Management",
    to: "/admin/candidates",
    icon: <Users className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-candidates",
  },
  {
    label: "Document Management",
    to: "/admin/documents",
    icon: <FileText className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-documents",
  },
  {
    label: "Fee Status",
    to: "/admin/fee-status",
    icon: <BadgeDollarSign className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-fee",
  },
  {
    label: "Vacancy Management",
    to: "/admin/vacancies",
    icon: <Briefcase className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-vacancies",
  },
  {
    label: "Slip Generate",
    to: "/admin/slip-generate",
    icon: <Receipt className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-slip",
  },
  {
    label: "Notifications",
    to: "/admin/notifications",
    icon: <Bell className="w-4 h-4 flex-shrink-0" />,
    ocid: "admin-nav-notifications",
  },
];

// ─── Logo sub-components ───────────────────────────────────────────────────────

function AshokaStambh({ className }: { className?: string }) {
  return (
    <img
      src="/assets/generated/ashoka-emblem-transparent.dim_200x220.png"
      alt="Ashoka Stambh"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

function IndiaPostLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/images/india-post-logo.jpg"
      alt="India Post"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

function SwachhBharatLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/swachh-bharat.svg"
      alt="Swachh Bharat"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

function DigitalIndiaLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/digital-india.svg"
      alt="Digital India"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

// ─── Government Header ────────────────────────────────────────────────────────

function GovtHeader() {
  return (
    <div
      className="w-full bg-card border-b border-border"
      data-ocid="admin-govt-header"
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
            <span className="text-white/80 text-[10px] tracking-wide leading-tight">
              Department of Post, Ministry of Communication, New Delhi - 110001
            </span>
          </div>
        </div>
        <span className="text-white/70 text-[10px] tracking-wide font-medium uppercase hidden sm:block">
          Admin Panel
        </span>
      </div>

      {/* MAIN HEADER ROW */}
      <div className="w-full bg-card px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <AshokaStambh className="h-16 w-auto" />
          </div>
          <div className="flex items-center shrink-0 border-r border-border pr-3 mr-1">
            <IndiaPostLogo className="h-20 w-auto" />
          </div>
          <div className="flex-1 text-center min-w-0 px-2">
            <h1 className="text-[#B22222] font-bold text-2xl lg:text-3xl leading-tight tracking-wide font-body">
              Department of Post
            </h1>
            <p className="text-[#B22222] font-semibold text-sm lg:text-base leading-tight tracking-wide font-body">
              Ministry of Communication, New Delhi - 110001
            </p>
            <p className="text-muted-foreground text-xs mt-0.5 font-body">
              O/o The Chief Postmaster General, MP Circle, Regional Office
              Jabalpur
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0 border-l border-border pl-3">
            <SwachhBharatLogo className="h-12 w-auto" />
            <DigitalIndiaLogo className="h-12 w-auto" />
          </div>
        </div>
      </div>

      {/* RED TICKER */}
      <div className="w-full overflow-hidden bg-[#cc0000]">
        <div className="flex items-center">
          <div className="shrink-0 px-3 py-1 text-white text-xs font-bold uppercase tracking-widest border-r border-white/20 bg-[#990000]">
            Admin
          </div>
          <div className="flex-1 py-1 px-3">
            <span className="text-white text-xs font-medium">
              GDS Recruitment Management System — Secure Admin Area
              &nbsp;|&nbsp; All actions are logged and monitored &nbsp;|&nbsp;
              Regional Office Jabalpur
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Sub-bar ────────────────────────────────────────────────────────────

function AdminSubBar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = getAdminUser();
  const { mutate: logout } = useAdminLogout();

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        window.location.href = "/admin/login";
      },
    });
  }

  return (
    <div
      className="w-full bg-[#1a1a2e] px-4 py-2 flex items-center justify-between gap-3"
      data-ocid="admin-subbar"
    >
      <div className="flex items-center gap-2">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden flex items-center justify-center w-7 h-7 rounded text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Toggle sidebar"
          data-ocid="admin-mobile-menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <MapPin className="w-3.5 h-3.5 text-orange-400 hidden sm:block" />
        <span className="text-white text-xs font-semibold tracking-wide uppercase hidden sm:block">
          GDS Recruitment — Admin
        </span>
        <a
          href="/"
          data-ocid="admin-subbar-home"
          className="flex items-center gap-1 text-white/70 hover:text-white text-xs border border-white/20 px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
          title="Go to Public Home Page"
        >
          <Home className="w-3 h-3" />
          <span className="hidden sm:inline">Home</span>
        </a>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-[#B22222] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white uppercase">
              {user?.username?.[0] ?? "A"}
            </span>
          </div>
          <span className="text-white/80 text-xs font-medium hidden sm:block truncate max-w-[120px]">
            {user?.username ?? "admin"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="admin-subbar-logout"
          className="flex items-center gap-1 text-white/70 hover:text-white text-xs border border-white/20 px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function AdminSidebar({
  topOffset,
  open,
  onClose,
}: {
  topOffset: number;
  open: boolean;
  onClose: () => void;
}) {
  const { location } = useRouterState();
  const { mutate: logout } = useAdminLogout();
  const currentPath = location.pathname;

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        window.location.href = "/admin/login";
      },
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 h-full w-60 flex flex-col border-r border-border bg-card z-40 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{ top: topOffset }}
        data-ocid="admin-sidebar"
      >
        {/* Label */}
        <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground font-semibold tracking-widest uppercase">
            Navigation
          </p>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Home link */}
        <div className="px-2 pt-3">
          <a
            href="/"
            data-ocid="admin-sidebar-home"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted border border-dashed border-border/60 mb-1"
            onClick={() => onClose()}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span className="truncate font-medium">Home Page</span>
          </a>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentPath === item.to ||
              (item.to !== "/admin/dashboard" &&
                currentPath.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={item.ocid}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-[#B22222] text-white font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="px-2 py-3 border-t border-border">
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="admin-nav-logout"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Admin header stack heights:
 *   top-bar  ~28px
 *   logo-row ~104px
 *   red-bar  ~24px
 *   sub-bar  ~38px
 *   ≈ 194px total
 */
export const ADMIN_HEADER_HEIGHT = 194;
export const ADMIN_SIDEBAR_WIDTH = 240; // px (w-60)

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTokenValid()) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login";
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Fixed top header */}
      <div className="fixed top-0 left-0 right-0 z-50 shadow-md">
        <GovtHeader />
        <AdminSubBar onMenuClick={() => setSidebarOpen((v) => !v)} />
      </div>

      {/* Sidebar */}
      <AdminSidebar
        topOffset={ADMIN_HEADER_HEIGHT}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main
        className="min-h-screen overflow-x-hidden"
        style={{
          paddingTop: ADMIN_HEADER_HEIGHT,
          paddingLeft: 0,
        }}
        data-ocid="admin-main-content"
      >
        <div className="lg:ml-60 min-h-screen" style={{ minWidth: 0 }}>
          <div className="w-full p-5 pb-10">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
