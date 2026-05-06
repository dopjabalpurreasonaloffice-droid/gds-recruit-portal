import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Headphones,
  Info,
  Loader2,
  Mail,
  Phone,
  Search,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface GrievanceForm {
  applicationId: string;
  candidateName: string;
  mobile: string;
  email: string;
  grievanceType: string;
  subject: string;
  description: string;
  document: File | null;
}

interface FormErrors {
  applicationId?: string;
  candidateName?: string;
  mobile?: string;
  email?: string;
  grievanceType?: string;
  subject?: string;
  description?: string;
}

const GRIEVANCE_TYPES = [
  { value: "registration", label: "Registration Issue" },
  { value: "application", label: "Application Issue" },
  { value: "payment", label: "Payment Issue" },
  { value: "document", label: "Document Issue" },
  { value: "other", label: "Other" },
];

const MOCK_STATUSES: Record<
  string,
  { status: string; message: string; color: string }
> = {
  "GDS2024-001234": {
    status: "Under Review",
    message:
      "Your grievance is under review by the concerned authority. Expected resolution: 7 working days.",
    color: "bg-accent/20 text-accent-foreground border-accent/30",
  },
  "GDS2024-005678": {
    status: "Resolved",
    message:
      "Your grievance has been resolved. Refer to the email sent to your registered address.",
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300/40",
  },
};

function generateGrievanceRef(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `GRV-${new Date().getFullYear()}-${num}`;
}

export default function Grievance() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<GrievanceForm>({
    applicationId: "",
    candidateName: "",
    mobile: "",
    email: "",
    grievanceType: "",
    subject: "",
    description: "",
    document: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [grievanceRef, setGrievanceRef] = useState("");

  // Track section
  const [trackId, setTrackId] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResult, setTrackResult] = useState<
    (typeof MOCK_STATUSES)[string] | null
  >(null);
  const [trackError, setTrackError] = useState("");

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.applicationId.trim())
      errs.applicationId = "Application/Registration ID is required.";
    if (!form.candidateName.trim())
      errs.candidateName = "Candidate name is required.";
    if (!form.mobile || !/^\d{10}$/.test(form.mobile))
      errs.mobile = "Enter a valid 10-digit mobile number.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.grievanceType)
      errs.grievanceType = "Please select a grievance type.";
    if (!form.subject.trim()) errs.subject = "Subject is required.";
    if (!form.description.trim() || form.description.trim().length < 50)
      errs.description = "Description must be at least 50 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function update<K extends keyof GrievanceForm>(
    key: K,
    value: GrievanceForm[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setGrievanceRef(generateGrievanceRef());
    setSubmitted(true);
  }

  function handleReset() {
    setForm({
      applicationId: "",
      candidateName: "",
      mobile: "",
      email: "",
      grievanceType: "",
      subject: "",
      description: "",
      document: null,
    });
    setErrors({});
    setSubmitted(false);
    setGrievanceRef("");
  }

  async function handleTrackStatus() {
    if (!trackId.trim()) {
      setTrackError("Please enter an Application ID to check status.");
      return;
    }
    setTrackError("");
    setTrackResult(null);
    setTrackLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setTrackLoading(false);
    const result = MOCK_STATUSES[trackId.trim()] || null;
    if (!result) {
      setTrackError(
        "No grievance found for this Application ID. If submitted recently, it may take 24 hours to reflect.",
      );
    } else {
      setTrackResult(result);
    }
  }

  function ErrorMsg({ msg }: { msg?: string }) {
    if (!msg) return null;
    return (
      <p className="text-destructive text-xs flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3 shrink-0" /> {msg}
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-1 rounded-full bg-primary shrink-0" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            {t("pages.grievance.title")}
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-4">
          {t("pages.grievance.subtitle")}
        </p>
      </motion.div>

      {/* Important notice */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-start gap-3 rounded-lg bg-accent/10 border border-accent/30 p-4"
      >
        <Info className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
        <div className="text-sm space-y-1">
          <p className="font-semibold text-foreground">Important Notice</p>
          <p className="text-muted-foreground leading-relaxed">
            Grievances can only be submitted after your application has been
            submitted. Please note your{" "}
            <strong>Application ID / Registration Number</strong> before
            proceeding. Do not submit duplicate grievances for the same issue —
            it may delay resolution.
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main form column */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="bg-primary px-6 py-4">
                  <h2 className="font-display text-lg font-bold text-primary-foreground">
                    Grievance Submitted
                  </h2>
                </div>
                <div className="p-8 text-center space-y-4">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      {t("pages.grievance.success")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("pages.grievance.grievanceId")}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-2 text-base font-mono px-4 py-1.5"
                      data-ocid="grievance-reference-id"
                    >
                      {grievanceRef}
                    </Badge>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-4 text-left text-sm text-muted-foreground space-y-1">
                    <p>
                      • Expected resolution time:{" "}
                      <strong className="text-foreground">
                        7–10 working days
                      </strong>
                    </p>
                    <p>
                      • A confirmation email will be sent to your registered
                      email address.
                    </p>
                    <p>
                      • Use the Grievance Reference Number to track your status
                      below.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    data-ocid="grievance-submit-another-btn"
                  >
                    Submit Another Grievance
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="bg-primary px-6 py-4">
                  <h2 className="font-display text-lg font-bold text-primary-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 opacity-80" />
                    Grievance Submission Form
                  </h2>
                </div>

                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="p-6 space-y-5"
                >
                  {/* Row 1: Application ID + Name */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor="gr-app-id"
                        className="text-sm font-medium"
                      >
                        Application ID / Registration No.{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="gr-app-id"
                        type="text"
                        placeholder="e.g. GDS2024-001234"
                        value={form.applicationId}
                        onChange={(e) =>
                          update("applicationId", e.target.value)
                        }
                        data-ocid="grievance-application-id-input"
                        className={
                          errors.applicationId ? "border-destructive" : ""
                        }
                      />
                      <ErrorMsg msg={errors.applicationId} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="gr-name" className="text-sm font-medium">
                        Candidate Name{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="gr-name"
                        type="text"
                        placeholder="As per registration"
                        value={form.candidateName}
                        onChange={(e) =>
                          update("candidateName", e.target.value)
                        }
                        data-ocid="grievance-name-input"
                        className={
                          errors.candidateName ? "border-destructive" : ""
                        }
                      />
                      <ErrorMsg msg={errors.candidateName} />
                    </div>
                  </div>

                  {/* Row 2: Mobile + Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor="gr-mobile"
                        className="text-sm font-medium"
                      >
                        Mobile Number{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="gr-mobile"
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={form.mobile}
                        onChange={(e) =>
                          update("mobile", e.target.value.replace(/\D/g, ""))
                        }
                        data-ocid="grievance-mobile-input"
                        className={errors.mobile ? "border-destructive" : ""}
                      />
                      <ErrorMsg msg={errors.mobile} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="gr-email" className="text-sm font-medium">
                        Email Address{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="gr-email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        data-ocid="grievance-email-input"
                        className={errors.email ? "border-destructive" : ""}
                      />
                      <ErrorMsg msg={errors.email} />
                    </div>
                  </div>

                  {/* Grievance type */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Grievance Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={form.grievanceType}
                      onValueChange={(v) => update("grievanceType", v)}
                    >
                      <SelectTrigger
                        data-ocid="grievance-type-select"
                        className={
                          errors.grievanceType ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder="Select grievance type" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRIEVANCE_TYPES.map((gt) => (
                          <SelectItem key={gt.value} value={gt.value}>
                            {gt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMsg msg={errors.grievanceType} />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1">
                    <Label htmlFor="gr-subject" className="text-sm font-medium">
                      Subject <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="gr-subject"
                      type="text"
                      placeholder="Brief subject of your grievance"
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      data-ocid="grievance-subject-input"
                      className={errors.subject ? "border-destructive" : ""}
                    />
                    <ErrorMsg msg={errors.subject} />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gr-desc" className="text-sm font-medium">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <span
                        className={`text-xs ${form.description.length >= 50 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                      >
                        {form.description.length} / 50 min chars
                      </span>
                    </div>
                    <Textarea
                      id="gr-desc"
                      rows={5}
                      placeholder="Describe your grievance in detail (minimum 50 characters). Include dates, error messages, and any relevant information."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      data-ocid="grievance-description-input"
                      className={`resize-none ${errors.description ? "border-destructive" : ""}`}
                    />
                    <ErrorMsg msg={errors.description} />
                  </div>

                  {/* Document upload */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Supporting Document{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        update("document", file);
                      }}
                      data-ocid="grievance-document-input"
                    />
                    {form.document ? (
                      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate min-w-0 flex-1 text-foreground">
                          {form.document.name}
                        </span>
                        <button
                          type="button"
                          aria-label="Remove file"
                          onClick={() => {
                            update("document", null);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 py-4 text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
                        data-ocid="grievance-document-upload-btn"
                      >
                        <Upload className="h-4 w-4" />
                        Click to upload PDF, JPG, PNG (max 2 MB)
                      </button>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full font-semibold"
                      disabled={submitting}
                      data-ocid="grievance-submit-btn"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                          Submitting...
                        </>
                      ) : (
                        t("pages.grievance.submitGrievance")
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Fields marked <span className="text-destructive">*</span>{" "}
                      are mandatory
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Track status section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="mt-6 rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="bg-secondary px-6 py-4 border-b border-border">
              <h2 className="font-display text-base font-bold text-secondary-foreground flex items-center gap-2">
                <Search className="h-4 w-4 opacity-70" />
                Track Grievance Status
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter your Application ID to check the status of your previously
                submitted grievance.
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="e.g. GDS2024-001234"
                  value={trackId}
                  onChange={(e) => {
                    setTrackId(e.target.value);
                    setTrackError("");
                    setTrackResult(null);
                  }}
                  data-ocid="grievance-track-id-input"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleTrackStatus}
                  disabled={trackLoading}
                  data-ocid="grievance-track-status-btn"
                >
                  {trackLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Check Status"
                  )}
                </Button>
              </div>

              <AnimatePresence>
                {trackError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-destructive flex items-start gap-1.5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{" "}
                    {trackError}
                  </motion.p>
                )}
                {trackResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-lg border p-4 space-y-1 ${trackResult.color}`}
                    data-ocid="grievance-track-result"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <strong className="text-sm">{trackResult.status}</strong>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {trackResult.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-xs text-muted-foreground">
                Demo: Try <strong>GDS2024-001234</strong> or{" "}
                <strong>GDS2024-005678</strong>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sidebar: contact info */}
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="rounded-xl border border-border bg-card overflow-hidden sticky top-4"
          >
            <div className="bg-primary px-5 py-4">
              <h2 className="font-display text-base font-bold text-primary-foreground flex items-center gap-2">
                <Headphones className="h-4 w-4 opacity-80" />
                Helpdesk Contact
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Email Support</p>
                    <a
                      href="mailto:gdsrecruitment@indiapost.gov.in"
                      className="text-primary hover:underline break-all"
                    >
                      gdsrecruitment@indiapost.gov.in
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Helpline</p>
                    <p className="text-muted-foreground">011-23096086</p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted/40 border border-border p-3">
                <p className="text-xs font-semibold text-foreground mb-1">
                  Working Hours
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Monday – Friday
                  <br />
                  10:00 AM – 5:00 PM IST
                  <br />
                  (Excluding Govt. Holidays)
                </p>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <p className="text-xs font-semibold text-foreground">
                  Response Timeline
                </p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {[
                    { type: "Registration Issue", days: "3–5 days" },
                    { type: "Application Issue", days: "5–7 days" },
                    { type: "Payment Issue", days: "3–5 days" },
                    { type: "Document Issue", days: "7–10 days" },
                  ].map((item) => (
                    <div key={item.type} className="flex justify-between">
                      <span>{item.type}</span>
                      <span className="font-medium text-foreground">
                        {item.days}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-xs text-destructive leading-relaxed">
                  <strong>Note:</strong> Do not contact helpdesk for status
                  queries. Use the Track Status tool above.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
