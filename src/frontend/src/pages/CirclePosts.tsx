import type { Division } from "@/backend.d";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SkeletonTable } from "@/components/ui/loading-skeleton";
import { PageTitle } from "@/components/ui/page-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { useAllCircles, useListStates } from "@/hooks/useQueries";
import { INDIAN_STATES } from "@/lib/constants";
import { Building2, Filter, Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostCount {
  ur: number;
  obc: number;
  sc: number;
  st: number;
  ews: number;
  total: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countPosts(posts: Division["posts"]): PostCount {
  const counts: PostCount = { ur: 0, obc: 0, sc: 0, st: 0, ews: 0, total: 0 };
  for (const post of posts) {
    counts.ur += Number(post.urPosts);
    counts.obc += Number(post.obcPosts);
    counts.sc += Number(post.scPosts);
    counts.st += Number(post.stPosts);
    counts.total += Number(post.totalPosts);
  }
  return counts;
}

function getDivisionPosts(div: Division): PostCount {
  return countPosts(div.posts);
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function TableRow({
  state,
  circle,
  division,
  counts,
  rowIndex,
}: {
  state: string;
  circle: string;
  division: string;
  counts: PostCount;
  rowIndex: number;
}) {
  return (
    <tr
      className={`hover:bg-muted/30 transition-colors ${rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
      data-ocid="circle-table-row"
    >
      <td className="px-3 py-2.5 text-xs text-foreground border-b border-border">
        {state}
      </td>
      <td className="px-3 py-2.5 text-xs text-foreground border-b border-border font-medium">
        {circle}
      </td>
      <td className="px-3 py-2.5 text-xs text-foreground border-b border-border">
        {division}
      </td>
      <td className="px-3 py-2.5 text-xs text-right text-foreground border-b border-border tabular-nums">
        {counts.ur || "—"}
      </td>
      <td className="px-3 py-2.5 text-xs text-right text-foreground border-b border-border tabular-nums">
        {counts.obc || "—"}
      </td>
      <td className="px-3 py-2.5 text-xs text-right text-foreground border-b border-border tabular-nums">
        {counts.sc || "—"}
      </td>
      <td className="px-3 py-2.5 text-xs text-right text-foreground border-b border-border tabular-nums">
        {counts.st || "—"}
      </td>
      <td className="px-3 py-2.5 text-xs text-right font-bold text-primary border-b border-border tabular-nums">
        {counts.total}
      </td>
    </tr>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────

function MobileCard({
  state,
  circle,
  division,
  counts,
}: {
  state: string;
  circle: string;
  division: string;
  counts: PostCount;
}) {
  return (
    <Card className="border-border" data-ocid="circle-mobile-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {circle}
            </p>
            <p className="text-xs text-muted-foreground">
              {division} · {state}
            </p>
          </div>
          <span className="flex-shrink-0 text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {counts.total} posts
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {[
            { label: "UR", value: counts.ur },
            { label: "OBC", value: counts.obc },
            { label: "SC", value: counts.sc },
            { label: "ST", value: counts.st },
          ].map((cat) => (
            <div
              key={cat.label}
              className="text-center p-1.5 rounded bg-muted/40"
            >
              <p className="text-xs font-bold text-foreground">
                {cat.value || 0}
              </p>
              <p className="text-xs text-muted-foreground">{cat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Card className="border-border">
      <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
        <Building2 className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-muted-foreground text-sm">
          No circles found matching your filters.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CirclePosts() {
  const { t } = useLanguage();
  const { data: circles, isLoading } = useAllCircles();
  const { data: statesFromApi } = useListStates();

  const [selectedState, setSelectedState] = useState("all");
  const [search, setSearch] = useState("");

  // Build state list from API or fallback to constants
  const stateOptions = useMemo(
    () =>
      statesFromApi && statesFromApi.length > 0 ? statesFromApi : INDIAN_STATES,
    [statesFromApi],
  );

  // Build flat rows: one per division
  interface FlatRow {
    state: string;
    circle: string;
    division: string;
    counts: PostCount;
    circleId: string;
    divId: string;
  }

  const flatRows = useMemo<FlatRow[]>(() => {
    if (!circles) return [];
    const rows: FlatRow[] = [];
    for (const circ of circles) {
      for (const div of circ.divisions) {
        rows.push({
          state: circ.stateName,
          circle: circ.circleName,
          division: div.name,
          counts: getDivisionPosts(div),
          circleId: circ.id.toString(),
          divId: div.id.toString(),
        });
      }
    }
    return rows;
  }, [circles]);

  const filtered = useMemo(() => {
    return flatRows.filter((row) => {
      const matchState = selectedState === "all" || row.state === selectedState;
      const matchSearch =
        !search ||
        row.circle.toLowerCase().includes(search.toLowerCase()) ||
        row.division.toLowerCase().includes(search.toLowerCase()) ||
        row.state.toLowerCase().includes(search.toLowerCase());
      return matchState && matchSearch;
    });
  }, [flatRows, selectedState, search]);

  // Totals for summary row
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, row) => ({
        ur: acc.ur + row.counts.ur,
        obc: acc.obc + row.counts.obc,
        sc: acc.sc + row.counts.sc,
        st: acc.st + row.counts.st,
        ews: acc.ews + row.counts.ews,
        total: acc.total + row.counts.total,
      }),
      { ur: 0, obc: 0, sc: 0, st: 0, ews: 0, total: 0 },
    );
  }, [filtered]);

  return (
    <div className="max-w-6xl mx-auto">
      <PageTitle
        title={t("pages.circlePosts.title")}
        subtitle={t("pages.circlePosts.subtitle")}
        breadcrumbs={[{ label: t("pages.circlePosts.title") }]}
      />

      {/* Filter Bar */}
      <div
        className="flex flex-col sm:flex-row gap-3 mb-5"
        data-ocid="circle-filter-bar"
      >
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search circle or division..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-ocid="circle-search"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select
            value={selectedState}
            onValueChange={setSelectedState}
            data-ocid="circle-state-filter"
          >
            <SelectTrigger className="w-52" aria-label="Filter by state">
              <SelectValue placeholder="Filter by State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States / UTs</SelectItem>
              {stateOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={8} />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden md:block"
          >
            <Card className="border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted border-b-2 border-border">
                      <th className="text-left px-3 py-3 text-xs font-semibold text-foreground">
                        State / UT
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-foreground">
                        Circle
                      </th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-foreground">
                        Division
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-foreground">
                        UR
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-foreground">
                        OBC
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-foreground">
                        SC
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-foreground">
                        ST
                      </th>
                      <th className="text-right px-3 py-3 text-xs font-semibold text-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <TableRow
                        key={`${row.circleId}-${row.divId}`}
                        state={row.state}
                        circle={row.circle}
                        division={row.division}
                        counts={row.counts}
                        rowIndex={i}
                      />
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/60 font-bold">
                      <td
                        colSpan={3}
                        className="px-3 py-2.5 text-xs font-bold text-foreground border-t-2 border-border"
                      >
                        Total ({filtered.length} divisions)
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right font-bold text-foreground border-t-2 border-border">
                        {totals.ur}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right font-bold text-foreground border-t-2 border-border">
                        {totals.obc}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right font-bold text-foreground border-t-2 border-border">
                        {totals.sc}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right font-bold text-foreground border-t-2 border-border">
                        {totals.st}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right font-bold text-primary border-t-2 border-border">
                        {totals.total}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </motion.div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((row) => (
              <motion.div
                key={`${row.circleId}-${row.divId}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <MobileCard
                  state={row.state}
                  circle={row.circle}
                  division={row.division}
                  counts={row.counts}
                />
              </motion.div>
            ))}

            {/* Summary card */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <p className="font-bold text-sm text-foreground mb-3">
                  Summary ({filtered.length} divisions)
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: "UR", value: totals.ur },
                    { label: "OBC", value: totals.obc },
                    { label: "SC", value: totals.sc },
                    { label: "ST", value: totals.st },
                    { label: "Total", value: totals.total },
                  ].map((cat) => (
                    <div
                      key={cat.label}
                      className="text-center p-2 rounded bg-background"
                    >
                      <p className="text-sm font-bold text-primary">
                        {cat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Record count */}
          <p className="text-xs text-muted-foreground mt-3 text-right">
            {filtered.length} division{filtered.length !== 1 ? "s" : ""} ·{" "}
            {totals.total} total posts
          </p>
        </>
      )}
    </div>
  );
}
