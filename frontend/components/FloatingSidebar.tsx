"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Home,
  BarChart3,
  Map,
  Globe,
  Users,
  Landmark,
  ShieldCheck,
  User,
  LogOut,
  X,
  Settings,
  ChevronRight,
  Sparkles,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function FloatingSidebar() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on path change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock scroll on mobile when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Super Admin",
          className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
        };
      case "dewan":
        return {
          label: "Anggota Dewan",
          className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
        };
      case "masyarakat":
      default:
        return {
          label: "Konstituen Warga",
          className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        };
    }
  };

  const navItemClass = (path: string) => {
    const active = isActive(path);
    return `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 ${
      active
        ? "bg-primary text-white shadow-md shadow-primary/25 font-bold"
        : "text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-neutral-800/70 hover:translate-x-0.5"
    }`;
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      
      {/* ── 1. Top Section: Clean Unified Brand Header (PINNED) ── */}
      <div className="shrink-0 pb-3 mb-1 border-b border-border/60">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-between gap-2.5 p-2 rounded-2xl hover:bg-muted/50 transition-colors group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {settings.app_logo ? (
              <img
                src={settings.app_logo}
                alt={settings.app_name || "HUDANG"}
                className="h-9 w-auto max-h-9 object-contain group-hover:scale-102 transition-transform"
              />
            ) : (
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-black">
                {settings.app_name?.charAt(0) || "D"}
              </div>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </Link>

        <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-muted-foreground font-medium">
          <span className="truncate">Sekretariat DPRD Jawa Barat</span>
          <span className="font-mono text-primary font-bold text-[10px] bg-primary/10 px-1.5 py-0.5 rounded">v2.5</span>
        </div>
      </div>

      {/* ── 2. Middle Section: Navigation Menu (SCROLLABLE with generous padding) ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-3.5 space-y-5 pr-1 pb-4">
        
        {/* Group A: Panel Navigasi */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
              Panel Navigasi
            </span>
            <Layers size={13} className="text-muted-foreground/40" />
          </div>

          {(user?.role === "masyarakat" || user?.role === "admin") && (
            <Link
              href="/masyarakat"
              onClick={() => setMobileOpen(false)}
              className={navItemClass("/masyarakat")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive("/masyarakat") ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}>
                  <Users size={16} />
                </div>
                <span className="truncate">Portal Warga</span>
              </div>
              {isActive("/masyarakat") ? (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-2" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              )}
            </Link>
          )}

          {(user?.role === "dewan" || user?.role === "admin") && (
            <Link
              href="/dewan"
              onClick={() => setMobileOpen(false)}
              className={navItemClass("/dewan")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive("/dewan") ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  <Landmark size={16} />
                </div>
                <span className="truncate">Panel Dewan</span>
              </div>
              {isActive("/dewan") ? (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-2" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              )}
            </Link>
          )}

          {user?.role === "admin" && (
            <>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={navItemClass("/admin")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive("/admin") && !pathname.includes("/settings") ? "bg-white/20 text-white" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  }`}>
                    <ShieldCheck size={16} />
                  </div>
                  <span className="truncate">Super Admin</span>
                </div>
                {isActive("/admin") && !pathname.includes("/settings") ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-2" />
                ) : (
                  <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                )}
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setMobileOpen(false)}
                className={navItemClass("/admin/settings")}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive("/admin/settings") ? "bg-white/20 text-white" : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                  }`}>
                    <Settings size={16} />
                  </div>
                  <span className="truncate">Pengaturan Sistem</span>
                </div>
                {isActive("/admin/settings") ? (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-2" />
                ) : (
                  <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                )}
              </Link>
            </>
          )}

          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className={navItemClass("/profile")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isActive("/profile") ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}>
                <User size={16} />
              </div>
              <span className="truncate">Profil Pengguna</span>
            </div>
            {isActive("/profile") ? (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-2" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            )}
          </Link>
        </div>

        {/* Group B: Spasial GIS & Analitika */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 py-1 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
              Eksplorasi Spasial
            </span>
            <Activity size={13} className="text-muted-foreground/40" />
          </div>

          <Link
            href="/gis"
            onClick={() => setMobileOpen(false)}
            className={navItemClass("/gis")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isActive("/gis") ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              }`}>
                <Map size={16} />
              </div>
              <span className="truncate">Peta Aspirasi GIS</span>
            </div>
            {isActive("/gis") ? (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-2" />
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2">Peta</span>
            )}
          </Link>

          <Link
            href="/gis-kunjungan"
            onClick={() => setMobileOpen(false)}
            className={navItemClass("/gis-kunjungan")}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isActive("/gis-kunjungan") ? "bg-white/20 text-white" : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
              }`}>
                <Globe size={16} />
              </div>
              <span className="truncate">Peta Kunjungan Dapil</span>
            </div>
            {isActive("/gis-kunjungan") ? (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0 ml-2" />
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0 ml-2">Jabar</span>
            )}
          </Link>

          <a
            href="/#transparansi-surat"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-neutral-800/70 hover:translate-x-0.5 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <BarChart3 size={16} />
              </div>
              <span className="truncate">Grafik Transparansi</span>
            </div>
            <ArrowUpRight size={14} className="text-muted-foreground/40 group-hover:text-emerald-500 transition-colors shrink-0 ml-2" />
          </a>
        </div>

        {/* Group C: Shortcut Publik */}
        <div className="space-y-1">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-neutral-800/70 hover:translate-x-0.5 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center group-hover:text-primary transition-colors shrink-0">
                <Home size={16} />
              </div>
              <span className="truncate">Halaman Depan</span>
            </div>
            <Sparkles size={13} className="text-primary/60 shrink-0 ml-2" />
          </Link>
        </div>

        {/* AI Engine Status Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-2xs mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary animate-pulse" />
              Dewan AI Engine
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary">v2.5</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Analisis ringkasan & klasifikasi aspirasi konstituen otomatis aktif.
          </p>
        </div>

      </div>

      {/* ── 3. Bottom Section: User Executive Hub (PINNED) ── */}
      <div className="shrink-0 pt-3 border-t border-border/60 space-y-2.5">
        {user && (
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/70 border border-border/60 transition-all duration-200 group"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {user.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                    getRoleBadge(user.role).className
                  }`}
                >
                  {getRoleBadge(user.role).label}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle className="w-10 h-10 shrink-0 rounded-xl" />
          <button
            onClick={logout}
            className="flex items-center gap-2 h-10 px-3 rounded-xl text-xs font-bold text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-all flex-1 justify-center border border-border/60 hover:border-rose-300 dark:hover:border-rose-900/60 active:scale-98"
            title="Keluar dari akun"
          >
            <LogOut size={15} />
            <span>Keluar</span>
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* ── Desktop Professional Floating Sidebar ── */}
      <aside className="hidden md:flex flex-col fixed left-5 top-5 bottom-5 w-[310px] rounded-[26px] bg-white dark:bg-[#111116] border border-border/80 shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-4 sm:p-5 z-40 overflow-hidden">
        {renderNavContent()}
      </aside>

      {/* ── Mobile Floating Pill Header ── */}
      <div className="md:hidden sticky top-2.5 mx-3 z-40 mb-2.5">
        <header className="h-14 rounded-2xl bg-white/95 dark:bg-[#121217]/95 backdrop-blur-xl border border-slate-200/80 dark:border-neutral-800 shadow-md px-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            {settings.app_logo ? (
              <img
                src={settings.app_logo}
                alt="Logo"
                className="h-8 w-auto object-contain shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-xs shrink-0">
                <span className="text-white font-bold text-xs">
                  {settings.app_name?.charAt(0) || "D"}
                </span>
              </div>
            )}
            {!settings.app_logo && (
              <span className="font-extrabold text-xs sm:text-sm font-outfit text-foreground truncate">
                {settings.app_name || "DPRD HUDANG"}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle className="w-9 h-9 rounded-xl" />
          </div>
        </header>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <MobileBottomNav onOpenMenu={() => setMobileOpen(true)} />

      {/* ── Mobile Slide-Over Floating Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative my-2.5 ml-2.5 w-[310px] max-w-[85vw] bg-white dark:bg-[#121217] rounded-[24px] h-[calc(100dvh-1.25rem)] p-4 flex flex-col z-50 shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3.5 right-3.5 h-9 w-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors border border-slate-200 dark:border-neutral-800 z-10"
              aria-label="Tutup menu"
            >
              <X size={16} />
            </button>
            {renderNavContent()}
          </div>
        </div>
      )}
    </>
  );
}
