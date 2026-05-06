import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, Edit2, PlusCircle, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ImportantDate {
  id: string;
  label: string;
  date: string;
  description: string;
  highlighted: boolean;
}

const DEFAULT_DATES: ImportantDate[] = [
  {
    id: "d1",
    label: "GDS Special Drive Schedule 3 — Registration Opens",
    date: "15.01.2026",
    description: "Online registration begins for Schedule 3",
    highlighted: true,
  },
  {
    id: "d2",
    label: "GDS Special Drive Schedule 2 — Registration Opens",
    date: "01.10.2025",
    description: "Online registration begins for Schedule 2",
    highlighted: false,
  },
  {
    id: "d3",
    label: "GDS Special Drive Schedule 1 — Registration Opens",
    date: "01.06.2025",
    description: "Online registration begins for Schedule 1",
    highlighted: false,
  },
  {
    id: "d4",
    label: "Document Submission Deadline",
    date: "31.03.2026",
    description: "Last date for document submission at RO Jabalpur",
    highlighted: true,
  },
  {
    id: "d5",
    label: "Fee Payment Last Date",
    date: "28.02.2026",
    description: "Last date for payment of application fee",
    highlighted: false,
  },
];

function loadDates(): ImportantDate[] {
  try {
    const raw = localStorage.getItem("siteImportantDates");
    if (raw) return JSON.parse(raw) as ImportantDate[];
  } catch {
    /* ignore */
  }
  return DEFAULT_DATES;
}

function saveDates(items: ImportantDate[]) {
  try {
    localStorage.setItem("siteImportantDates", JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

const BLANK: Omit<ImportantDate, "id"> = {
  label: "",
  date: "",
  description: "",
  highlighted: false,
};

export default function SiteAdminDates() {
  const [items, setItems] = useState<ImportantDate[]>(loadDates);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ImportantDate | null>(null);
  const [form, setForm] = useState<Omit<ImportantDate, "id">>(BLANK);

  useEffect(() => {
    saveDates(items);
  }, [items]);

  function openAdd() {
    setEditing(null);
    setForm(BLANK);
    setShowForm(true);
  }
  function openEdit(item: ImportantDate) {
    setEditing(item);
    setForm({
      label: item.label,
      date: item.date,
      description: item.description,
      highlighted: item.highlighted,
    });
    setShowForm(true);
  }
  function handleDelete(id: string) {
    if (!confirm("Delete this date entry?")) return;
    setItems((prev) => prev.filter((d) => d.id !== id));
    toast.success("Date deleted");
  }
  function handleSave() {
    if (!form.label.trim() || !form.date.trim()) {
      toast.error("Label and date are required");
      return;
    }
    if (editing) {
      setItems((prev) =>
        prev.map((d) => (d.id === editing.id ? { ...editing, ...form } : d)),
      );
      toast.success("Date updated");
    } else {
      setItems((prev) => [{ id: `d${Date.now()}`, ...form }, ...prev]);
      toast.success("Date added");
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-6" data-ocid="site-admin-dates-page">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Important Dates
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              GDS schedule dates, deadlines and key events displayed on the home
              page
            </p>
          </div>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="site-admin-dates-add-btn"
          className="gap-2 bg-indigo-700 hover:bg-indigo-800 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Add Date
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          className="bg-card border border-indigo-200 rounded-xl p-6 shadow-sm"
          data-ocid="site-admin-date-form"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">
              {editing ? "Edit Date" : "Add Important Date"}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close"
              data-ocid="site-admin-date-form-close"
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <Label className="text-sm font-medium">
                Event Label <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
                placeholder="e.g. Registration Opens for Schedule 3"
                className="h-10"
                data-ocid="site-admin-date-label-input"
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
                data-ocid="site-admin-date-date-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Brief description…"
                className="h-10"
                data-ocid="site-admin-date-desc-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <label
                className="flex items-center gap-2 cursor-pointer text-sm h-10 px-1"
                data-ocid="site-admin-date-highlight-toggle"
              >
                <input
                  type="checkbox"
                  checked={form.highlighted}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, highlighted: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-indigo-700"
                />
                <span>Highlight this date</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-5 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              data-ocid="site-admin-date-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              data-ocid="site-admin-date-save-btn"
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              {editing ? "Update Date" : "Add Date"}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Important Dates{" "}
            <span className="text-muted-foreground font-normal">
              ({items.length})
            </span>
          </h2>
          <span className="text-xs text-muted-foreground">
            {items.filter((d) => d.highlighted).length} highlighted
          </span>
        </div>
        {items.length === 0 ? (
          <div
            className="p-12 text-center text-muted-foreground"
            data-ocid="site-admin-dates-empty"
          >
            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No dates added yet</p>
            <p className="text-xs mt-1">Click "Add Date" to create one.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors duration-150"
                data-ocid={`site-admin-date-item.${idx + 1}`}
              >
                <div
                  className={`shrink-0 text-xs font-bold font-mono px-2.5 py-1 rounded mt-0.5 min-w-[90px] text-center ${
                    item.highlighted
                      ? "bg-indigo-600 text-card"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.date}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  )}
                  {item.highlighted && (
                    <span className="inline-block mt-1 text-[10px] text-indigo-700 font-semibold bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                      Highlighted
                    </span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    data-ocid={`site-admin-date-edit-btn.${idx + 1}`}
                    className="p-1.5 rounded hover:bg-muted transition-colors duration-150"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    data-ocid={`site-admin-date-delete-btn.${idx + 1}`}
                    className="p-1.5 rounded hover:bg-destructive/10 transition-colors duration-150"
                    aria-label="Delete"
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
