import type {
  ApplicationId,
  Circle,
  EducationDetails,
  Preferences,
} from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/ui/page-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import {
  useAddDocumentUrl,
  useAllCircles,
  useCreateApplication,
  useMyApplications,
  useMyProfile,
  useSubmitApplication,
} from "@/hooks/useQueries";
import {
  EDUCATION_BOARDS,
  FEE_AMOUNT,
  FEE_EXEMPTED_CATEGORIES,
  INDIAN_STATES,
  POST_CATEGORIES,
} from "@/lib/constants";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileCheck,
  FileText,
  Lock,
  MapPin,
  ShieldCheck,
  Upload,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── types ───────────────────────────────────────────────────────────────────

type ResultType = "Percentage" | "CGPA" | "Grade/Point";

interface DocFile {
  file: File | null;
  url: string;
  uploading: boolean;
  progress: number;
}

interface PrefRow {
  state: string;
  circle: string;
  division: string;
  postCategory: string;
}

interface FormState {
  boardName: string;
  yearOfPassing: string;
  resultType: ResultType;
  // Percentage mode
  totalMarks: string;
  marksObtained: string;
  percentageObtained: string;
  // CGPA mode
  totalCgpa: string;
  // Grade/Point mode
  totalGrade: string;
  computerKnowledge: string;
  additionalQualification: string;
  pref1: PrefRow;
  pref2: PrefRow;
  hasSecondPref: boolean;
}

const EMPTY_PREF: PrefRow = {
  state: "",
  circle: "",
  division: "",
  postCategory: "",
};

const EMPTY_FORM: FormState = {
  boardName: "",
  yearOfPassing: "",
  resultType: "Percentage",
  totalMarks: "",
  marksObtained: "",
  percentageObtained: "",
  totalCgpa: "",
  totalGrade: "",
  computerKnowledge: "",
  additionalQualification: "",
  pref1: { ...EMPTY_PREF },
  pref2: { ...EMPTY_PREF },
  hasSecondPref: false,
};

const PASSING_YEARS: string[] = Array.from({ length: 11 }, (_, i) =>
  String(new Date().getFullYear() - i),
);

// ─── helpers ─────────────────────────────────────────────────────────────────

function calcPct(obtained: string, total: string): number | null {
  const o = Number.parseFloat(obtained);
  const t = Number.parseFloat(total);
  if (!o || !t || t === 0) return null;
  return Math.min(Number.parseFloat(((o / t) * 100).toFixed(2)), 100);
}

function PctBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const color =
    pct >= 60
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      : pct >= 45
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
        : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-semibold ${color}`}
    >
      {pct}%
    </span>
  );
}

// ─── collapsible section wrapper ─────────────────────────────────────────────

function Section({
  id,
  icon,
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border border-border shadow-sm" id={id}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-muted/30 transition-colors rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-controls={`section-body-${id}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-primary">{icon}</span>
          <span className="font-semibold text-base text-foreground">
            {title}
          </span>
          {badge}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <CardContent
          id={`section-body-${id}`}
          className="pt-0 pb-5 px-4 md:px-6"
        >
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// ─── preference row ───────────────────────────────────────────────────────────

function PrefSelector({
  value,
  onChange,
  circles,
  label,
  t,
}: {
  value: PrefRow;
  onChange: (v: PrefRow) => void;
  circles: Circle[];
  label: string;
  t: (k: string) => string;
}) {
  const stateCircles = useMemo(
    () => circles.filter((c) => c.stateName === value.state),
    [circles, value.state],
  );
  const selectedCircle = useMemo(
    () => stateCircles.find((c) => c.circleName === value.circle),
    [stateCircles, value.circle],
  );

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/10 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* State */}
        <div className="space-y-1.5">
          <Label className="text-sm">
            {t("pages.apply.selectState")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={value.state}
            onValueChange={(v) => onChange({ ...EMPTY_PREF, state: v })}
          >
            <SelectTrigger data-ocid="pref-state-select">
              <SelectValue placeholder={t("pages.apply.selectState")} />
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

        {/* Circle */}
        <div className="space-y-1.5">
          <Label className="text-sm">
            {t("pages.apply.selectCircle")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={value.circle}
            onValueChange={(v) =>
              onChange({ ...value, circle: v, division: "" })
            }
            disabled={!value.state}
          >
            <SelectTrigger data-ocid="pref-circle-select">
              <SelectValue placeholder={t("pages.apply.selectCircle")} />
            </SelectTrigger>
            <SelectContent>
              {stateCircles.length > 0 ? (
                stateCircles.map((c) => (
                  <SelectItem key={String(c.id)} value={c.circleName}>
                    {c.circleName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="__none" disabled>
                  No circles available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Division */}
        <div className="space-y-1.5">
          <Label className="text-sm">
            {t("pages.apply.selectDivision")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={value.division}
            onValueChange={(v) => onChange({ ...value, division: v })}
            disabled={!value.circle}
          >
            <SelectTrigger data-ocid="pref-division-select">
              <SelectValue placeholder={t("pages.apply.selectDivision")} />
            </SelectTrigger>
            <SelectContent>
              {(selectedCircle?.divisions ?? []).length > 0 ? (
                selectedCircle!.divisions.map((d) => (
                  <SelectItem key={String(d.id)} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="__none" disabled>
                  No divisions available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Post Category */}
        <div className="space-y-1.5">
          <Label className="text-sm">
            {t("pages.apply.postCategory")}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Select
            value={value.postCategory}
            onValueChange={(v) => onChange({ ...value, postCategory: v })}
          >
            <SelectTrigger data-ocid="pref-post-select">
              <SelectValue placeholder={t("common.selectOption")} />
            </SelectTrigger>
            <SelectContent>
              {POST_CATEGORIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ─── document row ─────────────────────────────────────────────────────────────

function DocRow({
  label,
  required,
  doc,
  onUpload,
  onRemove,
  accept,
}: {
  label: string;
  required: boolean;
  doc: DocFile;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-border last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </p>
        {doc.file && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {doc.file.name}
          </p>
        )}
        {doc.uploading && (
          <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${doc.progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {doc.url ? (
          <>
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Uploaded
            </span>
            <button
              type="button"
              onClick={onRemove}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove document"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={accept ?? ".pdf,.jpg,.jpeg,.png"}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f);
              }}
              aria-label={`Upload ${label}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={doc.uploading}
              onClick={() => inputRef.current?.click()}
              data-ocid="doc-upload-btn"
              className="text-xs"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              {doc.uploading ? "Uploading…" : "Upload"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function Apply() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // queries
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: applications, isLoading: appsLoading } = useMyApplications();
  const { data: circles = [], isLoading: circlesLoading } = useAllCircles();
  const createApp = useCreateApplication();
  const submitApp = useSubmitApplication();
  const addDocUrl = useAddDocumentUrl();

  // existing draft / submitted app
  const existingApp = useMemo(
    () => (applications && applications.length > 0 ? applications[0] : null),
    [applications],
  );
  const isDraft = existingApp?.status === "draft";
  const isSubmitted = existingApp?.status !== "draft" && existingApp !== null;

  // form state
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successApp, setSuccessApp] = useState<ApplicationId | null>(null);

  // documents
  const [docs, setDocs] = useState<{
    class10Cert: DocFile;
    class10Sheet: DocFile;
    casteCert: DocFile;
    photoId: DocFile;
    disabilityCert: DocFile;
  }>({
    class10Cert: { file: null, url: "", uploading: false, progress: 0 },
    class10Sheet: { file: null, url: "", uploading: false, progress: 0 },
    casteCert: { file: null, url: "", uploading: false, progress: 0 },
    photoId: { file: null, url: "", uploading: false, progress: 0 },
    disabilityCert: { file: null, url: "", uploading: false, progress: 0 },
  });

  // pre-fill form from existing draft
  useEffect(() => {
    if (isDraft && existingApp) {
      const ed = existingApp.educationDetails;
      const pref = existingApp.preferences;
      setForm((prev) => ({
        ...prev,
        boardName: ed.boardName,
        yearOfPassing: ed.yearOfPassing,
        totalMarks: String(ed.totalMarks),
        marksObtained: String(ed.marksObtained),
        percentageObtained: String(ed.percentage),
        pref1: {
          state: pref.state,
          circle: pref.circle,
          division: pref.division,
          postCategory: pref.postCategory,
        },
      }));
    }
  }, [isDraft, existingApp]);

  // derived
  const pct =
    form.resultType === "Percentage"
      ? calcPct(form.marksObtained, form.totalMarks)
      : null;
  const isFemale = profile?.gender?.toLowerCase() === "female";
  const isPwD = profile?.subcategory === "PWD";
  const isFeeExempt =
    isFemale ||
    isPwD ||
    FEE_EXEMPTED_CATEGORIES.some(
      (c) => c === profile?.category || c === profile?.subcategory,
    );
  const feeAmount = isFeeExempt ? 0 : FEE_AMOUNT;
  const needsCaste =
    profile?.category === "SC" ||
    profile?.category === "ST" ||
    profile?.category === "OBC";

  // ── form field helpers ─────────────────────────────────────────────────────

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)),
    );
  }

  // ── validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!form.boardName) errs.boardName = t("common.required");
    if (!form.yearOfPassing) errs.yearOfPassing = t("common.required");

    if (form.resultType === "Percentage") {
      const tm = Number.parseInt(form.totalMarks);
      const mo = Number.parseInt(form.marksObtained);
      if (!form.totalMarks || Number.isNaN(tm) || tm <= 0 || tm > 600)
        errs.totalMarks = "Enter valid total marks (1–600)";
      if (!form.marksObtained || Number.isNaN(mo) || mo < 0 || mo > tm)
        errs.marksObtained = "Enter valid marks (0–Total Marks)";
      if (!form.percentageObtained)
        errs.percentageObtained = "Enter percentage obtained";
    } else if (form.resultType === "CGPA") {
      if (!form.totalCgpa) errs.totalCgpa = "Enter your CGPA";
    } else {
      if (!form.totalGrade) errs.totalGrade = "Enter your Grade/Point";
    }

    if (!form.computerKnowledge) errs.computerKnowledge = t("common.required");

    if (!form.pref1.state) errs.pref1State = t("common.required");
    if (!form.pref1.circle) errs.pref1Circle = t("common.required");
    if (!form.pref1.division) errs.pref1Division = t("common.required");
    if (!form.pref1.postCategory) errs.pref1Post = t("common.required");

    if (form.hasSecondPref) {
      if (!form.pref2.state) errs.pref2State = t("common.required");
      if (!form.pref2.circle) errs.pref2Circle = t("common.required");
      if (!form.pref2.division) errs.pref2Division = t("common.required");
      if (!form.pref2.postCategory) errs.pref2Post = t("common.required");
    }

    if (!docs.class10Cert.url)
      errs.class10Cert = "Required document not uploaded";
    if (!docs.class10Sheet.url)
      errs.class10Sheet = "Required document not uploaded";
    if (needsCaste && !docs.casteCert.url)
      errs.casteCert = "Required for your category";
    if (!docs.photoId.url) errs.photoId = "Required document not uploaded";
    if (isPwD && !docs.disabilityCert.url)
      errs.disabilityCert = "Required for PwD candidates";

    if (!declarationAccepted)
      errs.declaration = "You must accept the declaration";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── mock upload ────────────────────────────────────────────────────────────

  const mockUpload = useCallback(
    (docKey: keyof typeof docs, file: File, appId?: ApplicationId) => {
      if (file.size > 500 * 1024) {
        alert(
          `${file.name} exceeds 500KB limit. Please choose a smaller file.`,
        );
        return;
      }
      setDocs((prev) => ({
        ...prev,
        [docKey]: { file, url: "", uploading: true, progress: 0 },
      }));
      let prog = 0;
      const interval = setInterval(() => {
        prog += 20;
        setDocs((prev) => ({
          ...prev,
          [docKey]: { ...prev[docKey], progress: prog },
        }));
        if (prog >= 100) {
          clearInterval(interval);
          const url = `#document-${docKey}`;
          setDocs((prev) => ({
            ...prev,
            [docKey]: { file, url, uploading: false, progress: 100 },
          }));
          if (appId) {
            addDocUrl.mutate({ id: appId, url });
          }
        }
      }, 150);
    },
    [addDocUrl],
  );

  function removeDoc(docKey: keyof typeof docs) {
    setDocs((prev) => ({
      ...prev,
      [docKey]: { file: null, url: "", uploading: false, progress: 0 },
    }));
  }

  // ── build backend params ───────────────────────────────────────────────────

  function buildParams(): { ed: EducationDetails; prefs: Preferences } {
    let tm: bigint;
    let mo: bigint;
    let pctVal: number;

    if (form.resultType === "Percentage") {
      tm = BigInt(Number.parseInt(form.totalMarks) || 0);
      mo = BigInt(Number.parseInt(form.marksObtained) || 0);
      pctVal = Number.parseFloat(form.percentageObtained) || 0;
    } else if (form.resultType === "CGPA") {
      tm = BigInt(10);
      mo = BigInt(0);
      pctVal = Number.parseFloat(form.totalCgpa) * 9.5; // CGPA approx conversion
    } else {
      tm = BigInt(0);
      mo = BigInt(0);
      pctVal = 0;
    }

    return {
      ed: {
        boardName: form.boardName,
        yearOfPassing: form.yearOfPassing,
        totalMarks: tm,
        marksObtained: mo,
        percentage: pctVal,
      },
      prefs: {
        state: form.pref1.state,
        circle: form.pref1.circle,
        division: form.pref1.division,
        postCategory: form.pref1.postCategory,
      },
    };
  }

  // ── save draft ─────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    setSaving(true);
    try {
      const { ed, prefs } = buildParams();
      if (!existingApp) {
        await createApp.mutateAsync({
          educationDetails: ed,
          preferences: prefs,
        });
      }
      // If draft already exists, we don't re-create
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // ── submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      const firstErr = document.querySelector("[data-error]");
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const { ed, prefs } = buildParams();
      let appId: ApplicationId;
      if (existingApp) {
        appId = existingApp.id;
      } else {
        appId = await createApp.mutateAsync({
          educationDetails: ed,
          preferences: prefs,
        });
      }

      // Upload pending docs
      const docEntries = Object.entries(docs) as Array<
        [keyof typeof docs, DocFile]
      >;
      for (const [key, doc] of docEntries) {
        if (doc.file && !doc.url) {
          mockUpload(key, doc.file, appId);
        } else if (doc.url && doc.url !== "#document-placeholder") {
          addDocUrl.mutate({ id: appId, url: doc.url });
        }
      }

      await submitApp.mutateAsync(appId);
      setSuccessApp(appId);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  // ── redirect after success ─────────────────────────────────────────────────

  useEffect(() => {
    if (successApp !== null) {
      const timer = setTimeout(() => {
        navigate({ to: "/fee-payment" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successApp, navigate]);

  // ── auth guard ─────────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h2 className="font-display font-bold text-xl text-foreground">
            Login Required
          </h2>
          <p className="text-sm text-muted-foreground">
            You must be logged in to access the Apply Online page.
          </p>
        </div>
        <Link to="/login">
          <Button data-ocid="login-redirect-btn">Login / Register</Button>
        </Link>
      </div>
    );
  }

  // ── loading ────────────────────────────────────────────────────────────────

  if (profileLoading || appsLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-72" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // ── success screen ─────────────────────────────────────────────────────────

  if (successApp !== null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5">
        <Card className="max-w-md w-full text-center p-8 border-green-300 dark:border-green-700 bg-green-50/60 dark:bg-green-950/20 shadow-md">
          <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <CardTitle className="font-display text-2xl text-foreground mb-2">
            {t("pages.apply.success")}
          </CardTitle>
          <p className="text-sm text-muted-foreground mb-4">
            Application ID:{" "}
            <strong className="font-mono text-foreground">
              APP-{String(successApp).padStart(6, "0")}
            </strong>
          </p>
          <p className="text-xs text-muted-foreground">
            Redirecting to Fee Payment page in 3 seconds…
          </p>
          <Link to="/fee-payment">
            <Button className="mt-4 w-full" data-ocid="go-fee-payment-btn">
              Proceed to Fee Payment
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ── submitted (read-only) view ─────────────────────────────────────────────

  if (isSubmitted && existingApp) {
    const ed = existingApp.educationDetails;
    const pr = existingApp.preferences;
    return (
      <div className="max-w-3xl mx-auto space-y-5 pb-10">
        <PageTitle
          title={t("pages.apply.title")}
          subtitle={t("pages.apply.subtitle")}
          breadcrumbs={[{ label: "Apply Online" }]}
        />
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
              <FileCheck className="h-5 w-5" />
              Application Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your application has been submitted. No further edits are allowed.
            Status:{" "}
            <Badge variant="outline" className="ml-1 capitalize">
              {existingApp.status}
            </Badge>
          </CardContent>
        </Card>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ["Board", ed.boardName],
            ["Year of Passing", ed.yearOfPassing],
            ["Marks", `${ed.marksObtained} / ${ed.totalMarks}`],
            ["Percentage", `${ed.percentage}%`],
            ["State", pr.state],
            ["Circle", pr.circle],
            ["Division", pr.division],
            ["Post Category", pr.postCategory],
          ].map(([label, val]) => (
            <div
              key={label}
              className="bg-card border border-border rounded-md px-4 py-2.5"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium text-foreground">{val}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── main form ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-5">
      <PageTitle
        title={t("pages.apply.title")}
        subtitle={t("pages.apply.subtitle")}
        breadcrumbs={[{ label: "Apply Online (Stage 2)" }]}
      />

      {/* Draft banner */}
      {isDraft && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700/40 text-amber-800 dark:text-amber-300 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            You have a saved draft. Complete and submit the application before
            the deadline.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* ── SECTION 1: Personal Info ──────────────────────────────── */}
        <Section
          id="sec-personal"
          icon={<User className="h-5 w-5" />}
          title="Personal Information"
        >
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Personal details auto-filled from your registration
          </p>
          {profile ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ["Full Name", profile.name],
                ["Mobile", profile.mobile],
                ["Email", profile.email],
                ["Date of Birth", profile.dob],
                ["Gender", profile.gender],
                [
                  "Category",
                  profile.category +
                    (profile.subcategory !== "NONE"
                      ? ` / ${profile.subcategory}`
                      : ""),
                ],
              ].map(([label, val]) => (
                <div
                  key={label}
                  className="bg-muted/50 border border-border rounded-md px-3 py-2.5"
                >
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-foreground mt-0.5 truncate">
                    {val || "—"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Profile not found. Please{" "}
              <Link
                to="/register"
                className="text-primary underline underline-offset-2"
              >
                complete registration
              </Link>{" "}
              first.
            </div>
          )}
        </Section>

        {/* ── SECTION 2: Education ──────────────────────────────────── */}
        <Section
          id="sec-education"
          icon={<BookOpen className="h-5 w-5" />}
          title={t("pages.apply.educationDetails")}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Board Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="boardName">
                {t("pages.apply.boardName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.boardName}
                onValueChange={(v) => setField("boardName", v)}
              >
                <SelectTrigger
                  id="boardName"
                  data-ocid="board-select"
                  data-error={errors.boardName ? "" : undefined}
                >
                  <SelectValue placeholder="Select your board" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_BOARDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.boardName && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.boardName}
                </p>
              )}
            </div>

            {/* Result Type — shown after board is selected */}
            {form.boardName && (
              <div className="sm:col-span-2 space-y-2">
                <Label>
                  Result Type <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-6">
                  {(["Percentage", "CGPA", "Grade/Point"] as const).map(
                    (rt) => (
                      <label
                        key={rt}
                        className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                      >
                        <input
                          type="radio"
                          name="resultType"
                          value={rt}
                          checked={form.resultType === rt}
                          onChange={() => setField("resultType", rt)}
                          className="h-4 w-4 accent-primary"
                          data-ocid={`result-type-${rt.toLowerCase().replace("/", "-")}`}
                        />
                        {rt}
                      </label>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Year of Passing */}
            <div className="space-y-1.5">
              <Label htmlFor="yearOfPassing">
                {t("pages.apply.yearOfPassing")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.yearOfPassing}
                onValueChange={(v) => setField("yearOfPassing", v)}
              >
                <SelectTrigger
                  id="yearOfPassing"
                  data-ocid="year-select"
                  data-error={errors.yearOfPassing ? "" : undefined}
                >
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {PASSING_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.yearOfPassing && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.yearOfPassing}
                </p>
              )}
            </div>

            {/* Conditional fields by result type */}
            {form.resultType === "Percentage" && (
              <>
                {/* Total Marks */}
                <div className="space-y-1.5">
                  <Label htmlFor="totalMarks">
                    {t("pages.apply.totalMarks")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min={1}
                    max={600}
                    placeholder="e.g. 500"
                    value={form.totalMarks}
                    onChange={(e) => setField("totalMarks", e.target.value)}
                    data-ocid="total-marks-input"
                    data-error={errors.totalMarks ? "" : undefined}
                  />
                  {errors.totalMarks && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.totalMarks}
                    </p>
                  )}
                </div>

                {/* Marks Obtained */}
                <div className="space-y-1.5">
                  <Label htmlFor="marksObtained">
                    {t("pages.apply.marksObtained")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="marksObtained"
                    type="number"
                    min={0}
                    max={Number.parseInt(form.totalMarks) || 600}
                    placeholder="e.g. 425"
                    value={form.marksObtained}
                    onChange={(e) => setField("marksObtained", e.target.value)}
                    data-ocid="marks-obtained-input"
                    data-error={errors.marksObtained ? "" : undefined}
                  />
                  {errors.marksObtained && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.marksObtained}
                    </p>
                  )}
                </div>

                {/* Percentage Obtained */}
                <div className="space-y-1.5">
                  <Label htmlFor="percentageObtained">
                    Percentage Obtained (%){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="percentageObtained"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    placeholder="e.g. 85.50"
                    value={form.percentageObtained}
                    onChange={(e) =>
                      setField("percentageObtained", e.target.value)
                    }
                    data-ocid="percentage-obtained-input"
                    data-error={errors.percentageObtained ? "" : undefined}
                  />
                  {errors.percentageObtained && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors.percentageObtained}
                    </p>
                  )}
                </div>

                {/* Auto-calculated percentage display */}
                <div className="space-y-1.5">
                  <Label>{t("pages.apply.percentage")}</Label>
                  <div className="flex items-center gap-3 h-10 px-3 bg-muted/50 border border-border rounded-md">
                    {pct !== null ? (
                      <PctBadge pct={pct} />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Auto-calculated
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {form.resultType === "CGPA" && (
              <div className="space-y-1.5">
                <Label htmlFor="totalCgpa">
                  Total CGPA <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalCgpa"
                  type="number"
                  min={0}
                  max={10}
                  step={0.01}
                  placeholder="e.g. 8.5"
                  value={form.totalCgpa}
                  onChange={(e) => setField("totalCgpa", e.target.value)}
                  data-ocid="total-cgpa-input"
                  data-error={errors.totalCgpa ? "" : undefined}
                />
                {errors.totalCgpa && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.totalCgpa}
                  </p>
                )}
              </div>
            )}

            {form.resultType === "Grade/Point" && (
              <div className="space-y-1.5">
                <Label htmlFor="totalGrade">
                  Total Grade / Point{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="totalGrade"
                  type="text"
                  placeholder="e.g. A+ or 8.0"
                  value={form.totalGrade}
                  onChange={(e) => setField("totalGrade", e.target.value)}
                  data-ocid="total-grade-input"
                  data-error={errors.totalGrade ? "" : undefined}
                />
                {errors.totalGrade && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.totalGrade}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Computer Knowledge */}
          <div className="space-y-2">
            <Label>
              Computer Knowledge <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-6">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="radio"
                    name="computerKnowledge"
                    value={opt}
                    checked={form.computerKnowledge === opt}
                    onChange={() => setField("computerKnowledge", opt)}
                    className="h-4 w-4 accent-primary"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {errors.computerKnowledge && (
              <p className="text-xs text-destructive" role="alert" data-error>
                {errors.computerKnowledge}
              </p>
            )}
          </div>

          {/* Additional Qualification */}
          <div className="space-y-1.5 mt-4">
            <Label htmlFor="addlQual">
              Additional Qualifications (optional)
            </Label>
            <Textarea
              id="addlQual"
              placeholder="Mention any additional certifications or qualifications..."
              rows={3}
              value={form.additionalQualification}
              onChange={(e) =>
                setField("additionalQualification", e.target.value)
              }
              data-ocid="addl-qual-input"
            />
          </div>
        </Section>

        {/* ── SECTION 3: Post Preferences ──────────────────────────── */}
        <Section
          id="sec-preferences"
          icon={<MapPin className="h-5 w-5" />}
          title={t("pages.apply.preferences")}
        >
          {circlesLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="space-y-4">
              <PrefSelector
                value={form.pref1}
                onChange={(v) => setField("pref1", v)}
                circles={circles as Circle[]}
                label="Preference 1 (Primary)"
                t={t}
              />
              {(errors.pref1State ||
                errors.pref1Circle ||
                errors.pref1Division ||
                errors.pref1Post) && (
                <p className="text-xs text-destructive" role="alert" data-error>
                  Please fill all preference 1 fields.
                </p>
              )}

              {/* Second preference toggle */}
              <label
                htmlFor="hasSecondPref"
                className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-foreground"
              >
                <Checkbox
                  id="hasSecondPref"
                  checked={form.hasSecondPref}
                  onCheckedChange={(checked) =>
                    setField("hasSecondPref", checked === true)
                  }
                  data-ocid="second-pref-checkbox"
                />
                Apply for additional post (optional 2nd preference)
              </label>

              {form.hasSecondPref && (
                <PrefSelector
                  value={form.pref2}
                  onChange={(v) => setField("pref2", v)}
                  circles={circles as Circle[]}
                  label="Preference 2 (Secondary)"
                  t={t}
                />
              )}
              {form.hasSecondPref &&
                (errors.pref2State ||
                  errors.pref2Circle ||
                  errors.pref2Division ||
                  errors.pref2Post) && (
                  <p
                    className="text-xs text-destructive"
                    role="alert"
                    data-error
                  >
                    Please fill all preference 2 fields.
                  </p>
                )}
            </div>
          )}
        </Section>

        {/* ── SECTION 4: Document Upload ──────────────────────────── */}
        <Section
          id="sec-documents"
          icon={<FileText className="h-5 w-5" />}
          title={t("pages.apply.documents")}
          badge={
            <Badge variant="outline" className="text-[10px] ml-2">
              Max 500KB each
            </Badge>
          }
        >
          <p className="text-xs text-muted-foreground mb-4">
            Upload clear scanned copies or photos. Accepted formats: PDF, JPG,
            PNG.
          </p>
          <div>
            <DocRow
              label="Class 10th Certificate"
              required
              doc={docs.class10Cert}
              onUpload={(f) => mockUpload("class10Cert", f, existingApp?.id)}
              onRemove={() => removeDoc("class10Cert")}
            />
            {errors.class10Cert && (
              <p
                className="text-xs text-destructive mt-1"
                role="alert"
                data-error
              >
                {errors.class10Cert}
              </p>
            )}

            <DocRow
              label="Class 10th Mark Sheet"
              required
              doc={docs.class10Sheet}
              onUpload={(f) => mockUpload("class10Sheet", f, existingApp?.id)}
              onRemove={() => removeDoc("class10Sheet")}
            />
            {errors.class10Sheet && (
              <p
                className="text-xs text-destructive mt-1"
                role="alert"
                data-error
              >
                {errors.class10Sheet}
              </p>
            )}

            {needsCaste && (
              <>
                <DocRow
                  label={`Caste Certificate (${profile?.category})`}
                  required
                  doc={docs.casteCert}
                  onUpload={(f) => mockUpload("casteCert", f, existingApp?.id)}
                  onRemove={() => removeDoc("casteCert")}
                />
                {errors.casteCert && (
                  <p
                    className="text-xs text-destructive mt-1"
                    role="alert"
                    data-error
                  >
                    {errors.casteCert}
                  </p>
                )}
              </>
            )}

            <DocRow
              label="Photo ID Proof (Aadhaar / Voter ID / Passport)"
              required
              doc={docs.photoId}
              onUpload={(f) => mockUpload("photoId", f, existingApp?.id)}
              onRemove={() => removeDoc("photoId")}
            />
            {errors.photoId && (
              <p
                className="text-xs text-destructive mt-1"
                role="alert"
                data-error
              >
                {errors.photoId}
              </p>
            )}

            {isPwD && (
              <>
                <DocRow
                  label="Disability Certificate (PwD)"
                  required
                  doc={docs.disabilityCert}
                  onUpload={(f) =>
                    mockUpload("disabilityCert", f, existingApp?.id)
                  }
                  onRemove={() => removeDoc("disabilityCert")}
                />
                {errors.disabilityCert && (
                  <p
                    className="text-xs text-destructive mt-1"
                    role="alert"
                    data-error
                  >
                    {errors.disabilityCert}
                  </p>
                )}
              </>
            )}
          </div>
        </Section>

        {/* ── SECTION 5: Declaration ───────────────────────────────── */}
        <Section
          id="sec-declaration"
          icon={<ShieldCheck className="h-5 w-5" />}
          title={t("pages.apply.declaration")}
        >
          {/* Fee info */}
          <div className="mb-5 rounded-lg border border-border bg-muted/20 px-4 py-3.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Application Fee
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">
                {isFeeExempt
                  ? "Fee Exempted (SC/ST/PwD/Female)"
                  : "General / OBC Category"}
              </p>
              <span
                className={`text-lg font-bold font-mono ${isFeeExempt ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
              >
                {isFeeExempt ? "₹0" : `₹${feeAmount}`}
              </span>
            </div>
            {!isFeeExempt && (
              <p className="text-xs text-muted-foreground mt-1">
                Fee payment must be completed on the next page to confirm your
                application.
              </p>
            )}
          </div>

          {/* Declaration text */}
          <div className="mb-5 rounded-lg border border-border bg-muted/10 p-4 text-sm text-foreground leading-relaxed max-h-40 overflow-y-auto">
            <p className="font-semibold mb-2">Declaration by Candidate</p>
            <p>
              I hereby declare that all the information given by me in this
              application is true, complete, and correct to the best of my
              knowledge and belief. I understand that in the event of any
              information being found false or incorrect or ineligibility being
              detected before or after the examination, my candidature is liable
              to be cancelled and action taken against me as per rules. I also
              hereby undertake to abide by all rules and regulations governing
              this recruitment.
            </p>
            <p className="mt-2">
              I am aware that canvassing in any form will result in
              disqualification of my candidature. I confirm that I fulfill the
              eligibility criteria specified for this post.
            </p>
          </div>

          {/* Accept checkbox */}
          <label
            className="flex items-start gap-3 cursor-pointer"
            htmlFor="declaration-accept"
          >
            <Checkbox
              id="declaration-accept"
              checked={declarationAccepted}
              onCheckedChange={(c) => {
                setDeclarationAccepted(c === true);
                if (c) {
                  setErrors((prev) =>
                    Object.fromEntries(
                      Object.entries(prev).filter(([k]) => k !== "declaration"),
                    ),
                  );
                }
              }}
              data-ocid="declaration-checkbox"
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">
              I have read and agree to the above declaration. I confirm that all
              information provided is accurate and complete.{" "}
              <span className="text-destructive font-medium">*</span>
            </span>
          </label>
          {errors.declaration && (
            <p
              className="text-xs text-destructive mt-2"
              role="alert"
              data-error
            >
              {errors.declaration}
            </p>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={saving || submitting}
              onClick={handleSaveDraft}
              data-ocid="save-draft-btn"
              className="sm:order-1"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              {saving ? "Saving…" : "Save as Draft"}
            </Button>
            <Button
              type="submit"
              disabled={submitting || saving || !declarationAccepted}
              data-ocid="submit-application-btn"
              className="sm:order-2"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          </div>

          {/* General error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 flex items-start gap-2 text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-lg px-4 py-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Please fix {Object.keys(errors).length} error
                {Object.keys(errors).length > 1 ? "s" : ""} above before
                submitting.
              </span>
            </div>
          )}
        </Section>
      </form>
    </div>
  );
}
