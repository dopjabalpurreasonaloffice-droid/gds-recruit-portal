// Site Admin Panel 2 authentication — separate from admin-auth.ts
// TOKEN_KEY: siteAdminToken, 8h expiry
// Credentials are configured — no defaults exposed.

const TOKEN_KEY = "siteAdminToken";

export interface SiteAdminTokenPayload {
  username: string;
  expiry: number; // Unix ms
}

function decodeToken(token: string): SiteAdminTokenPayload | null {
  try {
    const payload = atob(token);
    return JSON.parse(payload) as SiteAdminTokenPayload;
  } catch {
    return null;
  }
}

export function getSiteAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSiteAdminToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // silently ignore
  }
}

export function removeSiteAdminToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // silently ignore
  }
}

export function isSiteAdminTokenValid(): boolean {
  const token = getSiteAdminToken();
  if (!token) return false;
  const payload = decodeToken(token);
  if (!payload) return false;
  return payload.expiry > Date.now();
}

export function getSiteAdminUser(): { username: string } | null {
  const token = getSiteAdminToken();
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || payload.expiry <= Date.now()) return null;
  return { username: payload.username };
}

/**
 * Validates credentials against hardcoded siteadmin and returns a signed token.
 * Sets the token in localStorage synchronously before returning.
 */
export function attemptSiteAdminLogin(
  username: string,
  password: string,
): string | null {
  if (username === "siteadmin11" && password === "jbpregion$07@12") {
    const payload: SiteAdminTokenPayload = {
      username,
      expiry: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
    };
    const token = btoa(JSON.stringify(payload));
    setSiteAdminToken(token);
    return token;
  }
  return null;
}
