"use client";

import React, { useState } from "react";
import {
  Star,
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  Award,
  MessageSquare,
} from "lucide-react";

const ASPECT_LABELS: Record<string, string> = {
  speakingScore: "Artikulasi",
  contextScore: "Relevansi",
  timeScore: "Ketepatan Waktu",
  responsivenessScore: "Daya Tanggap",
  solutionScore: "Orientasi Solusi",
};

function StarBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={11}
            className={value >= s ? "text-amber-400 fill-amber-400" : "text-border"}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground font-bold">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function DewanPerformanceCard({ dewan, ratings }: { dewan: any; ratings: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const dewanRatings = ratings.filter((r) => r.dewanId === dewan.id);
  if (dewanRatings.length === 0) return null;

  const avgAspect = (key: string) =>
    Math.round(
      (dewanRatings.reduce((a: number, r: any) => a + (r[key] || 0), 0) / dewanRatings.length) * 10
    ) / 10;

  const overallAvg =
    Math.round(
      (dewanRatings.reduce((a: number, r: any) => a + r.avgScore, 0) / dewanRatings.length) * 10
    ) / 10;

  const scoreColor =
    overallAvg >= 4 ? "text-emerald-600 dark:text-emerald-400"
    : overallAvg >= 3 ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="border border-border hover:border-purple-500/30 rounded-2xl overflow-hidden bg-card shadow-xs hover:shadow-md transition-all duration-300">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{dewan.name}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {dewan.fraksi || "—"} &middot; {dewanRatings.length} ulasan masyarakat
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className={`flex items-center gap-1 justify-end ${scoreColor}`}>
              <Star size={14} className="fill-current" />
              <span className="text-base font-extrabold tabular-nums">{overallAvg}</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">rata-rata kepuasan</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 bg-muted/20 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {Object.entries(ASPECT_LABELS).map(([key, label]) => (
              <div key={key} className="text-center p-3 bg-card rounded-xl border border-border/80 shadow-2xs">
                <p className="text-[10px] text-muted-foreground mb-1.5 font-bold uppercase tracking-wider">{label}</p>
                <StarBar value={avgAspect(key)} />
              </div>
            ))}
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
            {dewanRatings.map((r: any) => (
              <div
                key={r.id}
                className="flex items-start gap-3 p-3.5 bg-card border border-border/80 rounded-xl text-xs"
              >
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded-md font-bold text-[11px]">
                      <Star size={10} className="fill-current" />
                      {r.avgScore}
                    </div>
                    <span className="font-semibold text-foreground">{r.masyarakatName}</span>
                    <span className="text-muted-foreground text-[11px]">
                      &middot; {new Date(r.meetingDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </span>
                  </div>
                  {r.comment && <p className="text-muted-foreground italic text-xs mt-1">&ldquo;{r.comment}&rdquo;</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AdminRatingsTabProps {
  ratings: any[];
  dewanList: any[];
}

export default function AdminRatingsTab({ ratings, dewanList }: AdminRatingsTabProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"id" | "avgScore" | "meetingDate">("id");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filteredRatings = ratings
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        !search ||
        r.dewanName.toLowerCase().includes(q) ||
        r.masyarakatName.toLowerCase().includes(q) ||
        r.meetingTitle.toLowerCase().includes(q) ||
        (r.comment && r.comment.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === "id") diff = a.id - b.id;
      else if (sortBy === "avgScore") diff = a.avgScore - b.avgScore;
      else diff = new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime();
      return sortDir === "desc" ? -diff : diff;
    });

  const handleToggleSort = (field: "id" | "avgScore" | "meetingDate") => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir("desc"); }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Dewan Performance Accordion Section */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award size={17} />
          </div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            Rapor Performa Legislator Berdasarkan Ulasan Konstituen
          </h3>
        </div>

        {dewanList.filter((d) => ratings.some((r) => r.dewanId === d.id)).length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center mb-3">
              <Award size={32} className="opacity-40 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Belum Ada Ulasan Masuk</p>
            <p className="text-xs text-muted-foreground">Ulasan akan terkumpul otomatis setelah warga menyelesaikan sesi pertemuan dengan anggota dewan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dewanList.map((dewan) => (
              <DewanPerformanceCard key={dewan.id} dewan={dewan} ratings={ratings} />
            ))}
          </div>
        )}
      </div>

      {/* Ratings Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare size={17} />
            </div>
            <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2">
              Daftar Ulasan &amp; Penilaian Masuk
              <span className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-bold text-muted-foreground">
                {filteredRatings.length}
              </span>
            </h3>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              id="ratings-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ulasan, nama dewan, warga..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground transition-all"
            />
          </div>
        </div>

        {/* Modern Ratings Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/60 dark:bg-muted/40 border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 160 }}>Anggota Dewan</th>
                  <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 140 }}>Warga Pemohon</th>
                  <th
                    style={{ minWidth: 180, cursor: "pointer" }}
                    onClick={() => handleToggleSort("id")}
                    className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider select-none hover:text-foreground transition-colors"
                    title="Klik untuk mengurutkan berdasarkan ulasan terbaru"
                  >
                    Sesi Aspirasi {sortBy === "id" ? (sortDir === "desc" ? " ↓ (Terbaru)" : " ↑") : ""}
                  </th>
                  <th
                    style={{ minWidth: 120, cursor: "pointer" }}
                    onClick={() => handleToggleSort("avgScore")}
                    className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider select-none hover:text-foreground transition-colors"
                    title="Klik untuk mengurutkan berdasarkan skor"
                  >
                    Skor {sortBy === "avgScore" ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
                  </th>
                  <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 220 }}>Komentar / Masukan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRatings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12">
                      <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                        <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center mb-3">
                          <MessageSquare size={32} className="opacity-40 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-bold text-foreground mb-1">Belum Ada Penilaian Masuk</p>
                        <p className="text-xs text-muted-foreground">Ulasan akan otomatis tampil setelah warga memberikan penilaian pasca sesi.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRatings.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground leading-snug">{r.dewanName}</div>
                        <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{r.dewanFraksi}</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground">{r.masyarakatName}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground leading-snug">{r.meetingTitle}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(r.meetingDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg font-extrabold text-xs">
                          <Star size={12} className="fill-current" />
                          <span>{r.avgScore}</span>
                          <span className="text-[10px] opacity-70">/ 5</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground text-xs max-w-xs">
                        <p className="line-clamp-2 italic font-medium">
                          {r.comment ? `"${r.comment}"` : "—"}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
