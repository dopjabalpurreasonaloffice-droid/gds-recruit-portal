import {
  useAdminCreateOfficialUpdate,
  useAdminDeleteOfficialUpdate,
  useAdminListAllOfficialUpdates,
} from "@/hooks/useAdminQueries";
import type {
  OfficialUpdate,
  OfficialUpdateCategory,
} from "@/hooks/useAdminQueries";
import { Bell, ExternalLink, FilePlus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORY_STYLES: Record<
  OfficialUpdateCategory,
  { label: string; className: string }
> = {
  "Official Letters": {
    label: "Official Letter",
    className: "bg-red-100 text-red-700 border border-red-200",
  },
  Tenders: {
    label: "Tender",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  Recruitment: {
    label: "Recruitment",
    className: "bg-green-100 text-green-700 border border-green-200",
  },
};

function CategoryBadge({ category }: { category: OfficialUpdateCategory }) {
  const s = CATEGORY_STYLES[category];
  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${s.className}`}
    >
      {s.label}
    </span>
  );
}

const TODAY = new Date().toISOString().slice(0, 10);
const CATEGORIES: OfficialUpdateCategory[] = [
  "Official Letters",
  "Tenders",
  "Recruitment",
];

function AddUpdateForm({ onSuccess }: { onSuccess: () => void }) {
  const { mutate: createUpdate, isPending } = useAdminCreateOfficialUpdate();
  const [category, setCategory] =
    useState<OfficialUpdateCategory>("Official Letters");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(TODAY);
  const [pdfUrl, setPdfUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    createUpdate(
      {
        title: title.trim(),
        content: content.trim(),
        category,
        pdfUrl: pdfUrl.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Update added successfully");
          setTitle("");
          setContent("");
          setPdfUrl("");
          setDate(TODAY);
          setCategory("Official Letters");
          onSuccess();
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Failed to add update");
        },
      },
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      data-ocid="notification-add-form"
    >
      <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
        <FilePlus className="w-4 h-4 text-[#B22222] flex-shrink-0" />
        <h2 className="text-sm font-semibold text-foreground">
          Add New Update
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="notification-category"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-widest"
            >
              Category <span className="text-destructive">*</span>
            </label>
            <select
              id="notification-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as OfficialUpdateCategory)
              }
              className="form-input text-sm"
              data-ocid="notification-category"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="notification-date"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-widest"
            >
              Date <span className="text-destructive">*</span>
            </label>
            <input
              id="notification-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input text-sm"
              data-ocid="notification-date"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notification-title"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Title <span className="text-destructive">*</span>
          </label>
          <input
            id="notification-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title…"
            className="form-input text-sm"
            data-ocid="notification-title"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notification-content"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-widest"
          >
            Description{" "}
            <span className="text-muted-foreground font-normal normal-case">
              (optional)
            </span>
          </label>
          <textarea
            id="notification-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter additional details or description…"
            rows={3}
            className="form-input resize-y text-sm"
            data-ocid="notification-content"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notification-pdf-url"
            className="text-xs font-semibold text-muted-foreground uppercase tracking-widest"
          >
            PDF URL{" "}
            <span className="text-muted-foreground font-normal normal-case">
              (optional)
            </span>
          </label>
          <input
            id="notification-pdf-url"
            type="url"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            placeholder="https://…"
            className="form-input text-sm"
            data-ocid="notification-pdf-url"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            data-ocid="notification-submit"
            className="flex items-center gap-2 bg-[#B22222] hover:bg-[#9b1c1c] disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FilePlus className="w-4 h-4" />
            )}
            Add Update
          </button>
        </div>
      </form>
    </div>
  );
}

function UpdatesTable({ updates }: { updates: OfficialUpdate[] }) {
  const { mutate: deleteUpdate } = useAdminDeleteOfficialUpdate();

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteUpdate(id, {
      onSuccess: () => toast.success("Update deleted"),
      onError: () => toast.error("Failed to delete update"),
    });
  }

  if (updates.length === 0) {
    return (
      <div
        className="bg-card border border-dashed border-border rounded-xl py-16 flex flex-col items-center gap-3"
        data-ocid="notification-empty-state"
      >
        <Bell className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          No updates added yet
        </p>
        <p className="text-xs text-muted-foreground/70">
          Use the form above to add official letters, tenders, or recruitment
          notices.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      data-ocid="notification-table"
    >
      <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
        <Bell className="w-4 h-4 text-[#B22222] flex-shrink-0" />
        <h2 className="text-sm font-semibold text-foreground">
          All Updates{" "}
          <span className="text-muted-foreground font-normal">
            ({updates.length})
          </span>
        </h2>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Newest first
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {["Date", "Category", "Title", "PDF", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className={`text-left px-5 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-widest whitespace-nowrap ${h === "Actions" ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {updates.map((u, i) => (
              <tr
                key={u.id}
                className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 1 ? "bg-muted/10" : ""}`}
                data-ocid={`notification-row-${i + 1}`}
              >
                <td className="px-5 py-3 whitespace-nowrap font-mono text-xs text-foreground">
                  {formatDate(u.date)}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <CategoryBadge category={u.category} />
                </td>
                <td className="px-5 py-3 text-foreground font-medium max-w-xs">
                  <span className="line-clamp-2">{u.title}</span>
                  {u.content && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {u.content}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  {u.pdfUrl ? (
                    <a
                      href={u.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-ocid={`notification-pdf-link-${i + 1}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View PDF
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-5 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                  </span>
                </td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleDelete(u.id, u.title)}
                    data-ocid={`notification-delete-${i + 1}`}
                    className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded-md px-2.5 py-1.5 transition-colors font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function NotificationsManagement() {
  const {
    data: updates = [],
    isLoading,
    error,
    refetch,
  } = useAdminListAllOfficialUpdates();
  const sorted = [...updates].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6" data-ocid="notifications-management">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Bell className="w-6 h-6 text-primary flex-shrink-0" />
          Notifications Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage official letters, tenders, and recruitment notices shown on the
          public portal.
        </p>
      </div>

      {/* Add form */}
      <AddUpdateForm onSuccess={() => refetch()} />

      {/* Table */}
      {isLoading ? (
        <div
          className="flex items-center justify-center h-40"
          data-ocid="notifications-loading"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 border-2 border-[#B22222] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 text-sm text-destructive">
          Failed to load updates. Please refresh the page.
        </div>
      ) : (
        <UpdatesTable updates={sorted} />
      )}
    </div>
  );
}
