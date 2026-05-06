import type {
  Application,
  ApplicationId,
  ApplicationStatus,
  NotifType,
  Notification,
  ShortlistedCandidate,
  User,
  UserId,
} from "@/backend.d";
import {
  ApplicationStatus as AppStatusEnum,
  NotifType as NotifTypeEnum,
  UserRole,
} from "@/backend.d";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonCard, SkeletonTable } from "@/components/ui/loading-skeleton";
import { PageTitle } from "@/components/ui/page-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  useAddCandidate,
  useAllApplicationsAdmin,
  useAllCandidates,
  useAllNotificationsAdmin,
  useAllPaymentsAdmin,
  useAllUsersAdmin,
  useCreateNotification,
  useDeactivateNotification,
  useDeleteCandidate,
  useDeleteNotification,
  useDeleteUser,
  useSetUserRole,
  useUpdateApplicationStatus,
  useUpdateNotification,
  useVerifyUser,
} from "@/hooks/useQueries";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
  INDIAN_STATES,
  NOTIF_TYPES,
} from "@/lib/constants";
import {
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  CheckCircle,
  CreditCard,
  Download,
  Edit2,
  Eye,
  FileText,
  Plus,
  Shield,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatTs(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function exportCSV(
  data: Record<string, string | number | boolean>[],
  filename: string,
) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsvText(text: string): Record<string, string>[] {
  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = headerLine
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines
    .filter((l) => l.trim())
    .map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
    });
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div
      data-ocid="admin-stat-card"
      className="bg-card border border-border rounded-lg p-5 flex items-start gap-4 hover:shadow-md transition-smooth"
    >
      <div className={`rounded-lg p-3 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold font-display text-foreground mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Access Denied
// ─────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="rounded-full bg-destructive/10 p-6">
        <Shield className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground">
        Access Denied
      </h2>
      <p className="text-muted-foreground max-w-sm">
        You do not have permission to view the Admin Panel. Please login with an
        administrator account.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          window.location.href = "/login";
        }}
      >
        Go to Login
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 1: Dashboard
// ─────────────────────────────────────────────

function DashboardTab({
  users,
  applications,
  payments,
  candidates,
  usersLoading,
  applicationsLoading,
  onTabChange,
}: {
  users: User[];
  applications: Application[];
  payments: { id: bigint }[];
  candidates: ShortlistedCandidate[];
  usersLoading: boolean;
  applicationsLoading: boolean;
  onTabChange: (tab: string) => void;
}) {
  const recent = [...applications]
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {usersLoading ? (
          ["sk-users", "sk-apps", "sk-payments", "sk-shortlist"].map((k) => (
            <SkeletonCard key={k} />
          ))
        ) : (
          <>
            <StatCard
              label="Registered Users"
              value={users.length}
              icon={Users}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              label="Applications Submitted"
              value={
                applications.filter((a) => a.status !== AppStatusEnum.draft)
                  .length
              }
              icon={FileText}
              color="bg-accent/20 text-accent-foreground"
            />
            <StatCard
              label="Payments Received"
              value={payments.length}
              icon={CreditCard}
              color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            />
            <StatCard
              label="Shortlisted Count"
              value={candidates.length}
              icon={Award}
              color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            />
          </>
        )}
      </div>

      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">
          Recent Applications
        </h3>
        {applicationsLoading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      App ID
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      State
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Category
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No applications yet.
                      </td>
                    </tr>
                  ) : (
                    recent.map((app) => (
                      <tr
                        key={String(app.id)}
                        className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-primary">
                          #{String(app.id)}
                        </td>
                        <td className="px-4 py-3">{app.preferences.state}</td>
                        <td className="px-4 py-3">
                          {app.preferences.postCategory}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status] ?? ""}`}
                          >
                            {APPLICATION_STATUS_LABELS[app.status] ??
                              app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {formatTs(app.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="font-display font-semibold text-foreground mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Manage Notifications", icon: Bell, tab: "notifications" },
            {
              label: "Review Applications",
              icon: FileText,
              tab: "applications",
            },
            { label: "Shortlisted Candidates", icon: Award, tab: "candidates" },
            { label: "Manage Users", icon: Users, tab: "users" },
          ].map(({ label, icon: Icon, tab }) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:bg-muted/40 hover:border-primary/30 transition-smooth text-center"
              data-ocid={`quick-action-${tab}`}
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 2: Notifications
// ─────────────────────────────────────────────

type NotifFormState = {
  title: string;
  content: string;
  notifType: string;
};

function NotificationsTab() {
  const { data: notifications = [], isLoading } = useAllNotificationsAdmin();
  const createMut = useCreateNotification();
  const updateMut = useUpdateNotification();
  const deleteMut = useDeleteNotification();
  const deactivateMut = useDeactivateNotification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [form, setForm] = useState<NotifFormState>({
    title: "",
    content: "",
    notifType: "general",
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: "", content: "", notifType: "general" });
    setDialogOpen(true);
  }

  function openEdit(n: Notification) {
    setEditing(n);
    setForm({ title: n.title, content: n.content, notifType: n.notifType });
    setDialogOpen(true);
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({
          id: editing.id,
          title: form.title,
          content: form.content,
          notifType: form.notifType as NotifType,
        });
        toast.success("Notification updated");
      } else {
        await createMut.mutateAsync({
          title: form.title,
          content: form.content,
          notifType: form.notifType as NotifType,
        });
        toast.success("Notification created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Action failed. Please try again.");
    }
  }

  async function handleDeactivate(id: bigint) {
    try {
      await deactivateMut.mutateAsync(id);
      toast.success("Notification deactivated");
    } catch {
      toast.error("Failed to deactivate");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget);
      toast.success("Notification deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  const notifTypeColor: Record<string, string> = {
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    important:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    general: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">
          All Notifications
        </h3>
        <Button
          type="button"
          onClick={openCreate}
          size="sm"
          data-ocid="add-notification-btn"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Notification
        </Button>
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No notifications found. Add one above.
                    </td>
                  </tr>
                ) : (
                  notifications.map((n) => (
                    <tr
                      key={String(n.id)}
                      className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                    >
                      <td
                        className="px-4 py-3 max-w-xs truncate font-medium"
                        title={n.title}
                      >
                        {n.title}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${notifTypeColor[n.notifType] ?? ""}`}
                        >
                          {n.notifType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatTs(n.date)}
                      </td>
                      <td className="px-4 py-3">
                        {n.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(n)}
                            aria-label="Edit notification"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          {n.isActive && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivate(n.id)}
                              aria-label="Deactivate notification"
                            >
                              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(n.id)}
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Notification" : "Add New Notification"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="notif-title">Title</Label>
              <Input
                id="notif-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Notification title"
                data-ocid="notif-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notif-content">Content</Label>
              <Textarea
                id="notif-content"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Notification content..."
                rows={4}
                data-ocid="notif-content-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notif-type">Type</Label>
              <Select
                value={form.notifType}
                onValueChange={(v) => setForm((f) => ({ ...f, notifType: v }))}
              >
                <SelectTrigger id="notif-type" data-ocid="notif-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTIF_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createMut.isPending || updateMut.isPending}
              data-ocid="notif-submit-btn"
            >
              {editing ? "Save Changes" : "Create Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The notification will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="confirm-delete-notif"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 3: Applications
// ─────────────────────────────────────────────

function ApplicationsTab() {
  const { data: applications = [], isLoading } = useAllApplicationsAdmin();
  const updateStatusMut = useUpdateApplicationStatus();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewApp, setViewApp] = useState<Application | null>(null);
  const [updateTarget, setUpdateTarget] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");

  const filtered =
    statusFilter === "all"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  function handleExportCSV() {
    const rows = filtered.map((a) => ({
      "App ID": String(a.id),
      State: a.preferences.state,
      Circle: a.preferences.circle,
      Division: a.preferences.division,
      Category: a.preferences.postCategory,
      Status: APPLICATION_STATUS_LABELS[a.status] ?? a.status,
      "Payment Status": a.paymentStatus,
      "Created At": formatTs(a.createdAt),
    }));
    exportCSV(rows, "applications.csv");
    toast.success("CSV exported");
  }

  async function handleUpdateStatus() {
    if (!updateTarget || !newStatus) return;
    try {
      await updateStatusMut.mutateAsync({
        id: updateTarget.id,
        status: newStatus as ApplicationStatus,
      });
      toast.success("Status updated");
      setUpdateTarget(null);
    } catch {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="text-sm shrink-0">
            Filter by Status:
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              id="status-filter"
              className="w-44"
              data-ocid="app-status-filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          data-ocid="export-csv-btn"
        >
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    App ID
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    State
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Circle
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Payment
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((app) => (
                    <tr
                      key={String(app.id)}
                      className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                      data-ocid="app-row"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-primary">
                        #{String(app.id)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {app.preferences.state}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {app.preferences.circle || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {app.preferences.postCategory}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${APPLICATION_STATUS_COLORS[app.status] ?? ""}`}
                        >
                          {APPLICATION_STATUS_LABELS[app.status] ?? app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs ${app.paymentStatus === "success" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                        >
                          {app.paymentStatus === "success"
                            ? "Paid"
                            : app.paymentStatus === "notRequired"
                              ? "N/A"
                              : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewApp(app)}
                            aria-label="View application details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUpdateTarget(app);
                              setNewStatus(app.status);
                            }}
                            aria-label="Update application status"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={viewApp !== null}
        onOpenChange={(open) => {
          if (!open) setViewApp(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Application Details — #{viewApp ? String(viewApp.id) : ""}
            </DialogTitle>
          </DialogHeader>
          {viewApp && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${APPLICATION_STATUS_COLORS[viewApp.status] ?? ""}`}
                  >
                    {APPLICATION_STATUS_LABELS[viewApp.status] ??
                      viewApp.status}
                  </span>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Payment</p>
                  <p className="font-medium capitalize">
                    {viewApp.paymentStatus}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">State</p>
                  <p className="font-medium">{viewApp.preferences.state}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Circle</p>
                  <p className="font-medium">
                    {viewApp.preferences.circle || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Division</p>
                  <p className="font-medium">
                    {viewApp.preferences.division || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Post Category</p>
                  <p className="font-medium">
                    {viewApp.preferences.postCategory}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Board</p>
                  <p className="font-medium text-xs">
                    {viewApp.educationDetails.boardName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Marks %</p>
                  <p className="font-medium">
                    {viewApp.educationDetails.percentage.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p className="font-medium">{formatTs(viewApp.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Documents</p>
                  <p className="font-medium">
                    {viewApp.documentUrls.length} uploaded
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewApp(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={updateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setUpdateTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Application #{updateTarget ? String(updateTarget.id) : ""}
            </p>
            <div className="space-y-1.5">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger data-ocid="update-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(APPLICATION_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUpdateTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateStatus}
              disabled={updateStatusMut.isPending}
              data-ocid="update-status-submit"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 4: Candidates
// ─────────────────────────────────────────────

type CandidateFormState = {
  applicationId: string;
  candidateName: string;
  rollNumber: string;
  state: string;
  circle: string;
  division: string;
  category: string;
  rank: string;
};

const EMPTY_CANDIDATE_FORM: CandidateFormState = {
  applicationId: "",
  candidateName: "",
  rollNumber: "",
  state: "",
  circle: "",
  division: "",
  category: "",
  rank: "",
};

const CSV_REQUIRED_COLS = [
  "candidateName",
  "rollNumber",
  "state",
  "circle",
  "division",
  "category",
  "rank",
];

function CandidatesTab() {
  const { data: candidates = [], isLoading } = useAllCandidates();
  const addMut = useAddCandidate();
  const deleteMut = useDeleteCandidate();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [form, setForm] = useState<CandidateFormState>(EMPTY_CANDIDATE_FORM);
  const [stateFilter, setStateFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [csvError, setCsvError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered =
    stateFilter === "all"
      ? candidates
      : candidates.filter((c) => c.state === stateFilter);

  async function handleAddCandidate() {
    if (
      !form.applicationId ||
      !form.candidateName ||
      !form.rollNumber ||
      !form.state
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await addMut.mutateAsync({
        applicationId: BigInt(form.applicationId),
        candidateName: form.candidateName,
        rollNumber: form.rollNumber,
        state: form.state,
        circle: form.circle,
        division: form.division,
        category: form.category,
        rank: BigInt(form.rank || "0"),
      });
      toast.success("Candidate added");
      setForm(EMPTY_CANDIDATE_FORM);
      setAddDialogOpen(false);
    } catch {
      toast.error("Failed to add candidate");
    }
  }

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCsvText(text);
      if (!rows.length) {
        setCsvError("CSV is empty");
        return;
      }
      const missing = CSV_REQUIRED_COLS.filter((c) => !(c in rows[0]));
      if (missing.length) {
        setCsvError(`Missing columns: ${missing.join(", ")}`);
        return;
      }
      setCsvPreview(rows);
    };
    reader.readAsText(file);
  }

  async function handleBulkUpload() {
    if (!csvPreview.length) return;
    let success = 0;
    for (const row of csvPreview) {
      try {
        await addMut.mutateAsync({
          applicationId: BigInt(row.applicationId || "0"),
          candidateName: row.candidateName,
          rollNumber: row.rollNumber,
          state: row.state,
          circle: row.circle,
          division: row.division,
          category: row.category,
          rank: BigInt(row.rank || "0"),
        });
        success++;
      } catch {
        // continue
      }
    }
    toast.success(`Uploaded ${success} of ${csvPreview.length} candidates`);
    setCsvPreview([]);
    setCsvDialogOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget);
      toast.success("Candidate removed");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="state-filter" className="text-sm shrink-0">
            Filter by State:
          </Label>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger
              id="state-filter"
              className="w-48"
              data-ocid="candidate-state-filter"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCsvDialogOpen(true)}
            data-ocid="bulk-upload-btn"
          >
            <Upload className="h-4 w-4 mr-1" /> Bulk Upload CSV
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            data-ocid="add-candidate-btn"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Candidate
          </Button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={5} cols={7} />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Roll No.
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    State
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Circle
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Division
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                    Rank
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No candidates found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr
                      key={String(c.id)}
                      className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                      data-ocid="candidate-row"
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {c.rollNumber}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {c.candidateName}
                      </td>
                      <td className="px-4 py-3 text-xs">{c.state}</td>
                      <td className="px-4 py-3 text-xs">{c.circle}</td>
                      <td className="px-4 py-3 text-xs">{c.division}</td>
                      <td className="px-4 py-3 text-xs">{c.category}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {String(c.rank)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(c.id)}
                          aria-label="Delete candidate"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Candidate Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Shortlisted Candidate</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {(
              [
                ["applicationId", "Application ID", "text"],
                ["candidateName", "Candidate Name", "text"],
                ["rollNumber", "Roll Number", "text"],
                ["rank", "Rank", "number"],
                ["circle", "Circle", "text"],
                ["division", "Division", "text"],
                ["category", "Category", "text"],
              ] as [keyof CandidateFormState, string, string][]
            ).map(([key, label, type]) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`cand-${key}`} className="text-xs">
                  {label}
                </Label>
                <Input
                  id={`cand-${key}`}
                  type={type}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  placeholder={label}
                />
              </div>
            ))}
            <div className="space-y-1 col-span-2">
              <Label htmlFor="cand-state" className="text-xs">
                State
              </Label>
              <Select
                value={form.state}
                onValueChange={(v) => setForm((f) => ({ ...f, state: v }))}
              >
                <SelectTrigger id="cand-state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddCandidate}
              disabled={addMut.isPending}
              data-ocid="add-candidate-submit"
            >
              Add Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload CSV Dialog */}
      <Dialog
        open={csvDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCsvPreview([]);
            setCsvError("");
          }
          setCsvDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Candidates (CSV)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md bg-muted/40 border border-border p-3 text-xs space-y-1">
              <p className="font-semibold text-foreground">
                Required CSV Columns:
              </p>
              <p className="font-mono text-muted-foreground">
                {CSV_REQUIRED_COLS.join(", ")}
              </p>
              <p className="text-muted-foreground">
                Optional: <span className="font-mono">applicationId</span>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="csv-upload">Select CSV File</Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                ref={fileRef}
                onChange={handleCsvFile}
                data-ocid="csv-file-input"
              />
            </div>
            {csvError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {csvError}
              </p>
            )}
            {csvPreview.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">
                  {csvPreview.length} candidates parsed — preview (first 5):
                </p>
                <div className="rounded border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        {CSV_REQUIRED_COLS.map((c) => (
                          <th
                            key={c}
                            className="text-left px-3 py-2 font-semibold capitalize"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.slice(0, 5).map((row) => (
                        <tr
                          key={`${row.rollNumber}-${row.candidateName}`}
                          className="border-b border-border last:border-b-0"
                        >
                          {CSV_REQUIRED_COLS.map((c) => (
                            <td
                              key={c}
                              className="px-3 py-2 truncate max-w-[100px]"
                            >
                              {row[c]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCsvDialogOpen(false);
                setCsvPreview([]);
                setCsvError("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkUpload}
              disabled={csvPreview.length === 0 || addMut.isPending}
              data-ocid="bulk-upload-submit"
            >
              Upload{" "}
              {csvPreview.length > 0 ? `${csvPreview.length} Candidates` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the candidate from the shortlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="confirm-delete-candidate"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────
// TAB 5: Users
// ─────────────────────────────────────────────

function UsersTab() {
  const { data: users = [], isLoading } = useAllUsersAdmin();
  const setRoleMut = useSetUserRole();
  const verifyMut = useVerifyUser();
  const deleteMut = useDeleteUser();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<UserId | null>(null);

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.mobile.includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  async function handleSetAdmin(id: UserId) {
    try {
      await setRoleMut.mutateAsync({ id, role: UserRole.admin });
      toast.success("User role updated to Admin");
    } catch {
      toast.error("Failed to update role");
    }
  }

  async function handleVerify(id: UserId) {
    try {
      await verifyMut.mutateAsync(id);
      toast.success("User verified");
    } catch {
      toast.error("Failed to verify user");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMut.mutateAsync(deleteTarget);
      toast.success("User deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete user");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name, mobile or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
          data-ocid="user-search-input"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-36" data-ocid="user-role-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="applicant">Applicant</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} of {users.length} users
        </span>
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} cols={7} />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Mobile
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                    Verified
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={String(u.id)}
                      className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                      data-ocid="user-row"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{String(u.id)}
                      </td>
                      <td className="px-4 py-3">
                        <p
                          className="font-medium truncate max-w-[140px]"
                          title={u.name}
                        >
                          {u.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {u.email}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {u.mobile}
                      </td>
                      <td className="px-4 py-3 text-xs">{u.category}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={u.role === "admin" ? "default" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3.5 w-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5" /> No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {u.role !== "admin" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetAdmin(u.id)}
                              title="Set as Admin"
                              aria-label="Set as Admin"
                            >
                              <UserCheck className="h-3.5 w-3.5 text-primary" />
                            </Button>
                          )}
                          {!u.isVerified && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerify(u.id)}
                              title="Verify User"
                              aria-label="Verify user"
                            >
                              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(u.id)}
                            aria-label="Delete user"
                          >
                            <UserX className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user and all their data. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              data-ocid="confirm-delete-user"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Admin Page
// ─────────────────────────────────────────────

export default function Admin() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: users = [], isLoading: usersLoading } = useAllUsersAdmin();
  const { data: applications = [], isLoading: appsLoading } =
    useAllApplicationsAdmin();
  const { data: payments = [] } = useAllPaymentsAdmin();
  const { data: candidates = [] } = useAllCandidates();

  if (!isAdmin) return <AccessDenied />;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Admin Dashboard"
        subtitle="Manage the GDS Recruitment Portal — users, applications, notifications and shortlisted candidates."
        breadcrumbs={[{ label: "Admin Panel" }]}
        action={
          <Badge
            variant="secondary"
            className="flex items-center gap-1 text-xs"
          >
            <BarChart3 className="h-3 w-3" />
            Admin Mode
          </Badge>
        }
      />

      {/* Summary stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={usersLoading ? "—" : users.length}
          icon={Users}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Total Applications"
          value={appsLoading ? "—" : applications.length}
          icon={FileText}
          color="bg-accent/20 text-accent-foreground"
        />
        <StatCard
          label="Total Payments"
          value={payments.length}
          icon={CreditCard}
          color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          label="Shortlisted"
          value={candidates.length}
          icon={Award}
          color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        data-ocid="admin-tabs"
      >
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/40 p-1 rounded-lg">
          <TabsTrigger
            value="dashboard"
            className="text-xs sm:text-sm"
            data-ocid="tab-dashboard"
          >
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-xs sm:text-sm"
            data-ocid="tab-notifications"
          >
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="applications"
            className="text-xs sm:text-sm"
            data-ocid="tab-applications"
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Applications
          </TabsTrigger>
          <TabsTrigger
            value="candidates"
            className="text-xs sm:text-sm"
            data-ocid="tab-candidates"
          >
            <Award className="h-3.5 w-3.5 mr-1.5" />
            Candidates
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="text-xs sm:text-sm"
            data-ocid="tab-users"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab
            users={users}
            applications={applications}
            payments={payments}
            candidates={candidates}
            usersLoading={usersLoading}
            applicationsLoading={appsLoading}
            onTabChange={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <ApplicationsTab />
        </TabsContent>

        <TabsContent value="candidates" className="mt-6">
          <CandidatesTab />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
