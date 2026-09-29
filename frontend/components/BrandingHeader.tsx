"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ThemeToggle from "@/components/ThemeToggle";
import { useSettings } from "@/context/SettingsContext";

export default function BrandingHeader() {
  const { settings } = useSettings();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/60">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity group flex-shrink-0"
        >
          {settings.app_logo ? (
            <img
              src={settings.app_logo}
              alt="Logo"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-lg">{settings.app_name.charAt(0)}</span>
            </div>
          )}
          <div>
            {!settings.app_logo && (
              <h1 className="text-xl font-bold tracking-tight font-outfit leading-none">
                {settings.app_name.split(" ")[0]}
                <span className="text-primary">
                  {settings.app_name.split(" ").slice(1).join(" ")}
                </span>
              </h1>
            )}
            <p className="hidden sm:block text-[9px] text-muted-foreground font-bold mt-0.5 uppercase tracking-wider">
              Sekretariat DPRD Jawa Barat
            </p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2 flex-shrink-0">
          <Navbar />
          <div className="w-px h-4 bg-border mx-1" />
          <ThemeToggle />
        </nav>

        {/* Mobile: ThemeToggle only (navigation provided by MobileBottomNav) */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
