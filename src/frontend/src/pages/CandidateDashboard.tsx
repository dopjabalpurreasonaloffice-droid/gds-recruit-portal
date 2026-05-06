import CandidateQuickAccessCards from "@/components/CandidateQuickAccessCards";
import { useCandidateProfile } from "@/hooks/useAdminQueries";
import type { AdminCandidate } from "@/hooks/useAdminQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Home,
  LogOut,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminCandidate["status"] }) {
  if (status === "Approved")
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300"
        data-ocid="candidate-status-badge"
      >
        <CheckCircle className="h-4 w-4" /> Approved
      </span>
    );
  if (status === "Rejected")
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-300"
        data-ocid="candidate-status-badge"
      >
        <XCircle className="h-4 w-4" /> Rejected
      </span>
    );
  if (status === "Verified")
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-300"
        data-ocid="candidate-status-badge"
      >
        <CheckCircle className="h-4 w-4" /> Verified
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-300"
      data-ocid="candidate-status-badge"
    >
      <Clock className="h-4 w-4" /> Pending
    </span>
  );
}

function SectionHeading({
  icon,
  title,
}: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
      <span className="w-1 h-4 bg-[#B22222] rounded-full inline-block" />
      {icon}
      {title}
    </h2>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
        <span className="text-[#B22222]">{icon}</span>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-foreground font-medium">
        {value || (
          <span className="text-muted-foreground italic">Not provided</span>
        )}
      </span>
    </div>
  );
}

function AddressDisplay({
  label,
  address,
}: { label: string; address?: AdminCandidate["presentAddress"] }) {
  if (!address) return null;
  const parts = [
    address.doorNo,
    address.street,
    address.village,
    address.district,
    address.state,
    address.pincode,
  ].filter(Boolean);
  return (
    <div className="py-1.5 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide block mb-1">
        {label}
      </span>
      <span className="text-sm text-foreground">
        {parts.length > 0 ? parts.join(", ") : "—"}
      </span>
    </div>
  );
}

// ─── Candidate Panel Settings ──────────────────────────────────────────────────

interface CandidatePanelSettings {
  applicationOpenDate?: string;
  applicationCloseDate?: string;
  correctionPeriodStart?: string;
  correctionPeriodEnd?: string;
  applicationStatus?: string;
  notificationTitle?: string;
  scheduleNumber?: string;
}

function loadCandidatePanelSettings(): CandidatePanelSettings {
  try {
    const raw = localStorage.getItem("candidatePanelSettings");
    if (raw) return JSON.parse(raw) as CandidatePanelSettings;
  } catch {
    /* ignore */
  }
  return {};
}

function formatDateDisplay(isoDate?: string, fallback = ""): string {
  if (!isoDate) return fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── GDS Notification Card ───────────────────────────────────────────────────────────

function GDSNotificationCard() {
  const settings = loadCandidatePanelSettings();
  const appStatus = settings.applicationStatus ?? "Application Open";
  const isOpen = appStatus === "Application Open";
  const title = [
    settings.notificationTitle ??
      "Gramin Dak Sevak (GDS) Online Engagement Special Drive",
    settings.scheduleNumber ?? "",
  ]
    .filter(Boolean)
    .join(" — ");
  const openDate = formatDateDisplay(
    settings.applicationOpenDate,
    "02 Feb 2026",
  );
  const closeDate = formatDateDisplay(
    settings.applicationCloseDate,
    "16 Feb 2026",
  );
  const corrStart = formatDateDisplay(
    settings.correctionPeriodStart,
    "18 Feb 2026",
  );
  const corrEnd = formatDateDisplay(
    settings.correctionPeriodEnd,
    "19 Feb 2026",
  );

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      data-ocid="candidate-gds-notification-card"
    >
      <div className="px-4 py-3 bg-gradient-to-r from-[#154360] to-[#1a5276] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-white/80" />
          <span className="text-white text-sm font-semibold">
            Recruitment Notification
          </span>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isOpen ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"
          }`}
        >
          {isOpen ? "Application Open" : "Application Closed"}
        </span>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="font-semibold text-foreground text-sm leading-snug">
          {title}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-blue-50 rounded-lg px-3 py-2">
            <p className="text-blue-600 font-semibold uppercase tracking-wide mb-1">
              Application Period
            </p>
            <p className="text-foreground font-medium">
              {openDate} – {closeDate}
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg px-3 py-2">
            <p className="text-amber-600 font-semibold uppercase tracking-wide mb-1">
              Correction Period
            </p>
            <p className="text-foreground font-medium">
              {corrStart} – {corrEnd}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          {isOpen
            ? `Closes on: ${closeDate}`
            : `Correction deadline: ${corrEnd}`}
        </p>
      </div>
    </div>
  );
}

// ─── Application Status Section ──────────────────────────────────────────────────

function ApplicationStatusSection({
  candidate,
}: { candidate: AdminCandidate }) {
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
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
      data-ocid="candidate-application-status-section"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#1d4ed8]/10 to-transparent border-b border-border flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <h2 className="font-semibold text-foreground text-sm flex-1">
          Application Status
        </h2>
      </div>

      <div className="p-4">
        <div
          className="border border-border rounded-lg overflow-hidden"
          data-ocid="candidate-application-item.1"
        >
          {/* App header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-gradient-to-r from-[#B22222]/5 to-transparent border-b border-border">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm leading-tight truncate">
                GDS Online Engagement — {candidate.circle}
                {candidate.division ? ` / ${candidate.division}` : ""}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <code className="text-xs font-mono text-[#B22222] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  {candidate.registrationNo}
                </code>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{appDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={candidate.status} />
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-2 py-1 rounded-md transition-colors"
                data-ocid="candidate-app-view-details-btn"
                aria-expanded={expanded}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" /> View Details
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Fee + Post preferences summary */}
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-3 text-xs">
            <span className="text-muted-foreground font-medium">Fee:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                candidate.feeStatus === "Paid"
                  ? "bg-green-100 text-green-700"
                  : candidate.feeStatus === "Failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {candidate.feeStatus}
            </span>
            {candidate.circle && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  Circle: {candidate.circle}
                </span>
              </>
            )}
          </div>

          {/* Post preferences summary */}
          {candidate.postPreferences &&
            candidate.postPreferences.length > 0 && (
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  Post Preferences
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.postPreferences.slice(0, 3).map((p, i) => (
                    <span
                      key={`${p.branchOfficeName}-${i}`}
                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
                    >
                      {String(p.preferenceNo ?? i + 1)}. {p.branchOfficeName} (
                      {p.postType})
                    </span>
                  ))}
                  {candidate.postPreferences.length > 3 && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      +{candidate.postPreferences.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Rejection reason */}
          {candidate.status === "Rejected" && candidate.rejectionReason && (
            <div className="px-4 py-2.5 border-b border-border">
              <p className="text-xs text-red-600 font-medium">
                Rejection Reason: {candidate.rejectionReason}
              </p>
            </div>
          )}

          {/* Expanded details */}
          {expanded && (
            <div
              className="border-t border-border px-4 py-4 bg-muted/30 space-y-3"
              data-ocid="candidate-app-details-expanded"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground uppercase tracking-wide font-medium mb-1">
                    Personal
                  </p>
                  <p className="text-foreground">{candidate.name}</p>
                  {candidate.fatherName && (
                    <p className="text-muted-foreground">
                      Father: {candidate.fatherName}
                    </p>
                  )}
                  <p className="text-muted-foreground">DOB: {candidate.dob}</p>
                  <p className="text-muted-foreground">
                    Category: {candidate.category}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase tracking-wide font-medium mb-1">
                    Contact
                  </p>
                  <p className="text-foreground">+91 {candidate.mobile}</p>
                  {candidate.email && (
                    <p className="text-muted-foreground">{candidate.email}</p>
                  )}
                  {candidate.division && (
                    <p className="text-muted-foreground">
                      Division: {candidate.division}
                    </p>
                  )}
                </div>
              </div>

              {candidate.postPreferences &&
                candidate.postPreferences.length > 0 && (
                  <div>
                    <p className="text-muted-foreground uppercase tracking-wide font-medium text-xs mb-2">
                      All Post Preferences
                    </p>
                    <div className="overflow-x-auto rounded border border-border">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border-b border-border px-2 py-1.5 text-left text-muted-foreground">
                              Pref
                            </th>
                            <th className="border-b border-border px-2 py-1.5 text-left text-muted-foreground">
                              Branch Office
                            </th>
                            <th className="border-b border-border px-2 py-1.5 text-left text-muted-foreground">
                              Post
                            </th>
                            <th className="border-b border-border px-2 py-1.5 text-left text-muted-foreground">
                              Category
                            </th>
                            <th className="border-b border-border px-2 py-1.5 text-right text-muted-foreground">
                              Pay
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {candidate.postPreferences.map((p, i) => (
                            <tr
                              key={`${p.branchOfficeName}-${i}`}
                              className={i % 2 === 1 ? "bg-muted/30" : ""}
                            >
                              <td className="px-2 py-1.5 text-center text-[#B22222] font-bold">
                                {String(p.preferenceNo ?? i + 1)}
                              </td>
                              <td className="px-2 py-1.5 text-foreground">
                                {p.branchOfficeName}
                              </td>
                              <td className="px-2 py-1.5 text-muted-foreground">
                                {p.postType}
                              </td>
                              <td className="px-2 py-1.5 text-muted-foreground">
                                {p.category}
                              </td>
                              <td className="px-2 py-1.5 text-right text-muted-foreground">
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
      </div>
    </div>
  );
}

// ─── Application Form Section ────────────────────────────────────────────────────

function ApplicationFormSection({ candidate }: { candidate: AdminCandidate }) {
  // applicationFormData is ?Text in Motoko -> string | undefined in TS
  const pdfData = candidate.applicationFormData;
  const hasPdf = typeof pdfData === "string" && pdfData.trim().length > 0;

  if (!hasPdf) {
    return (
      <div
        className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        data-ocid="candidate-app-form-section"
      >
        <div className="px-4 py-3 bg-muted/50 border-b border-border flex items-center gap-2">
          <FileText className="h-4 w-4 text-[#B22222]" />
          <h2 className="font-semibold text-foreground text-sm">
            Application Form
          </h2>
        </div>
        <div
          className="p-8 text-center"
          data-ocid="candidate-app-form-empty-state"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground text-base mb-2">
            Application form not yet uploaded by admin.
          </p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Please check back later. The administrator will upload your form
            once it is ready.
          </p>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Awaiting admin upload</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
      data-ocid="candidate-app-form-section"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-white" />
          <span className="text-white text-sm font-semibold">
            Your Application Form is Ready
          </span>
        </div>
        <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">
          ✓ Available
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* PDF Viewer */}
        <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
          <iframe
            src={pdfData}
            title="Application Form PDF"
            className="w-full"
            style={{ height: "600px", minHeight: "400px" }}
            data-ocid="candidate-app-form-pdf-viewer"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={pdfData}
            download={`application-form-${candidate.registrationNo}.pdf`}
            data-ocid="candidate-app-form-download-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B22222] hover:bg-[#991b1b] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </a>
          <a
            href={pdfData}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="candidate-app-form-newtab-btn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-sm font-medium transition-colors"
          >
            View in New Tab
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Card ──────────────────────────────────────────────────────────────────────

function ProfileCard({ candidate }: { candidate: AdminCandidate }) {
  return (
    <div
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
      data-ocid="candidate-profile-card"
    >
      {/* Accent stripe */}
      <div className="h-2 bg-gradient-to-r from-[#B22222] via-[#dc2626] to-[#ef4444]" />
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B22222] to-[#991b1b] flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0">
            {candidate.name?.[0]?.toUpperCase() ?? "C"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">
              {candidate.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <code className="text-xs font-mono font-bold text-white bg-[#B22222] px-2.5 py-1 rounded-full">
                {candidate.registrationNo}
              </code>
              <StatusBadge status={candidate.status} />
              {candidate.category && (
                <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                  {candidate.category}
                </span>
              )}
            </div>
            {(candidate.circle || candidate.division) && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {[candidate.circle, candidate.division]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
            )}
          </div>

          {/* Registered date */}
          <div className="shrink-0 text-right">
            <p className="text-xs text-muted-foreground">Registered on</p>
            <p className="text-sm font-medium text-foreground mt-0.5">
              {new Date(
                Number(candidate.createdAt) / 1_000_000,
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Portal header (shared topbar + govt strip) ─────────────────────────────────

function CandidatePortalHeader({
  name,
  registrationNo,
  onLogout,
}: {
  name: string;
  registrationNo: string;
  onLogout: () => void;
}) {
  return (
    <>
      <div
        className="w-full text-white px-5 py-2.5 flex items-center justify-between shadow-md"
        style={{ backgroundColor: "#B22222" }}
        data-ocid="candidate-dashboard-topbar"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {name?.[0]?.toUpperCase() ?? "C"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate max-w-[160px] sm:max-w-none">
              {name}
            </p>
            <p className="text-white/70 text-xs leading-tight font-mono">
              {registrationNo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs border border-white/30 px-2.5 py-1 rounded hover:bg-white/10 transition-colors"
            data-ocid="candidate-dashboard-home-link"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-xs border border-white/30 px-2.5 py-1 rounded hover:bg-white/10 transition-colors"
            data-ocid="candidate-dashboard-logout-btn"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
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
    </>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────────────

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<AdminCandidate | null>(null);
  const [notFound, setNotFound] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Read auth from localStorage — on first render, before any effects run
  const regNo = localStorage.getItem("candidateRegNo") ?? null;
  const token = localStorage.getItem("candidateToken") ?? null;
  const storedName = localStorage.getItem("candidateName") ?? "Candidate";

  const {
    data: profileData,
    isLoading,
    isError,
    fetchStatus,
  } = useCandidateProfile(token && regNo ? regNo : null);

  // Guard: if no auth, redirect immediately
  useEffect(() => {
    if (!token || !regNo) {
      navigate({ to: "/candidate/login" });
    }
  }, [token, regNo, navigate]);

  // Sync profile data into local state once loaded
  useEffect(() => {
    // isLoading=false AND fetchStatus=idle means the query has run to completion
    if (!isLoading && fetchStatus !== "fetching") {
      if (profileData) {
        setCandidate(profileData);
        setNotFound(false);
      } else if (isError) {
        // Real backend error
        setNotFound(true);
      } else if (profileData === null && !isError) {
        // Backend responded with null — record not found
        setNotFound(true);
      }
      // profileData === undefined means query hasn't fetched yet — keep waiting
    }
  }, [profileData, isLoading, isError, fetchStatus]);

  function handleLogout() {
    localStorage.removeItem("candidateToken");
    localStorage.removeItem("candidateRegNo");
    localStorage.removeItem("candidateName");
    navigate({ to: "/candidate/login" });
  }

  function scrollToStatus() {
    statusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleApplyOnline() {
    navigate({ to: "/apply" });
  }

  if (isLoading || (fetchStatus === "fetching" && !candidate)) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <div
          className="text-center"
          data-ocid="candidate-dashboard-loading-state"
        >
          <div className="w-12 h-12 border-4 border-[#B22222] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            Loading your profile...
          </p>
          {storedName && storedName !== "Candidate" && (
            <p className="text-xs text-muted-foreground mt-1">
              Welcome, {storedName}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (notFound || (!candidate && !isLoading)) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
        <div
          className="text-center max-w-sm"
          data-ocid="candidate-dashboard-error-state"
        >
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-2">
            Profile Not Found
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your registration record could not be loaded. Please check your
            login details or contact the admin.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="text-[#B22222] text-sm font-medium hover:underline"
          >
            Try logging in again
          </button>
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  const settings = loadCandidatePanelSettings();
  const appOpenStatus = settings.applicationStatus ?? "Application Open";

  const maskedAadhaar = candidate.aadhaar
    ? `XXXX-XXXX-${candidate.aadhaar.slice(-4)}`
    : "—";

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top bar + Govt strip */}
      <CandidatePortalHeader
        name={candidate.name || storedName}
        registrationNo={candidate.registrationNo}
        onLogout={handleLogout}
      />

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-5">
        {/* 1. Profile Card */}
        <ProfileCard candidate={candidate} />

        {/* 2. Quick Access Cards (3 cards) */}
        <div>
          <SectionHeading icon={null} title="Quick Access" />
          <CandidateQuickAccessCards
            onApplyClick={handleApplyOnline}
            onStatusClick={scrollToStatus}
            onApplicationFormClick={scrollToForm}
            applicationStatus={candidate.status}
            applicationOpenStatus={appOpenStatus}
          />
        </div>

        {/* 3. GDS Notification Card */}
        <GDSNotificationCard />

        {/* 4. Application Status Section */}
        <div ref={statusRef}>
          <SectionHeading
            icon={<CheckCircle className="h-3.5 w-3.5" />}
            title="Application Status"
          />
          <ApplicationStatusSection candidate={candidate} />
        </div>

        {/* 5. Application Form Section */}
        <div ref={formRef}>
          <SectionHeading
            icon={<FileText className="h-3.5 w-3.5" />}
            title="Application Form"
          />
          <ApplicationFormSection candidate={candidate} />
        </div>

        {/* 6. Profile Details (collapsible) */}
        <ProfileDetailsSection
          candidate={candidate}
          maskedAadhaar={maskedAadhaar}
        />

        {/* Footer note */}
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            <Calendar className="inline h-3 w-3 mr-1" />
            Registration submitted on{" "}
            {new Date(
              Number(candidate.createdAt) / 1_000_000,
            ).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Details Section (collapsible) ─────────────────────────────────────────

function ProfileDetailsSection({
  candidate,
  maskedAadhaar,
}: { candidate: AdminCandidate; maskedAadhaar: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border hover:bg-muted/70 transition-colors"
        data-ocid="candidate-profile-details-toggle"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[#B22222]" />
          <span className="font-semibold text-foreground text-sm">
            Full Profile Details
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              title="Personal Details"
              icon={<User className="h-4 w-4" />}
            >
              <div className="space-y-0">
                <Field label="Full Name" value={candidate.name} />
                <Field
                  label="Father / Mother Name"
                  value={candidate.fatherName}
                />
                <Field label="Date of Birth" value={candidate.dob} />
                <Field label="Gender" value={candidate.gender} />
                <Field label="Category" value={candidate.category} />
                <Field label="Aadhaar Number" value={maskedAadhaar} />
                <Field
                  label="PH (Physically Handicapped)"
                  value={candidate.ph ? "Yes" : "No"}
                />
                <Field
                  label="Can Ride Bicycle"
                  value={candidate.canRideBicycle ? "Yes" : "No"}
                />
                <Field
                  label="Currently Employed"
                  value={candidate.isEmployed ? "Yes" : "No"}
                />
              </div>
            </InfoCard>

            <InfoCard
              title="Contact Details"
              icon={<Phone className="h-4 w-4" />}
            >
              <div className="space-y-0">
                <Field
                  label="Mobile Number"
                  value={`+91 ${candidate.mobile}`}
                />
                <Field label="Email" value={candidate.email || "—"} />
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                  Circle & Division
                </p>
                <Field label="Circle" value={candidate.circle} />
                <Field label="Division" value={candidate.division} />
                <Field
                  label="Division for Verification"
                  value={candidate.divisionForVerification}
                />
              </div>
            </InfoCard>

            <InfoCard
              title="Address Details"
              icon={<MapPin className="h-4 w-4" />}
            >
              {candidate.presentAddress ? (
                <AddressDisplay
                  label="Present Address"
                  address={candidate.presentAddress}
                />
              ) : (
                <Field label="Present Address" value="—" />
              )}
              {candidate.permanentAddress ? (
                <AddressDisplay
                  label="Permanent Address"
                  address={candidate.permanentAddress}
                />
              ) : (
                <Field label="Permanent Address" value="—" />
              )}
            </InfoCard>

            <InfoCard
              title="Education / Marks"
              icon={<BookOpen className="h-4 w-4" />}
            >
              <div className="space-y-0">
                <Field label="Board Name" value={candidate.boardName} />
                <Field
                  label="State & Year of Passing"
                  value={
                    [candidate.stateOfBoard, candidate.yearOfPassing]
                      .filter(Boolean)
                      .join(" — ") || "—"
                  }
                />
                <Field label="Result Type" value={candidate.resultType} />
                <Field
                  label="Percentage / CGPA / Grade"
                  value={
                    candidate.percentageObtained ||
                    candidate.totalCgpa ||
                    candidate.totalGrade ||
                    "—"
                  }
                />
                <Field label="Board Remarks" value={candidate.boardRemarks} />
              </div>
              {candidate.subjectMarks && candidate.subjectMarks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                    Subject Marks
                  </p>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border px-2 py-1 text-left font-medium text-muted-foreground">
                          Subject
                        </th>
                        <th className="border border-border px-2 py-1 text-right font-medium text-muted-foreground">
                          Marks / Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidate.subjectMarks.map((sm, idx) => (
                        <tr
                          key={sm.subject || idx}
                          className={idx % 2 === 1 ? "bg-muted/30" : ""}
                        >
                          <td className="border border-border px-2 py-1 text-foreground">
                            {sm.subject}
                          </td>
                          <td className="border border-border px-2 py-1 text-right text-foreground">
                            {sm.marksOrGrade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </InfoCard>
          </div>

          {/* Post Preferences */}
          {candidate.postPreferences &&
            candidate.postPreferences.length > 0 && (
              <InfoCard
                title="Post Preferences"
                icon={<Building2 className="h-4 w-4" />}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border px-3 py-2 text-left font-medium text-muted-foreground text-xs uppercase">
                          Pref. No
                        </th>
                        <th className="border border-border px-3 py-2 text-left font-medium text-muted-foreground text-xs uppercase">
                          Branch Office
                        </th>
                        <th className="border border-border px-3 py-2 text-left font-medium text-muted-foreground text-xs uppercase">
                          Post Type
                        </th>
                        <th className="border border-border px-3 py-2 text-left font-medium text-muted-foreground text-xs uppercase">
                          Category
                        </th>
                        <th className="border border-border px-3 py-2 text-right font-medium text-muted-foreground text-xs uppercase">
                          Basic Pay
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidate.postPreferences.map((pref, idx) => (
                        <tr
                          key={`pref-${pref.branchOfficeName}-${pref.postType}`}
                          className={idx % 2 === 1 ? "bg-muted/30" : ""}
                        >
                          <td className="border border-border px-3 py-2 text-center font-semibold text-[#B22222]">
                            {pref.preferenceNo !== undefined
                              ? String(pref.preferenceNo)
                              : idx + 1}
                          </td>
                          <td className="border border-border px-3 py-2 text-foreground">
                            {pref.branchOfficeName}
                          </td>
                          <td className="border border-border px-3 py-2 text-muted-foreground">
                            {pref.postType}
                          </td>
                          <td className="border border-border px-3 py-2 text-muted-foreground">
                            {pref.category}
                          </td>
                          <td className="border border-border px-3 py-2 text-right text-muted-foreground">
                            ₹{Number(pref.basicPay).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </InfoCard>
            )}
        </div>
      )}
    </div>
  );
}
