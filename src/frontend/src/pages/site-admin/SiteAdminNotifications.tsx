import PdfUploadWidget from "@/components/PdfUploadWidget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type OfficialUpdate,
  type OfficialUpdateCategory,
  useAdminCreateOfficialUpdate,
  useAdminDeleteOfficialUpdate,
  useAdminListAllOfficialUpdates,
  useAdminUpdateOfficialUpdate,
} from "@/hooks/useAdminQueries";
import { Bell, Edit2, FileText, PlusCircle, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormShape {
  title: string;
  date: string;
  category: OfficialUpdateCategory;
  isNew: boolean;
  published: boolean;
  pdfUrl: string;
}

const BLANK: FormShape = {
  title: "",
  date: "",
  category: "Recruitment",
  isNew: true,
  published: true,
  pdfUrl: "",
};

// ─── Shared page component used by Letters / Tenders / Recruitment ────────────

interface NotificationsPageProps {
  filterCategory?: OfficialUpdateCategory;
  pageTitle: string;
  pageDesc: string;
  icon: React.ReactNode;
  accentColor?: string;
}

export function NotificationsPage({
  filterCategory,
  pageTitle,
  pageDesc,
  icon,
  accentColor = "blue",
}: NotificationsPageProps) {
  const { data: allUpdates = [], isLoading } = useAdminListAllOfficialUpdates();
  const createMutation = useAdminCreateOfficialUpdate();
  const updateMutation = useAdminUpdateOfficialUpdate();
  const deleteMutation = useAdminDeleteOfficialUpdate();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OfficialUpdate | null>(null);
  const [form, setForm] = useState<FormShape>({
    ...BLANK,
    category: filterCategory ?? "Recruitment",
  });

  const filtered = filterCategory
    ? allUpdates.filter((n) => n.category === filterCategory)
    : allUpdates;

  function openAdd() {
    setEditing(null);
    setForm({ ...BLANK, category: filterCategory ?? "Recruitment" });
    setShowForm(true);
  }
  function openEdit(item: OfficialUpdate) {
    setEditing(item);
    setForm({
      title: item.title,
      date: item.date,
      category: item.category,
      isNew: item.isNew,
      published: item.isActive,
      pdfUrl: item.pdfUrl,
    });
    setShowForm(true);
  }
  function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Deleted"),
      onError: (err) => toast.error(String(err)),
    });
  }
  function handleSave() {
    if (!form.title.trim() || !form.date.trim()) {
      toast.error("Title and date are required");
      return;
    }
    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          title: form.title,
          content: form.title,
          pdfUrl: form.pdfUrl,
          isActive: form.published,
        },
        {
          onSuccess: () => {
            toast.success("Updated");
            setShowForm(false);
          },
          onError: (err) => toast.error(String(err)),
        },
      );
    } else {
      createMutation.mutate(
        {
          title: form.title,
          content: form.title,
          category: form.category,
          pdfUrl: form.pdfUrl,
        },
        {
          onSuccess: () => {
            toast.success("Added");
            setShowForm(false);
          },
          onError: (err) => toast.error(String(err)),
        },
      );
    }
  }

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-${accentColor}-700/10 flex items-center justify-center shrink-0`}
          >
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {pageTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{pageDesc}</p>
          </div>
        </div>
        <Button
          onClick={openAdd}
          className={`gap-2 bg-${accentColor}-700 hover:bg-${accentColor}-800 shrink-0`}
          data-ocid={`site-admin-${pageTitle.toLowerCase().replace(/\s+/g, "-")}-add-btn`}
          disabled={isMutating}
        >
          <PlusCircle className="w-4 h-4" /> Add {pageTitle}
        </Button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div
          className="bg-card border border-blue-200 rounded-xl p-6 shadow-sm"
          data-ocid="site-admin-filtered-notif-form"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">
              {editing ? "Edit" : "Add"} {pageTitle}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close"
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Title…"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="DD.MM.YYYY"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Status</Label>
              <label className="flex items-center gap-2 cursor-pointer text-sm h-10 px-1">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, published: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-blue-700"
                />
                <span>Published (visible on site)</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <PdfUploadWidget
                value={form.pdfUrl}
                onChange={(url) => setForm((f) => ({ ...f, pdfUrl: url }))}
                label="Attach PDF (optional)"
                accentColor="blue"
                ocidPrefix="filtered-notif-pdf"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              data-ocid="site-admin-filtered-notif-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-700 hover:bg-blue-800"
              disabled={isMutating}
              data-ocid="site-admin-filtered-notif-save-btn"
            >
              {editing ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {pageTitle}{" "}
            <span className="text-muted-foreground font-normal">
              ({filtered.length})
            </span>
          </h2>
        </div>
        {isLoading ? (
          <div
            className="p-12 text-center text-muted-foreground"
            data-ocid="site-admin-filtered-loading"
          >
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="p-12 text-center text-muted-foreground"
            data-ocid="site-admin-filtered-empty-state"
          >
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No items yet</p>
            <p className="text-xs mt-1">
              Click "Add {pageTitle}" to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors duration-150"
                data-ocid={`site-admin-filtered-item.${idx + 1}`}
              >
                <div className="shrink-0 text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded mt-0.5 min-w-[80px] text-center">
                  {item.date}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] py-0">
                      {item.category}
                    </Badge>
                    {item.isNew && (
                      <Badge className="text-[10px] py-0 bg-green-600 text-card">
                        New
                      </Badge>
                    )}
                    {!item.isActive && (
                      <Badge variant="secondary" className="text-[10px] py-0">
                        Draft
                      </Badge>
                    )}
                    {item.pdfUrl && (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                      >
                        <FileText className="w-3 h-3" /> PDF
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="p-1.5 rounded hover:bg-muted transition-colors duration-150"
                    aria-label="Edit"
                    disabled={isMutating}
                    data-ocid={`site-admin-filtered-edit-btn.${idx + 1}`}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 transition-colors duration-150"
                    aria-label="Delete"
                    disabled={isMutating}
                    data-ocid={`site-admin-filtered-delete-btn.${idx + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Default page — all categories ───────────────────────────────────────────

export default function SiteAdminNotifications() {
  const { data: items = [], isLoading } = useAdminListAllOfficialUpdates();
  const createMutation = useAdminCreateOfficialUpdate();
  const updateMutation = useAdminUpdateOfficialUpdate();
  const deleteMutation = useAdminDeleteOfficialUpdate();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<OfficialUpdate | null>(null);
  const [form, setForm] = useState<FormShape>(BLANK);

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  function openAdd() {
    setEditing(null);
    setForm(BLANK);
    setShowForm(true);
  }

  function openEdit(item: OfficialUpdate) {
    setEditing(item);
    setForm({
      title: item.title,
      date: item.date,
      category: item.category,
      isNew: item.isNew,
      published: item.isActive,
      pdfUrl: item.pdfUrl,
    });
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this notification?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Notification deleted"),
      onError: (err) => toast.error(String(err)),
    });
  }

  function handleSave() {
    if (!form.title.trim() || !form.date.trim()) {
      toast.error("Title and date are required");
      return;
    }
    if (editing) {
      updateMutation.mutate(
        {
          id: editing.id,
          title: form.title,
          content: form.title,
          pdfUrl: form.pdfUrl,
          isActive: form.published,
        },
        {
          onSuccess: () => {
            toast.success("Notification updated");
            setShowForm(false);
          },
          onError: (err) => toast.error(String(err)),
        },
      );
    } else {
      createMutation.mutate(
        {
          title: form.title,
          content: form.title,
          category: form.category,
          pdfUrl: form.pdfUrl,
        },
        {
          onSuccess: () => {
            toast.success("Notification added");
            setShowForm(false);
          },
          onError: (err) => toast.error(String(err)),
        },
      );
    }
  }

  return (
    <div className="space-y-6" data-ocid="site-admin-notifications-page">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700/10 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              All Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage all categories (Official Letters, Tenders, Recruitment)
            </p>
          </div>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="site-admin-notifications-add-btn"
          className="gap-2 bg-blue-700 hover:bg-blue-800 shrink-0"
          disabled={isMutating}
        >
          <PlusCircle className="w-4 h-4" /> Add Notification
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          className="bg-card border border-blue-200 rounded-xl p-6 shadow-sm"
          data-ocid="site-admin-notification-form"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">
              {editing ? "Edit Notification" : "Add New Notification"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close form"
              data-ocid="site-admin-notification-form-close"
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Notification title…"
                className="h-10"
                data-ocid="site-admin-notification-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                placeholder="DD.MM.YYYY"
                className="h-10"
                data-ocid="site-admin-notification-date-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category</Label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as OfficialUpdateCategory,
                  }))
                }
                data-ocid="site-admin-notification-category-select"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="Official Letters">Official Letters</option>
                <option value="Tenders">Tenders</option>
                <option value="Recruitment">Recruitment</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Status</Label>
              <label
                className="flex items-center gap-2 cursor-pointer text-sm h-10 px-1"
                data-ocid="site-admin-notification-published-toggle"
              >
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, published: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-blue-700"
                />
                <span>Published (visible on site)</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <PdfUploadWidget
                value={form.pdfUrl}
                onChange={(url) => setForm((f) => ({ ...f, pdfUrl: url }))}
                label="Attach PDF (optional)"
                accentColor="blue"
                ocidPrefix="site-admin-notification-pdf"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-5 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              data-ocid="site-admin-notification-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-ocid="site-admin-notification-save-btn"
              className="bg-blue-700 hover:bg-blue-800"
              disabled={isMutating}
            >
              {editing ? "Update" : "Add Notification"}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            All Notifications{" "}
            <span className="text-muted-foreground font-normal">
              ({items.length})
            </span>
          </h2>
        </div>
        {isLoading ? (
          <div
            className="p-12 text-center text-muted-foreground"
            data-ocid="site-admin-notifications-loading"
          >
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
            <p className="text-sm">Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <div
            className="p-12 text-center text-muted-foreground"
            data-ocid="site-admin-notifications-empty"
          >
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs mt-1">
              Click "Add Notification" to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors duration-150"
                data-ocid={`site-admin-notification-item.${idx + 1}`}
              >
                <div className="shrink-0 text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded mt-0.5 min-w-[80px] text-center">
                  {item.date}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] py-0">
                      {item.category}
                    </Badge>
                    {item.isNew && (
                      <Badge className="text-[10px] py-0 bg-green-600 text-card">
                        New
                      </Badge>
                    )}
                    {!item.isActive && (
                      <Badge variant="secondary" className="text-[10px] py-0">
                        Draft
                      </Badge>
                    )}
                    {item.pdfUrl && (
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                      >
                        <FileText className="w-3 h-3" /> View PDF
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    data-ocid={`site-admin-notification-edit-btn.${idx + 1}`}
                    className="p-1.5 rounded hover:bg-muted transition-colors duration-150"
                    aria-label="Edit"
                    disabled={isMutating}
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    data-ocid={`site-admin-notification-delete-btn.${idx + 1}`}
                    className="p-1.5 rounded hover:bg-destructive/10 transition-colors duration-150"
                    aria-label="Delete"
                    disabled={isMutating}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
