"use client";

/**
 * Dynamically resolves the backend API URL based on the browser's current window location.
 * This resolves CORS, Same-Origin Policy violations, and mixed-content issues on production/staging domains.
 */
export const getBackendUrl = (): string => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If the browser is visiting a remote production/staging domain (e.g., perdinkeuangan.online)
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    // Return same domain. Requests will go to https://perdinkeuangan.online/api/...
    // which is proxied by Nginx to the backend container.
    return `${protocol}//${window.location.host}`;
  }
  
  // In local development, fallback to the configured environment variable or localhost:5000
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
};
