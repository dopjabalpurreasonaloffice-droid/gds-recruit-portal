import { isSiteAdminTokenValid } from "@/lib/site-admin-auth";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  Calendar,
  FileText,
  Image,
  LayoutDashboard,
  Settings,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

function useSiteNotificationCounts() {
  const [counts, setCounts] = useState({
    total: 3,
    letters: 0,
    tenders: 0,
    recruitment: 3,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("siteNotifications");
      if (raw) {
        const items = JSON.parse(raw) as Array<{ category: string }>;
        const letters = items.filter(
          (i) => i.category === "Official Letters",
        ).length;
        const tenders = items.filter((i) => i.category === "Tenders").length;
        const recruitment = items.filter(
          (i) => i.category === "Recruitment",
        ).length;
        setCounts({ total: items.length, letters, tenders, recruitment });
      }
    } catch {
      // use defaults
    }
  }, []);

  return counts;
}

// ─── Live clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div
      className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-right shrink-0"
      data-ocid="site-admin-clock"
    >
      <p className="text-xs text-blue-600 font-medium">{dateStr}</p>
      <p className="text-lg font-bold text-blue-800 font-mono">{timeStr}</p>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  to: string;
  valueColor: string;
  iconBg: string;
  borderColor: string;
}

function StatCard({
  label,
  value,
  icon,
  to,
  valueColor,
  iconBg,
  borderColor,
}: StatCardProps) {
  return (
    <Link
      to={to}
      className={`block bg-card border ${borderColor} rounded-xl p-5 hover:shadow-md transition-all duration-200 group`}
      data-ocid={`site-admin-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shrink-0`}
        >
          {icon}
        </div>
      </div>
    </Link>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

interface QuickActionProps {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  ocid: string;
}

function QuickAction({ label, description, to, icon, ocid }: QuickActionProps) {
  return (
    <Link
      to={to}
      data-ocid={ocid}
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors duration-150 group"
    >
      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 group-hover:bg-blue-200 transition-colors duration-150 shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {label}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {description}
        </p>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SiteAdminDashboard() {
  const counts = useSiteNotificationCounts();

  useEffect(() => {
    if (!isSiteAdminTokenValid()) {
      window.location.href = "/site-admin/login";
    }
  }, []);

  return (
    <div className="space-y-6" data-ocid="site-admin-dashboard">
      {/* Page header + clock */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Website Content Control Panel
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage notifications, letters, banners, and important dates
            </p>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              Welcome to Website Admin Panel
            </h2>
            <p className="text-blue-200 text-sm mt-0.5">
              Control all content displayed on the GDS Recruitment Portal public
              website.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Notifications"
          value={counts.total}
          icon={<Bell className="w-6 h-6 text-blue-700" />}
          to="/site-admin/notifications"
          valueColor="text-blue-700"
          iconBg="bg-blue-100"
          borderColor="border-blue-200"
        />
        <StatCard
          label="Official Letters"
          value={counts.letters}
          icon={<FileText className="w-6 h-6 text-red-700" />}
          to="/site-admin/letters"
          valueColor="text-red-700"
          iconBg="bg-red-100"
          borderColor="border-red-200"
        />
        <StatCard
          label="Tenders"
          value={counts.tenders}
          icon={<Briefcase className="w-6 h-6 text-orange-600" />}
          to="/site-admin/tenders"
          valueColor="text-orange-600"
          iconBg="bg-orange-100"
          borderColor="border-orange-200"
        />
        <StatCard
          label="Recruitment"
          value={counts.recruitment}
          icon={<UserPlus className="w-6 h-6 text-green-700" />}
          to="/site-admin/recruitment"
          valueColor="text-green-700"
          iconBg="bg-green-100"
          borderColor="border-green-200"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">
            Quick Actions
          </h2>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction
            label="Notifications"
            description="All categories — add, edit, delete"
            to="/site-admin/notifications"
            icon={<Bell className="w-5 h-5" />}
            ocid="site-admin-quick-notifications"
          />
          <QuickAction
            label="Official Letters"
            description="Government orders and circulars"
            to="/site-admin/letters"
            icon={<FileText className="w-5 h-5" />}
            ocid="site-admin-quick-letters"
          />
          <QuickAction
            label="Tenders"
            description="Procurement and tender notices"
            to="/site-admin/tenders"
            icon={<Briefcase className="w-5 h-5" />}
            ocid="site-admin-quick-tenders"
          />
          <QuickAction
            label="Recruitment"
            description="GDS schedule and drive notices"
            to="/site-admin/recruitment"
            icon={<UserPlus className="w-5 h-5" />}
            ocid="site-admin-quick-recruitment"
          />
          <QuickAction
            label="Banners / Ticker"
            description="Red marquee text on home page"
            to="/site-admin/banners"
            icon={<Image className="w-5 h-5" />}
            ocid="site-admin-quick-banners"
          />
          <QuickAction
            label="Important Dates"
            description="Schedule dates visible on home page"
            to="/site-admin/dates"
            icon={<Calendar className="w-5 h-5" />}
            ocid="site-admin-quick-dates"
          />
          <QuickAction
            label="Candidate Panel Settings"
            description="Dates, notifications & card images"
            to="/site-admin/candidate-settings"
            icon={<Settings className="w-5 h-5" />}
            ocid="site-admin-quick-candidate-settings"
          />
        </div>
      </div>

      {/* System info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-blue-700 shrink-0" />
            Panel Information
          </h3>
          <dl className="space-y-2 text-sm">
            {[
              ["Panel Type", "Website Content Admin"],
              ["Access Level", "Content Editor"],
              ["Route Prefix", "/site-admin"],
              ["Session Duration", "8 hours"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between gap-2">
                <dt className="text-muted-foreground shrink-0">{label}</dt>
                <dd
                  className={`font-medium text-foreground text-right ${label === "Route Prefix" ? "font-mono text-xs" : ""} ${label === "Access Level" ? "text-blue-700" : ""}`}
                >
                  {val}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <div className="w-1.5 h-4 rounded-full bg-green-600 shrink-0" />
            What You Can Control
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              "Home page notification updates (Official Letters, Tenders, Recruitment)",
              "Red marquee ticker messages",
              "Important GDS schedule dates",
              "PDF attachments for orders and letters",
              '"New" badge visibility per notification',
              "Candidate dashboard — application dates & status",
              "Candidate Quick Access card background images",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
