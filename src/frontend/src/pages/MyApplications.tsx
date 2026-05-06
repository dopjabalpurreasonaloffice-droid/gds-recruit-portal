import { useCandidateProfile } from "@/hooks/useAdminQueries";
import type { AdminCandidate } from "@/hooks/useAdminQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Home,
  LogOut,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminCandidate["status"] }) {
  if (status === "Approved")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
        <CheckCircle className="h-3.5 w-3.5" /> Approved
      </span>
    );
  if (status === "Rejected")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-300">
        <XCircle className="h-3.5 w-3.5" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-300">
      <Clock className="h-3.5 w-3.5" /> Pending
    </span>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────

function ApplicationCard({ candidate }: { candidate: AdminCandidate }) {
  const [expanded, setExpanded] = useState(false);

  const appDate = new Date(
    Number(candidate.createdAt) / 1_000_000,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="border border-border rounded-xl overflow-hidden shadow-sm bg-card"
      data-ocid="my-applications-item.1"
    >
      {/* Card accent top */}
      <div className="h-1 bg-gradient-to-r from-[#B22222] to-[#ef4444]" />

      {/* App header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 bg-gradient-to-r from-[#B22222]/5 to-transparent border-b border-border">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base leading-tight">
            GDS Online Engagement — {candidate.circle}
            {candidate.division ? ` / ${candidate.division}` : ""}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <code className="text-xs font-mono text-[#B22222] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              {candidate.registrationNo}
            </code>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {appDate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <StatusBadge status={candidate.status} />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition-colors"
            data-ocid="my-applications-view-details-btn"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> View Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fee + category row */}
      <div className="px-5 py-3 flex flex-wrap items-center gap-4 text-sm border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            Category:
          </span>
          <span className="text-foreground text-xs font-semibold">
            {candidate.category}
          </span>
        </div>
        {candidate.percentageObtained && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              Marks:
            </span>
            <span className="text-foreground text-xs font-semibold">
              {candidate.percentageObtained}%
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-medium">
            Fee:
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${candidate.feeStatus === "Paid" ? "bg-green-100 text-green-700" : candidate.feeStatus === "Failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
          >
            {candidate.feeStatus}
          </span>
        </div>
        {candidate.rejectionReason && (
          <p className="text-xs text-destructive font-medium w-full">
            Rejection Reason: {candidate.rejectionReason}
          </p>
        )}
      </div>

      {/* Post preferences summary */}
      {candidate.postPreferences && candidate.postPreferences.length > 0 && (
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
            Post Preferences
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.postPreferences.slice(0, 4).map((p, i) => (
              <span
                key={`${p.branchOfficeName}-${i}`}
                className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
              >
                {p.preferenceNo ?? i + 1}. {p.branchOfficeName} ({p.postType})
              </span>
            ))}
            {candidate.postPreferences.length > 4 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                +{candidate.postPreferences.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div
          className="px-5 py-5 bg-muted/20 space-y-4 border-t border-border"
          data-ocid="my-applications-details-expanded"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                Personal Information
              </p>
              <p className="text-foreground font-medium">{candidate.name}</p>
              {candidate.fatherName && (
                <p className="text-muted-foreground text-xs">
                  Father/Mother: {candidate.fatherName}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Date of Birth: {candidate.dob}
              </p>
              <p className="text-muted-foreground text-xs">
                Gender: {candidate.gender ?? "—"}
              </p>
              <p className="text-muted-foreground text-xs">
                Category: {candidate.category}
              </p>
              {candidate.ph && (
                <p className="text-muted-foreground text-xs">PH: Yes</p>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                Contact & Location
              </p>
              <p className="text-foreground font-medium">
                +91 {candidate.mobile}
              </p>
              {candidate.email && (
                <p className="text-muted-foreground text-xs">
                  {candidate.email}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Circle: {candidate.circle}
              </p>
              <p className="text-muted-foreground text-xs">
                Division: {candidate.division}
              </p>
              {candidate.divisionForVerification && (
                <p className="text-muted-foreground text-xs">
                  Div. for Verification: {candidate.divisionForVerification}
                </p>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Education
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {candidate.boardName && (
                <div className="bg-card rounded-lg border border-border px-3 py-2">
                  <p className="text-muted-foreground mb-0.5">Board</p>
                  <p className="font-medium text-foreground">
                    {candidate.boardName}
                  </p>
                </div>
              )}
              {candidate.resultType && (
                <div className="bg-card rounded-lg border border-border px-3 py-2">
                  <p className="text-muted-foreground mb-0.5">Result Type</p>
                  <p className="font-medium text-foreground">
                    {candidate.resultType}
                  </p>
                </div>
              )}
              {(candidate.percentageObtained ||
                candidate.totalCgpa ||
                candidate.totalGrade) && (
                <div className="bg-card rounded-lg border border-border px-3 py-2">
                  <p className="text-muted-foreground mb-0.5">Score</p>
                  <p className="font-medium text-foreground">
                    {candidate.percentageObtained ||
                      candidate.totalCgpa ||
                      candidate.totalGrade}
                  </p>
                </div>
              )}
              {candidate.yearOfPassing && (
                <div className="bg-card rounded-lg border border-border px-3 py-2">
                  <p className="text-muted-foreground mb-0.5">Year</p>
                  <p className="font-medium text-foreground">
                    {candidate.yearOfPassing}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* All post preferences table */}
          {candidate.postPreferences &&
            candidate.postPreferences.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                  All Post Preferences
                </p>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border-b border-border px-3 py-2 text-left text-muted-foreground font-semibold">
                          Pref
                        </th>
                        <th className="border-b border-border px-3 py-2 text-left text-muted-foreground font-semibold">
                          Branch Office
                        </th>
                        <th className="border-b border-border px-3 py-2 text-left text-muted-foreground font-semibold">
                          Post Type
                        </th>
                        <th className="border-b border-border px-3 py-2 text-left text-muted-foreground font-semibold">
                          Category
                        </th>
                        <th className="border-b border-border px-3 py-2 text-right text-muted-foreground font-semibold">
                          Basic Pay
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidate.postPreferences.map((p, i) => (
                        <tr
                          key={`${p.branchOfficeName}-${i}`}
                          className={i % 2 === 1 ? "bg-muted/30" : ""}
                        >
                          <td className="px-3 py-2 text-center font-bold text-[#B22222]">
                            {p.preferenceNo ?? i + 1}
                          </td>
                          <td className="px-3 py-2 text-foreground">
                            {p.branchOfficeName}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {p.postType}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {p.category}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground">
                            ₹{Number(p.basicPay).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MyApplications() {
  const navigate = useNavigate();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("candidateToken")
      : null;
  const regNo =
    typeof window !== "undefined"
      ? localStorage.getItem("candidateRegNo")
      : null;

  const { data: candidate, isLoading } = useCandidateProfile(
    token ? regNo : null,
  );

  useEffect(() => {
    if (!token || !regNo) {
      navigate({ to: "/candidate/login" });
    }
  }, [token, regNo, navigate]);

  function handleLogout() {
    localStorage.removeItem("candidateToken");
    localStorage.removeItem("candidateRegNo");
    navigate({ to: "/candidate/login" });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div className="text-center" data-ocid="my-applications-loading-state">
          <div className="w-10 h-10 border-4 border-[#B22222] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top bar */}
      <div
        className="w-full text-white px-5 py-2.5 flex items-center justify-between shadow-md"
        style={{ backgroundColor: "#B22222" }}
        data-ocid="my-applications-topbar"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-white/80 shrink-0" />
          <div>
            <p className="font-semibold text-sm leading-tight">
              My Applications
            </p>
            {candidate && (
              <p className="text-white/70 text-xs font-mono">
                {candidate.registrationNo}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/candidate/dashboard"
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs border border-white/30 px-2.5 py-1 rounded hover:bg-white/10 transition-colors"
            data-ocid="my-applications-dashboard-link"
          >
            Dashboard
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs border border-white/30 px-2.5 py-1 rounded hover:bg-white/10 transition-colors"
            data-ocid="my-applications-home-link"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs border border-white/30 px-2.5 py-1 rounded hover:bg-white/10 transition-colors"
            data-ocid="my-applications-logout-btn"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Govt strip */}
      <div className="w-full bg-[#154360] px-5 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex flex-col w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#138808]" />
          </div>
          <span className="text-white text-xs font-medium tracking-wide">
            भारत सरकार / GOVERNMENT OF INDIA — Department of Post
          </span>
        </div>
        <span className="text-white/60 text-[10px] uppercase tracking-wide hidden sm:block">
          Candidate Portal
        </span>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Page heading */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              My Applications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              All applications registered under your account
            </p>
          </div>
          {candidate && (
            <span className="text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-1.5 font-mono font-medium shadow-sm shrink-0">
              {candidate.registrationNo}
            </span>
          )}
        </div>

        {/* Applications list */}
        {!candidate ? (
          <div
            className="bg-card border border-border rounded-xl p-12 text-center shadow-sm"
            data-ocid="my-applications-empty-state"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No Applications Found
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              No applications registered under your account. Please contact the
              admin office.
            </p>
            <Link
              to="/candidate/dashboard"
              className="mt-4 inline-block text-sm text-[#B22222] font-medium hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4 text-[#B22222]" />
              <span className="font-medium text-foreground">
                1 Application Found
              </span>
            </div>
            <ApplicationCard candidate={candidate} />
          </div>
        )}

        {/* Footer note */}
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground">
            For any discrepancy in your application details, please contact the
            exam office at <strong>RO Jabalpur</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
