import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bell,
  ImageIcon,
  Info,
  PlusCircle,
  Settings,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CandidatePanelSettings {
  applicationOpenDate: string;
  applicationCloseDate: string;
  correctionPeriodStart: string;
  correctionPeriodEnd: string;
  applicationStatus:
    | "Application Open"
    | "Application Closed"
    | "Upcoming"
    | "Result Awaited";
  notificationTitle: string;
  scheduleNumber: string;
}

interface CandidateDashboardNotification {
  id: string;
  title: string;
  date: string;
  type: "Info" | "Warning" | "Important";
  visible: boolean;
}

interface CandidateCardImages {
  card1?: string; // Apply Online
  card2?: string; // My Applications
  card3?: string; // Register Complaint
  card4?: string; // My Complaints
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: CandidatePanelSettings = {
  applicationOpenDate: "2026-01-15",
  applicationCloseDate: "2026-03-31",
  correctionPeriodStart: "2026-02-01",
  correctionPeriodEnd: "2026-02-15",
  applicationStatus: "Application Open",
  notificationTitle: "Gramin Dak Sevak (GDS) Online Engagement Special Drive",
  scheduleNumber: "Schedule 3",
};

const DEFAULT_NOTIFICATIONS: CandidateDashboardNotification[] = [
  {
    id: "n1",
    title:
      "GDS Online Engagement Special Drive schedule 3 — Registration Open (15.01.2026)",
    date: "2026-01-15",
    type: "Important",
    visible: true,
  },
  {
    id: "n2",
    title:
      "GDS Online Engagement Special Drive schedule 2 — Registration (01.10.2025)",
    date: "2025-10-01",
    type: "Info",
    visible: true,
  },
  {
    id: "n3",
    title:
      "GDS Online Engagement Special Drive schedule 1 — Registration (01.06.2025)",
    date: "2025-06-01",
    type: "Info",
    visible: true,
  },
];

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

function loadSettings(): CandidatePanelSettings {
  try {
    const raw = localStorage.getItem("candidatePanelSettings");
    if (raw)
      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(raw),
      } as CandidatePanelSettings;
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

function loadNotifications(): CandidateDashboardNotification[] {
  try {
    const raw = localStorage.getItem("candidateDashboardNotifications");
    if (raw) return JSON.parse(raw) as CandidateDashboardNotification[];
  } catch {
    /* ignore */
  }
  return DEFAULT_NOTIFICATIONS;
}

function loadCardImages(): CandidateCardImages {
  try {
    const raw = localStorage.getItem("candidateCardImages");
    if (raw) return JSON.parse(raw) as CandidateCardImages;
  } catch {
    /* ignore */
  }
  return {};
}

// ─── Card Image Upload component ──────────────────────────────────────────────

interface CardImageSlotProps {
  label: string;
  cardKey: keyof CandidateCardImages;
  currentImage?: string;
  onImageChange: (
    key: keyof CandidateCardImages,
    value: string | undefined,
  ) => void;
}

function CardImageSlot({
  label,
  cardKey,
  currentImage,
  onImageChange,
}: CardImageSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Max size is 2MB.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP files are allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") {
        onImageChange(cardKey, result);
        toast.success(`Image uploaded for "${label}"`);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Preview */}
      <div
        className="relative h-32 w-full flex items-center justify-center overflow-hidden"
        style={
          currentImage
            ? {
                backgroundImage: `url(${currentImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              }
        }
      >
        {!currentImage && (
          <div className="text-center text-white/80">
            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-60" />
            <p className="text-xs font-medium">No image uploaded</p>
            <p className="text-[10px] opacity-70">Gradient will be used</p>
          </div>
        )}
        {currentImage && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <p className="text-white text-xs font-semibold">Image set ✓</p>
          </div>
        )}
      </div>

      {/* Info + controls */}
      <div className="p-3 space-y-2.5">
        <p className="text-sm font-semibold text-foreground">{label}</p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-xs h-8"
            onClick={() => inputRef.current?.click()}
            data-ocid={`candidate-card-upload-btn-${cardKey}`}
          >
            <Upload className="w-3.5 h-3.5" />
            {currentImage ? "Replace Image" : "Upload Image"}
          </Button>
          {currentImage && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 px-2"
              onClick={() => {
                onImageChange(cardKey, undefined);
                toast.success("Image removed");
              }}
              data-ocid={`candidate-card-remove-btn-${cardKey}`}
              aria-label="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          JPG, PNG, WebP • Max 2MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
        aria-label={`Upload image for ${label}`}
      />
    </div>
  );
}

// ─── Notification type badge ───────────────────────────────────────────────────

const TYPE_COLORS: Record<CandidateDashboardNotification["type"], string> = {
  Info: "bg-blue-100 text-blue-700",
  Warning: "bg-amber-100 text-amber-700",
  Important: "bg-red-100 text-red-700",
};

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SiteAdminCandidateSettings() {
  // Section 1
  const [settings, setSettings] =
    useState<CandidatePanelSettings>(loadSettings);

  // Section 2
  const [notifications, setNotifications] =
    useState<CandidateDashboardNotification[]>(loadNotifications);
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [editingNotif, setEditingNotif] =
    useState<CandidateDashboardNotification | null>(null);
  const [notifForm, setNotifForm] = useState<
    Omit<CandidateDashboardNotification, "id">
  >({
    title: "",
    date: "",
    type: "Info",
    visible: true,
  });

  // Section 3
  const [cardImages, setCardImages] =
    useState<CandidateCardImages>(loadCardImages);

  // ── Save helpers ────────────────────────────────────────────────────────────

  function saveSettings() {
    try {
      localStorage.setItem("candidatePanelSettings", JSON.stringify(settings));
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  }

  function saveNotifications(updated: CandidateDashboardNotification[]) {
    try {
      localStorage.setItem(
        "candidateDashboardNotifications",
        JSON.stringify(updated),
      );
      toast.success("Notifications saved!");
    } catch {
      toast.error("Failed to save notifications");
    }
  }

  function saveCardImages(updated: CandidateCardImages) {
    try {
      localStorage.setItem("candidateCardImages", JSON.stringify(updated));
    } catch {
      toast.error("Failed to save card images");
    }
  }

  // ── Notification form handlers ──────────────────────────────────────────────

  function openAddNotif() {
    setEditingNotif(null);
    setNotifForm({ title: "", date: "", type: "Info", visible: true });
    setShowNotifForm(true);
  }

  function openEditNotif(notif: CandidateDashboardNotification) {
    setEditingNotif(notif);
    setNotifForm({
      title: notif.title,
      date: notif.date,
      type: notif.type,
      visible: notif.visible,
    });
    setShowNotifForm(true);
  }

  function handleNotifSave() {
    if (!notifForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    let updated: CandidateDashboardNotification[];
    if (editingNotif) {
      updated = notifications.map((n) =>
        n.id === editingNotif.id ? { ...editingNotif, ...notifForm } : n,
      );
    } else {
      updated = [{ id: `n${Date.now()}`, ...notifForm }, ...notifications];
    }
    setNotifications(updated);
    saveNotifications(updated);
    setShowNotifForm(false);
  }

  function handleDeleteNotif(id: string) {
    if (!confirm("Delete this notification?")) return;
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    saveNotifications(updated);
  }

  function toggleNotifVisibility(id: string) {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, visible: !n.visible } : n,
    );
    setNotifications(updated);
    saveNotifications(updated);
  }

  // ── Card image handler ──────────────────────────────────────────────────────

  function handleCardImageChange(
    key: keyof CandidateCardImages,
    value: string | undefined,
  ) {
    const updated = { ...cardImages };
    if (value === undefined) {
      delete updated[key];
    } else {
      updated[key] = value;
    }
    setCardImages(updated);
    saveCardImages(updated);
  }

  // ── Sync on mount ────────────────────────────────────────────────────────────

  useEffect(() => {
    setSettings(loadSettings());
    setNotifications(loadNotifications());
    setCardImages(loadCardImages());
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8" data-ocid="candidate-settings-page">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Candidate Panel Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Control what candidates see on their dashboard — dates,
            notifications, and card images
          </p>
        </div>
      </div>

      {/* ── Section 1: Application Period Settings ─────────────────────────── */}
      <section
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="candidate-settings-dates-section"
      >
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-700" />
          <h2 className="text-sm font-semibold text-foreground">
            Application Period Settings
          </h2>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Saved to localStorage: "candidatePanelSettings"
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Row 1: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="appOpenDate"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Application Open Date
              </Label>
              <Input
                id="appOpenDate"
                type="date"
                value={settings.applicationOpenDate}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    applicationOpenDate: e.target.value,
                  }))
                }
                data-ocid="candidate-settings-open-date-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="appCloseDate"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Application Close Date
              </Label>
              <Input
                id="appCloseDate"
                type="date"
                value={settings.applicationCloseDate}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    applicationCloseDate: e.target.value,
                  }))
                }
                data-ocid="candidate-settings-close-date-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="corrStart"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Correction Period Start
              </Label>
              <Input
                id="corrStart"
                type="date"
                value={settings.correctionPeriodStart}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    correctionPeriodStart: e.target.value,
                  }))
                }
                data-ocid="candidate-settings-corr-start-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="corrEnd"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Correction Period End
              </Label>
              <Input
                id="corrEnd"
                type="date"
                value={settings.correctionPeriodEnd}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    correctionPeriodEnd: e.target.value,
                  }))
                }
                data-ocid="candidate-settings-corr-end-input"
              />
            </div>
          </div>

          {/* Row 2: Status, Title, Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="appStatus"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Application Status
              </Label>
              <select
                id="appStatus"
                value={settings.applicationStatus}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    applicationStatus: e.target
                      .value as CandidatePanelSettings["applicationStatus"],
                  }))
                }
                data-ocid="candidate-settings-status-select"
                className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-150"
              >
                <option>Application Open</option>
                <option>Application Closed</option>
                <option>Upcoming</option>
                <option>Result Awaited</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="notifTitle"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Notification Title
              </Label>
              <Input
                id="notifTitle"
                value={settings.notificationTitle}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    notificationTitle: e.target.value,
                  }))
                }
                placeholder="e.g. GDS Online Engagement Special Drive"
                data-ocid="candidate-settings-notif-title-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="scheduleNo"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Schedule Number
              </Label>
              <Input
                id="scheduleNo"
                value={settings.scheduleNumber}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, scheduleNumber: e.target.value }))
                }
                placeholder="e.g. Schedule 3"
                data-ocid="candidate-settings-schedule-input"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              These settings are read by the Candidate Dashboard to show the
              correct application period and status banner.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              data-ocid="candidate-settings-dates-save-btn"
              className="bg-purple-700 hover:bg-purple-800 text-white gap-2"
            >
              Save Period Settings
            </Button>
          </div>
        </div>
      </section>

      {/* ── Section 2: Dashboard Notifications ─────────────────────────────── */}
      <section
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="candidate-settings-notifications-section"
      >
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-700" />
          <h2 className="text-sm font-semibold text-foreground">
            Candidate Dashboard Notifications
          </h2>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Saved to localStorage: "candidateDashboardNotifications"
          </span>
          <Button
            size="sm"
            onClick={openAddNotif}
            className="ml-2 gap-1.5 bg-blue-700 hover:bg-blue-800 text-white h-7 text-xs"
            data-ocid="candidate-notif-add-btn"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add
          </Button>
        </div>

        {/* Inline form */}
        {showNotifForm && (
          <div
            className="px-5 py-5 border-b border-blue-100 bg-blue-50/40"
            data-ocid="candidate-notif-form"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                {editingNotif ? "Edit Notification" : "Add Notification"}
              </h3>
              <button
                type="button"
                onClick={() => setShowNotifForm(false)}
                aria-label="Close form"
                data-ocid="candidate-notif-form-close"
                className="p-1 rounded hover:bg-muted"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={notifForm.title}
                  onChange={(e) =>
                    setNotifForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Application window closing soon..."
                  data-ocid="candidate-notif-title-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  value={notifForm.date}
                  onChange={(e) =>
                    setNotifForm((f) => ({ ...f, date: e.target.value }))
                  }
                  data-ocid="candidate-notif-date-input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Type
                </Label>
                <select
                  value={notifForm.type}
                  onChange={(e) =>
                    setNotifForm((f) => ({
                      ...f,
                      type: e.target
                        .value as CandidateDashboardNotification["type"],
                    }))
                  }
                  data-ocid="candidate-notif-type-select"
                  className="w-full h-10 border border-input rounded-md px-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-150"
                >
                  <option>Info</option>
                  <option>Warning</option>
                  <option>Important</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <label
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  data-ocid="candidate-notif-visible-toggle"
                >
                  <input
                    type="checkbox"
                    checked={notifForm.visible}
                    onChange={(e) =>
                      setNotifForm((f) => ({ ...f, visible: e.target.checked }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Visible to candidates</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-4 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNotifForm(false)}
                data-ocid="candidate-notif-cancel-btn"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNotifSave}
                className="bg-blue-700 hover:bg-blue-800 text-white"
                data-ocid="candidate-notif-save-btn"
              >
                {editingNotif ? "Update" : "Add Notification"}
              </Button>
            </div>
          </div>
        )}

        {/* Notification list */}
        {notifications.length === 0 ? (
          <div
            className="p-10 text-center text-muted-foreground"
            data-ocid="candidate-notif-empty-state"
          >
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notifications added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notif, idx) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-5 py-3.5 hover:bg-muted/20 ${!notif.visible ? "opacity-50" : ""}`}
                data-ocid={`candidate-notif-item.${idx + 1}`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground leading-snug">
                    {notif.title}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {notif.date && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {notif.date}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[notif.type]}`}
                    >
                      {notif.type}
                    </span>
                    {!notif.visible && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleNotifVisibility(notif.id)}
                    data-ocid={`candidate-notif-toggle.${idx + 1}`}
                    className="px-2 py-1 rounded text-[10px] font-semibold border border-border hover:bg-muted transition-colors"
                    title={
                      notif.visible
                        ? "Hide from candidates"
                        : "Show to candidates"
                    }
                  >
                    {notif.visible ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditNotif(notif)}
                    data-ocid={`candidate-notif-edit-btn.${idx + 1}`}
                    className="p-1.5 rounded hover:bg-muted text-blue-600"
                    aria-label="Edit"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotif(notif.id)}
                    data-ocid={`candidate-notif-delete-btn.${idx + 1}`}
                    className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Section 3: Card Image Upload ─────────────────────────────────────── */}
      <section
        className="bg-card border border-border rounded-xl overflow-hidden"
        data-ocid="candidate-settings-images-section"
      >
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-green-700" />
          <h2 className="text-sm font-semibold text-foreground">
            Form Box Card Images
          </h2>
          <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Saved to localStorage: "candidateCardImages"
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
            <p className="text-xs text-green-800">
              If an image is uploaded, it will replace the colored gradient
              background of the card. The image will be displayed as a
              full-cover background. Max size: 2MB per image. Accepted formats:
              JPG, PNG, WebP.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardImageSlot
              label="Card 1 — Apply Online"
              cardKey="card1"
              currentImage={cardImages.card1}
              onImageChange={handleCardImageChange}
            />
            <CardImageSlot
              label="Card 2 — My Applications"
              cardKey="card2"
              currentImage={cardImages.card2}
              onImageChange={handleCardImageChange}
            />
            <CardImageSlot
              label="Card 3 — Register Complaint"
              cardKey="card3"
              currentImage={cardImages.card3}
              onImageChange={handleCardImageChange}
            />
            <CardImageSlot
              label="Card 4 — My Complaints"
              cardKey="card4"
              currentImage={cardImages.card4}
              onImageChange={handleCardImageChange}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Images are saved automatically on upload. Changes will be reflected
            on the candidate dashboard Quick Access cards.
          </p>
        </div>
      </section>
    </div>
  );
}
