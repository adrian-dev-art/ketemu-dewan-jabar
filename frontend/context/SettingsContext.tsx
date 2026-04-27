"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SystemSettings {
  app_name: string;
  app_logo: string;
  app_description: string;
}

interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
}

const defaultSettings: SystemSettings = {
  app_name: "DPRD HUDANG",
  app_logo: "/images/logo-1.png",
  app_description: "Aplikasi konferensi video aspirasi masyarakat bersama DPRD.",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/system/info`);
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch system settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [backendUrl]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
