"use client";

/**
 * Dynamically resolves the backend API URL based on the browser's current window location.
 * This resolves CORS, Same-Origin Policy violations, and mixed-content issues on production/staging domains.
 */
export const getBackendUrl = (): string => {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
  }
  
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If accessed locally or via private network / Wi-Fi IP (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
  const isLocalOrLan = 
    hostname === "localhost" || 
    hostname === "127.0.0.1" || 
    /^10\./.test(hostname) || 
    /^192\.168\./.test(hostname) || 
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname);

  if (isLocalOrLan) {
    // In local development or multi-device Wi-Fi testing:
    const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    let backendPort = "5001";
    if (envUrl) {
      try {
        const parsed = new URL(envUrl);
        if (parsed.port) backendPort = parsed.port;
      } catch {}
    }
    return `${protocol}//${hostname}:${backendPort}`;
  }
  
  // In remote production domain (e.g., perdinkeuangan.online where Nginx reverse proxies /api on port 80/443)
  return `${protocol}//${window.location.host}`;
};
