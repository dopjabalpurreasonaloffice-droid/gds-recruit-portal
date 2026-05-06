import {
  type AdminCandidate,
  type AdminFeeStatus,
  useAdminCandidates,
  useAdminUpdateFeeStatus,
} from "@/hooks/useAdminQueries";
import { BadgeDollarSign, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function FeeStatusBadge({ status }: { status: AdminFeeStatus }) {
  if (status === "Paid")
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        Paid
      </span>
    );
  if (status === "Failed")
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        Failed
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      Pending
    </span>
  );
}

function CandidateStatusBadge({
  status,
}: { status: AdminCandidate["status"] }) {
  if (status === "Approved")
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        Approved
      </span>
    );
  if (status === "Rejected")
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
      Pending
    </span>
  );
}

function FeeRow({
  candidate,
  updating,
  onUpdate,
  index,
}: {
  candidate: AdminCandidate;
  updating: boolean;
  onUpdate: (id: string, status: AdminFeeStatus) => void;
  index: number;
}) {
  return (
    <tr
      className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${index % 2 === 1 ? "bg-muted/10" : ""}`}
      data-ocid={`fee-row-${index + 1}`}
    >
      <td className="px-5 py-3 font-semibold text-foreground text-sm">
        {candidate.name}
      </td>
      <td className="px-5 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
        {candidate.registrationNo}
      </td>
      <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {candidate.circle}
      </td>
      <td className="px-5 py-3">
        <CandidateStatusBadge status={candidate.status} />
      </td>
      <td className="px-5 py-3">
        <FeeStatusBadge status={candidate.feeStatus} />
      </td>
      <td className="px-5 py-3">
        <select
          value={candidate.feeStatus}
          disabled={updating}
          onChange={(e) =>
            onUpdate(String(candidate.id), e.target.value as AdminFeeStatus)
          }
          className="form-input text-xs py-1.5 w-28"
          data-ocid={`fee-select-${index + 1}`}
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Failed">Failed</option>
        </select>
      </td>
    </tr>
  );
}

export default function FeeStatus() {
  const { data: candidates, isLoading } = useAdminCandidates();
  const { mutate: updateFee, isPending } = useAdminUpdateFeeStatus();
  const [search, setSearch] = useState("");

  const filtered =
    candidates?.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.registrationNo.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  function handleUpdate(candidateId: string, feeStatus: AdminFeeStatus) {
    updateFee(
      { candidateId, feeStatus },
      {
        onSuccess: () => toast.success("Fee status updated"),
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  return (
    <div className="space-y-6" data-ocid="fee-status-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <BadgeDollarSign className="w-6 h-6 text-primary flex-shrink-0" />
          Fee Status
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and update fee payment status for all candidates.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search by name or Reg No…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input text-sm pl-9 w-full"
          data-ocid="fee-search-input"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div
            className="flex items-center justify-center h-48"
            data-ocid="fee-loading"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="fee-empty"
          >
            <BadgeDollarSign className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              No candidates found
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
                    "Circle",
                    "Status",
                    "Fee Status",
                    "Update",
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
                {filtered.map((c, i) => (
                  <FeeRow
                    key={String(c.id)}
                    candidate={c}
                    updating={isPending}
                    onUpdate={handleUpdate}
                    index={i}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
