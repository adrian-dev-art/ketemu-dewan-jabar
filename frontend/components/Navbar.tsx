"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, Home, Users, UserCog, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
      isActive(path)
        ? "bg-primary text-white shadow-md shadow-primary/20"
        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
    }`;

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-1">
      <Link href="/" className={linkClass("/")}>
        <Home size={14} />
        <span className="hidden sm:inline">Beranda</span>
      </Link>

      {user ? (
        <>
          {(user.role === "masyarakat" || user.role === "admin") && (
            <Link href="/masyarakat" className={linkClass("/masyarakat")}>
              <Users size={14} />
              <span className="hidden sm:inline">Aspirasi</span>
            </Link>
          )}
          {(user.role === "dewan" || user.role === "admin") && (
            <Link href="/dewan" className={linkClass("/dewan")}>
              <UserCog size={14} />
              <span className="hidden sm:inline">Dewan</span>
            </Link>
          )}
          {user.role === "admin" && (
            <Link href="/admin" className={linkClass("/admin")}>
              <ShieldCheck size={14} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

          <span className="text-xs text-muted-foreground hidden md:inline px-1">
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
