"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Landmark, Map, Menu } from "lucide-react";

interface MobileBottomNavProps {
  onOpenMenu?: () => void;
}

export default function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Hide on video room pages
  if (pathname?.startsWith("/room")) return null;

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      label: "Beranda",
      href: "/",
      icon: Home,
      active: pathname === "/",
    },
    {
      label: "Aspirasi",
      href: "/masyarakat",
      icon: FileText,
      active: isActive("/masyarakat"),
    },
    {
      label: "Dewan",
      href: "/dewan",
      icon: Landmark,
      active: isActive("/dewan"),
    },
    {
      label: "Peta GIS",
      href: "/gis",
      icon: Map,
      active: isActive("/gis") || isActive("/gis-kunjungan"),
    },
  ];

  return (
    <nav 
      aria-label="Navigasi Bawah Ponsel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121217]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-neutral-800 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.active;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 relative ${
                active
                  ? "text-primary font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-foreground"
              }`}
            >
              <div
                className={`w-9 h-7 flex items-center justify-center rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary shadow-xs"
                    : ""
                }`}
              >
                <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${active ? "font-bold text-primary" : "font-medium"}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute -top-1 w-5 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}

        {/* Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-500 dark:text-slate-400 hover:text-foreground transition-all duration-200"
          aria-label="Buka Menu Lengkap"
        >
          <div className="w-9 h-7 flex items-center justify-center rounded-xl">
            <Menu size={19} strokeWidth={1.9} />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
