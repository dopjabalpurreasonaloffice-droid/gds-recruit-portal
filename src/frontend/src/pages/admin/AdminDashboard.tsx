import { useAdminDashboard } from "@/hooks/useAdminQueries";
import { getAdminUser } from "@/lib/admin-auth";
import { CheckCircle, Clock, TrendingUp, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

function StatCard({
  label,
  value,
  icon,
  colorClass,
  bgClass,
  subtitle,
}: {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  subtitle?: string;
}) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
      data-ocid={`stat-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}
      >
        <span className={colorClass}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-3xl font-bold text-foreground tabular-nums leading-none">
          {value ?? "—"}
        </p>
        <p className="text-sm font-semibold text-foreground/80 mt-1.5 leading-tight">
          {label}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function StatsTable({
  title,
  rows,
  col1,
}: {
  title: string;
  rows: [string, number][];
  col1: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 bg-muted/30">
        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
                  {col1}
                </th>
                <th className="text-right px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest">
                  Candidates
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, count], i) => (
                <tr
                  key={name}
                  className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}
                >
                  <td className="px-5 py-3 text-foreground font-medium">
                    {name}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold tabular-nums">
                      {count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useAdminDashboard();
  const user = getAdminUser();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
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
    hour12: true,
  });

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="admin-dashboard-loading"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 text-sm text-destructive"
        data-ocid="admin-dashboard-error"
      >
        Failed to load dashboard data. Please refresh the page.
      </div>
    );
  }

  const approvalRate =
    data && data.totalCandidates > 0
      ? Math.round((data.approved / data.totalCandidates) * 100)
      : 0;

  return (
    <div className="space-y-6" data-ocid="admin-dashboard">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.username ?? "Admin"} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {dateStr} &nbsp;·&nbsp;{" "}
            <span className="font-mono tabular-nums text-foreground/80">
              {timeStr}
            </span>
          </p>
        </div>
      </div>

      {/* Approval rate banner */}
      {data && data.totalCandidates > 0 && (
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Overall Approval Rate
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.approved} approved out of {data.totalCandidates} total
              candidates
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-4xl font-bold text-primary tabular-nums">
              {approvalRate}%
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards — 4 cols on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Candidates"
          value={data?.totalCandidates}
          icon={<Users className="w-6 h-6" />}
          colorClass="text-blue-600"
          bgClass="bg-blue-100"
        />
        <StatCard
          label="Approved"
          value={data?.approved}
          icon={<CheckCircle className="w-6 h-6" />}
          colorClass="text-green-600"
          bgClass="bg-green-100"
          subtitle="Cleared for posting"
        />
        <StatCard
          label="Rejected"
          value={data?.rejected}
          icon={<XCircle className="w-6 h-6" />}
          colorClass="text-red-600"
          bgClass="bg-red-100"
          subtitle="Not meeting criteria"
        />
        <StatCard
          label="Pending Review"
          value={data?.pending}
          icon={<Clock className="w-6 h-6" />}
          colorClass="text-amber-600"
          bgClass="bg-amber-100"
          subtitle="Awaiting action"
        />
      </div>

      {/* Stats Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <StatsTable
          title="Circle-wise Statistics"
          rows={data?.circleStats ?? []}
          col1="Circle"
        />
        <StatsTable
          title="Division-wise Statistics"
          rows={data?.divisionStats ?? []}
          col1="Division"
        />
      </div>
    </div>
  );
}
