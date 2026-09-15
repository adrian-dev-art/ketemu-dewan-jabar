"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorClass?: string;
  accentVariant?: "blue" | "indigo" | "amber" | "emerald" | "purple";
}

const ACCENT_BORDER_CLASSES: Record<string, string> = {
  blue: "hover:border-blue-500/40",
  indigo: "hover:border-indigo-500/40",
  amber: "hover:border-amber-500/40",
  emerald: "hover:border-emerald-500/40",
  purple: "hover:border-purple-500/40",
};

const ACCENT_TOP_BAR: Record<string, string> = {
  blue: "from-blue-500 to-indigo-500",
  indigo: "from-indigo-500 to-purple-500",
  amber: "from-amber-500 to-orange-500",
  emerald: "from-emerald-500 to-teal-500",
  purple: "from-purple-500 to-pink-500",
};

export default function AdminStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorClass = "bg-primary/10 text-primary",
  accentVariant = "blue",
}: AdminStatsCardProps) {
  const borderHover = ACCENT_BORDER_CLASSES[accentVariant] || "hover:border-primary/40";
  const topBarGradient = ACCENT_TOP_BAR[accentVariant] || "from-primary to-primary-hover";

  return (
    <div
      className={`group relative bg-card border border-border ${borderHover} rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden`}
    >
      {/* Top subtle gradient line on hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${topBarGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 leading-tight">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums tracking-tight leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-2 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-3 transition-transform duration-300 group-hover:scale-110 shadow-xs ${colorClass}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
