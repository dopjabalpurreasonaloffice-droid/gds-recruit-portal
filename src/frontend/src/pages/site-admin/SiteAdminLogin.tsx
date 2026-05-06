import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  attemptSiteAdminLogin,
  isSiteAdminTokenValid,
} from "@/lib/site-admin-auth";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Globe, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function AshokaStambh({ className }: { className?: string }) {
  return (
    <img
      src="/assets/generated/ashoka-emblem-transparent.dim_200x220.png"
      alt="Ashoka Stambh"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

function IndiaPostLogo({ className }: { className?: string }) {
  return (
    <img
      src="/assets/images/india-post-logo.jpg"
      alt="India Post"
      className={cn("object-contain", className)}
      draggable={false}
    />
  );
}

export default function SiteAdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (isSiteAdminTokenValid()) {
      window.location.href = "/site-admin/dashboard";
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter username and password");
      return;
    }
    setIsPending(true);
    setTimeout(() => {
      const token = attemptSiteAdminLogin(username.trim(), password);
      if (token) {
        toast.success("Login successful! Welcome, Site Admin.");
        window.location.href = "/site-admin/dashboard";
      } else {
        toast.error("Invalid username or password");
        setIsPending(false);
      }
    }, 400);
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-muted/40"
      data-ocid="site-admin-login-page"
    >
      {/* Government top bar */}
      <div className="w-full bg-[#154360] px-4 py-1.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex flex-col w-5 h-3.5 rounded-sm overflow-hidden shrink-0">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#138808]" />
            </div>
            <span className="text-white text-xs font-semibold">
              भारत सरकार / Government of India
            </span>
          </div>
          <span className="text-blue-300 text-[10px] uppercase font-semibold bg-blue-900/40 px-2 py-0.5 rounded">
            Website Admin Panel
          </span>
        </div>
      </div>

      {/* Centered card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {/* Government branding */}
        <div className="flex items-center gap-5 mb-8">
          <AshokaStambh className="h-16 w-auto" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
              भारत सरकार / Government of India
            </p>
            <p className="text-sm font-semibold text-foreground leading-tight">
              Department of Post, Ministry of Communication
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              O/o The Chief Postmaster General, MP Circle
            </p>
          </div>
          <IndiaPostLogo className="h-16 w-auto" />
        </div>

        {/* Login card */}
        <div className="w-full max-w-md">
          {/* Icon + title */}
          <div className="flex flex-col items-center mb-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center shadow-lg ring-4 ring-blue-700/20">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Website Content Admin
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                GDS Portal — Website Control Panel
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-card border border-border rounded-xl shadow-md p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="site-admin-username"
                  className="text-sm font-medium"
                >
                  Username
                </Label>
                <Input
                  id="site-admin-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter user ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isPending}
                  data-ocid="site-admin-login-username"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="site-admin-password"
                  className="text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="site-admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    data-ocid="site-admin-login-password"
                    className="h-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    tabIndex={-1}
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
                className="w-full h-10 font-semibold bg-blue-700 hover:bg-blue-800 text-white gap-2 transition-colors"
                disabled={isPending}
                data-ocid="site-admin-login-submit"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In to Website Admin
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer links + note */}
          <div className="mt-5 text-center space-y-2">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              Authorized personnel only. All activity is logged.
            </p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="/"
                className="text-xs text-blue-700 hover:text-blue-800 hover:underline transition-colors"
                data-ocid="site-admin-login-back-home"
              >
                ← Back to Public Portal
              </a>
              <span className="text-xs text-border">|</span>
              <a
                href="/admin/login"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
                data-ocid="site-admin-login-candidate-admin"
              >
                Candidate Admin Panel →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
