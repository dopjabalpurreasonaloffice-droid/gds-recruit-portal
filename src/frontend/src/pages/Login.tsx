import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type LoginTab = "mobile" | "email";

interface FormErrors {
  mobile?: string;
  otp?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<LoginTab>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  function validateMobileTab(): boolean {
    const errs: FormErrors = {};
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      errs.mobile = "Please enter a valid 10-digit mobile number.";
    }
    if (otpSent && (!otp || !/^\d{6}$/.test(otp))) {
      errs.otp = "Please enter the 6-digit OTP sent to your mobile.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateEmailTab(): boolean {
    const errs: FormErrors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 6) {
      errs.password = "Password must be at least 6 characters.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSendOtp() {
    const errs: FormErrors = {};
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      errs.mobile = "Please enter a valid 10-digit mobile number.";
      setErrors(errs);
      return;
    }
    setErrors({});
    setOtpLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setOtpLoading(false);
    setOtpSent(true);
    setOtpSuccess(true);
    setTimeout(() => setOtpSuccess(false), 3000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeTab === "mobile") {
      if (!validateMobileTab()) return;
      if (!otpSent) {
        await handleSendOtp();
        return;
      }
    } else {
      if (!validateEmailTab()) return;
    }

    setLoading(true);
    setErrors({});

    const identifier = activeTab === "mobile" ? mobile : email;
    const result = await login({
      identifier,
      password: password || "otp-auth",
    });

    setLoading(false);
    if (!result.success) {
      setErrors({ general: result.message || t("auth.loginFailed") });
      return;
    }

    const raw = localStorage.getItem("portal-user");
    if (raw) {
      const user = JSON.parse(raw) as { role: string };
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/apply" });
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-xl overflow-hidden border border-border shadow-lg">
          {/* Header */}
          <div className="bg-primary px-6 py-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-primary-foreground/80" />
              <h1 className="font-display text-xl font-bold text-primary-foreground tracking-wide">
                {t("auth.loginTitle")}
              </h1>
            </div>
            <p className="text-primary-foreground/70 text-xs">
              {t("auth.loginSubtitle")}
            </p>
          </div>

          {/* Tab switcher */}
          <div
            className="grid grid-cols-2 border-b border-border bg-card"
            role="tablist"
          >
            {(["mobile", "email"] as LoginTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => {
                  setActiveTab(tab);
                  setErrors({});
                  setOtpSent(false);
                }}
                data-ocid={`login-tab-${tab}`}
                className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                  activeTab === tab
                    ? "bg-background text-primary border-b-2 border-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-b-2 border-transparent"
                }`}
              >
                {tab === "mobile" ? (
                  <Phone className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                {tab === "mobile" ? "Login with Mobile" : "Login with Email"}
              </button>
            ))}
          </div>

          {/* Form body */}
          <div className="bg-background px-6 py-6">
            <form onSubmit={handleSubmit} noValidate>
              <AnimatePresence mode="wait">
                {activeTab === "mobile" ? (
                  <motion.div
                    key="mobile"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Mobile input */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="mobile-input"
                        className="text-sm font-medium"
                      >
                        {t("auth.mobile")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <div className="flex items-center border border-border rounded-md px-3 bg-muted text-sm text-muted-foreground shrink-0 h-10">
                          +91
                        </div>
                        <Input
                          id="mobile-input"
                          type="tel"
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number"
                          value={mobile}
                          onChange={(e) =>
                            setMobile(e.target.value.replace(/\D/g, ""))
                          }
                          data-ocid="login-mobile-input"
                          className={`h-10 ${errors.mobile ? "border-destructive" : ""}`}
                          disabled={loading}
                        />
                      </div>
                      {errors.mobile && (
                        <p className="text-destructive text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.mobile}
                        </p>
                      )}
                    </div>

                    {/* Send OTP button */}
                    {!otpSent && (
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        data-ocid="login-send-otp-btn"
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                            Sending OTP...
                          </>
                        ) : (
                          t("auth.sendOtp")
                        )}
                      </Button>
                    )}

                    {/* OTP sent success */}
                    {otpSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        OTP sent to +91 {mobile}.
                      </motion.p>
                    )}

                    {/* OTP field */}
                    <AnimatePresence>
                      {otpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5"
                        >
                          <Label
                            htmlFor="otp-input"
                            className="text-sm font-medium"
                          >
                            {t("auth.otp")}{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="otp-input"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            data-ocid="login-otp-input"
                            className={`h-10 ${errors.otp ? "border-destructive" : ""}`}
                            disabled={loading}
                          />
                          {errors.otp && (
                            <p className="text-destructive text-xs flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {errors.otp}
                            </p>
                          )}
                          <button
                            type="button"
                            className="text-xs text-primary hover:underline mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                            onClick={handleSendOtp}
                          >
                            Resend OTP
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Email input */}
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="email-input"
                        className="text-sm font-medium"
                      >
                        {t("auth.email")}{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email-input"
                        type="email"
                        placeholder="e.g. candidate@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        data-ocid="login-email-input"
                        className={`h-10 ${errors.email ? "border-destructive" : ""}`}
                        disabled={loading}
                      />
                      {errors.email && (
                        <p className="text-destructive text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password input */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="password-input"
                          className="text-sm font-medium"
                        >
                          {t("auth.password")}{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                          data-ocid="login-forgot-password"
                        >
                          {t("auth.forgotPassword")}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="password-input"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          data-ocid="login-password-input"
                          className={`h-10 ${
                            errors.password
                              ? "border-destructive pr-10"
                              : "pr-10"
                          }`}
                          disabled={loading}
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-destructive text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {errors.password}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* General error */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive"
                    data-ocid="login-error-state"
                    role="alert"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errors.general}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full mt-5 h-10 font-semibold"
                disabled={loading || (activeTab === "mobile" && !otpSent)}
                data-ocid="login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing
                    In...
                  </>
                ) : (
                  "Login / Sign In"
                )}
              </Button>
            </form>

            {/* Register link */}
            <p className="mt-4 text-center text-sm text-muted-foreground">
              New User?{" "}
              <Link
                to="/register"
                className="text-primary font-medium hover:underline transition-colors duration-150"
                data-ocid="login-register-link"
              >
                Register Here
              </Link>
            </p>
            {/* Candidate portal link */}
            <div className="mt-3 text-center">
              <Link
                to="/candidate/login"
                className="text-sm text-[#B22222] font-semibold hover:underline inline-flex items-center gap-1 transition-colors duration-150"
                data-ocid="login-candidate-portal-link"
              >
                Already Registered? → Candidate Login Portal
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/40 border-t border-border px-5 py-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This portal is for <strong>India Post GDS Recruitment</strong>{" "}
              only. Unauthorised access is strictly prohibited and punishable
              under IT Act 2000.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
