import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCandidateLogin } from "@/hooks/useAdminQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Info,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export default function CandidateLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useCandidateLogin();
  const loading = loginMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered Email ID.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    loginMutation.mutate(
      { email: normalizedEmail, password },
      {
        onSuccess: (result) => {
          localStorage.setItem("candidateToken", result.token);
          localStorage.setItem("candidateRegNo", result.registrationNo);
          localStorage.setItem("candidateName", result.name);
          navigate({ to: "/candidate/dashboard" });
        },
        onError: (err) => {
          const msg =
            err instanceof Error
              ? err.message
              : "Email ya password galat hai. Sirf admin-registered candidates login kar sakte hain.";
          setError(msg);
        },
      },
    );
  }

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-xl overflow-hidden border border-border shadow-lg">
          {/* Header */}
          <div
            className="px-6 py-5 text-center"
            style={{ backgroundColor: "#B22222" }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-white/80" />
              <h1 className="font-bold text-xl tracking-wide text-white">
                Candidate Login
              </h1>
            </div>
            <p className="text-white/75 text-xs">
              GDS Online Engagement — Candidate Portal
            </p>
          </div>

          {/* Info bar */}
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Enter your <strong>registered Gmail ID</strong> and use default
              password: <strong>Dop@123</strong>. Only admin-registered
              candidates can access this portal.
            </p>
          </div>

          {/* Form body */}
          <div className="bg-background px-6 py-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="candidate-email-input"
                  className="text-sm font-semibold text-foreground"
                >
                  Email ID / Gmail <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="candidate-email-input"
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-ocid="candidate-login-email-input"
                    className="pl-9 h-10"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="candidate-password-input"
                  className="text-sm font-semibold text-foreground"
                >
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="candidate-password-input"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-ocid="candidate-login-password-input"
                    className="pl-9 h-10"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3 shrink-0 text-blue-500" />
                  Default password: <strong>Dop@123</strong> (as issued by exam
                  office)
                </p>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive"
                  data-ocid="candidate-login-error-state"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-10 font-semibold text-white"
                style={{ backgroundColor: "#B22222" }}
                disabled={loading}
                data-ocid="candidate-login-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Login to Candidate Portal"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <Link
                to="/"
                className="text-[#B22222] font-medium hover:underline transition-colors duration-150"
                data-ocid="candidate-login-home-link"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/40 border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              This portal is for <strong>India Post GDS Recruitment</strong>{" "}
              only. Unauthorised access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
