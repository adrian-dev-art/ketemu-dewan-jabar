"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, Video, Star, Settings, ShieldCheck, TrendingUp,
  MessageSquare, RefreshCw, ChevronDown, ChevronUp, Search,
  Download, BarChart2, Filter, Database
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

const ASPECT_LABELS: Record<string, string> = {
  speakingScore: "Artikulasi",
  contextScore: "Relevansi",
  timeScore: "Ketepatan Waktu",
  responsivenessScore: "Daya Tanggap",
  solutionScore: "Orientasi Solusi",
};

function StarBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={11}
            className={value >= s ? "text-amber-400 fill-amber-400" : "text-border"}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  );
}

function DewanPerformanceCard({ dewan, ratings }: { dewan: any; ratings: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const dewanRatings = ratings.filter((r) => r.dewanId === dewan.id);
  if (dewanRatings.length === 0) return null;

  const avgAspect = (key: string) =>
    Math.round((dewanRatings.reduce((a: number, r: any) => a + (r[key] || 0), 0) / dewanRatings.length) * 10) / 10;

  const overallAvg =
    Math.round((dewanRatings.reduce((a: number, r: any) => a + r.avgScore, 0) / dewanRatings.length) * 10) / 10;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{dewan.name}</p>
            <p className="text-xs text-muted-foreground">{dewan.fraksi || "—"} · {dewanRatings.length} ulasan</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-1 justify-end">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="text-base font-bold">{overallAvg}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">rata-rata</p>
          </div>
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 bg-muted/20">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
            {Object.entries(ASPECT_LABELS).map(([key, label]) => (
              <div key={key} className="text-center p-2 bg-card rounded-lg border border-border">
                <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
                <StarBar value={avgAspect(key)} />
              </div>
            ))}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {dewanRatings.map((r: any) => (
              <div key={r.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg text-xs">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="font-semibold">{r.avgScore}</span>
                    <span className="text-muted-foreground">· {r.masyarakatName}</span>
                    <span className="text-muted-foreground">· {new Date(r.meetingDate).toLocaleDateString("id-ID")}</span>
                  </div>
                  {r.comment && <p className="text-muted-foreground italic">"{r.comment}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const [stats, setStats] = useState({ totalUsers: 0, totalMeetings: 0, avgRating: 0, totalRatings: 0 });
  const [ratings, setRatings] = useState<any[]>([]);
  const [dewanList, setDewanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"avgScore" | "meetingDate">("meetingDate");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [activeTab, setActiveTab] = useState<"overview" | "ratings">("overview");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, ratingsRes, dewanRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/admin/ratings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/dewan`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (ratingsRes.ok) setRatings(await ratingsRes.json());
      if (dewanRes.ok) setDewanList(await dewanRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const uniqueDewan = useMemo(() => {
    const map = new Map<number, any>();
    ratings.forEach((r) => { if (!map.has(r.dewanId)) map.set(r.dewanId, { id: r.dewanId, name: r.dewanName, fraksi: r.dewanFraksi }); });
    return Array.from(map.values());
  }, [ratings]);

  const filteredRatings = useMemo(() => {
    let result = ratings.filter((r) =>
      r.dewanName.toLowerCase().includes(search.toLowerCase()) ||
      r.masyarakatName.toLowerCase().includes(search.toLowerCase()) ||
      r.meetingTitle.toLowerCase().includes(search.toLowerCase())
    );
    result.sort((a, b) => {
      const aVal = sortBy === "avgScore" ? a.avgScore : new Date(a.meetingDate).getTime();
      const bVal = sortBy === "avgScore" ? b.avgScore : new Date(b.meetingDate).getTime();
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [ratings, search, sortBy, sortDir]);

  const exportCSV = () => {
    const headers = ["Dewan","Fraksi","Masyarakat","Topik","Tanggal","Artikulasi","Relevansi","Ketepatan Waktu","Daya Tanggap","Orientasi Solusi","Rata-rata","Komentar"];
    const rows = filteredRatings.map((r) => [
      r.dewanName, r.dewanFraksi, r.masyarakatName, r.meetingTitle,
      new Date(r.meetingDate).toLocaleDateString("id-ID"),
      r.speakingScore, r.contextScore, r.timeScore, r.responsivenessScore, r.solutionScore, r.avgScore,
      `"${(r.comment || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "penilaian_dewan.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (col: "avgScore" | "meetingDate") => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">

          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-primary tracking-wide uppercase mb-1">Manajemen Sistem</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Control Center</h2>
                <p className="text-sm text-muted-foreground mt-1">Pantau seluruh aktivitas dan kinerja platform secara real-time.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs font-medium text-muted-foreground">
                  <ShieldCheck size={14} />Administrator
                </div>
                <button
                  onClick={fetchData}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium text-muted-foreground hover:bg-border transition-colors"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Pengguna", value: loading ? "…" : stats.totalUsers, icon: Users, color: "text-primary bg-primary/10" },
              { label: "Total Pertemuan", value: loading ? "…" : stats.totalMeetings, icon: Video, color: "text-blue-500 bg-blue-500/10" },
              { label: "Total Penilaian", value: loading ? "…" : stats.totalRatings, icon: BarChart2, color: "text-emerald-500 bg-emerald-500/10" },
              { label: "Rating Platform", value: loading ? "…" : stats.avgRating || "—", icon: Star, color: "text-amber-500 bg-amber-500/10" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="border border-border rounded-xl p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${color}`}><Icon size={18} /></div>
                <div>
                  <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                  <p className="text-2xl font-bold tabular-nums">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6 gap-1">
            {[
              { key: "overview", label: "Kinerja Dewan", icon: TrendingUp },
              { key: "ratings", label: "Semua Penilaian", icon: MessageSquare },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={14} />{label}
              </button>
            ))}
          </div>

          {/* Overview Tab: Per-Dewan Performance */}
          {activeTab === "overview" && (
            <section>
              {loading ? (
                <div className="py-16 text-center text-muted-foreground text-sm">Memuat data kinerja...</div>
              ) : uniqueDewan.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border rounded-xl">
                  <Database size={24} className="mx-auto mb-2 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">Belum ada data penilaian yang masuk.</p>
                  <p className="text-xs text-muted-foreground mt-1">Penilaian akan muncul setelah masyarakat menyelesaikan sesi pertemuan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uniqueDewan.map((d) => (
                    <DewanPerformanceCard key={d.id} dewan={d} ratings={ratings} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Ratings Table Tab */}
          {activeTab === "ratings" && (
            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="relative flex-grow max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Cari dewan, masyarakat, atau topik..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button
                  onClick={exportCSV}
                  disabled={filteredRatings.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-muted border border-border rounded-lg hover:bg-border transition-colors disabled:opacity-50"
                >
                  <Download size={13} />Export CSV
                </button>
              </div>

              {loading ? (
                <div className="py-16 text-center text-muted-foreground text-sm">Memuat penilaian...</div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Dewan</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Topik Pertemuan</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Penilai</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort("meetingDate")}>
                            <span className="flex items-center gap-1">Tanggal {sortBy === "meetingDate" && <Filter size={11} />}</span>
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort("avgScore")}>
                            <span className="flex items-center gap-1">Rating {sortBy === "avgScore" && <Filter size={11} />}</span>
                          </th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Detail Aspek</th>
                          <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Komentar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredRatings.length === 0 ? (
                          <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">Tidak ada data penilaian.</td></tr>
                        ) : (
                          filteredRatings.map((r) => (
                            <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium text-sm">{r.dewanName}</p>
                                <p className="text-xs text-muted-foreground">{r.dewanFraksi}</p>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{r.meetingTitle}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground">{r.masyarakatName}</td>
                              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(r.meetingDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <Star size={13} className="text-amber-400 fill-amber-400" />
                                  <span className="font-bold text-sm">{r.avgScore}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-0.5 min-w-[140px]">
                                  {Object.entries(ASPECT_LABELS).map(([key, label]) => (
                                    <div key={key} className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] text-muted-foreground">{label}</span>
                                      <StarBar value={r[key] || 0} />
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px]">
                                {r.comment ? (
                                  <span className="italic">"{r.comment}"</span>
                                ) : (
                                  <span className="opacity-40">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {filteredRatings.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                      Menampilkan {filteredRatings.length} dari {ratings.length} penilaian
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}