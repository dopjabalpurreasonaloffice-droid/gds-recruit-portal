import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLogin } from "@/hooks/useAdminQueries";
import { isTokenValid } from "@/lib/admin-auth";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useAdminLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isTokenValid()) {
      void navigate({ to: "/admin/dashboard" });
    }
  }, [navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
    login(
      { username: username.trim(), password },
      {
        onSuccess: () => {
          toast.success("Login successful! Welcome, Admin.");
          window.location.href = "/admin/dashboard";
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Login failed");
        },
      },
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-muted/40 p-4"
      data-ocid="admin-login-page"
    >
      <div className="w-full max-w-md">
        {/* Govt branding strip */}
        <div className="bg-[#154360] rounded-t-xl px-6 py-3 flex items-center gap-3">
          <div className="flex flex-col w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#138808]" />
          </div>
          <div>
            <p className="text-white text-xs font-semibold tracking-wide">
              भारत सरकार / GOVERNMENT OF INDIA
            </p>
            <p className="text-white/70 text-[10px]">
              Department of Post, Ministry of Communication
            </p>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-card border border-border border-t-0 rounded-b-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#B22222] px-6 py-5 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Admin Login
              </h1>
              <p className="text-white/80 text-sm mt-0.5">
                GDS Recruitment Portal — Candidate Admin
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium">
                  User ID
                </Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your user ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isPending}
                  data-ocid="admin-login-username"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    data-ocid="admin-login-password"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-semibold bg-[#B22222] hover:bg-[#9b1c1c] text-white"
                disabled={isPending}
                data-ocid="admin-login-submit"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In to Admin Panel"
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-border text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                Authorized personnel only. All activity is logged.
              </p>
              <a href="/" className="text-xs text-primary hover:underline">
                ← Back to Public Portal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
