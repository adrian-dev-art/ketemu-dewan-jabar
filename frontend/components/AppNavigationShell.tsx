"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BrandingHeader from "@/components/BrandingHeader";
import FloatingSidebar from "@/components/FloatingSidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

interface AppNavigationShellProps {
  children: React.ReactNode;
}

export default function AppNavigationShell({ children }: AppNavigationShellProps) {
  const pathname = usePathname();

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
      <MobileBottomNav />
    </div>
  );
}
