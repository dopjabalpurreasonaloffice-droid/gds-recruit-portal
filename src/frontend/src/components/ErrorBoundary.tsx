import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "sans-serif",
            background: "#f8f8f8",
            color: "#333",
          }}
        >
          <div
            style={{
              maxWidth: 480,
              textAlign: "center",
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 12,
              padding: "2.5rem 2rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#c00" }}>
              GDS Portal — Loading Error
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "#666" }}>
              The portal encountered an error while loading. Please refresh the
              page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "#b91c1c",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Refresh Page
            </button>
            {this.state.error && (
              <p
                style={{
                  marginTop: 16,
                  fontSize: 11,
                  color: "#999",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
