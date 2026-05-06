import type { AddressType } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTitle } from "@/components/ui/page-title";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import {
  useRegisterUser,
  useRequestOTP,
  useUpdatePhotoUrl,
  useUpdateSignatureUrl,
  useVerifyOTP,
} from "@/hooks/useQueries";
import {
  CATEGORIES,
  GENDER_OPTIONS,
  INDIAN_STATES,
  SUBCATEGORIES,
} from "@/lib/constants";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface AddressForm {
  houseNo: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
}

interface FormData {
  // Step 1 — Contact Verification
  mobile: string;
  mobileOtp: string;
  mobileOtpSent: boolean;
  mobileVerified: boolean;
  email: string;
  emailOtp: string;
  emailOtpSent: boolean;
  emailVerified: boolean;
  // Step 2 — Personal Info
  fullName: string;
  dob: string;
  gender: string;
  aadhaar: string;
  aadhaarRaw: string;
  category: string;
  subcategory: string;
  isPwd: string;
  isExServiceman: string;
  // Step 3 — Address
  permanent: AddressForm;
  sameAsPermament: boolean;
  correspondence: AddressForm;
  // Step 4 — Documents
  photoFile: File | null;
  photoPreview: string;
  signatureFile: File | null;
  signaturePreview: string;
  declaration: boolean;
}

const EMPTY_ADDRESS: AddressForm = {
  houseNo: "",
  street: "",
  city: "",
  district: "",
  state: "",
  pinCode: "",
};

const INITIAL_FORM: FormData = {
  mobile: "",
  mobileOtp: "",
  mobileOtpSent: false,
  mobileVerified: false,
  email: "",
  emailOtp: "",
  emailOtpSent: false,
  emailVerified: false,
  fullName: "",
  dob: "",
  gender: "",
  aadhaar: "",
  aadhaarRaw: "",
  category: "",
  subcategory: "",
  isPwd: "No",
  isExServiceman: "No",
  permanent: { ...EMPTY_ADDRESS },
  sameAsPermament: false,
  correspondence: { ...EMPTY_ADDRESS },
  photoFile: null,
  photoPreview: "",
  signatureFile: null,
  signaturePreview: "",
  declaration: false,
};

const MOCK_OTP = "123456";

// ─────────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────────

const STEP_LABELS_EN = [
  "Contact Verification",
  "Personal Details",
  "Address Details",
  "Photo & Signature",
];
const STEP_LABELS_HI = [
  "संपर्क सत्यापन",
  "व्यक्तिगत विवरण",
  "पता विवरण",
  "फ़ोटो और हस्ताक्षर",
];

function StepIndicator({
  currentStep,
  lang,
}: {
  currentStep: number;
  lang: string;
}) {
  const labels = lang === "hi" ? STEP_LABELS_HI : STEP_LABELS_EN;
  return (
    <div className="w-full mb-8">
      <div className="flex items-start justify-between relative">
        {/* connector line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />
        {labels.map((label, i) => {
          const step = i + 1;
          const isDone = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div
              key={step}
              className="flex flex-col items-center z-10 gap-1.5"
              style={{ flex: 1 }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm transition-all duration-300 ${
                  isDone
                    ? "bg-green-600 border-green-600 text-white"
                    : isActive
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-110"
                      : "bg-card border-border text-muted-foreground"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              <span
                className={`text-xs text-center leading-tight max-w-[72px] ${
                  isActive
                    ? "text-primary font-semibold"
                    : isDone
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OTP Field sub-component
// ─────────────────────────────────────────────

function OtpField({
  label,
  value,
  onChange,
  onSend,
  onVerify,
  otpValue,
  onOtpChange,
  otpSent,
  verified,
  placeholder,
  type = "text",
  isSending,
  isVerifying,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onVerify: () => void;
  otpValue: string;
  onOtpChange: (v: string) => void;
  otpSent: boolean;
  verified: boolean;
  placeholder: string;
  type?: string;
  isSending: boolean;
  isVerifying: boolean;
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={verified}
          className="flex-1"
          data-ocid={`input-${label.toLowerCase().replace(/\s/g, "-")}`}
        />
        {!verified && (
          <Button
            type="button"
            variant="outline"
            onClick={onSend}
            disabled={!value || isSending}
            className="whitespace-nowrap shrink-0"
            data-ocid={`btn-send-otp-${label.toLowerCase().replace(/\s/g, "-")}`}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Send OTP"
            )}
          </Button>
        )}
        {verified && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 shrink-0 px-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Verified</span>
          </div>
        )}
      </div>
      <AnimatePresence>
        {otpSent && !verified && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex gap-2"
          >
            <Input
              type="text"
              maxLength={6}
              value={otpValue}
              onChange={(e) =>
                onOtpChange(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit OTP"
              className="flex-1 font-mono tracking-widest text-center"
              data-ocid="input-otp-code"
            />
            <Button
              type="button"
              onClick={onVerify}
              disabled={otpValue.length !== 6 || isVerifying}
              data-ocid="btn-verify-otp"
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Verify OTP"
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      {otpSent && !verified && (
        <p className="text-xs text-muted-foreground">
          OTP sent! Use <strong>123456</strong> for testing.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Address Sub-Form
// ─────────────────────────────────────────────

function AddressSubForm({
  title,
  addr,
  onChange,
  errors,
}: {
  title: string;
  addr: AddressForm;
  onChange: (field: keyof AddressForm, value: string) => void;
  errors: Partial<Record<keyof AddressForm, string>>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Door No. / House No. *</Label>
          <Input
            value={addr.houseNo}
            onChange={(e) => onChange("houseNo", e.target.value)}
            placeholder="e.g. H.No. 12/3"
          />
          {errors.houseNo && (
            <p className="text-xs text-destructive">{errors.houseNo}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Street / Locality *</Label>
          <Input
            value={addr.street}
            onChange={(e) => onChange("street", e.target.value)}
            placeholder="Street name, area"
          />
          {errors.street && (
            <p className="text-xs text-destructive">{errors.street}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>City *</Label>
          <Input
            value={addr.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="City"
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>District *</Label>
          <Input
            value={addr.district}
            onChange={(e) => onChange("district", e.target.value)}
            placeholder="District"
          />
          {errors.district && (
            <p className="text-xs text-destructive">{errors.district}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>State *</Label>
          <Select
            value={addr.state}
            onValueChange={(v) => onChange("state", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && (
            <p className="text-xs text-destructive">{errors.state}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>PIN Code *</Label>
          <Input
            value={addr.pinCode}
            onChange={(e) =>
              onChange("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="6-digit PIN"
            maxLength={6}
          />
          {errors.pinCode && (
            <p className="text-xs text-destructive">{errors.pinCode}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// File Upload Sub-component
// ─────────────────────────────────────────────

function DocumentUpload({
  label,
  instructions,
  accept,
  maxKB,
  preview,
  onSelect,
  onClear,
  error,
  ocid,
}: {
  label: string;
  instructions: string;
  accept: string;
  maxKB: number;
  preview: string;
  onSelect: (file: File, preview: string) => void;
  onClear: () => void;
  error?: string;
  ocid: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxKB * 1024) {
      alert(`File size must be under ${maxKB}KB`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onSelect(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      <p className="text-xs text-muted-foreground bg-muted/40 px-3 py-2 rounded border border-border">
        {instructions}
      </p>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt={label}
            className="w-32 h-32 object-cover rounded border-2 border-primary/30 shadow"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Remove file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> File selected
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          data-ocid={ocid}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:border-primary/60 hover:bg-primary/5 transition-all cursor-pointer gap-2"
        >
          <Upload className="w-7 h-7 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">
            Click to Upload
          </span>
          <span className="text-xs text-muted-foreground/70">
            JPG/PNG, max {maxKB}KB
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Registration Page
// ─────────────────────────────────────────────

export default function Register() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addrErrors, setAddrErrors] = useState<
    Partial<Record<keyof AddressForm, string>>
  >({});
  const [corrAddrErrors, setCorrAddrErrors] = useState<
    Partial<Record<keyof AddressForm, string>>
  >({});
  const [successRegId, setSuccessRegId] = useState<string | null>(null);
  const [isSendingMobile, setIsSendingMobile] = useState(false);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const registerUser = useRegisterUser();
  const requestOTP = useRequestOTP();
  const verifyOTP = useVerifyOTP();
  const updatePhoto = useUpdatePhotoUrl();
  const updateSignature = useUpdateSignatureUrl();

  // Auto-redirect on success
  useEffect(() => {
    if (!successRegId) return;
    const timer = setTimeout(() => navigate({ to: "/login" }), 3000);
    return () => clearTimeout(timer);
  }, [successRegId, navigate]);

  // ── Helpers ──

  const setField = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const setAddrField = (
    section: "permanent" | "correspondence",
    field: keyof AddressForm,
    val: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: val },
    }));
  };

  const maskAadhaar = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 12);
    const groups: string[] = [];
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    return groups.join("-");
  };

  // ── OTP Handlers ──

  const handleSendMobileOtp = async () => {
    if (!/^\d{10}$/.test(form.mobile)) {
      setErrors((e) => ({
        ...e,
        mobile: "Enter a valid 10-digit mobile number",
      }));
      return;
    }
    setIsSendingMobile(true);
    try {
      await requestOTP.mutateAsync(form.mobile);
    } catch {
      // mock: ignore errors
    }
    setField("mobileOtpSent", true);
    setIsSendingMobile(false);
  };

  const handleVerifyMobileOtp = async () => {
    setIsVerifyingMobile(true);
    try {
      if (form.mobileOtp === MOCK_OTP) {
        setField("mobileVerified", true);
      } else {
        await verifyOTP.mutateAsync({
          contact: form.mobile,
          code: form.mobileOtp,
        });
        setField("mobileVerified", true);
      }
    } catch {
      setErrors((e) => ({ ...e, mobileOtp: "Invalid OTP. Please try again." }));
    }
    setIsVerifyingMobile(false);
  };

  const handleSendEmailOtp = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors((e) => ({ ...e, email: "Enter a valid email address" }));
      return;
    }
    setIsSendingEmail(true);
    try {
      await requestOTP.mutateAsync(form.email);
    } catch {
      // mock: ignore errors
    }
    setField("emailOtpSent", true);
    setIsSendingEmail(false);
  };

  const handleVerifyEmailOtp = async () => {
    setIsVerifyingEmail(true);
    try {
      if (form.emailOtp === MOCK_OTP) {
        setField("emailVerified", true);
      } else {
        await verifyOTP.mutateAsync({
          contact: form.email,
          code: form.emailOtp,
        });
        setField("emailVerified", true);
      }
    } catch {
      setErrors((e) => ({ ...e, emailOtp: "Invalid OTP. Please try again." }));
    }
    setIsVerifyingEmail(false);
  };

  // ── Step Validation ──

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.mobileVerified)
      errs.mobileVerified = "Mobile number must be verified";
    if (!form.emailVerified)
      errs.emailVerified = "Email address must be verified";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    if (!form.gender) errs.gender = "Gender is required";
    if (form.aadhaarRaw.replace(/\D/g, "").length !== 12)
      errs.aadhaar = "Aadhaar must be 12 digits";
    if (!form.category) errs.category = "Category is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateAddress = (addr: AddressForm) => {
    const e: Partial<Record<keyof AddressForm, string>> = {};
    if (!addr.houseNo.trim()) e.houseNo = "Required";
    if (!addr.street.trim()) e.street = "Required";
    if (!addr.city.trim()) e.city = "Required";
    if (!addr.district.trim()) e.district = "Required";
    if (!addr.state) e.state = "Required";
    if (!/^\d{6}$/.test(addr.pinCode)) e.pinCode = "Enter valid 6-digit PIN";
    return e;
  };

  const validateStep3 = () => {
    const permErr = validateAddress(form.permanent);
    setAddrErrors(permErr);
    let corrErr: Partial<Record<keyof AddressForm, string>> = {};
    if (!form.sameAsPermament) {
      corrErr = validateAddress(form.correspondence);
      setCorrAddrErrors(corrErr);
    } else {
      setCorrAddrErrors({});
    }
    return (
      Object.keys(permErr).length === 0 && Object.keys(corrErr).length === 0
    );
  };

  const validateStep4 = () => {
    const errs: Record<string, string> = {};
    if (!form.photoFile) errs.photo = "Photograph is required";
    if (!form.signatureFile) errs.signature = "Signature is required";
    if (!form.declaration) errs.declaration = "You must accept the declaration";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Navigation ──

  const handleNext = () => {
    const validators: (() => boolean)[] = [
      validateStep1,
      validateStep2,
      validateStep3,
      () => true,
    ];
    if (validators[step - 1]()) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ──

  const handleSubmit = async () => {
    if (!validateStep4()) return;

    // AddressType uses permanent address (single address per backend schema)
    const address: AddressType = {
      doorNo: form.permanent.houseNo,
      street: form.permanent.street,
      city: form.permanent.city,
      district: form.permanent.district,
      state: form.permanent.state,
      pincode: form.permanent.pinCode,
    };

    try {
      const result = await registerUser.mutateAsync({
        name: form.fullName,
        mobile: form.mobile,
        email: form.email,
        aadhaar: form.aadhaarRaw.replace(/\D/g, ""),
        dob: form.dob,
        gender: form.gender,
        category: form.category,
        subcategory: form.subcategory || "NONE",
        address,
      });

      // Upload photo and signature (mock URLs using data URIs for demo)
      if (form.photoPreview) {
        try {
          await updatePhoto.mutateAsync(form.photoPreview.slice(0, 200));
        } catch {
          /* ignore */
        }
      }
      if (form.signaturePreview) {
        try {
          await updateSignature.mutateAsync(
            form.signaturePreview.slice(0, 200),
          );
        } catch {
          /* ignore */
        }
      }

      const regId =
        typeof result === "string"
          ? result
          : `REG${Date.now().toString().slice(-8)}`;
      setSuccessRegId(regId);
    } catch {
      setErrors((e) => ({
        ...e,
        submit: "Registration failed. Please try again.",
      }));
    }
  };

  // ── Max DOB ──
  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  })();

  // ─────────────────────────────────────────────
  // Render Success
  // ─────────────────────────────────────────────

  if (successRegId) {
    return (
      <div className="max-w-lg mx-auto mt-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-xl p-8 text-center shadow-lg"
          data-ocid="registration-success"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            {t("pages.register.success")}
          </h2>
          <div className="mt-3 bg-primary/10 border border-primary/30 rounded-lg px-6 py-4">
            <p className="text-xs text-muted-foreground mb-1">
              Registration ID
            </p>
            <p className="font-mono text-xl font-bold text-primary tracking-widest">
              {successRegId}
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Please note your Registration ID for future reference.
            <br />
            Redirecting to login in <strong>3 seconds</strong>…
          </p>
          <Badge variant="secondary" className="mt-3">
            Redirecting to Login…
          </Badge>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Render Form
  // ─────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 pb-12">
      <PageTitle
        title={t("pages.register.title")}
        subtitle={t("pages.register.subtitle")}
      />

      {/* Step Indicator */}
      <StepIndicator currentStep={step} lang={lang} />

      {/* Step Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
        >
          {/* Step header */}
          <div className="bg-muted/30 border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground text-base">
                Step {step} of 4 —{" "}
                <span className="text-primary">
                  {lang === "hi"
                    ? STEP_LABELS_HI[step - 1]
                    : STEP_LABELS_EN[step - 1]}
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Complete all required fields to proceed
              </p>
            </div>
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {step}/4
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-muted/30 border border-border rounded-lg px-4 py-3 text-xs text-muted-foreground">
                  <AlertCircle className="inline w-3.5 h-3.5 mr-1.5 mb-0.5" />
                  Both mobile number and email must be verified before
                  proceeding.
                </div>

                <OtpField
                  label="Mobile Number *"
                  type="tel"
                  value={form.mobile}
                  onChange={(v) =>
                    setField("mobile", v.replace(/\D/g, "").slice(0, 10))
                  }
                  onSend={handleSendMobileOtp}
                  onVerify={handleVerifyMobileOtp}
                  otpValue={form.mobileOtp}
                  onOtpChange={(v) => setField("mobileOtp", v)}
                  otpSent={form.mobileOtpSent}
                  verified={form.mobileVerified}
                  placeholder="10-digit mobile number"
                  isSending={isSendingMobile}
                  isVerifying={isVerifyingMobile}
                />
                {errors.mobileVerified && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.mobileVerified}
                  </p>
                )}
                {errors.mobileOtp && (
                  <p className="text-xs text-destructive">{errors.mobileOtp}</p>
                )}

                <div className="border-t border-border" />

                <OtpField
                  label="Email Address *"
                  type="email"
                  value={form.email}
                  onChange={(v) => setField("email", v)}
                  onSend={handleSendEmailOtp}
                  onVerify={handleVerifyEmailOtp}
                  otpValue={form.emailOtp}
                  onOtpChange={(v) => setField("emailOtp", v)}
                  otpSent={form.emailOtpSent}
                  verified={form.emailVerified}
                  placeholder="your@email.com"
                  isSending={isSendingEmail}
                  isVerifying={isVerifyingEmail}
                />
                {errors.emailVerified && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.emailVerified}
                  </p>
                )}
                {errors.emailOtp && (
                  <p className="text-xs text-destructive">{errors.emailOtp}</p>
                )}
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">
                    {t("pages.register.fullName")} *
                  </Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    placeholder="As per school certificate"
                    data-ocid="input-full-name"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DOB */}
                  <div className="space-y-1.5">
                    <Label htmlFor="dob">{t("pages.register.dob")} *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={form.dob}
                      max={maxDob}
                      onChange={(e) => setField("dob", e.target.value)}
                      data-ocid="input-dob"
                    />
                    {errors.dob && (
                      <p className="text-xs text-destructive">{errors.dob}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label>{t("pages.register.gender")} *</Label>
                    <RadioGroup
                      value={form.gender}
                      onValueChange={(v) => setField("gender", v)}
                      className="flex flex-wrap gap-3 mt-1"
                      data-ocid="radio-gender"
                    >
                      {GENDER_OPTIONS.map((g) => (
                        <div
                          key={g.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={g.value}
                            id={`gender-${g.value}`}
                          />
                          <Label
                            htmlFor={`gender-${g.value}`}
                            className="cursor-pointer font-normal"
                          >
                            {g.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {errors.gender && (
                      <p className="text-xs text-destructive">
                        {errors.gender}
                      </p>
                    )}
                  </div>
                </div>

                {/* Aadhaar */}
                <div className="space-y-1.5">
                  <Label htmlFor="aadhaar">
                    {t("pages.register.aadhaar")} *
                  </Label>
                  <Input
                    id="aadhaar"
                    value={form.aadhaar}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);
                      setField("aadhaarRaw", raw);
                      setField("aadhaar", maskAadhaar(raw));
                    }}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    data-ocid="input-aadhaar"
                  />
                  <p className="text-xs text-muted-foreground">
                    Displayed masked for security. 12 digits required.
                  </p>
                  {errors.aadhaar && (
                    <p className="text-xs text-destructive">{errors.aadhaar}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label>{t("pages.register.category")} *</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => {
                        setField("category", v);
                        setField("subcategory", "");
                      }}
                    >
                      <SelectTrigger data-ocid="select-category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-xs text-destructive">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Sub-category */}
                  <div className="space-y-1.5">
                    <Label>{t("pages.register.subcategory")}</Label>
                    <Select
                      value={form.subcategory}
                      onValueChange={(v) => setField("subcategory", v)}
                    >
                      <SelectTrigger data-ocid="select-subcategory">
                        <SelectValue placeholder="Select Sub-Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBCATEGORIES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* PwD & Ex-Serviceman */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Person with Disability (PwD)</Label>
                    <RadioGroup
                      value={form.isPwd}
                      onValueChange={(v) => setField("isPwd", v)}
                      className="flex gap-4"
                    >
                      {["Yes", "No"].map((v) => (
                        <div key={v} className="flex items-center space-x-2">
                          <RadioGroupItem value={v} id={`pwd-${v}`} />
                          <Label
                            htmlFor={`pwd-${v}`}
                            className="cursor-pointer font-normal"
                          >
                            {v}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label>Ex-Serviceman</Label>
                    <RadioGroup
                      value={form.isExServiceman}
                      onValueChange={(v) => setField("isExServiceman", v)}
                      className="flex gap-4"
                    >
                      {["Yes", "No"].map((v) => (
                        <div key={v} className="flex items-center space-x-2">
                          <RadioGroupItem value={v} id={`exsm-${v}`} />
                          <Label
                            htmlFor={`exsm-${v}`}
                            className="cursor-pointer font-normal"
                          >
                            {v}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <div className="space-y-6">
                <AddressSubForm
                  title="Permanent Address"
                  addr={form.permanent}
                  onChange={(field, val) =>
                    setAddrField("permanent", field, val)
                  }
                  errors={addrErrors}
                />

                <div className="flex items-center gap-3 py-2 border-t border-border">
                  <Checkbox
                    id="sameAddr"
                    checked={form.sameAsPermament}
                    onCheckedChange={(c) =>
                      setField("sameAsPermament", c === true)
                    }
                    data-ocid="checkbox-same-address"
                  />
                  <Label
                    htmlFor="sameAddr"
                    className="cursor-pointer text-sm font-medium"
                  >
                    Correspondence address same as Permanent address
                  </Label>
                </div>

                {!form.sameAsPermament && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AddressSubForm
                      title="Correspondence Address"
                      addr={form.correspondence}
                      onChange={(field, val) =>
                        setAddrField("correspondence", field, val)
                      }
                      errors={corrAddrErrors}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {/* ── STEP 4 ── */}
            {step === 4 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <DocumentUpload
                    label="Photograph *"
                    instructions="Recent passport-size photograph with white background. Dimensions: min 200×200px. Format: JPG/PNG. Max size: 50KB."
                    accept="image/jpeg,image/png"
                    maxKB={50}
                    preview={form.photoPreview}
                    onSelect={(file, preview) => {
                      setField("photoFile", file);
                      setField("photoPreview", preview);
                    }}
                    onClear={() => {
                      setField("photoFile", null);
                      setField("photoPreview", "");
                    }}
                    error={errors.photo}
                    ocid="upload-photo"
                  />

                  <DocumentUpload
                    label="Signature *"
                    instructions="Signature on white paper in black ink, scanned clearly. Format: JPG/PNG. Max size: 20KB."
                    accept="image/jpeg,image/png"
                    maxKB={20}
                    preview={form.signaturePreview}
                    onSelect={(file, preview) => {
                      setField("signatureFile", file);
                      setField("signaturePreview", preview);
                    }}
                    onClear={() => {
                      setField("signatureFile", null);
                      setField("signaturePreview", "");
                    }}
                    error={errors.signature}
                    ocid="upload-signature"
                  />
                </div>

                {/* Declaration */}
                <div
                  className={`border rounded-lg p-4 ${
                    errors.declaration
                      ? "border-destructive bg-destructive/5"
                      : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex gap-3">
                    <Checkbox
                      id="declaration"
                      checked={form.declaration}
                      onCheckedChange={(c) =>
                        setField("declaration", c === true)
                      }
                      data-ocid="checkbox-declaration"
                    />
                    <Label
                      htmlFor="declaration"
                      className="cursor-pointer text-sm leading-relaxed font-normal"
                    >
                      I hereby declare that all the information provided above
                      is true and correct to the best of my knowledge and
                      belief. I understand that if any information is found to
                      be false, my candidature/appointment is liable to be
                      cancelled.
                    </Label>
                  </div>
                  {errors.declaration && (
                    <p className="text-xs text-destructive mt-2 ml-7">
                      {errors.declaration}
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errors.submit}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1}
              data-ocid="btn-previous"
            >
              {t("common.previous")}
            </Button>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    s === step
                      ? "bg-primary scale-125"
                      : s < step
                        ? "bg-green-500"
                        : "bg-border"
                  }`}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button type="button" onClick={handleNext} data-ocid="btn-next">
                {t("common.next")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!form.declaration || registerUser.isPending}
                data-ocid="btn-submit-registration"
              >
                {registerUser.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting…
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
