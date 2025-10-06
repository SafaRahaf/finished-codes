// utils/auth.ts
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

export function getDecodedToken() {
  const token = getCookie("access_token");
  if (typeof token === "string" && token.trim()) {
    try {
      return jwtDecode(token);
    } catch (err) {
      console.error("Failed to decode token:", err);
    }
  }
  return null;
}

// New function to get org short name from Redux store or localStorage
export function getOrgShortName() {
  if (typeof window !== "undefined") {
    // First try to get from localStorage
    const storedOrgShortName = localStorage.getItem("org_short_name");
    if (storedOrgShortName) {
      return storedOrgShortName;
    }

    // Fallback to token
    const decoded = getDecodedToken();
    return decoded?.org_short_name || null;
  }
  return null;
}
