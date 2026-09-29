"use client";

import React from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ClipboardCheck,
  Building2,
  FileCheck2,
} from "lucide-react";

interface FormattedAiAnalysisProps {
  content: string;
  className?: string;
}

export default function FormattedAiAnalysis({
  content,
  className = "",
}: FormattedAiAnalysisProps) {
  if (!content) return null;

  // 1. Normalize text: Ensure newlines before Roman numeral section headers and bullet points
  // Even if backend returned a continuous string without newlines:
  let normalized = content
    // Add newlines before Roman numeral headers like **I. ...**, **II. ...**, etc.
    .replace(/(?:\s+|^)(\*\*[IVXLCDM]+\.\s+[^*]+?\*\*)/gi, "\n\n$1\n\n")
    // Add newlines before bold keys (like "- **Key:**" or "**Key:**")
    .replace(/(?:\s+|^)(?:[-•*]\s*)?(\*\*[A-Za-z0-9\s/&()-]+?:\*\*)/g, "\n- $1")
    // Clean up excessive newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Helper to render inline bold (**text**)
  const renderInlineFormatted = (text: string) => {
    const parts = text.split(/(\*\*[^*]+?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  // 2. Split by major Roman numeral headers or markdown headers
  const sectionRegex = /(\*\*[IVXLCDM]+\.\s+[^*]+?\*\*|^#{1,3}\s+.+$)/gim;
  const rawParts = normalized.split(sectionRegex).filter(Boolean);

  // If text doesn't contain Roman numeral sections, render as standard clean markdown paragraphs/lists
  if (rawParts.length <= 1) {
    const lines = normalized.split("\n").filter((l) => l.trim().length > 0);
    return (
      <div className={`space-y-3 text-xs leading-relaxed text-foreground/90 ${className}`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                <p className="flex-1">{renderInlineFormatted(trimmed.replace(/^[-•]\s*/, ""))}</p>
              </div>
            );
          }
          return <p key={idx}>{renderInlineFormatted(trimmed)}</p>;
        })}
      </div>
    );
  }

  // Group sections (Header -> Content)
  interface SectionBlock {
    title: string;
    content: string;
  }
  const sections: SectionBlock[] = [];

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i].trim();
    if (sectionRegex.test(part) || (part.startsWith("**") && part.endsWith("**") && /^[IVXLCDM]+\./i.test(part.slice(2)))) {
      const title = part.replace(/^\*\*|\*\*$/g, "").trim();
      const content = (rawParts[i + 1] && !sectionRegex.test(rawParts[i + 1])) ? rawParts[i + 1].trim() : "";
      sections.push({ title, content });
      if (content) i++;
    } else if (part.length > 0) {
      sections.push({ title: "Ringkasan Analisis", content: part });
    }
  }

  const getSectionIconAndStyle = (title: string) => {
    const upper = title.toUpperCase();
    if (upper.includes("IDENTIFIKASI")) {
      return {
        icon: <FileText size={15} className="text-blue-500" />,
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        border: "border-blue-500/20 bg-blue-500/5",
      };
    }
    if (upper.includes("ADMINISTRATIF") || upper.includes("KELENGKAPAN")) {
      return {
        icon: <FileCheck2 size={15} className="text-indigo-500" />,
        badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        border: "border-indigo-500/20 bg-indigo-500/5",
      };
    }
    if (upper.includes("SUBSTANSI") || upper.includes("URGENSI")) {
      return {
        icon: <Building2 size={15} className="text-emerald-500" />,
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        border: "border-emerald-500/20 bg-emerald-500/5",
      };
    }
    if (upper.includes("KLARIFIKASI")) {
      return {
        icon: <AlertTriangle size={15} className="text-amber-500" />,
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        border: "border-amber-500/30 bg-amber-500/10",
      };
    }
    if (upper.includes("REKOMENDASI")) {
      return {
        icon: <Lightbulb size={15} className="text-violet-500" />,
        badge: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
        border: "border-violet-500/30 bg-violet-500/10",
      };
    }
    return {
      icon: <Sparkles size={15} className="text-primary" />,
      badge: "bg-primary/10 text-primary border-primary/20",
      border: "border-border bg-card",
    };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {sections.map((sec, idx) => {
        const style = getSectionIconAndStyle(sec.title);
        const lines = sec.content
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        return (
          <div
            key={idx}
            className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${style.border}`}
          >
            {/* Section Header */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/60 mb-3">
              <div className="p-1.5 rounded-lg bg-background/80 shadow-2xs shrink-0">
                {style.icon}
              </div>
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-tight text-foreground">
                {sec.title}
              </h4>
            </div>

            {/* Section Body */}
            <div className="space-y-2.5 text-xs text-foreground/90 leading-relaxed">
              {lines.map((line, lineIdx) => {
                const isBullet = line.startsWith("- ") || line.startsWith("• ");
                const cleanLine = isBullet ? line.replace(/^[-•]\s*/, "") : line;

                // Check if bullet has sub-key like "**Identitas Pengusul & Kontak:** ..."
                const keyMatch = cleanLine.match(/^\*\*([^*]+?):\*\*\s*(.*)$/);

                if (keyMatch) {
                  const [, key, val] = keyMatch;
                  return (
                    <div
                      key={lineIdx}
                      className="p-2.5 rounded-xl bg-background/70 border border-border/50 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 shadow-2xs"
                    >
                      <span className="font-extrabold text-foreground shrink-0 sm:min-w-[180px] sm:max-w-[220px] text-[11px] uppercase tracking-wider text-primary">
                        {key}:
                      </span>
                      <span className="text-foreground/90 flex-1 leading-relaxed">
                        {renderInlineFormatted(val)}
                      </span>
                    </div>
                  );
                }

                if (isBullet) {
                  return (
                    <div key={lineIdx} className="flex items-start gap-2 pl-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1">{renderInlineFormatted(cleanLine)}</div>
                    </div>
                  );
                }

                return (
                  <p key={lineIdx} className="leading-relaxed">
                    {renderInlineFormatted(cleanLine)}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
