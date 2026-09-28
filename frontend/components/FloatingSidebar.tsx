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
  Menu,
  X,
  Settings,
  ChevronRight,
  Sparkles,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";

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
    return `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200 ${
      active
        ? "bg-primary text-white shadow-md shadow-primary/30 font-bold"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:translate-x-0.5"
    }`;
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      
      {/* ── 1. Top Section: Brand & Workspace Identity (PINNED) ── */}
      <div className="shrink-0 pb-4 border-b border-border/70 space-y-3">
        {/* Brand Card */}
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="block p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border/60 transition-all duration-200 group"
        >
          <div className="flex items-center justify-between gap-2">
            {settings.app_logo ? (
              <img
                src={settings.app_logo}
                alt={settings.app_name || "HUDANG"}
                className="h-9 w-auto max-h-9 max-w-[170px] object-contain group-hover:scale-102 transition-transform duration-200"
              />
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
                  <span className="text-white font-black text-base">
                    {settings.app_name?.charAt(0) || "D"}
                  </span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-black tracking-tight font-outfit text-foreground leading-tight truncate">
                    {settings.app_name || "DPRD HUDANG"}
                  </h1>
                </div>
              </div>
            )}

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold mt-2.5 pt-2 border-t border-border/40">
            <span className="truncate">Sekretariat DPRD Jawa Barat</span>
            <span className="font-mono text-primary font-bold">v2.5</span>
          </div>
        </Link>
      </div>

      {/* ── 2. Middle Section: Navigation Menu (SCROLLABLE) ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-6">
        
        {/* Group A: Panel Kerja & Layanan */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70">
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
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  isActive("/masyarakat") ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}>
                  <Users size={16} />
                </div>
                <span>Portal Warga</span>
              </div>
              {isActive("/masyarakat") ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              )}
            </Link>
          )}

          {(user?.role === "dewan" || user?.role === "admin") && (
            <Link
              href="/dewan"
              onClick={() => setMobileOpen(false)}
              className={navItemClass("/dewan")}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  isActive("/dewan") ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  <Landmark size={16} />
                </div>
                <span>Panel Dewan</span>
              </div>
              {isActive("/dewan") ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
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
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isActive("/admin") && !pathname.includes("/settings") ? "bg-white/20 text-white" : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  }`}>
                    <ShieldCheck size={16} />
                  </div>
                  <span>Super Admin</span>
                </div>
                {isActive("/admin") && !pathname.includes("/settings") ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ) : (
                  <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                )}
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setMobileOpen(false)}
                className={navItemClass("/admin/settings")}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isActive("/admin/settings") ? "bg-white/20 text-white" : "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                  }`}>
                    <Settings size={16} />
                  </div>
                  <span>Pengaturan Sistem</span>
                </div>
                {isActive("/admin/settings") ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                ) : (
                  <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                )}
              </Link>
            </>
          )}

          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className={navItemClass("/profile")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isActive("/profile") ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}>
                <User size={16} />
              </div>
              <span>Profil Pengguna</span>
            </div>
            {isActive("/profile") ? (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            )}
          </Link>
        </div>

        {/* Group B: Spasial GIS & Analitika */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70">
              Eksplorasi Spasial
            </span>
            <Activity size={13} className="text-muted-foreground/40" />
          </div>

          <Link
            href="/gis"
            onClick={() => setMobileOpen(false)}
            className={navItemClass("/gis")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isActive("/gis") ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              }`}>
                <Map size={16} />
              </div>
              <span>Peta Aspirasi GIS</span>
            </div>
            {isActive("/gis") ? (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ) : (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">Peta</span>
            )}
          </Link>

          <Link
            href="/gis-kunjungan"
            onClick={() => setMobileOpen(false)}
            className={navItemClass("/gis-kunjungan")}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                isActive("/gis-kunjungan") ? "bg-white/20 text-white" : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
              }`}>
                <Globe size={16} />
              </div>
              <span>Peta Kunjungan Dapil</span>
            </div>
            {isActive("/gis-kunjungan") ? (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ) : (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400">Jabar</span>
            )}
          </Link>

          <a
            href="/#transparansi-surat"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BarChart3 size={16} />
              </div>
              <span>Grafik Transparansi</span>
            </div>
            <ArrowUpRight size={14} className="text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
          </a>
        </div>

        {/* Group C: Shortcut Publik */}
        <div className="space-y-1.5">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center group-hover:text-primary transition-colors">
                <Home size={16} />
              </div>
              <span>Halaman Depan</span>
            </div>
            <Sparkles size={13} className="text-primary/60" />
          </Link>
        </div>

        {/* AI Engine Status Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
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
      <div className="shrink-0 pt-3 border-t border-border/70 space-y-3">
        {user && (
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted border border-border/60 transition-all duration-200 group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-blue-600 to-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-sm shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
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
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors flex-1 justify-center border border-border/60 hover:border-rose-300 dark:hover:border-rose-900/60"
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
      <aside className="hidden md:flex flex-col fixed left-5 top-5 bottom-5 w-[310px] rounded-[30px] bg-card/90 dark:bg-[#111116]/90 backdrop-blur-2xl border border-border/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] p-4.5 z-40 overflow-hidden">
        {renderNavContent()}
      </aside>

      {/* ── Mobile Floating Pill Header ── */}
      <div className="md:hidden sticky top-2.5 mx-3 z-40 mb-2.5">
        <header className="h-14 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-lg px-3 sm:px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            {settings.app_logo ? (
              <img
                src={settings.app_logo}
                alt="Logo"
                className="h-7 w-auto object-contain shrink-0"
              />
            ) : (
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-xs shrink-0">
                <span className="text-white font-bold text-xs">
                  {settings.app_name?.charAt(0) || "D"}
                </span>
              </div>
            )}
            <span className="font-extrabold text-xs sm:text-sm font-outfit text-foreground truncate">
              {settings.app_name || "DPRD HUDANG"}
            </span>
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              className="h-10 w-10 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/60 shrink-0"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
      </div>

      {/* ── Mobile Slide-Over Floating Drawer ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative my-2.5 ml-2.5 w-[300px] max-w-[85vw] bg-card/95 backdrop-blur-2xl rounded-[24px] h-[calc(100dvh-1.25rem)] p-4 flex flex-col z-50 shadow-2xl border border-border overflow-hidden animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3.5 right-3.5 h-9 w-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/50 z-10"
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
