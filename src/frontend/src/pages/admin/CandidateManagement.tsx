import {
  FeeStatus as BackendFeeStatus,
  AdminCandidateStatus as BackendStatus,
} from "@/backend";
import PdfUploadWidget from "@/components/PdfUploadWidget";
import {
  useAdminCandidates,
  useAdminDocuments,
  useAdminSetApplicationForm,
  useAdminUpdateCandidateStatus,
  useAdminUpdateFeeStatus,
} from "@/hooks/useAdminQueries";
import type {
  AdminCandidate,
  AdminCandidateStatus,
  AdminDocument,
} from "@/hooks/useAdminQueries";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Eye,
  FileText,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  { key: "Registration Form", label: "Registration Form" },
  { key: "Aadhaar Card", label: "Aadhaar Card" },
  { key: "PAN Card", label: "PAN Card" },
  { key: "10th Certificate", label: "10th Certificate" },
  { key: "12th Certificate", label: "12th Certificate" },
  { key: "Caste Certificate", label: "Caste Certificate" },
  { key: "Domicile Certificate", label: "Domicile Certificate" },
  { key: "Income Certificate", label: "Income Certificate" },
  { key: "Computer Certificate", label: "Computer Certificate" },
  { key: "Identity Certificate", label: "Identity Certificate" },
  { key: "Character Certificate", label: "Character Certificate" },
  { key: "Medical Certificate", label: "Medical Certificate" },
  { key: "Attestation Form", label: "Attestation Form" },
] as const;

type DocKey = (typeof DOC_TYPES)[number]["key"];

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AdminCandidate["status"] }) {
  if (status === BackendStatus.Approved)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        Approved
      </span>
    );
  if (status === BackendStatus.Rejected)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      Pending
    </span>
  );
}

// ─── RejectModal ──────────────────────────────────────────────────────────────

function RejectModal({
  candidate,
  onClose,
  onConfirm,
  isPending,
}: {
  candidate: AdminCandidate;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-2xl"
        data-ocid="reject-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            Reject Candidate
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            data-ocid="reject-close-button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Rejecting{" "}
          <span className="font-semibold text-foreground">
            {candidate.name}
          </span>{" "}
          ({candidate.registrationNo})
        </p>
        <div className="flex flex-col gap-1.5 mb-5">
          <label
            htmlFor="reject-reason-input"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
          >
            Rejection Reason <span className="text-destructive">*</span>
          </label>
          <textarea
            id="reject-reason-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this candidate is being rejected…"
            rows={3}
            className="form-input resize-none text-sm"
            data-ocid="reject-reason-input"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-md hover:bg-muted/30 transition-colors"
            data-ocid="reject-cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim() || isPending}
            onClick={() => onConfirm(reason.trim())}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:opacity-90 disabled:opacity-60 transition-colors font-medium"
            data-ocid="reject-confirm-btn"
          >
            {isPending ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DocumentsSection ─────────────────────────────────────────────────────────

function DocumentsSection({ candidateId }: { candidateId: string }) {
  const { data: docs, isLoading } = useAdminDocuments(candidateId);
  const docMap = (docs ?? []).reduce<Partial<Record<DocKey, AdminDocument>>>(
    (m, d) => {
      m[d.documentType as DocKey] = d;
      return m;
    },
    {},
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {DOC_TYPES.map((dt) => {
        const doc = docMap[dt.key];
        return (
          <div
            key={dt.key}
            className="flex items-center justify-between py-2.5 gap-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-foreground font-medium truncate">
                {dt.label}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {doc ? (
                <>
                  <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Uploaded
                  </span>
                  <a
                    href={doc.fileKey}
                    download={doc.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Eye className="w-3 h-3" /> View
                  </a>
                </>
              ) : (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3" /> Not Uploaded
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────

function DetailModal({
  candidate: initialCandidate,
  onClose,
}: {
  candidate: AdminCandidate;
  onClose: () => void;
}) {
  const [candidate, setCandidate] = useState<AdminCandidate>(initialCandidate);
  const [activeTab, setActiveTab] = useState<"info" | "documents" | "appform">(
    "info",
  );
  const [pdfValue, setPdfValue] = useState<string>(
    candidate.applicationFormData ?? "",
  );
  const [editingFeeStatus, setEditingFeeStatus] = useState<string>(
    String(candidate.feeStatus),
  );
  const { mutate: setAppForm, isPending: isSavingPdf } =
    useAdminSetApplicationForm();
  const { mutate: updateFee, isPending: isUpdatingFee } =
    useAdminUpdateFeeStatus();

  function handleFeeStatusUpdate() {
    const feeVal = editingFeeStatus as "Pending" | "Paid" | "Failed";
    updateFee(
      { candidateId: String(candidate.id), feeStatus: feeVal },
      {
        onSuccess: () => {
          toast.success(`Fee status updated to ${feeVal}`);
          setCandidate((prev) => ({
            ...prev,
            feeStatus: feeVal as BackendFeeStatus,
          }));
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  function handlePdfChange(dataUrl: string) {
    setPdfValue(dataUrl);
    setAppForm(
      { registrationNo: candidate.registrationNo, formData: dataUrl },
      {
        onSuccess: () => {
          const msg = dataUrl
            ? "Application form PDF saved successfully"
            : "Application form PDF removed";
          toast.success(msg);
          setCandidate((prev) => ({ ...prev, applicationFormData: dataUrl }));
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  const infoRows: [string, string][] = [
    ["Registration No", candidate.registrationNo],
    ["Full Name", candidate.name],
    ["Father's Name", candidate.fatherName],
    ["Date of Birth", candidate.dob],
    ["Category", candidate.category],
    ["Mobile No.", candidate.mobile],
    [
      "Marks / Percentage",
      candidate.percentageObtained ||
        candidate.totalCgpa ||
        candidate.totalGrade ||
        "—",
    ],
    ["Circle", candidate.circle],
    ["Division", candidate.division],
    ["Fee Status", String(candidate.feeStatus)],
    [
      "Registered On",
      new Date(Number(candidate.createdAt) / 1_000_000).toLocaleDateString(
        "en-IN",
        { day: "2-digit", month: "short", year: "numeric" },
      ),
    ],
  ];

  const TABS = [
    { key: "info" as const, label: "Registration Info" },
    { key: "documents" as const, label: "Documents" },
    { key: "appform" as const, label: "Application Form" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-6 px-4"
      data-ocid="detail-modal-overlay"
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-3xl shadow-2xl"
        data-ocid="detail-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#B22222] rounded-t-xl">
          <div>
            <h2 className="text-base font-bold text-white">
              Candidate Details
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Reg. No: {candidate.registrationNo}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            data-ocid="detail-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/20">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-[#B22222] text-[#B22222]"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`detail-tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Registration Info Tab */}
          {activeTab === "info" && (
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-bold text-[#B22222] uppercase tracking-widest mb-3 pb-1.5 border-b border-border">
                  Registration Information
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {infoRows.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                        {label}
                      </dt>
                      <dd className="text-sm font-semibold text-foreground mt-0.5 break-words">
                        {value || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section>
                <h3 className="text-xs font-bold text-[#B22222] uppercase tracking-widest mb-3 pb-1.5 border-b border-border">
                  Application Status
                </h3>
                <div className="flex items-center gap-6 flex-wrap">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                      Status
                    </span>
                    <StatusBadge status={candidate.status} />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1.5">
                      Fee Status
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        candidate.feeStatus === BackendFeeStatus.Paid
                          ? "bg-green-100 text-green-800 border-green-200"
                          : candidate.feeStatus === BackendFeeStatus.Failed
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {String(candidate.feeStatus)}
                    </span>
                  </div>
                </div>
                {/* Fee Status Updater */}
                <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                    Update Fee Status
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={editingFeeStatus}
                      onChange={(e) => setEditingFeeStatus(e.target.value)}
                      className="border border-input rounded-md px-3 py-1.5 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#B22222]/30"
                      data-ocid="detail-fee-status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <button
                      type="button"
                      disabled={isUpdatingFee}
                      onClick={handleFeeStatusUpdate}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-50 transition-colors font-semibold"
                      data-ocid="detail-update-fee-btn"
                    >
                      {isUpdatingFee ? "Updating…" : "✓ Update Fee Status"}
                    </button>
                  </div>
                </div>
                {candidate.rejectionReason && (
                  <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-[11px] font-bold text-red-700 uppercase tracking-widest mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-800">
                      {candidate.rejectionReason}
                    </p>
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-xs font-bold text-[#B22222] uppercase tracking-widest mb-3 pb-1.5 border-b border-border">
                  Fee Slip
                </h3>
                <div className="p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Payment Receipt
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {candidate.feeStatus === BackendFeeStatus.Paid
                        ? "Fee slip is available for this candidate."
                        : `Fee status: ${String(candidate.feeStatus)} — slip not generated.`}
                    </p>
                  </div>
                  {candidate.feeStatus === BackendFeeStatus.Paid ? (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#B22222] text-white rounded-md hover:opacity-90 transition-colors flex-shrink-0 font-medium"
                      data-ocid="detail-print-slip"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Print / Download
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground italic flex-shrink-0">
                      Not available
                    </span>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <section>
              <h3 className="text-xs font-bold text-[#B22222] uppercase tracking-widest mb-3 pb-1.5 border-b border-border">
                Uploaded Documents (13 Types)
              </h3>
              <DocumentsSection candidateId={String(candidate.id)} />
            </section>
          )}

          {/* Application Form PDF Tab */}
          {activeTab === "appform" && (
            <section className="space-y-4">
              <div className="pb-1.5 border-b border-border">
                <h3 className="text-xs font-bold text-[#B22222] uppercase tracking-widest">
                  Application Form PDF
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload an application form PDF for this candidate. Once saved,
                  the candidate can view it from their dashboard under{" "}
                  <span className="font-semibold">Application Form</span>.
                </p>
              </div>

              {isSavingPdf && (
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground py-1"
                  data-ocid="appform-saving-state"
                >
                  <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Saving to candidate record…
                </div>
              )}

              <PdfUploadWidget
                value={pdfValue}
                onChange={handlePdfChange}
                label="Upload Application Form PDF"
                accentColor="red"
                ocidPrefix="appform-pdf"
              />

              {pdfValue && (
                <div
                  className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-200 rounded-lg mt-3"
                  data-ocid="appform-pdf-status"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800">
                      Application form is uploaded
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Candidate will see this in their{" "}
                      <span className="font-semibold">Application Form</span>{" "}
                      section after login.
                    </p>
                  </div>
                  <a
                    href={pdfValue}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-[#B22222] text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-colors flex-shrink-0 font-medium"
                    data-ocid="appform-view-pdf-button"
                  >
                    <FileText className="w-3 h-3" />
                    View PDF
                  </a>
                </div>
              )}

              {!pdfValue && !isSavingPdf && (
                <div
                  className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg"
                  data-ocid="appform-pdf-empty-state"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    No application form PDF uploaded yet for this candidate.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end bg-muted/20 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors font-medium"
            data-ocid="detail-modal-close"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CandidateManagement() {
  const [circleFilter, setCircleFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | AdminCandidateStatus>(
    "",
  );
  const [rejectTarget, setRejectTarget] = useState<AdminCandidate | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminCandidate | null>(null);

  const filters = {
    circle: circleFilter || undefined,
    division: divisionFilter || undefined,
    status: (statusFilter || undefined) as AdminCandidateStatus | undefined,
  };

  const { data: candidates, isLoading } = useAdminCandidates(filters);
  const { mutate: updateStatus, isPending } = useAdminUpdateCandidateStatus();
  const { mutate: updateFee, isPending: isFeePending } =
    useAdminUpdateFeeStatus();

  function approve(id: string) {
    updateStatus(
      { id, status: "Approved" },
      {
        onSuccess: () => toast.success("Candidate approved"),
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  function markFeesPaid(candidateId: string) {
    updateFee(
      { candidateId, feeStatus: "Paid" },
      {
        onSuccess: () => toast.success("Fee marked as Paid"),
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  function confirmReject(reason: string) {
    if (!rejectTarget) return;
    updateStatus(
      {
        id: String(rejectTarget.id),
        status: "Rejected",
        rejectionReason: reason,
      },
      {
        onSuccess: () => {
          toast.success("Candidate rejected");
          setRejectTarget(null);
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  const hasFilter = !!(circleFilter || divisionFilter || statusFilter);

  return (
    <div className="space-y-5" data-ocid="candidate-management-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Users className="w-6 h-6 text-primary flex-shrink-0" />
          Candidate Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage all candidate applications.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl px-5 py-4 shadow-sm">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Filters
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by Circle"
              value={circleFilter}
              onChange={(e) => setCircleFilter(e.target.value)}
              className="form-input text-sm pl-8 w-40"
              data-ocid="filter-circle"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by Division"
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="form-input text-sm pl-8 w-40"
              data-ocid="filter-division"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "" | AdminCandidateStatus)
            }
            className="form-input text-sm w-36"
            data-ocid="filter-status"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setCircleFilter("");
                setDivisionFilter("");
                setStatusFilter("");
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 hover:bg-muted/40 transition-colors"
              data-ocid="filter-clear"
            >
              <X className="w-3 h-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div
            className="flex items-center justify-center h-48"
            data-ocid="candidates-loading"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Loading candidates…
              </p>
            </div>
          </div>
        ) : !candidates?.length ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="candidates-empty"
          >
            <Users className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              No candidates found
            </p>
            <p className="text-xs text-muted-foreground/70">
              {hasFilter
                ? "Try adjusting your filters."
                : "Register candidates to see them here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {[
                    "Name",
                    "Reg No",
                    "Circle / Division",
                    "Status",
                    "Fee",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.map((c, i) => (
                  <tr
                    key={String(c.id)}
                    className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${
                      i % 2 === 1 ? "bg-muted/10" : ""
                    }`}
                    data-ocid={`candidate-row-${i + 1}`}
                  >
                    <td className="px-5 py-3 font-semibold text-foreground max-w-[160px] truncate">
                      {c.name}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {c.registrationNo}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {c.circle}
                      {c.division ? ` / ${c.division}` : ""}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                          c.feeStatus === BackendFeeStatus.Paid
                            ? "bg-green-100 text-green-800 border-green-200"
                            : c.feeStatus === BackendFeeStatus.Failed
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                        }`}
                      >
                        {String(c.feeStatus)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="View Details"
                          onClick={() => setViewTarget(c)}
                          className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                          data-ocid={`view-candidate-${i + 1}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {c.status !== BackendStatus.Approved && (
                          <button
                            type="button"
                            title="Approve"
                            disabled={isPending}
                            onClick={() => approve(String(c.id))}
                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-green-100 text-green-700 transition-colors disabled:opacity-50"
                            data-ocid={`approve-candidate-${i + 1}`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.status !== BackendStatus.Rejected && (
                          <button
                            type="button"
                            title="Reject"
                            onClick={() => setRejectTarget(c)}
                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-red-100 text-red-700 transition-colors"
                            data-ocid={`reject-candidate-${i + 1}`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {c.feeStatus !== BackendFeeStatus.Paid && (
                          <button
                            type="button"
                            title="Mark Fees Paid"
                            disabled={isFeePending}
                            onClick={() => markFeesPaid(String(c.id))}
                            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-green-100 text-green-700 font-bold transition-colors disabled:opacity-50 text-sm"
                            data-ocid={`fee-paid-candidate-${i + 1}`}
                          >
                            ₹
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectTarget && (
        <RejectModal
          candidate={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={confirmReject}
          isPending={isPending}
        />
      )}

      {viewTarget && (
        <DetailModal
          candidate={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}
    </div>
  );
}
