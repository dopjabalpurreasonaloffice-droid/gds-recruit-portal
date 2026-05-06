import {
  type AdminCandidate,
  type AdminDocument,
  useAdminAddDocument,
  useAdminCandidates,
  useAdminDocuments,
} from "@/hooks/useAdminQueries";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  Search,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DocRow({
  docType,
  docLabel,
  existing,
  candidateId,
  registrationNo,
}: {
  docType: DocKey;
  docLabel: string;
  existing: AdminDocument | undefined;
  candidateId: string;
  registrationNo: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { mutate: addDocument } = useAdminAddDocument();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileKey = await fileToBase64(file);
      addDocument(
        {
          candidateId,
          registrationNo,
          documentType: docType,
          fileKey,
          fileName: file.name,
        },
        {
          onSuccess: () => toast.success(`${docLabel} uploaded`),
          onError: (err) => toast.error((err as Error).message),
          onSettled: () => setUploading(false),
        },
      );
    } catch {
      toast.error("Failed to read file");
      setUploading(false);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const slugId = docType.replace(/\s+/g, "-").toLowerCase();

  return (
    <div
      className="flex items-center justify-between py-3 border-b border-border last:border-0 gap-3"
      data-ocid={`doc-row-${slugId}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {docLabel}
          </p>
          {existing ? (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {existing.fileName} ·{" "}
              {new Date(existing.uploadedAt).toLocaleDateString("en-IN")}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-0.5">Not uploaded</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {existing ? (
          <>
            <span className="hidden sm:flex items-center gap-1 text-xs text-green-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
            </span>
            <a
              href={existing.fileKey}
              download={existing.fileName}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
              data-ocid={`doc-view-${slugId}`}
            >
              <Eye className="w-3.5 h-3.5" /> View
            </a>
          </>
        ) : (
          <span className="hidden sm:flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="w-3.5 h-3.5" /> Not uploaded
          </span>
        )}
        <label
          className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
          data-ocid={`doc-upload-${slugId}`}
        >
          <Upload className="w-3 h-3" />
          {uploading ? "Uploading…" : existing ? "Re-upload" : "Upload"}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      </div>
    </div>
  );
}

function CandidateDocuments({ candidate }: { candidate: AdminCandidate }) {
  const { data: docs, isLoading } = useAdminDocuments(String(candidate.id));
  const docMap = (docs ?? []).reduce<Partial<Record<DocKey, AdminDocument>>>(
    (m, d) => {
      m[d.documentType as DocKey] = d;
      return m;
    },
    {},
  );

  const uploaded = DOC_TYPES.filter((dt) => docMap[dt.key]).length;
  const total = DOC_TYPES.length;
  const pct = Math.round((uploaded / total) * 100);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 bg-muted/30">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {candidate.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {candidate.registrationNo} · {candidate.circle} /{" "}
            {candidate.division}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-xs font-bold text-foreground">
            {uploaded}/{total} uploaded
          </span>
          <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor:
                  pct === 100 ? "#16a34a" : pct > 50 ? "#d97706" : "#B22222",
              }}
            />
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-5">
          {DOC_TYPES.map((dt) => (
            <DocRow
              key={dt.key}
              docType={dt.key}
              docLabel={dt.label}
              existing={docMap[dt.key]}
              candidateId={String(candidate.id)}
              registrationNo={candidate.registrationNo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentManagement() {
  const { data: candidates, isLoading: candidatesLoading } =
    useAdminCandidates();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");

  const filtered =
    candidates?.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.registrationNo.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const selected = candidates?.find((c) => String(c.id) === selectedId) ?? null;

  return (
    <div className="space-y-6" data-ocid="document-management-page">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-primary flex-shrink-0" />
          Document Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload and manage candidate documents (13 types). Re-upload allowed at
          any time.
        </p>
      </div>

      {/* Candidate Selector */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
        <label
          htmlFor="doc-search-input"
          className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block"
        >
          Select Candidate
        </label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            id="doc-search-input"
            type="text"
            placeholder="Search by name or Registration No…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input text-sm pl-8 w-full"
            data-ocid="doc-search-input"
          />
        </div>
        {candidatesLoading ? (
          <p className="text-xs text-muted-foreground animate-pulse">
            Loading candidates…
          </p>
        ) : (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="form-input text-sm w-full"
            size={Math.min(filtered.length + 1, 7)}
            data-ocid="doc-candidate-select"
          >
            <option value="">— Select a candidate —</option>
            {filtered.map((c) => (
              <option key={String(c.id)} value={String(c.id)}>
                {c.name} · {c.registrationNo}
              </option>
            ))}
          </select>
        )}
      </div>

      {selected && <CandidateDocuments candidate={selected} />}

      {!selected && !candidatesLoading && (
        <div
          className="bg-card border border-dashed border-border rounded-xl flex flex-col items-center justify-center py-16 gap-3"
          data-ocid="doc-empty"
        >
          <FileText className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">
            Select a candidate above to manage their documents
          </p>
        </div>
      )}
    </div>
  );
}
