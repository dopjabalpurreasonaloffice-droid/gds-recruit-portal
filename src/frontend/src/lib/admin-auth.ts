// Admin authentication — JWT-style token stored in localStorage
// Token payload: base64(JSON({ username, expiry }))
// Credentials are configured — no defaults exposed.

const TOKEN_KEY = "adminToken";

export interface AdminTokenPayload {
  username: string;
  expiry: number; // Unix ms
}

function decodeToken(token: string): AdminTokenPayload | null {
  try {
    const payload = atob(token);
    return JSON.parse(payload) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // silently ignore
  }
}

export function removeAdminToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // silently ignore
  }
}

export function isTokenValid(): boolean {
  const token = getAdminToken();
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload) return false;
  return payload.expiry > Date.now();
}

export function getAdminUser(): { username: string } | null {
  const token = getAdminToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || payload.expiry <= Date.now()) return null;
  return { username: payload.username };
}

/**
 * Validates credentials against hardcoded admin and returns a signed token.
 * Sets the token in localStorage immediately before returning.
 */
export function attemptAdminLogin(
  username: string,
  password: string,
): string | null {
  if (username === "jbpinsp481666" && password === "jbpadmin$07@12") {
    const payload: AdminTokenPayload = {
      username,
      expiry: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    };
    const token = btoa(JSON.stringify(payload));
    // Set token synchronously so route guards see it immediately
    setAdminToken(token);
    return token;
  }
  return null;
}
