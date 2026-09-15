"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LogIn,
  LogOut,
  Home,
  Users,
  UserCog,
  ShieldCheck,
  Map,
  Globe,
  BarChart3,
} from "lucide-react";

interface NavbarProps {
  mobileMode?: boolean;
}

export default function Navbar({ mobileMode = false }: NavbarProps) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const desktopLinkClass = (path: string) =>
    `flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
      isActive(path)
        ? "bg-primary text-white shadow-sm shadow-primary/20"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  const mobileLinkClass = (path: string) =>
    `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive(path)
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  const linkClass = mobileMode ? mobileLinkClass : desktopLinkClass;

  if (isLoading) return null;

  if (mobileMode) {
    return (
      <>
        <Link href="/" className={linkClass("/")}>
          <Home size={16} />
          <span>Beranda</span>
        </Link>

        <a
          href="/#transparansi-surat"
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all"
        >
          <BarChart3 size={16} className="text-emerald-500" />
          <span>Grafik &amp; Jadwal Publik</span>
        </a>

        {user ? (
          <>
            {(user.role === "masyarakat" || user.role === "admin") && (
              <Link href="/masyarakat" className={linkClass("/masyarakat")}>
                <Users size={16} />
                <span>Aspirasi</span>
              </Link>
            )}
            {(user.role === "dewan" || user.role === "admin") && (
              <Link href="/dewan" className={linkClass("/dewan")}>
                <UserCog size={16} />
                <span>Dewan</span>
              </Link>
            )}
            {user.role === "admin" && (
              <Link href="/admin" className={linkClass("/admin")}>
                <ShieldCheck size={16} />
                <span>Admin</span>
              </Link>
            )}
            <Link href="/gis" className={linkClass("/gis")}>
              <Map size={16} />
              <span>Peta Aspirasi</span>
            </Link>
            <Link href="/gis-kunjungan" className={linkClass("/gis-kunjungan")}>
              <Globe size={16} />
              <span>Peta Kunjungan</span>
            </Link>
            <Link href="/profile" className={linkClass("/profile")}>
              <UserCog size={16} />
              <span>Profil — {user.name}</span>
            </Link>
            <div className="h-px bg-border my-1" />
            <button
              onClick={logout}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors w-full text-left"
            >
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </>
        ) : (
          <Link href="/login" className={linkClass("/login")}>
            <LogIn size={16} />
            <span>Masuk</span>
          </Link>
        )}
      </>
    );
  }

  // Desktop mode
  return (
    <div className="flex items-center gap-1">
      <Link href="/" className={linkClass("/")}>
        <Home size={14} />
        <span className="hidden lg:inline">Beranda</span>
      </Link>

      <a
        href="/#transparansi-surat"
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all border border-emerald-500/20"
      >
        <BarChart3 size={14} className="text-emerald-500" />
        <span className="hidden sm:inline">Grafik &amp; Jadwal Publik</span>
      </a>

      {user ? (
        <>
          {(user.role === "masyarakat" || user.role === "admin") && (
            <Link href="/masyarakat" className={linkClass("/masyarakat")}>
              <Users size={14} />
              <span className="hidden md:inline">Aspirasi</span>
            </Link>
          )}
          {(user.role === "dewan" || user.role === "admin") && (
            <Link href="/dewan" className={linkClass("/dewan")}>
              <UserCog size={14} />
              <span className="hidden md:inline">Dewan</span>
            </Link>
          )}

          {user.role === "admin" && (
            <Link href="/admin" className={linkClass("/admin")}>
              <ShieldCheck size={14} />
              <span className="hidden lg:inline">Admin</span>
            </Link>
          )}

          <Link href="/gis" className={linkClass("/gis")}>
            <Map size={14} />
            <span className="hidden xl:inline">Peta Aspirasi</span>
          </Link>

          <Link href="/gis-kunjungan" className={linkClass("/gis-kunjungan")}>
            <Globe size={14} />
            <span className="hidden xl:inline">Peta Kunjungan</span>
          </Link>

          <Link href="/profile" className={linkClass("/profile")}>
            <UserCog size={14} />
            <span className="hidden lg:inline">Profil</span>
          </Link>

          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          <span className="text-xs text-muted-foreground hidden md:inline px-1 truncate max-w-[100px]">
            {user.name}
          </span>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </>
      ) : (
        <Link href="/login" className={linkClass("/login")}>
          <LogIn size={14} />
          <span className="hidden sm:inline">Masuk</span>
        </Link>
      )}
    </div>
  );
}
