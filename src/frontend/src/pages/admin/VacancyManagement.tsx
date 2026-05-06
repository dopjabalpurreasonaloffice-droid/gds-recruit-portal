import {
  type AdminVacancy,
  useAdminAddVacancy,
  useAdminGetVacancies,
  useAdminUpdateVacancy,
} from "@/hooks/useAdminQueries";
import { MP_POSTAL_DIVISIONS } from "@/lib/mpPostalData";
import { Briefcase, Check, PencilLine, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const CIRCLES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const CATEGORIES_GDS = ["UR", "OBC", "SC", "ST"];

const POST_TYPES = [
  {
    value: "BPM" as const,
    label: "GDS BPM (Branch Post Master)",
    pay: 12000,
    payLabel: "Rs.12,000/-",
  },
  {
    value: "ABPM" as const,
    label: "GDS ABPM (Asst. Branch Post Master)",
    pay: 10000,
    payLabel: "Rs.10,000/-",
  },
];

// ─── Editable Seats cell ──────────────────────────────────────────────────────

function EditableSeats({
  vacancy,
  isPending,
  onSave,
}: {
  vacancy: AdminVacancy;
  isPending: boolean;
  onSave: (id: string, seats: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(vacancy.totalSeats));

  function save() {
    const seats = Number.parseInt(value, 10);
    if (Number.isNaN(seats) || seats < 0) return;
    onSave(vacancy.id, seats);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          id={`vacancy-seats-input-${vacancy.id}`}
          type="number"
          value={value}
          min={0}
          onChange={(e) => setValue(e.target.value)}
          className="form-input text-sm py-1 w-20"
          data-ocid={`vacancy-seats-input-${vacancy.id}`}
        />
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="p-1 rounded text-green-700 hover:bg-green-100 transition-colors"
          data-ocid={`vacancy-seats-save-${vacancy.id}`}
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setValue(String(vacancy.totalSeats));
          }}
          className="p-1 rounded text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-foreground">
        {vacancy.totalSeats}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        title="Edit seats"
        data-ocid={`vacancy-edit-${vacancy.id}`}
      >
        <PencilLine className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Branch Office Row (one row per BO in the picker table) ──────────────────

interface BORowState {
  postType: "BPM" | "ABPM";
  category: string;
  seats: string;
  adding: boolean;
}

function BranchOfficeRow({
  boName,
  onAdd,
  isAdding,
}: {
  boName: string;
  onAdd: (postType: "BPM" | "ABPM", category: string, seats: number) => void;
  isAdding: boolean;
}) {
  const [row, setRow] = useState<BORowState>({
    postType: "BPM",
    category: "UR",
    seats: "1",
    adding: false,
  });

  const pt = POST_TYPES.find((p) => p.value === row.postType)!;

  function handleAdd() {
    const s = Number.parseInt(row.seats, 10);
    if (Number.isNaN(s) || s <= 0) {
      toast.error("Enter valid seat count (> 0)");
      return;
    }
    onAdd(row.postType, row.category, s);
    setRow({ postType: "BPM", category: "UR", seats: "1", adding: false });
  }

  return (
    <tr
      className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors"
      data-ocid={`bo-row-${boName.replace(/\s+/g, "-").toLowerCase()}`}
    >
      {/* Branch Office Name */}
      <td className="px-3 py-2 text-sm font-medium text-foreground whitespace-nowrap">
        {boName}
      </td>

      {/* Post Type select */}
      <td className="px-3 py-2">
        <select
          value={row.postType}
          onChange={(e) =>
            setRow((r) => ({
              ...r,
              postType: e.target.value as "BPM" | "ABPM",
            }))
          }
          className="form-input text-xs py-1 min-w-[160px]"
          data-ocid={`bo-post-${boName}`}
        >
          {POST_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </td>

      {/* Category select */}
      <td className="px-3 py-2">
        <select
          value={row.category}
          onChange={(e) => setRow((r) => ({ ...r, category: e.target.value }))}
          className="form-input text-xs py-1 w-20"
          data-ocid={`bo-category-${boName}`}
        >
          {CATEGORIES_GDS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </td>

      {/* Basic Pay — auto from post type */}
      <td className="px-3 py-2 text-xs font-semibold text-primary whitespace-nowrap">
        {pt.payLabel}
      </td>

      {/* Total Seats input */}
      <td className="px-3 py-2">
        <input
          type="number"
          min={1}
          value={row.seats}
          onChange={(e) => setRow((r) => ({ ...r, seats: e.target.value }))}
          className="form-input text-xs py-1 w-20"
          data-ocid={`bo-seats-${boName}`}
        />
      </td>

      {/* Add button */}
      <td className="px-3 py-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 disabled:opacity-50 transition-smooth whitespace-nowrap"
          data-ocid={`bo-add-btn-${boName}`}
        >
          <Check className="w-3 h-3" />
          Add Vacancy
        </button>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VacancyManagement() {
  const { data: vacancies, isLoading } = useAdminGetVacancies();
  const { mutate: addVacancy, isPending: adding } = useAdminAddVacancy();
  const { mutate: updateVacancy, isPending: updating } =
    useAdminUpdateVacancy();

  const [circle, setCircle] = useState("");
  const [division, setDivision] = useState("");

  // Get divisions for selected circle
  const isMPCircle = circle === "Madhya Pradesh";
  const mpDivisions = useMemo(() => MP_POSTAL_DIVISIONS.map((d) => d.name), []);
  const selectedDivData = useMemo(
    () => MP_POSTAL_DIVISIONS.find((d) => d.name === division),
    [division],
  );

  function handleCircleChange(val: string) {
    setCircle(val);
    setDivision("");
  }

  function handleAddVacancy(
    boName: string,
    postType: "BPM" | "ABPM",
    category: string,
    totalSeats: number,
  ) {
    const basicPay = postType === "BPM" ? 12000 : 10000;
    addVacancy(
      {
        circle,
        division,
        branchOfficeName: boName,
        postType,
        category,
        basicPay,
        totalSeats,
      },
      {
        onSuccess: () =>
          toast.success(
            `Vacancy added — ${boName} / GDS ${postType} / ${category}`,
          ),
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  function handleUpdate(id: string, totalSeats: number) {
    updateVacancy(
      { id, totalSeats },
      {
        onSuccess: () => toast.success("Vacancy updated"),
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  return (
    <div className="space-y-6" data-ocid="vacancy-management-page">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-primary flex-shrink-0" /> Vacancy
          Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a Circle and Division to add branch office vacancies with post
          type, category, and basic pay.
        </p>
      </div>

      {/* ── Step 1: Circle + Division selectors ── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">
          Step 1 — Select Circle &amp; Division
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="vacancy-input-circle"
              className="text-xs font-medium text-muted-foreground"
            >
              Circle *
            </label>
            <select
              id="vacancy-input-circle"
              value={circle}
              onChange={(e) => handleCircleChange(e.target.value)}
              className="form-input text-sm"
              data-ocid="vacancy-input-circle"
            >
              <option value="">Select circle</option>
              {CIRCLES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="vacancy-input-division"
              className="text-xs font-medium text-muted-foreground"
            >
              Division *
            </label>
            {isMPCircle ? (
              <select
                id="vacancy-input-division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="form-input text-sm"
                disabled={!circle}
                data-ocid="vacancy-input-division"
              >
                <option value="">Select MP Division</option>
                {mpDivisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="vacancy-input-division"
                type="text"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="e.g. Lucknow"
                className="form-input text-sm"
                disabled={!circle}
                data-ocid="vacancy-input-division"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Step 2: Branch office table (MP only) ── */}
      {isMPCircle && division && selectedDivData && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2 bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">
              Step 2 — Add Branch Office Vacancies
            </h2>
            <span className="text-xs text-muted-foreground">
              — {division} ({selectedDivData.branchOffices.length} branch
              offices)
            </span>
          </div>
          <div className="px-5 py-2.5 bg-muted/20 border-b border-border">
            <p className="text-xs text-muted-foreground">
              For each branch office, select Post Type, Category, set Total
              Seats and click{" "}
              <span className="font-semibold text-foreground">Add Vacancy</span>
              . Basic Pay is auto-set (BPM = Rs.12,000 | ABPM = Rs.10,000).
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Branch Office Name",
                  "Post Type",
                  "Category",
                  "Basic Pay",
                  "Total Seats",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedDivData.branchOffices.map((bo) => (
                <BranchOfficeRow
                  key={bo.name}
                  boName={bo.name}
                  onAdd={(postType, category, seats) =>
                    handleAddVacancy(bo.name, postType, category, seats)
                  }
                  isAdding={adding}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Non-MP quick add (when division is text input) */}
      {circle && !isMPCircle && division.trim() && (
        <div
          className="bg-card border border-border rounded-md p-5 space-y-4 w-full"
          data-ocid="vacancy-add-form-generic"
        >
          <h2 className="text-sm font-semibold text-foreground">
            Add Vacancy — {circle} / {division}
          </h2>
          <GenericVacancyForm
            circle={circle}
            division={division}
            onAdd={addVacancy}
            adding={adding}
          />
        </div>
      )}

      {/* ── Current Vacancies Table ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground">
            Current Vacancies
          </h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
          </div>
        ) : !vacancies?.length ? (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3"
            data-ocid="vacancy-empty"
          >
            <Briefcase className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              No vacancies added yet
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Circle",
                  "Division",
                  "Branch Office",
                  "Post Type",
                  "Category",
                  "Basic Pay",
                  "Total",
                  "Filled",
                  "Available",
                  "Edit Seats",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vacancies.map(({ vacancy, filledSeats }, i) => {
                const available = vacancy.totalSeats - filledSeats;
                return (
                  <tr
                    key={vacancy.id}
                    className={`border-b border-border last:border-0 ${i % 2 === 1 ? "bg-muted/10" : ""}`}
                    data-ocid={`vacancy-row-${vacancy.id}`}
                  >
                    <td className="px-3 py-2.5 text-foreground whitespace-nowrap">
                      {vacancy.circle}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                      {vacancy.division}
                    </td>
                    <td className="px-3 py-2.5 text-foreground font-medium whitespace-nowrap">
                      {vacancy.branchOfficeName || "—"}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        GDS {vacancy.postType || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {vacancy.category || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-semibold text-primary whitespace-nowrap">
                      {vacancy.basicPay
                        ? `Rs.${vacancy.basicPay.toLocaleString("en-IN")}/-`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground text-right">
                      {vacancy.totalSeats}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={
                          filledSeats > 0
                            ? "text-green-700 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {filledSeats}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={
                          available < 0
                            ? "text-red-600 font-medium"
                            : available === 0
                              ? "text-amber-600"
                              : "text-foreground"
                        }
                      >
                        {available}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <EditableSeats
                        vacancy={vacancy}
                        isPending={updating}
                        onSave={handleUpdate}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── Generic Vacancy Form (non-MP circles) ────────────────────────────────────

function GenericVacancyForm({
  circle,
  division,
  onAdd,
  adding,
}: {
  circle: string;
  division: string;
  onAdd: (
    params: {
      circle: string;
      division: string;
      branchOfficeName: string;
      postType: "BPM" | "ABPM";
      category: string;
      basicPay: number;
      totalSeats: number;
    },
    opts: { onSuccess: () => void; onError: (err: Error) => void },
  ) => void;
  adding: boolean;
}) {
  const [boName, setBoName] = useState("");
  const [postType, setPostType] = useState<"BPM" | "ABPM">("BPM");
  const [category, setCategory] = useState("UR");
  const [seats, setSeats] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = Number.parseInt(seats, 10);
    if (!boName.trim()) {
      setError("Branch office name required");
      return;
    }
    if (Number.isNaN(s) || s <= 0) {
      setError("Enter valid seat count");
      return;
    }
    setError("");
    onAdd(
      {
        circle,
        division,
        branchOfficeName: boName,
        postType,
        category,
        basicPay: postType === "BPM" ? 12000 : 10000,
        totalSeats: s,
      },
      {
        onSuccess: () => {
          toast.success("Vacancy added");
          setBoName("");
          setSeats("");
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
      data-ocid="vacancy-add-form"
    >
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="g-bo"
            className="text-xs font-medium text-muted-foreground"
          >
            Branch Office Name *
          </label>
          <input
            id="g-bo"
            type="text"
            value={boName}
            onChange={(e) => setBoName(e.target.value)}
            placeholder="e.g. Lucknow HO"
            className="form-input text-sm"
            data-ocid="vacancy-bo-name"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="g-post"
            className="text-xs font-medium text-muted-foreground"
          >
            Post Type
          </label>
          <select
            id="g-post"
            value={postType}
            onChange={(e) => setPostType(e.target.value as "BPM" | "ABPM")}
            className="form-input text-sm"
            data-ocid="vacancy-post-type"
          >
            {POST_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="g-cat"
            className="text-xs font-medium text-muted-foreground"
          >
            Category
          </label>
          <select
            id="g-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input text-sm"
            data-ocid="vacancy-category"
          >
            {CATEGORIES_GDS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="g-seats"
            className="text-xs font-medium text-muted-foreground"
          >
            Total Seats *
          </label>
          <input
            id="g-seats"
            type="number"
            value={seats}
            min={1}
            onChange={(e) => setSeats(e.target.value)}
            placeholder="e.g. 10"
            className="form-input text-sm"
            data-ocid="vacancy-input-seats"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">
          Basic Pay:{" "}
          <strong className="text-primary">
            {postType === "BPM" ? "Rs.12,000/-" : "Rs.10,000/-"}
          </strong>
        </span>
        <button
          type="submit"
          disabled={adding}
          className="ml-auto px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-60 transition-smooth"
          data-ocid="vacancy-add-btn"
        >
          {adding ? "Adding…" : "Add Vacancy"}
        </button>
      </div>
    </form>
  );
}
