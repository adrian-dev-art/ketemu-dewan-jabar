"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users, User, Video, Star, Settings, ShieldCheck, TrendingUp, MessageSquare, 
  RefreshCw, ChevronDown, ChevronUp, Search, Download, BarChart2, 
  Filter, Database, Trash2, Edit, Check, X, Calendar, Languages, 
  FileText, Loader2, ExternalLink, ArrowUpDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, RotateCcw, SlidersHorizontal, CalendarDays,
  MapPin, Layers
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

const JABAR_KAB_KOTA = [
  "Kota Bandung", "Kabupaten Bandung", "Kabupaten Bandung Barat", "Kota Cimahi",
  "Kabupaten Bogor", "Kota Bogor", "Kota Depok", "Kota Bekasi", "Kabupaten Bekasi",
  "Kabupaten Karawang", "Kabupaten Subang", "Kabupaten Purwakarta", "Kabupaten Cianjur",
  "Kabupaten Sukabumi", "Kota Sukabumi", "Kabupaten Sumedang", "Kabupaten Garut",
  "Kabupaten Indramayu", "Kabupaten Majalengka", "Kabupaten Cirebon", "Kota Cirebon",
  "Kabupaten Kuningan", "Kabupaten Tasikmalaya", "Kota Tasikmalaya", "Kabupaten Ciamis",
  "Kota Banjar", "Kabupaten Pangandaran"
];

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
  const [roleFilter, setRoleFilter] = useState("all");

  // --- Advanced Schedule States ---
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState("all");
  const [scheduleCategoryFilter, setScheduleCategoryFilter] = useState("all");
  const [scheduleRegencyFilter, setScheduleRegencyFilter] = useState("all");
  const [scheduleStartDate, setScheduleStartDate] = useState("");
  const [scheduleEndDate, setScheduleEndDate] = useState("");
  const [scheduleSortBy, setScheduleSortBy] = useState<"startTime" | "id" | "title" | "status">("startTime");
  const [scheduleSortDir, setScheduleSortDir] = useState<"desc" | "asc">("desc");
  const [schedulePage, setSchedulePage] = useState(1);
  const [schedulePageSize, setSchedulePageSize] = useState(15);

  const [transcribingId, setTranscribingId] = useState<number | null>(null);
  const [viewingScheduleId, setViewingScheduleId] = useState<number | null>(null);
  const [analysisTitle, setAnalysisTitle] = useState<string>("");

  const viewingSchedule = useMemo(() => {
    return schedulesList.find(s => s.id === viewingScheduleId);
  }, [schedulesList, viewingScheduleId]);

  const viewingAnalysis = useMemo(() => {
    if (!viewingSchedule) return null;
    return viewingSchedule.analysis || { pending: true };
  }, [viewingSchedule]);

  const viewingTranscription = useMemo(() => {
    if (!viewingSchedule) return null;
    return viewingSchedule.transcription || "";
  }, [viewingSchedule]);

  // Reset page when filters change
  useEffect(() => {
    setSchedulePage(1);
  }, [scheduleSearch, scheduleStatusFilter, scheduleCategoryFilter, scheduleRegencyFilter, scheduleStartDate, scheduleEndDate, schedulePageSize]);

  const toggleScheduleSort = (field: "startTime" | "id" | "title" | "status") => {
    if (scheduleSortBy === field) {
      setScheduleSortDir(scheduleSortDir === "asc" ? "desc" : "asc");
    } else {
      setScheduleSortBy(field);
      setScheduleSortDir(field === "title" ? "asc" : "desc");
    }
  };

  const applyDatePreset = (preset: "all" | "7d" | "30d" | "this_month" | "this_year") => {
    const now = new Date();
    const formatDate = (d: Date) => d.toISOString().slice(0, 10);
    
    if (preset === "all") {
      setScheduleStartDate("");
      setScheduleEndDate("");
    } else if (preset === "7d") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setScheduleStartDate(formatDate(past));
      setScheduleEndDate(formatDate(now));
    } else if (preset === "30d") {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setScheduleStartDate(formatDate(past));
      setScheduleEndDate(formatDate(now));
    } else if (preset === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setScheduleStartDate(formatDate(startOfMonth));
      setScheduleEndDate(formatDate(now));
    } else if (preset === "this_year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      setScheduleStartDate(formatDate(startOfYear));
      setScheduleEndDate(formatDate(now));
    }
  };

  const resetScheduleFilters = () => {
    setScheduleSearch("");
    setScheduleStatusFilter("all");
    setScheduleCategoryFilter("all");
    setScheduleRegencyFilter("all");
    setScheduleStartDate("");
    setScheduleEndDate("");
    setScheduleSortBy("startTime");
    setScheduleSortDir("desc");
    setSchedulePage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (scheduleSearch) count++;
    if (scheduleStatusFilter !== "all") count++;
    if (scheduleCategoryFilter !== "all") count++;
    if (scheduleRegencyFilter !== "all") count++;
    if (scheduleStartDate || scheduleEndDate) count++;
    return count;
  }, [scheduleSearch, scheduleStatusFilter, scheduleCategoryFilter, scheduleRegencyFilter, scheduleStartDate, scheduleEndDate]);

  const filteredAndSortedSchedules = useMemo(() => {
    const filtered = schedulesList.filter((s) => {
      const dewanNames = (s.participants || []).map((p: any) => p.dewan?.name || "").join(" ").toLowerCase();
      const titleStr = (s.title || "").toLowerCase();
      const citizenStr = (s.masyarakat?.name || "").toLowerCase();
      const kabStr = (s.masyarakat?.kabupaten || "").toLowerCase();
      const kecStr = (s.masyarakat?.kecamatan || "").toLowerCase();
      const searchLower = scheduleSearch.toLowerCase();

      const matchesSearch = !scheduleSearch || 
        titleStr.includes(searchLower) || 
        citizenStr.includes(searchLower) ||
        dewanNames.includes(searchLower) ||
        kabStr.includes(searchLower) ||
        kecStr.includes(searchLower);

      const matchesStatus = scheduleStatusFilter === "all" || (s.status || "").toLowerCase() === scheduleStatusFilter.toLowerCase();

      const matchesRegency = scheduleRegencyFilter === "all" || 
        kabStr.includes(scheduleRegencyFilter.toLowerCase()) || 
        titleStr.includes(scheduleRegencyFilter.toLowerCase());

      const matchesCategory = scheduleCategoryFilter === "all" || (() => {
        if (scheduleCategoryFilter === "kunker") return titleStr.includes("kunjungan kerja") || titleStr.includes("kunker");
        if (scheduleCategoryFilter === "reses") return titleStr.includes("reses");
        if (scheduleCategoryFilter === "aspirasi") return titleStr.includes("aspirasi") || titleStr.includes("audiensi");
        return true;
      })();

      const matchesDate = (() => {
        if (!scheduleStartDate && !scheduleEndDate) return true;
        const sTime = new Date(s.startTime).getTime();
        if (scheduleStartDate) {
          const start = new Date(scheduleStartDate).setHours(0, 0, 0, 0);
          if (sTime < start) return false;
        }
        if (scheduleEndDate) {
          const end = new Date(scheduleEndDate).setHours(23, 59, 59, 999);
          if (sTime > end) return false;
        }
        return true;
      })();

      return matchesSearch && matchesStatus && matchesRegency && matchesCategory && matchesDate;
    });

    return filtered.sort((a, b) => {
      let comp = 0;
      if (scheduleSortBy === "startTime") {
        comp = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      } else if (scheduleSortBy === "id") {
        comp = a.id - b.id;
      } else if (scheduleSortBy === "title") {
        comp = (a.title || "").localeCompare(b.title || "");
      } else if (scheduleSortBy === "status") {
        comp = (a.status || "").localeCompare(b.status || "");
      }
      return scheduleSortDir === "asc" ? comp : -comp;
    });
  }, [schedulesList, scheduleSearch, scheduleStatusFilter, scheduleRegencyFilter, scheduleCategoryFilter, scheduleStartDate, scheduleEndDate, scheduleSortBy, scheduleSortDir]);

  const totalScheduleItems = filteredAndSortedSchedules.length;
  const totalSchedulePages = Math.max(1, Math.ceil(totalScheduleItems / schedulePageSize));
  const paginatedSchedules = useMemo(() => {
    const startIdx = (schedulePage - 1) * schedulePageSize;
    return filteredAndSortedSchedules.slice(startIdx, startIdx + schedulePageSize);
  }, [filteredAndSortedSchedules, schedulePage, schedulePageSize]);

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
      const matchesStatus = scheduleStatusFilter === "all" || (s.status || "").toLowerCase() === scheduleStatusFilter.toLowerCase();
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
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center w-14">No.</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nama</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Peran</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredUsers.map((u, idx) => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-5 py-4 text-xs font-bold text-muted-foreground tabular-nums text-center">{idx + 1}</td>
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
              {/* --- ADVANCED FILTER & CONTROL BAR --- */}
              <div className="bg-card border border-border p-5 rounded-[2rem] shadow-sm space-y-4">
                {/* Row 1: Search & Primary Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                    <input
                      type="text"
                      placeholder="Cari topik, dewan, warga, wilayah..."
                      className="w-full pl-10 pr-9 py-2.5 bg-muted/50 border border-border/50 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={scheduleSearch}
                      onChange={(e) => setScheduleSearch(e.target.value)}
                    />
                    {scheduleSearch && (
                      <button
                        onClick={() => setScheduleSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      className="w-full px-3.5 py-2.5 bg-muted/50 border border-border/50 rounded-2xl text-xs font-semibold outline-none cursor-pointer hover:bg-muted transition-colors"
                      value={scheduleStatusFilter}
                      onChange={(e) => setScheduleStatusFilter(e.target.value)}
                    >
                      <option value="all">Semua Status</option>
                      <option value="completed">Selesai (Completed)</option>
                      <option value="confirmed">Disetujui (Confirmed)</option>
                      <option value="pending">Menunggu (Pending)</option>
                      <option value="cancelled">Dibatalkan (Cancelled)</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <select
                      className="w-full px-3.5 py-2.5 bg-muted/50 border border-border/50 rounded-2xl text-xs font-semibold outline-none cursor-pointer hover:bg-muted transition-colors"
                      value={scheduleCategoryFilter}
                      onChange={(e) => setScheduleCategoryFilter(e.target.value)}
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="kunker">🏛️ Kunjungan Kerja</option>
                      <option value="reses">📢 Reses Masa Sidang</option>
                      <option value="aspirasi">🤝 Audiensi & Aspirasi</option>
                    </select>
                  </div>

                  {/* Regency Filter */}
                  <div className="relative">
                    <select
                      className="w-full px-3.5 py-2.5 bg-muted/50 border border-border/50 rounded-2xl text-xs font-semibold outline-none cursor-pointer hover:bg-muted transition-colors"
                      value={scheduleRegencyFilter}
                      onChange={(e) => setScheduleRegencyFilter(e.target.value)}
                    >
                      <option value="all">Semua 27 Kab/Kota Jabar</option>
                      {JABAR_KAB_KOTA.map((kab) => (
                        <option key={kab} value={kab}>{kab}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Date Filters, Presets & Reset */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
                  {/* Date Range Inputs */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                      <CalendarDays size={13} />
                      Rentang Tanggal:
                    </span>
                    <input
                      type="date"
                      className="px-2.5 py-1.5 bg-muted/50 border border-border/50 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/30"
                      value={scheduleStartDate}
                      onChange={(e) => setScheduleStartDate(e.target.value)}
                      title="Tanggal Mulai"
                    />
                    <span className="text-muted-foreground font-bold">-</span>
                    <input
                      type="date"
                      className="px-2.5 py-1.5 bg-muted/50 border border-border/50 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary/30"
                      value={scheduleEndDate}
                      onChange={(e) => setScheduleEndDate(e.target.value)}
                      title="Tanggal Selesai"
                    />

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1 ml-1">
                      {[
                        { label: "Semua", val: "all" },
                        { label: "7 Hari", val: "7d" },
                        { label: "30 Hari", val: "30d" },
                        { label: "Bulan Ini", val: "this_month" },
                        { label: "Tahun Ini", val: "this_year" },
                      ].map((p) => (
                        <button
                          key={p.val}
                          onClick={() => applyDatePreset(p.val as any)}
                          className="px-2 py-1 text-[10px] font-bold rounded-lg border border-border/60 hover:bg-muted hover:border-primary/40 transition-all text-muted-foreground hover:text-foreground"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset & Stats Badge */}
                  <div className="flex items-center gap-2.5 ml-auto">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Menampilkan <strong className="text-foreground">{paginatedSchedules.length}</strong> dari <strong className="text-foreground">{totalScheduleItems}</strong> sesi
                    </span>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetScheduleFilters}
                        className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl text-[11px] font-bold transition-all"
                        title="Reset semua filter"
                      >
                        <RotateCcw size={11} />
                        Reset ({activeFiltersCount})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* --- TABLE CONTAINER --- */}
              <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border select-none">
                        {/* No Column */}
                        <th className="px-5 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center w-14">
                          <span>No.</span>
                        </th>

                        {/* Sortable Title */}
                        <th
                          onClick={() => toggleScheduleSort("title")}
                          className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest cursor-pointer hover:bg-muted/60 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Detail Pertemuan & Agenda</span>
                            {scheduleSortBy === "title" ? (
                              scheduleSortDir === "asc" ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />
                            ) : (
                              <ArrowUpDown size={11} className="text-muted-foreground/40" />
                            )}
                          </div>
                        </th>

                        {/* Participants */}
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                          Partisipan (Dewan & Warga)
                        </th>

                        {/* Sortable Date */}
                        <th
                          onClick={() => toggleScheduleSort("startTime")}
                          className="px-5 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest cursor-pointer hover:bg-muted/60 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Waktu Pelaksanaan</span>
                            {scheduleSortBy === "startTime" ? (
                              scheduleSortDir === "asc" ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />
                            ) : (
                              <ArrowUpDown size={11} className="text-muted-foreground/40" />
                            )}
                          </div>
                        </th>

                        {/* Sortable Status */}
                        <th
                          onClick={() => toggleScheduleSort("status")}
                          className="px-5 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center cursor-pointer hover:bg-muted/60 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Status</span>
                            {scheduleSortBy === "status" ? (
                              scheduleSortDir === "asc" ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />
                            ) : (
                              <ArrowUpDown size={11} className="text-muted-foreground/40" />
                            )}
                          </div>
                        </th>

                        {/* Actions */}
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">
                          Aksi & Laporan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {paginatedSchedules.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-14 text-center">
                            <div className="max-w-xs mx-auto space-y-2">
                              <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                                <Search size={22} />
                              </div>
                              <h4 className="font-bold text-sm text-foreground">Tidak Ada Jadwal Ditemukan</h4>
                              <p className="text-xs text-muted-foreground">
                                Coba ubah kata kunci pencarian, rentang tanggal, atau reset filter Anda.
                              </p>
                              {activeFiltersCount > 0 && (
                                <button
                                  onClick={resetScheduleFilters}
                                  className="mt-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-sm"
                                >
                                  Reset Semua Filter
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedSchedules.map((s, idx) => {
                          const rowNumber = ((schedulePage - 1) * schedulePageSize) + idx + 1;
                          const isKunker = (s.title || "").toLowerCase().includes("kunjungan kerja") || (s.title || "").toLowerCase().includes("kunker");
                          const isReses = (s.title || "").toLowerCase().includes("reses");

                          return (
                            <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                              {/* No. */}
                              <td className="px-5 py-4 text-xs font-bold text-muted-foreground tabular-nums text-center">
                                {rowNumber}
                              </td>

                              {/* Detail Title */}
                              <td className="px-6 py-4 max-w-md">
                                <div className="flex items-center gap-1.5 mb-1">
                                  {isKunker && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-blue-500/10 text-blue-600 border border-blue-200/50">
                                      Kunjungan Kerja
                                    </span>
                                  )}
                                  {isReses && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-200/50">
                                      Reses Dapil
                                    </span>
                                  )}
                                  {!isKunker && !isReses && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase bg-purple-500/10 text-purple-600 border border-purple-200/50">
                                      Aspirasi
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-sm text-foreground line-clamp-2" title={s.title}>
                                  {s.title || "Tanpa Judul"}
                                </div>
                                {s.masyarakat?.kabupaten && (
                                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin size={11} className="text-primary/70" />
                                    <span>{s.masyarakat.kabupaten} {s.masyarakat.kecamatan ? `• Kec. ${s.masyarakat.kecamatan}` : ''}</span>
                                  </div>
                                )}
                              </td>

                              {/* Participants */}
                              <td className="px-6 py-4">
                                <div className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                                  <User size={11} className="text-muted-foreground" />
                                  <span>{s.masyarakat?.name || "Masyarakat Jabar"}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {(s.participants || []).map((p: any) => (
                                    <span
                                      key={p.dewan?.id || Math.random()}
                                      className="text-[10px] px-2 py-0.5 bg-muted/80 rounded-lg border border-border text-foreground font-semibold flex items-center gap-1"
                                      title={p.dewan?.fraksi ? `Fraksi: ${p.dewan.fraksi}` : undefined}
                                    >
                                      <ShieldCheck size={10} className="text-primary" />
                                      {p.dewan?.name || "Anggota Dewan"}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              {/* Date */}
                              <td className="px-5 py-4 whitespace-nowrap">
                                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                  <Calendar size={12} className="text-muted-foreground" />
                                  {new Date(s.startTime).toLocaleDateString("id-ID", {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 ml-4 font-mono">
                                  {new Date(s.startTime).toLocaleTimeString("id-ID", {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} WIB
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-5 py-4">
                                <div className="flex justify-center">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    s.status === 'completed' || s.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    s.status === 'confirmed' || s.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    s.status === 'cancelled' || s.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                    {s.status}
                                  </span>
                                </div>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {s.recordingUrl && (
                                    <a
                                      href={s.recordingUrl.startsWith('http') ? s.recordingUrl : `${backendUrl}${s.recordingUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2 hover:bg-emerald-500/10 rounded-xl text-emerald-600 border border-emerald-200/40 transition-colors"
                                      title="Tonton Rekaman"
                                    >
                                      <Video size={14} />
                                    </a>
                                  )}

                                  {(s.status === 'confirmed' || s.status === 'CONFIRMED') && (
                                    <button
                                      onClick={() => router.push(`/room/${s.id}`)}
                                      className="p-2 hover:bg-blue-500/10 rounded-xl text-blue-600 border border-blue-200/40 transition-colors"
                                      title="Gabung Ruangan"
                                    >
                                      <ExternalLink size={14} />
                                    </button>
                                  )}

                                  {(s.analysis || s.transcription || s.recordingUrl) && (
                                    <button
                                      onClick={() => {
                                        setViewingScheduleId(s.id);
                                        setAnalysisTitle(s.title || "Diskusi Aspirasi");
                                      }}
                                      className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl transition-all shadow-xs"
                                      title="Buka Laporan AI & Transkrip"
                                    >
                                      <BarChart2 size={14} />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setEditingSchedule({ ...s, startTime: new Date(s.startTime).toISOString().slice(0, 16) })}
                                    className="p-2 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-colors"
                                    title="Edit Jadwal"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(s.id)}
                                    className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-colors"
                                    title="Hapus Jadwal"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- PAGINATION & ROWS FOOTER --- */}
                {totalScheduleItems > 0 && (
                  <div className="px-6 py-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    {/* Rows per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Baris per halaman:</span>
                      <select
                        className="px-2.5 py-1 bg-card border border-border rounded-xl font-bold outline-none cursor-pointer"
                        value={schedulePageSize}
                        onChange={(e) => setSchedulePageSize(Number(e.target.value))}
                      >
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="text-muted-foreground ml-2">
                        {((schedulePage - 1) * schedulePageSize) + 1} - {Math.min(schedulePage * schedulePageSize, totalScheduleItems)} dari {totalScheduleItems}
                      </span>
                    </div>

                    {/* Pagination Navigation */}
                    <div className="flex items-center gap-1.5">
                      {/* First Page */}
                      <button
                        onClick={() => setSchedulePage(1)}
                        disabled={schedulePage === 1}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Halaman Pertama"
                      >
                        <ChevronsLeft size={14} />
                      </button>

                      {/* Prev Page */}
                      <button
                        onClick={() => setSchedulePage(prev => Math.max(1, prev - 1))}
                        disabled={schedulePage === 1}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Halaman Sebelumnya"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {/* Page Numbers */}
                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalSchedulePages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalSchedulePages || Math.abs(p - schedulePage) <= 1)
                          .map((p, idx, arr) => {
                            const prevP = arr[idx - 1];
                            return (
                              <React.Fragment key={p}>
                                {prevP && p - prevP > 1 && (
                                  <span className="px-1 text-muted-foreground">...</span>
                                )}
                                <button
                                  onClick={() => setSchedulePage(p)}
                                  className={`w-7 h-7 rounded-lg font-bold text-xs transition-all ${
                                    schedulePage === p
                                      ? 'bg-primary text-primary-foreground shadow-xs'
                                      : 'bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  {p}
                                </button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      {/* Next Page */}
                      <button
                        onClick={() => setSchedulePage(prev => Math.min(totalSchedulePages, prev + 1))}
                        disabled={schedulePage === totalSchedulePages}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Halaman Berikutnya"
                      >
                        <ChevronRight size={14} />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() => setSchedulePage(totalSchedulePages)}
                        disabled={schedulePage === totalSchedulePages}
                        className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title="Halaman Terakhir"
                      >
                        <ChevronsRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
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
                      <option value="confirmed">Confirmed</option>
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



        {/* Analysis & Transcription Modal */}
        <AnalysisModal 
          isOpen={!!viewingScheduleId} 
          onClose={() => {
            setViewingScheduleId(null);
          }} 
          data={viewingAnalysis}
          transcription={viewingTranscription}
          title={analysisTitle}
        />
      </div>
    </ProtectedRoute>
  );
}