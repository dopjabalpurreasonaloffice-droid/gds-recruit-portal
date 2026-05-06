import type { Notification } from "@/backend.d";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/ui/loading-skeleton";
import { PageTitle } from "@/components/ui/page-title";
import { useLanguage } from "@/hooks/use-language";
import { useActiveNotifications } from "@/hooks/useQueries";
import { NOTIF_TYPES } from "@/lib/constants";
import {
  AlertCircle,
  Bell,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTypeKey(notif: Notification): string {
  return (notif.notifType as string).toLowerCase();
}

function notifBadgeClass(type: string): string {
  if (type === "urgent")
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  if (type === "important")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
}

function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
  activeType: string;
  search: string;
  onTypeChange: (type: string) => void;
  onSearchChange: (v: string) => void;
  t: (k: string) => string;
}

function FilterBar({
  activeType,
  search,
  onTypeChange,
  onSearchChange,
  t,
}: FilterBarProps) {
  const filters = [
    { value: "all", label: "All" },
    ...NOTIF_TYPES.map((nt) => ({ value: nt.value, label: nt.label })),
  ];

  return (
    <div
      className="flex flex-col sm:flex-row gap-3 mb-5"
      data-ocid="notif-filter-bar"
    >
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={`${t("common.search")} notifications...`}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          data-ocid="notif-search"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onTypeChange(f.value)}
            data-ocid={`notif-filter-${f.value}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeType === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotifCard({ notif, index }: { notif: Notification; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const typeKey = getTypeKey(notif);
  const typeInfo = NOTIF_TYPES.find((t) => t.value === typeKey);
  const isLong = notif.content.length > 180;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-ocid="notif-card"
    >
      <Card className="border-border hover:border-primary/30 hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${notifBadgeClass(typeKey)}`}
              >
                {typeKey === "urgent" && <AlertCircle className="h-3 w-3" />}
                {typeInfo?.label ?? typeKey}
              </span>
            </div>
            {/* Date right-aligned */}
            <span className="text-sm text-muted-foreground shrink-0 font-medium tabular-nums">
              {formatTimestamp(notif.date)}
            </span>
          </div>

          <h3 className="font-semibold text-sm text-foreground mb-1.5 leading-snug">
            {notif.title}
          </h3>

          <p
            className={`text-sm text-muted-foreground leading-relaxed ${!expanded && isLong ? "line-clamp-3" : ""}`}
          >
            {notif.content}
          </p>

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((p) => !p)}
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              data-ocid="notif-read-more"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Read More
                </>
              )}
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="border-border">
      <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
        <Bell className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Notifications() {
  const { t } = useLanguage();
  const { data: notifications, isLoading } = useActiveNotifications();

  const [activeType, setActiveType] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = (notifications ?? []).filter((n) => {
    const matchType = activeType === "all" || getTypeKey(n) === activeType;
    const matchSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="max-w-3xl mx-auto">
      <PageTitle
        title={t("pages.notifications.title")}
        subtitle={t("pages.notifications.subtitle")}
        breadcrumbs={[{ label: t("pages.notifications.title") }]}
      />

      <FilterBar
        activeType={activeType}
        search={search}
        onTypeChange={setActiveType}
        onSearchChange={setSearch}
        t={t}
      />

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((k) => (
            <SkeletonCard key={k} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          message={
            search || activeType !== "all"
              ? "No notifications match your filters."
              : "No notifications available at this time."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((notif, i) => (
            <NotifCard key={notif.id.toString()} notif={notif} index={i} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-5">
          Showing {filtered.length} notification
          {filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
