import type { ShortlistedCandidate } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllCandidates } from "@/hooks/useQueries";
import { CATEGORIES, INDIAN_STATES } from "@/lib/constants";
import {
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  LayoutList,
  Search,
  TreePine,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type SortKey = "rank" | "state" | "candidateName" | "rollNumber";
type SortDir = "asc" | "desc";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function categoryColor(cat: string): string {
  const map: Record<string, string> = {
    UR: "bg-primary/10 text-primary border-primary/30",
    OBC: "bg-accent/15 text-accent-foreground border-accent/30",
    SC: "bg-secondary text-secondary-foreground border-border",
    ST: "bg-muted text-muted-foreground border-border",
    EWS: "bg-card text-foreground border-border",
  };
  return map[cat] ?? "bg-muted text-muted-foreground border-border";
}

function mockDownload(label: string) {
  alert(`Download initiated for: ${label} (mock PDF)`);
}

// ─────────────────────────────────────────────
// Circle table inside accordion
// ─────────────────────────────────────────────

function CircleTable({
  candidates,
  circle,
}: { candidates: ShortlistedCandidate[]; circle: string }) {
  const sorted = [...candidates].sort(
    (a, b) => Number(a.rank) - Number(b.rank),
  );
  return (
    <div className="px-4 pb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {circle} Circle
        </span>
        <button
          type="button"
          onClick={() => mockDownload(`${circle} Circle`)}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          aria-label={`Download ${circle} circle list`}
        >
          <Download className="h-3.5 w-3.5" />
          Download (PDF)
        </button>
      </div>
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-12 text-xs py-2">S.No</TableHead>
              <TableHead className="text-xs py-2">Roll Number</TableHead>
              <TableHead className="text-xs py-2">Candidate Name</TableHead>
              <TableHead className="text-xs py-2 hidden sm:table-cell">
                Category
              </TableHead>
              <TableHead className="text-xs py-2 hidden md:table-cell">
                Division
              </TableHead>
              <TableHead className="text-xs py-2 text-right">Rank</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c, idx) => (
              <TableRow
                key={c.id.toString()}
                className="text-xs hover:bg-muted/20 transition-colors"
                data-ocid="shortlisted-tree-row"
              >
                <TableCell className="py-2 text-muted-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell className="py-2 font-mono text-xs font-medium">
                  {c.rollNumber}
                </TableCell>
                <TableCell className="py-2 font-medium">
                  {c.candidateName}
                </TableCell>
                <TableCell className="py-2 hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${categoryColor(c.category)}`}
                  >
                    {c.category}
                  </Badge>
                </TableCell>
                <TableCell className="py-2 hidden md:table-cell text-muted-foreground">
                  {c.division}
                </TableCell>
                <TableCell className="py-2 text-right font-semibold text-primary">
                  #{Number(c.rank)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// State accordion section
// ─────────────────────────────────────────────

function StateAccordion({
  state,
  candidates,
  defaultOpen,
}: {
  state: string;
  candidates: ShortlistedCandidate[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const byCircle = useMemo(() => {
    const map: Record<string, ShortlistedCandidate[]> = {};
    for (const c of candidates) {
      if (!map[c.circle]) map[c.circle] = [];
      map[c.circle].push(c);
    }
    return map;
  }, [candidates]);

  const circles = Object.keys(byCircle).sort();

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 border-b border-border transition-smooth text-left group"
          data-ocid="shortlisted-state-header"
          aria-expanded={open}
        >
          <div className="flex items-center gap-3">
            {open ? (
              <ChevronDown className="h-4 w-4 text-primary shrink-0 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-hover:text-primary" />
            )}
            <span className="font-semibold text-sm text-foreground">
              {state}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-xs font-medium"
              data-ocid="shortlisted-state-count"
            >
              {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
            </Badge>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                mockDownload(`${state} State`);
              }}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors px-2 py-0.5 rounded border border-primary/30 hover:bg-primary/5"
              aria-label={`Download ${state} list`}
              data-ocid="shortlisted-download-btn"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-background border-b border-border"
            >
              {circles.map((circle) => (
                <div
                  key={circle}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <CircleTable candidates={byCircle[circle]} circle={circle} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─────────────────────────────────────────────
// Flat table view
// ─────────────────────────────────────────────

function FlatTableView({ candidates }: { candidates: ShortlistedCandidate[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    return [...candidates].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "rank") cmp = Number(a.rank) - Number(b.rank);
      else if (sortKey === "state") cmp = a.state.localeCompare(b.state);
      else if (sortKey === "candidateName")
        cmp = a.candidateName.localeCompare(b.candidateName);
      else if (sortKey === "rollNumber")
        cmp = a.rollNumber.localeCompare(b.rollNumber);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [candidates, sortKey, sortDir]);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 opacity-30" />;
    return (
      <ChevronDown
        className={`h-3 w-3 text-primary transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`}
      />
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-12 text-xs py-2.5">S.No</TableHead>
            <TableHead className="text-xs py-2.5">
              <button
                type="button"
                onClick={() => toggleSort("rollNumber")}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                data-ocid="shortlisted-sort-rollno"
              >
                Roll Number <SortIcon col="rollNumber" />
              </button>
            </TableHead>
            <TableHead className="text-xs py-2.5">
              <button
                type="button"
                onClick={() => toggleSort("candidateName")}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                data-ocid="shortlisted-sort-name"
              >
                Candidate Name <SortIcon col="candidateName" />
              </button>
            </TableHead>
            <TableHead className="text-xs py-2.5 hidden sm:table-cell">
              Category
            </TableHead>
            <TableHead className="text-xs py-2.5 hidden md:table-cell">
              <button
                type="button"
                onClick={() => toggleSort("state")}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                data-ocid="shortlisted-sort-state"
              >
                State <SortIcon col="state" />
              </button>
            </TableHead>
            <TableHead className="text-xs py-2.5 hidden lg:table-cell">
              Circle
            </TableHead>
            <TableHead className="text-xs py-2.5 hidden lg:table-cell">
              Division
            </TableHead>
            <TableHead className="text-xs py-2.5 text-right">
              <button
                type="button"
                onClick={() => toggleSort("rank")}
                className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                data-ocid="shortlisted-sort-rank"
              >
                Rank <SortIcon col="rank" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((c, idx) => (
            <motion.tr
              key={c.id.toString()}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.4) }}
              className="text-xs border-b border-border hover:bg-muted/20 transition-colors"
              data-ocid="shortlisted-flat-row"
            >
              <TableCell className="py-2.5 text-muted-foreground">
                {idx + 1}
              </TableCell>
              <TableCell className="py-2.5 font-mono text-xs font-medium">
                {c.rollNumber}
              </TableCell>
              <TableCell className="py-2.5 font-medium">
                {c.candidateName}
              </TableCell>
              <TableCell className="py-2.5 hidden sm:table-cell">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${categoryColor(c.category)}`}
                >
                  {c.category}
                </Badge>
              </TableCell>
              <TableCell className="py-2.5 hidden md:table-cell text-muted-foreground">
                {c.state}
              </TableCell>
              <TableCell className="py-2.5 hidden lg:table-cell text-muted-foreground">
                {c.circle}
              </TableCell>
              <TableCell className="py-2.5 hidden lg:table-cell text-muted-foreground">
                {c.division}
              </TableCell>
              <TableCell className="py-2.5 text-right font-semibold text-primary">
                #{Number(c.rank)}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-4 text-center"
      data-ocid="shortlisted-empty"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">No candidates found</p>
        <p className="text-sm text-muted-foreground mt-1">
          {query
            ? `No results for "${query}". Try adjusting your search or filters.`
            : "No shortlisted candidates match the selected filters."}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Loading skeleton for tree view
// ─────────────────────────────────────────────

function TreeSkeleton() {
  return (
    <div
      className="space-y-2"
      aria-busy="true"
      aria-label="Loading candidates..."
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-border overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-card">
            <div className="flex items-center gap-3">
              <div className="skeleton h-4 w-4 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function Shortlisted() {
  const { data: allCandidates = [], isLoading } = useAllCandidates();

  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [stateFilter, setStateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered data
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allCandidates.filter((c) => {
      if (stateFilter !== "all" && c.state !== stateFilter) return false;
      if (categoryFilter !== "all" && c.category !== categoryFilter)
        return false;
      if (q) {
        const haystack =
          `${c.candidateName} ${c.rollNumber} ${c.state} ${c.circle}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allCandidates, stateFilter, categoryFilter, searchQuery]);

  // Group by state for tree view
  const byState = useMemo(() => {
    const map: Record<string, ShortlistedCandidate[]> = {};
    for (const c of filtered) {
      if (!map[c.state]) map[c.state] = [];
      map[c.state].push(c);
    }
    return map;
  }, [filtered]);

  const statesWithData = Object.keys(byState).sort();

  // Derive states present in data for filter dropdown
  const availableStates = useMemo(() => {
    const s = new Set(allCandidates.map((c) => c.state));
    return INDIAN_STATES.filter((st) => s.has(st));
  }, [allCandidates]);

  const totalCount = allCandidates.length;
  const shownCount = filtered.length;

  return (
    <div className="space-y-6" data-ocid="shortlisted-page">
      <PageTitle
        title="Shortlisted Candidates"
        subtitle="Shortlisted candidates for GDS Recruitment 2024-25"
        breadcrumbs={[{ label: "Shortlisted Candidates" }]}
        action={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-smooth ${
                viewMode === "tree"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={viewMode === "tree"}
              data-ocid="shortlisted-tree-toggle"
            >
              <TreePine className="h-3.5 w-3.5" />
              Tree View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-smooth ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={viewMode === "table"}
              data-ocid="shortlisted-table-toggle"
            >
              <LayoutList className="h-3.5 w-3.5" />
              Table View
            </button>
          </div>
        }
      />

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Total shortlisted:</span>
          <span className="font-bold text-foreground">
            {totalCount.toLocaleString()}
          </span>
        </div>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-accent" />
          <span className="text-muted-foreground">Showing:</span>
          <span
            className="font-bold text-foreground"
            data-ocid="shortlisted-count"
          >
            {shownCount.toLocaleString()} of {totalCount.toLocaleString()}{" "}
            candidates
          </span>
        </div>
        {statesWithData.length > 0 && (
          <>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="text-sm text-muted-foreground">
              Across{" "}
              <span className="font-semibold text-foreground">
                {statesWithData.length}
              </span>{" "}
              state{statesWithData.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by name, roll number, state or circle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-sm"
            aria-label="Search candidates"
            data-ocid="shortlisted-search"
          />
        </div>

        {/* State filter */}
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger
            className="w-full sm:w-52 text-sm"
            aria-label="Filter by state"
            data-ocid="shortlisted-state-filter"
          >
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {availableStates.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger
            className="w-full sm:w-44 text-sm"
            aria-label="Filter by category"
            data-ocid="shortlisted-category-filter"
          >
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.value} – {cat.label.split(" ")[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset filters */}
        {(stateFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => {
              setStateFilter("all");
              setCategoryFilter("all");
              setSearchQuery("");
            }}
            data-ocid="shortlisted-reset-filters"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        viewMode === "tree" ? (
          <TreeSkeleton />
        ) : (
          <SkeletonTable rows={8} cols={7} />
        )
      ) : filtered.length === 0 ? (
        <EmptyState query={searchQuery} />
      ) : viewMode === "tree" ? (
        // ── Tree View ──
        <motion.div
          key="tree"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-border overflow-hidden divide-y divide-border"
          data-ocid="shortlisted-tree-view"
        >
          {statesWithData.map((state, idx) => (
            <StateAccordion
              key={state}
              state={state}
              candidates={byState[state]}
              defaultOpen={idx === 0 && statesWithData.length === 1}
            />
          ))}
        </motion.div>
      ) : (
        // ── Table View ──
        <motion.div
          key="table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-ocid="shortlisted-flat-view"
        >
          <FlatTableView candidates={filtered} />
        </motion.div>
      )}

      {/* Mobile category legend */}
      <div className="flex flex-wrap gap-2 pt-2 sm:hidden">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.value}
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${categoryColor(cat.value)}`}
          >
            <span className="font-semibold">{cat.value}</span>
            <span className="opacity-70 hidden xs:inline">
              — {cat.label.split("(")[0].trim()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
