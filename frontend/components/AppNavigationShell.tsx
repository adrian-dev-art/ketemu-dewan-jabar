"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import BrandingHeader from "@/components/BrandingHeader";
import FloatingSidebar from "@/components/FloatingSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import Navbar from "@/components/Navbar";

interface AppNavigationShellProps {
  children: React.ReactNode;
}

export default function AppNavigationShell({ children }: AppNavigationShellProps) {
  const pathname = usePathname();
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);

  // 1. Video Conference Room: Full Screen without any navigation
  if (pathname?.startsWith("/room")) {
    return <main id="main-content" className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">{children}</main>;
  }

  // 2. Dashboard Routes: Use Professional Floating Sidebar
  const dashboardRoutes = [
    "/masyarakat",
    "/dewan",
    "/admin",
    "/profile",
    "/gis",
    "/gis-kunjungan",
    "/disposisi",
  ];

  const isDashboardRoute = dashboardRoutes.some(
    (route) => pathname === route || pathname?.startsWith(`${route}/`)
  );

  if (isDashboardRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground relative">
        <FloatingSidebar />
        <main
          id="main-content"
          className="flex-1 min-w-0 md:pl-[372px] md:pr-10 py-3.5 sm:py-7 px-3 sm:px-6 md:px-8 pb-24 md:pb-8 transition-all duration-300"
        >
          {children}
        </main>
      </div>
    );
  }

  // 3. Public Pages (Landing Page /, /login, /register, etc.): Use Elegant Topbar + MobileBottomNav
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <BrandingHeader />
      <main id="main-content" className="flex-grow flex flex-col pb-20 md:pb-0">
        {children}
      </main>
      <MobileBottomNav onOpenMenu={() => setPublicMenuOpen(true)} />

      {/* Public Mobile Drawer */}
      {publicMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setPublicMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card shadow-2xl border-r border-border h-full p-4">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <span className="font-bold text-sm">Menu Navigasi</span>
              <button
                onClick={() => setPublicMenuOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
                aria-label="Tutup menu"
              >
                <X size={18} />
              </button>
            </div>
            <div onClick={() => setPublicMenuOpen(false)} className="flex flex-col gap-1">
              <Navbar mobileMode />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
