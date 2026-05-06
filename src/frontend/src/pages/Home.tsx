import type { Notification, OfficialUpdate } from "@/backend.d";
import { Card, CardContent } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/loading-skeleton";
import {
  useActiveNotifications,
  useActiveOfficialUpdates,
} from "@/hooks/useQueries";
import { NOTIF_TYPES } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Briefcase,
  Calendar,
  FileText,
  Info,
  ScrollText,
} from "lucide-react";
import { useState } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(ts: bigint | number | undefined): string {
  try {
    if (ts === undefined || ts === null) return "";
    return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function notifTypeLabel(typeKey: string): string {
  const found = NOTIF_TYPES.find((t) => t.value === typeKey.toLowerCase());
  return found?.label ?? typeKey;
}

// ─── Section Title Component ──────────────────────────────────────────────────

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#B22222]">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#B22222] shrink-0" />
        <h2 className="text-[#B22222] font-bold text-lg uppercase tracking-wide leading-tight">
          {title}
        </h2>
        {subtitle && (
          <span className="text-muted-foreground text-xs hidden sm:inline">
            {subtitle}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Important Dates Data ─────────────────────────────────────────────────────

const IMPORTANT_DATES_CARDS = [
  {
    id: "registration",
    title: "USER REGISTRATION",
    color: "#B22222",
    rows: [
      { label: "Start Date", value: "31.01.2026" },
      { label: "End Date", value: "14.02.2026  17:00 HRS" },
    ],
  },
  {
    id: "application",
    title: "APPLICATION SUBMISSION",
    color: "#8B0000",
    rows: [
      { label: "Start Date", value: "02.02.2026" },
      { label: "End Date", value: "16.02.2026  17:00 HRS" },
    ],
  },
  {
    id: "edit",
    title: "EDIT / CORRECTION WINDOW",
    color: "#CC5500",
    rows: [
      { label: "Start Date", value: "18.02.2026" },
      { label: "End Date", value: "19.02.2026  17:00 HRS" },
    ],
  },
];

// ─── Pinned Schedule Notifications ───────────────────────────────────────────

const PINNED_SCHEDULES = [
  {
    id: "schedule-3",
    title: "Gramin Dak Sevak (GDS) Online Engagement Special Drive Schedule 3",
    date: "15.01.2026",
  },
  {
    id: "schedule-2",
    title: "Gramin Dak Sevak (GDS) Online Engagement Special Drive Schedule 2",
    date: "01.10.2025",
  },
  {
    id: "schedule-1",
    title: "Gramin Dak Sevak (GDS) Online Engagement Special Drive Schedule 1",
    date: "01.06.2025",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImportantDatesSection() {
  return (
    <section className="mb-6" data-ocid="important-dates">
      <SectionTitle
        icon={Calendar}
        title="Important Dates"
        subtitle="/ महत्वपूर्ण तिथियाँ"
      />

      {/* 3 equal-height date cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
        {IMPORTANT_DATES_CARDS.map((card) => (
          <div
            key={card.id}
            className="border border-border rounded overflow-hidden shadow-sm flex flex-col"
            data-ocid={`date-card-${card.id}`}
          >
            {/* Card header */}
            <div
              className="px-3 py-2 text-white text-center"
              style={{ backgroundColor: card.color }}
            >
              <p className="text-xs font-bold uppercase tracking-wide leading-tight">
                {card.title}
              </p>
            </div>
            {/* Card body — flex-1 keeps equal height */}
            <div className="bg-card px-3 py-3 flex-1">
              {card.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center py-1.5 border-b border-border last:border-b-0"
                >
                  <span className="text-xs text-muted-foreground font-medium shrink-0 mr-2">
                    {row.label}:
                  </span>
                  <span className="text-xs font-bold text-foreground text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NotificationsSection({
  notifications,
  isLoading,
}: {
  notifications: Notification[] | undefined;
  isLoading: boolean;
}) {
  const top8 = notifications?.slice(0, 8) ?? [];

  return (
    <section className="mb-4" data-ocid="latest-notifications">
      <SectionTitle
        icon={AlertCircle}
        title="Latest Notifications"
        action={
          <Link
            to="/notifications"
            className="flex items-center gap-1 text-xs text-[#B22222] hover:underline font-semibold"
            data-ocid="view-all-notifications"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      {/* GDS Online Engagement badge */}
      <div className="mb-3" data-ocid="gds-engagement-badge">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-white text-[11px] font-bold uppercase tracking-wider shadow-sm"
          style={{
            background: "linear-gradient(90deg, #B22222 0%, #CC5500 100%)",
          }}
        >
          <Bell className="h-3 w-3" />
          GDS Online Engagement
        </span>
      </div>

      {/* Pinned Schedule Notifications */}
      <div
        className="border border-[#B22222]/30 rounded overflow-hidden mb-3"
        data-ocid="pinned-schedules"
      >
        {PINNED_SCHEDULES.map((sched, i) => (
          <div
            key={sched.id}
            className={`flex items-start gap-2 px-4 py-3 border-b border-[#B22222]/10 last:border-b-0 hover:bg-orange-50 transition-colors duration-150 cursor-default ${
              i % 2 === 0 ? "bg-orange-50/40" : "bg-card"
            }`}
            data-ocid={`pinned-schedule-${i + 1}`}
          >
            <span className="text-[#B22222] text-sm shrink-0 mt-0.5">▶</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded shrink-0 uppercase"
                  style={{
                    background:
                      "linear-gradient(90deg, #B22222 0%, #CC5500 100%)",
                  }}
                >
                  NEW
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  Notification Date: {sched.date}
                </span>
              </div>
              <p className="text-sm text-foreground font-semibold leading-snug">
                {sched.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      ) : top8.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-6 flex flex-col items-center gap-2 text-center">
            <Info className="h-6 w-6 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No notifications at this time.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          {top8.map((notif, i) => {
            const typeKey = (notif.notifType as string).toLowerCase();
            const typeLabel = notifTypeLabel(typeKey);
            const isUrgent = typeKey === "urgent";
            return (
              <div
                key={notif.id.toString()}
                className={`flex items-start gap-2 px-4 py-3 border-b border-border last:border-b-0 hover:bg-orange-50 transition-colors duration-150 ${
                  i % 2 === 0 ? "bg-card" : "bg-muted/20"
                }`}
                data-ocid={`notif-row-${i}`}
              >
                <span className="text-[#B22222] text-sm shrink-0 mt-0.5">
                  ▶
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    {isUrgent && (
                      <span className="text-[10px] font-bold text-destructive-foreground bg-destructive px-1.5 py-0.5 rounded shrink-0 uppercase">
                        {typeLabel}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTimestamp(notif.date)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium leading-snug">
                    {notif.title}
                  </p>
                  {notif.content && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {notif.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── Updates Section ──────────────────────────────────────────────────────────

type TabKey = "officialLetter" | "tender" | "recruitment";

const UPDATE_TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "officialLetter",
    label: "Official Letters / News",
    icon: <ScrollText className="h-3.5 w-3.5 shrink-0" />,
  },
  {
    key: "tender",
    label: "Tenders",
    icon: <Briefcase className="h-3.5 w-3.5 shrink-0" />,
  },
  {
    key: "recruitment",
    label: "Recruitment",
    icon: <FileText className="h-3.5 w-3.5 shrink-0" />,
  },
];

function formatUpdateDate(ts: bigint | number | undefined): {
  dd: string;
  mmm: string;
  yyyy: string;
} {
  try {
    if (ts === undefined || ts === null)
      return { dd: "--", mmm: "---", yyyy: "" };
    const d = new Date(Number(ts) / 1_000_000);
    return {
      dd: d.toLocaleDateString("en-IN", { day: "2-digit" }),
      mmm: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
      yyyy: d.getFullYear().toString(),
    };
  } catch {
    return { dd: "--", mmm: "---", yyyy: "" };
  }
}

function UpdateItem({ update }: { update: OfficialUpdate }) {
  const { dd, mmm, yyyy } = formatUpdateDate(update.date);
  const pdfUrl = update.pdfUrl ?? null;

  return (
    <div
      className="flex items-start gap-3 px-3 py-3 border-b border-border last:border-b-0 hover:bg-orange-50/60 transition-colors duration-150"
      data-ocid={`update-item-${update.id}`}
    >
      {/* Date box — red maroon style */}
      <div
        className="flex flex-col items-center justify-center rounded text-white shrink-0 min-w-[46px] py-1.5 px-1 shadow-sm"
        style={{
          background: "linear-gradient(160deg, #8B0000 0%, #B22222 100%)",
        }}
      >
        <span className="text-lg font-extrabold leading-none">{dd}</span>
        <span className="text-[10px] font-semibold leading-tight tracking-wide mt-0.5">
          {mmm}
        </span>
        <span className="text-[9px] leading-none opacity-80">{yyyy}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium leading-snug break-words">
          {update.title}
        </p>
        {update.content && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {update.content}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {update.isNew && (
          <span
            className="inline-block text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase leading-none"
            style={{
              background: "linear-gradient(90deg, #B22222 0%, #CC5500 100%)",
            }}
          >
            NEW
          </span>
        )}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-white px-2.5 py-1.5 rounded hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
            style={{ background: "#B22222" }}
            data-ocid={`update-view-${update.id}`}
          >
            <FileText className="h-3 w-3" />
            View PDF
          </a>
        )}
      </div>
    </div>
  );
}

// Static sample data shown when backend has no updates yet
const SAMPLE_UPDATES: OfficialUpdate[] = [
  {
    id: "sample-ol-1",
    title:
      "Gramin Dak Sevak (GDS) Online Engagement Special Drive — Official Notification",
    content: "Detailed engagement notification for Special Drive Schedule 3.",
    category: "officialLetter" as unknown as OfficialUpdate["category"],
    date: BigInt(new Date("2026-01-15").getTime()) * BigInt(1_000_000),
    pdfUrl: undefined,
    isNew: true,
    isActive: true,
    createdBy: "admin",
  },
  {
    id: "sample-ol-2",
    title:
      "Amendment in GDS Recruitment Rules 2024 — Ministry of Communications Circular",
    content:
      "Circular regarding amendment in GDS recruitment eligibility criteria.",
    category: "officialLetter" as unknown as OfficialUpdate["category"],
    date: BigInt(new Date("2025-10-01").getTime()) * BigInt(1_000_000),
    pdfUrl: undefined,
    isNew: false,
    isActive: true,
    createdBy: "admin",
  },
  {
    id: "sample-ol-3",
    title: "GDS Online Engagement Special Drive Schedule 1 Notification",
    content:
      "Notification for Schedule 1 drive with post details and important dates.",
    category: "officialLetter" as unknown as OfficialUpdate["category"],
    date: BigInt(new Date("2025-06-01").getTime()) * BigInt(1_000_000),
    pdfUrl: undefined,
    isNew: false,
    isActive: true,
    createdBy: "admin",
  },
  {
    id: "sample-t-1",
    title:
      "Tender Notice: Supply of Uniform Items for Gramin Dak Sevaks — MP Circle 2025-26",
    content:
      "Open tender for uniform supply across Madhya Pradesh postal divisions.",
    category: "tender" as unknown as OfficialUpdate["category"],
    date: BigInt(new Date("2026-01-10").getTime()) * BigInt(1_000_000),
    pdfUrl: undefined,
    isNew: true,
    isActive: true,
    createdBy: "admin",
  },
  {
    id: "sample-t-2",
    title:
      "Tender for IT Equipment Procurement — Jabalpur Regional Office 2025",
    content: "Tender for supply and installation of computers and peripherals.",
    category: "tender" as unknown as OfficialUpdate["category"],
    date: BigInt(new Date("2025-09-15").getTime()) * BigInt(1_000_000),
    pdfUrl: undefined,
    isNew: false,
    isActive: true,
    createdBy: "admin",
  },
  {
    id: "sample-r-1",
    title:
      "Recruitment Notice: GDS Special Drive Schedule 3 — 15.01.2026 Applications Open",
    content:
      "Eligible candidates may apply for GDS posts across MP postal circles.",
    category: "recruitment" as unknown as OfficialUpdate["category"],
    date: BigInt(new Date("2026-01-15").getTime()) * BigInt(1_000_000),
    pdfUrl: undefined,
    isNew: true,
    isActive: true,
    createdBy: "admin",
  },
  {
    id: "sample-r-2",
    title: "Recruitment Notice: GDS Special Drive Schedule 2 — 01.10.2025",
    content:
      "GDS engagement schedule 2 recruitment across Madhya Pradesh circle.",
    category: "recruitment" as unknown as OfficialUpdate["category"],
    date: BigInt(new Date("2025-10-01").getTime()) * BigInt(1_000_000),
    pdfUrl: undefined,
    isNew: false,
    isActive: true,
    createdBy: "admin",
  },
  {
    id: "sample-r-3",
    title: "Recruitment Notice: GDS Special Drive Schedule 1 — 01.06.2025",
    content:
      "GDS engagement schedule 1 recruitment across Madhya Pradesh circle.",
    category: "recruitment" as unknown as OfficialUpdate["category"],
    date: BigInt(new Date("2025-06-01").getTime()) * BigInt(1_000_000),
    pdfUrl: undefined,
    isNew: false,
    isActive: true,
    createdBy: "admin",
  },
];

function getCategoryKey(update: OfficialUpdate): TabKey {
  const cat = update.category as unknown as string;
  if (
    cat === "officialLetter" ||
    (typeof cat === "object" &&
      cat !== null &&
      "officialLetter" in (cat as object))
  )
    return "officialLetter";
  if (
    cat === "tender" ||
    (typeof cat === "object" && cat !== null && "tender" in (cat as object))
  )
    return "tender";
  return "recruitment";
}

function UpdatesSection({
  updates,
  isLoading,
}: {
  updates: OfficialUpdate[] | undefined;
  isLoading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("officialLetter");

  const sourceData =
    !isLoading && (!updates || updates.length === 0)
      ? SAMPLE_UPDATES
      : (updates ?? []);

  const filtered = sourceData
    .filter((u) => getCategoryKey(u) === activeTab)
    .sort((a, b) => {
      const aNum = typeof a.date === "bigint" ? Number(a.date) : Number(a.date);
      const bNum = typeof b.date === "bigint" ? Number(b.date) : Number(b.date);
      return bNum - aNum;
    });

  return (
    <section className="mb-6" data-ocid="updates-section">
      {/* Section heading */}
      <div className="flex items-center gap-0 mb-0">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-t text-white font-bold text-sm uppercase tracking-wide shadow-sm"
          style={{
            background: "linear-gradient(90deg, #8B0000 0%, #B22222 100%)",
          }}
        >
          <Bell className="h-4 w-4" />
          Updates
          <span className="text-[10px] font-normal opacity-80 ml-1 hidden sm:inline">
            / अद्यतन
          </span>
        </div>
      </div>

      {/* Tab bar — active tab has bottom indicator in red */}
      <div
        className="flex border border-border border-b-0 overflow-x-auto"
        style={{ borderTop: "3px solid #8B0000" }}
        data-ocid="updates-tabs"
        role="tablist"
      >
        {UPDATE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B22222] ${
                isActive
                  ? "border-b-[#B22222] text-[#8B0000] bg-red-50"
                  : "border-b-transparent text-muted-foreground bg-card hover:text-[#B22222] hover:bg-orange-50"
              }`}
              data-ocid={`tab-${tab.key}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="border border-border rounded-b overflow-hidden bg-card">
        {isLoading ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((k) => (
              <SkeletonCard key={k} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Info className="h-6 w-6 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              No updates available.
            </p>
          </div>
        ) : (
          <div>
            {filtered.map((u) => (
              <UpdateItem key={u.id} update={u} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: notifications, isLoading } = useActiveNotifications();
  const { data: officialUpdates, isLoading: updatesLoading } =
    useActiveOfficialUpdates();

  return (
    <div className="max-w-4xl mx-auto">
      {/* NEW NOTIFICATION Button */}
      <div className="mb-4" data-ocid="new-notification-banner">
        <Link to="/notifications" data-ocid="new-notif-btn">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded font-bold text-white text-sm uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
            style={{
              background:
                "linear-gradient(135deg, #FF8C00 0%, #FF6600 50%, #E55000 100%)",
            }}
          >
            <Bell className="h-4 w-4" />🔔 NEW NOTIFICATION
          </button>
        </Link>
      </div>

      {/* Main heading */}
      <div className="mb-4 pb-2 border-b border-border">
        <h1 className="text-foreground font-bold text-base lg:text-lg leading-snug">
          Gramin Dak Sevak (GDS) Online Engagement Special Drive
        </h1>
        <p className="text-muted-foreground text-xs mt-1">
          ग्रामीण डाक सेवक (GDS) ऑनलाइन सहभागिता विशेष अभियान — अनुसूची-I दिनांक
          01.06.2025 &nbsp;|&nbsp; अनुसूची-II दिनांक 01.10.2025 &nbsp;|&nbsp;
          अनुसूची-III दिनांक 15.01.2026
        </p>
      </div>

      {/* Important Dates */}
      <ImportantDatesSection />

      {/* Notifications */}
      <NotificationsSection
        notifications={notifications}
        isLoading={isLoading}
      />

      {/* Official Updates Tabs */}
      <UpdatesSection updates={officialUpdates} isLoading={updatesLoading} />

      {/* Quick Links */}
      <section className="mb-4" data-ocid="quick-links">
        <SectionTitle icon={ArrowRight} title="Quick Links" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              label: "Registration",
              sub: "New Candidate",
              href: "/register",
              ocid: "ql-register",
            },
            {
              label: "Apply Online",
              sub: "Submit Application",
              href: "/apply",
              ocid: "ql-apply",
            },
            {
              label: "Fee Payment",
              sub: "Pay Application Fee",
              href: "/fee-payment",
              ocid: "ql-fee",
            },
            {
              label: "App Status",
              sub: "Track Application",
              href: "/status",
              ocid: "ql-status",
            },
          ].map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="flex flex-col items-center border border-border rounded p-3 text-center hover:bg-orange-50 hover:border-[#B22222] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222] gap-1"
              data-ocid={link.ocid}
            >
              <p className="text-xs font-bold text-foreground">{link.label}</p>
              <p className="text-[10px] text-muted-foreground">{link.sub}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
