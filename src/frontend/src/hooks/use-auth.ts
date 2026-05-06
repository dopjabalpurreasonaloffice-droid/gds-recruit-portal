import { useCallback, useEffect, useState } from "react";

export interface AuthUser {
  id: number;
  name: string;
  role: "admin" | "applicant";
  isVerified: boolean;
  mobile?: string;
  email?: string;
}

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

function loadUserFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem("portal-user");
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: loadUserFromStorage(),
    loading: false,
  });

  useEffect(() => {
    // Re-sync from storage on mount
    const user = loadUserFromStorage();
    setState((prev) => ({ ...prev, user }));
  }, []);

  const login = useCallback(
    async (
      credentials: LoginCredentials,
    ): Promise<{ success: boolean; message: string }> => {
      setState((prev) => ({ ...prev, loading: true }));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const { identifier } = credentials;
        const isAdmin =
          identifier.toLowerCase().includes("admin") ||
          identifier === "admin@indiapost.gov.in";

        const user: AuthUser = isAdmin
          ? {
              id: 0,
              name: "Admin User",
              role: "admin",
              isVerified: true,
              email: identifier,
            }
          : {
              id: 1,
              name: "Ramesh Kumar",
              role: "applicant",
              isVerified: true,
              mobile: identifier.match(/^\d{10}$/) ? identifier : undefined,
              email: identifier.includes("@") ? identifier : undefined,
            };

        localStorage.setItem("portal-user", JSON.stringify(user));
        setState({ user, loading: false });
        return { success: true, message: "Login successful!" };
      } catch {
        setState((prev) => ({ ...prev, loading: false }));
        return { success: false, message: "Login failed. Please try again." };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("portal-user");
    setState({ user: null, loading: false });
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.user !== null,
    isAdmin: state.user?.role === "admin",
    login,
    logout,
    loading: state.loading,
  };
}
