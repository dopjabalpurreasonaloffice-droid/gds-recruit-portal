import { Edit2, Image, PlusCircle, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ─── Types & store ────────────────────────────────────────────────────────────

export interface BannerMessage {
  id: string;
  text: string;
  active: boolean;
  createdAt: number;
}

const STORE_KEY = "siteBanners";

const DEFAULT_BANNERS: BannerMessage[] = [
  {
    id: "b1",
    text: "Gramin Dak Sevak (GDS) Online Engagement Special Drive schedule 3 — Last date: 15.01.2026",
    active: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: "b2",
    text: "Gramin Dak Sevak (GDS) Online Engagement Special Drive schedule 2 — Last date: 01.10.2025",
    active: true,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "b3",
    text: "Gramin Dak Sevak (GDS) Online Engagement Special Drive schedule 1 — Last date: 01.06.2025",
    active: true,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: "b4",
    text: "Candidates are advised to read all instructions carefully before filling the application form.",
    active: true,
    createdAt: Date.now() - 86400000 * 40,
  },
];

function loadBanners(): BannerMessage[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as BannerMessage[];
    saveBanners(DEFAULT_BANNERS);
    return DEFAULT_BANNERS;
  } catch {
    return DEFAULT_BANNERS;
  }
}

function saveBanners(items: BannerMessage[]): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// ─── Active toggle (custom switch) ───────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  ocid: string;
  label: string;
}

function ToggleSwitch({ checked, onChange, ocid, label }: ToggleSwitchProps) {
  return (
    <label
      className="flex items-center cursor-pointer gap-2 shrink-0"
      title={label}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        data-ocid={ocid}
        aria-label={label}
      />
      <div
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-green-500" : "bg-muted-foreground/30"}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
    </label>
  );
}

// ─── Preview Ticker ───────────────────────────────────────────────────────────

function TickerPreview({ messages }: { messages: BannerMessage[] }) {
  const active = messages.filter((m) => m.active);
  const tickerText = active.map((m) => m.text).join("  \u00a0|\u00a0  ");

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden"
      data-ocid="site-admin-ticker-preview"
    >
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Live Preview — How it appears on the home page
        </p>
      </div>
      <div className="p-4">
        <div className="rounded overflow-hidden border border-[#cc0000]/30">
          <div className="flex items-center bg-[#cc0000]">
            <div className="shrink-0 px-3 py-1.5 text-white text-xs font-bold uppercase tracking-widest border-r border-white/20 bg-[#990000]">
              Notice
            </div>
            <div className="flex-1 overflow-hidden py-1.5 px-3">
              {active.length > 0 ? (
                <p className="text-white text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {tickerText}
                </p>
              ) : (
                <p className="text-white/60 text-xs italic">
                  No active messages — add some below
                </p>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {active.length} of {messages.length} messages active
        </p>
      </div>
    </div>
  );
}

// ─── Message row ──────────────────────────────────────────────────────────────

interface MessageRowProps {
  banner: BannerMessage;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

function MessageRow({
  banner,
  index,
  onToggle,
  onDelete,
  onEdit,
}: MessageRowProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(banner.text);

  function handleSave() {
    if (!text.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    onEdit(banner.id, text.trim());
    setEditing(false);
  }

  return (
    <div
      className={`border border-border rounded-lg p-4 transition-colors ${banner.active ? "bg-card" : "bg-muted/20"}`}
      data-ocid={`site-admin-banner-item.${index + 1}`}
    >
      <div className="flex items-start gap-3">
        {/* Active toggle */}
        <ToggleSwitch
          checked={banner.active}
          onChange={() => onToggle(banner.id)}
          ocid={`site-admin-banner-toggle.${index + 1}`}
          label={banner.active ? "Deactivate message" : "Activate message"}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-colors"
                data-ocid={`site-admin-banner-edit-input.${index + 1}`}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors"
                  data-ocid={`site-admin-banner-save-button.${index + 1}`}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setText(banner.text);
                    setEditing(false);
                  }}
                  className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded hover:bg-muted transition-colors"
                  data-ocid={`site-admin-banner-cancel-button.${index + 1}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className={`text-sm leading-relaxed ${banner.active ? "text-foreground" : "text-muted-foreground line-through"}`}
            >
              {banner.text}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                banner.active
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {banner.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="p-2 rounded text-muted-foreground hover:text-blue-700 hover:bg-blue-50 transition-colors"
              title="Edit message"
              data-ocid={`site-admin-banner-edit-button.${index + 1}`}
              aria-label="Edit banner message"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (!window.confirm("Delete this banner message?")) return;
              onDelete(banner.id);
            }}
            className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete message"
            data-ocid={`site-admin-banner-delete-button.${index + 1}`}
            aria-label="Delete banner message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Banner Form ──────────────────────────────────────────────────────────

function AddBannerForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    const items = loadBanners();
    items.push({
      id: `b${Date.now()}`,
      text: text.trim(),
      active: true,
      createdAt: Date.now(),
    });
    saveBanners(items);
    toast.success("Banner message added");
    setText("");
    setOpen(false);
    onAdded();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
        data-ocid="site-admin-add-banner-button"
      >
        <PlusCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Add Message</span>
        <span className="sm:hidden">Add</span>
      </button>
    );
  }

  return (
    <div
      className="bg-card border border-blue-200 rounded-xl p-5"
      data-ocid="site-admin-add-banner-form"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Add New Ticker Message
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Enter the ticker message text…"
          className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none transition-colors"
          data-ocid="site-admin-add-banner-input"
        />
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            data-ocid="site-admin-add-banner-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            data-ocid="site-admin-add-banner-submit"
          >
            Add Message
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SiteAdminBanners() {
  const [banners, setBanners] = useState<BannerMessage[]>(() => loadBanners());

  function reload() {
    setBanners(loadBanners());
  }

  function handleToggle(id: string) {
    const updated = banners.map((b) =>
      b.id === id ? { ...b, active: !b.active } : b,
    );
    saveBanners(updated);
    setBanners(updated);
    toast.success("Banner status updated");
  }

  function handleDelete(id: string) {
    const updated = banners.filter((b) => b.id !== id);
    saveBanners(updated);
    setBanners(updated);
    toast.success("Banner message deleted");
  }

  function handleEdit(id: string, text: string) {
    const updated = banners.map((b) => (b.id === id ? { ...b, text } : b));
    saveBanners(updated);
    setBanners(updated);
    toast.success("Banner message updated");
  }

  return (
    <div className="space-y-6" data-ocid="site-admin-banners-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700/10 flex items-center justify-center shrink-0">
            <Image className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Banners / Ticker
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage the red scrolling marquee messages on the home page
            </p>
          </div>
        </div>
        <AddBannerForm onAdded={reload} />
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">
          ℹ️ How this works
        </p>
        <ul className="space-y-1 text-xs text-blue-700 list-disc list-inside">
          <li>
            Active messages scroll in the red ticker at the top of the home page
          </li>
          <li>
            Toggle the switch (left) to enable or disable individual messages
          </li>
          <li>Messages are joined with " | " separator in the ticker</li>
          <li>Changes are saved immediately to localStorage</li>
        </ul>
      </div>

      {/* Live preview */}
      <TickerPreview messages={banners} />

      {/* Message list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-semibold text-foreground">
              Ticker Messages{" "}
              <span className="text-muted-foreground font-normal">
                ({banners.length})
              </span>
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {banners.filter((b) => b.active).length} active
          </span>
        </div>

        {banners.length === 0 ? (
          <div
            className="py-12 flex flex-col items-center gap-3 text-center"
            data-ocid="site-admin-banners-empty-state"
          >
            <Image className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground font-medium">
              No ticker messages yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Click "Add Message" above to create your first ticker message.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {banners.map((banner, i) => (
              <MessageRow
                key={banner.id}
                banner={banner}
                index={i}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
