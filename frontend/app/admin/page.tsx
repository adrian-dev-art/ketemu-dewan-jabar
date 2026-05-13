"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users, Video, Star, Settings, ShieldCheck, TrendingUp, MessageSquare, 
  RefreshCw, ChevronDown, ChevronUp, Search, Download, BarChart2, 
  Filter, Database, Trash2, Edit, Check, X, Calendar, Languages, 
  FileText, Loader2, ExternalLink
} from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import AnalysisModal from "@/components/AnalysisModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const [stats, setStats] = useState({ totalUsers: 0, totalMeetings: 0, avgRating: 0, totalRatings: 0 });
  const [ratings, setRatings] = useState<any[]>([]);
  const [dewanList, setDewanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"avgScore" | "meetingDate">("meetingDate");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [activeTab, setActiveTab] = useState<"overview" | "ratings" | "users" | "schedules">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [schedulesList, setSchedulesList] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState("all");
  const [transcribingId, setTranscribingId] = useState<number | null>(null);
  const [viewingTranscription, setViewingTranscription] = useState<string | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<any | null>(null);
  const [analysisTitle, setAnalysisTitle] = useState<string>("");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, ratingsRes, dewanRes, usersRes, schedulesRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/admin/ratings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/dewan`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${backendUrl}/api/admin/schedules`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (ratingsRes.ok) setRatings(await ratingsRes.json());
      if (dewanRes.ok) setDewanList(await dewanRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (schedulesRes.ok) setSchedulesList(await schedulesRes.json());
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribe = async (id: number) => {
    if (!token) return;
    setTranscribingId(id);
    try {
      const res = await fetch(`${backendUrl}/api/admin/schedules/${id}/transcribe`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Transkripsi telah dimulai di latar belakang. Silakan segarkan halaman dalam beberapa menit.");
        fetchData();
      } else {
        const data = await res.json();
        alert("Gagal memulai transkripsi: " + data.error);
      }
    } catch (err) { 
      console.error(err);
      alert("Terjadi kesalahan saat menghubungi server.");
    }
    setTranscribingId(null);
  };

  const fetchSchedulesOnly = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/admin/schedules`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSchedulesList(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Polling for transcription progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const hasActiveProcess = schedulesList.some(s => s.isTranscribing || s.isAnalyzing);
    
    if (hasActiveProcess) {
      interval = setInterval(() => {
        fetchSchedulesOnly();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [schedulesList]);

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

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                           u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !token) return;
    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingUser),
      });
      if (res.ok) {
        const { password, ...safeUser } = editingUser;
        setUsers(users.map((u) => (u.id === editingUser.id ? safeUser : u)));
        setEditingUser(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (id: number) => {
    if (!token || !confirm("Yakin ingin menghapus pengguna ini?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(users.filter((u) => u.id !== id));
    } catch (err) { console.error(err); }
  };

  const filteredSchedules = useMemo(() => {
    return schedulesList.filter((s) => {
      const dewanNames = s.participants.map((p: any) => p.dewan.name).join(" ").toLowerCase();
      const matchesSearch = (s.title || "").toLowerCase().includes(scheduleSearch.toLowerCase()) || 
                           (s.masyarakat?.name || "").toLowerCase().includes(scheduleSearch.toLowerCase()) ||
                           dewanNames.includes(scheduleSearch.toLowerCase());
      const matchesStatus = scheduleStatusFilter === "all" || s.status === scheduleStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [schedulesList, scheduleSearch, scheduleStatusFilter]);

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule || !token) return;
    try {
      const res = await fetch(`${backendUrl}/api/admin/schedules/${editingSchedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editingSchedule),
      });
      if (res.ok) {
        setSchedulesList(schedulesList.map((s) => (s.id === editingSchedule.id ? { ...s, ...editingSchedule } : s)));
        setEditingSchedule(null);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!token || !confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/admin/schedules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSchedulesList(schedulesList.filter((s) => s.id !== id));
    } catch (err) { console.error(err); }
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
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span>System Online</span>
                </div>
                <button onClick={fetchData} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground" title="Refresh Data">
                  <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 mt-8 p-1 bg-muted/50 rounded-2xl w-fit">
              {[
                { id: "overview", label: "Overview", icon: TrendingUp },
                { id: "ratings", label: "Penilaian Dewan", icon: Star },
                { id: "users", label: "Pengguna", icon: Users },
                { id: "schedules", label: "Jadwal", icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Pengguna", value: stats.totalUsers, icon: Users, color: "text-blue-500 bg-blue-50" },
                  { label: "Total Pertemuan", value: stats.totalMeetings, icon: Video, color: "text-purple-500 bg-purple-50" },
                  { label: "Rating Rata-rata", value: stats.avgRating.toFixed(1), icon: Star, color: "text-amber-500 bg-amber-50" },
                  { label: "Total Ulasan", value: stats.totalRatings, icon: MessageSquare, color: "text-emerald-500 bg-emerald-50" },
                ].map((s, i) => (
                  <div key={i} className="bg-card border border-border p-5 rounded-[2rem] shadow-sm">
                    <div className={`w-10 h-10 rounded-2xl ${s.color} flex items-center justify-center mb-3`}>
                      <s.icon size={20} />
                    </div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{s.label}</p>
                    <h4 className="text-2xl font-black mt-1 tracking-tight">{s.value}</h4>
                  </div>
                ))}
              </div>

              <DashboardCharts title="Statistik Aktivitas Platform" />

              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black tracking-tight">Kinerja Anggota Dewan</h3>
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Berdasarkan Ulasan Masyarakat</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dewanList.map((d) => (
                    <DewanPerformanceCard key={d.id} dewan={d} ratings={ratings} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ratings" && (
            <section className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    placeholder="Cari dewan, masyarakat, atau topik..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-2xl text-xs font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Dewan</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Masyarakat</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest cursor-pointer hover:text-primary transition-colors" onClick={() => toggleSort("meetingDate")}>
                          Tanggal {sortBy === "meetingDate" && (sortDir === "desc" ? "↓" : "↑")}
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest cursor-pointer hover:text-primary transition-colors text-center" onClick={() => toggleSort("avgScore")}>
                          Rating {sortBy === "avgScore" && (sortDir === "desc" ? "↓" : "↑")}
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Komentar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredRatings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic text-sm">Tidak ada data penilaian yang ditemukan.</td>
                        </tr>
                      ) : (
                        filteredRatings.map((r) => (
                          <tr key={r.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm text-foreground">{r.dewanName}</div>
                              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{r.dewanFraksi || "Tanpa Fraksi"}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-sm">{r.masyarakatName}</div>
                              <div className="text-[10px] text-muted-foreground">{r.meetingTitle}</div>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-muted-foreground tabular-nums">
                              {new Date(r.meetingDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'long', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-full flex items-center gap-1.5 group-hover:scale-110 transition-transform">
                                  <Star size={12} className="text-amber-500 fill-amber-500" />
                                  <span className="text-xs font-black text-amber-700">{r.avgScore}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] italic group-hover:line-clamp-none transition-all">
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
            </section>
          )}

          {activeTab === "users" && (
            <section className="space-y-6 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    placeholder="Cari nama atau email pengguna..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2 bg-muted/50 border-none rounded-2xl text-xs font-bold outline-none"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">Semua Peran</option>
                  <option value="admin">Admin</option>
                  <option value="dewan">Dewan</option>
                  <option value="masyarakat">Masyarakat</option>
                </select>
              </div>

              <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">ID</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nama</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Peran</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-6 py-4 text-xs font-bold text-muted-foreground tabular-nums">#{u.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm text-foreground">{u.name}</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{u.email}</td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                u.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                                u.role === 'dewan' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                'bg-slate-50 text-slate-600 border border-slate-100'
                              }`}>
                                {u.role}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setEditingUser(u)}
                                className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeTab === "schedules" && (
            <section className="space-y-6 animate-in fade-in duration-500">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    placeholder="Cari topik atau partisipan..."
                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2 bg-muted/50 border-none rounded-2xl text-xs font-bold outline-none"
                  value={scheduleStatusFilter}
                  onChange={(e) => setScheduleStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu</option>
                  <option value="accepted">Disetujui</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">ID</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Detail Pertemuan</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Partisipan</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredSchedules.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-6 py-4 text-xs font-bold text-muted-foreground tabular-nums">#{s.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm text-foreground">{s.title || "Tanpa Judul"}</div>
                            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1">
                              <Calendar size={10} />
                              {new Date(s.startTime).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[11px] font-semibold text-foreground">
                              {s.masyarakat?.name} (Warga)
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {s.participants.map((p: any) => (
                                <span key={p.dewan.id} className="text-[9px] px-1.5 py-0.5 bg-muted rounded border border-border text-muted-foreground font-medium">
                                  {p.dewan.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                s.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                s.status === 'accepted' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                s.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                'bg-amber-50 text-amber-600 border border-amber-100'
                              }`}>
                                {s.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {s.recordingUrl && (
                                <a
                                  href={s.recordingUrl.startsWith('http') ? s.recordingUrl : `${backendUrl}${s.recordingUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-emerald-500 transition-colors"
                                  title="Tonton Rekaman"
                                >
                                  <Video size={14} />
                                </a>
                              )}

                              {(s.status === 'accepted' || s.status === 'CONFIRMED' || s.status === 'confirmed') && (
                                <button
                                  onClick={() => router.push(`/room/${s.id}`)}
                                  className="p-1.5 hover:bg-blue-500/10 rounded-lg text-blue-500 transition-colors"
                                  title="Gabung Ruangan"
                                >
                                  <ExternalLink size={14} />
                                </button>
                              )}

                              {s.recordingUrl && s.status === 'completed' && (
                                <button
                                  onClick={() => {
                                    setViewingAnalysis(s.analysis || { pending: true });
                                    setViewingTranscription(s.transcription || "");
                                    setAnalysisTitle(s.title || "Diskusi Aspirasi");
                                  }}
                                  className="p-1.5 hover:bg-purple-500/10 rounded-lg text-purple-500 transition-colors"
                                  title="Lihat Laporan AI & Transkrip"
                                >
                                  <BarChart2 size={14} />
                                </button>
                              )}

                              <button
                                onClick={() => setEditingSchedule({ ...s, startTime: new Date(s.startTime).toISOString().slice(0, 16) })}
                                className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(s.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-bold text-lg">Edit Profil Pengguna</h3>
                <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Nama Lengkap</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Peran (Role)</label>
                    <select
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="dewan">Dewan</option>
                      <option value="masyarakat">Masyarakat</option>
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-6 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors">Batal</button>
                  <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Schedule Modal */}
        {editingSchedule && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-bold text-lg">Edit Jadwal Pertemuan</h3>
                <button onClick={() => setEditingSchedule(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateSchedule}>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Topik Pertemuan</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      value={editingSchedule.title}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Waktu Mulai</label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      value={editingSchedule.startTime}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase ml-1">Status</label>
                    <select
                      className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                      value={editingSchedule.status}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                  <button type="button" onClick={() => setEditingSchedule(null)} className="px-6 py-2 rounded-xl text-sm font-bold hover:bg-muted transition-colors">Batal</button>
                  <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transcription View Modal */}
        {viewingTranscription && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h3 className="font-bold text-lg">Hasil Transkripsi</h3>
                <button onClick={() => setViewingTranscription(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {viewingTranscription}
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end">
                <button 
                  onClick={() => {
                    const blob = new Blob([viewingTranscription], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `transkripsi.txt`;
                    a.click();
                  }}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Unduh (.txt)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis & Transcription Modal */}
        <AnalysisModal 
          isOpen={!!viewingAnalysis} 
          onClose={() => {
            setViewingAnalysis(null);
            setViewingTranscription(null);
          }} 
          data={viewingAnalysis}
          transcription={viewingTranscription}
          title={analysisTitle}
        />
      </div>
    </ProtectedRoute>
  );
}