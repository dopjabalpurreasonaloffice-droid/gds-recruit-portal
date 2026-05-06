import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Loading fallback shown while app chunks load
function AppLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #1d4ed8",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          Loading GDS Recruitment Portal…
        </p>
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    </div>
  );
}

// Wrap InternetIdentityProvider in its own ErrorBoundary so a provider crash
// doesn't kill the whole app — the portal UI should still render without II.
function SafeIdentityProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={children}>
      <InternetIdentityProvider>{children}</InternetIdentityProvider>
    </ErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) {
  console.error("[main] #root element not found — cannot mount React app");
} else {
  ReactDOM.createRoot(root).render(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeIdentityProvider>
          <Suspense fallback={<AppLoading />}>
            <App />
          </Suspense>
        </SafeIdentityProvider>
      </QueryClientProvider>
    </ErrorBoundary>,
  );
}
