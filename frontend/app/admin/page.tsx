"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Settings,
  ShieldCheck,
  RefreshCw,
  LayoutDashboard,
  CalendarDays,
  Users,
  Award,
  MessageSquare,
} from "lucide-react";
import AnalysisModal from "@/components/AnalysisModal";
import FollowUpTimelineModal, { FollowUpData } from "@/components/FollowUpTimelineModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSocketUpdates } from "@/hooks/useSocketUpdates";

import AdminOverviewTab from "@/components/admin/AdminOverviewTab";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminSchedulesTab from "@/components/admin/AdminSchedulesTab";
import AdminRatingsTab from "@/components/admin/AdminRatingsTab";
import AdminAspirasiTab from "@/components/admin/AdminAspirasiTab";

type TabKey = "overview" | "schedules" | "users" | "ratings" | "aspirasi";

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ElementType;
  count?: number;
}

import { getBackendUrl } from "@/context/utils";

export default function AdminDashboard() {
  const { token } = useAuth();
  const router = useRouter();
  const backendUrl = getBackendUrl();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalMeetings: 0, avgRating: 0, totalRatings: 0 });
  const [ratings, setRatings] = useState<any[]>([]);
  const [dewanList, setDewanList] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [schedulesList, setSchedulesList] = useState<any[]>([]);

  // Modal States
  const [viewingScheduleId, setViewingScheduleId] = useState<number | null>(null);
  const [analysisTitle, setAnalysisTitle] = useState<string>("");
  const [followUpScheduleId, setFollowUpScheduleId] = useState<number | null>(null);

  const viewingSchedule = useMemo(() => {
    return schedulesList.find((s) => s.id === viewingScheduleId);
  }, [schedulesList, viewingScheduleId]);

  const followUpSchedule = useMemo(() => {
    return schedulesList.find((s) => s.id === followUpScheduleId) || null;
  }, [schedulesList, followUpScheduleId]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, ratingsRes, dewanRes, usersRes, schedulesRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/stats`, { headers }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${backendUrl}/api/admin/ratings`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${backendUrl}/api/dewan`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${backendUrl}/api/admin/users`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${backendUrl}/api/admin/schedules`, { headers }).then((r) => (r.ok ? r.json() : [])),
      ]);

      if (statsRes) setStats(statsRes);
      if (ratingsRes) setRatings(ratingsRes);
      if (dewanRes) setDewanList(dewanRes);
      if (usersRes) setUsers(usersRes);
      if (schedulesRes) setSchedulesList(schedulesRes);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  }, [token, backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useSocketUpdates({
    onScheduleUpdated: () => fetchData(),
    onScheduleCreated: () => fetchData(),
    onFollowUpUpdated: (data) => {
      if (data?.followUp) {
        setSchedulesList((prev) =>
          prev.map((s) => (s.id === data.scheduleId ? { ...s, followUp: data.followUp } : s))
        );
      } else {
        fetchData();
      }
    },
    onRatingCreated: () => fetchData(),
  });

  const handleFollowUpUpdate = (updatedFollowUp: FollowUpData) => {
    setSchedulesList((prev) =>
      prev.map((s) => (s.id === updatedFollowUp.scheduleId ? { ...s, followUp: updatedFollowUp } : s))
    );
  };

  const followUpStats = useMemo(() => {
    let totalDisposed = 0;
    let completed = 0;
    let inProgress = 0;
    let viewed = 0;
    let notDisposed = 0;

    schedulesList.forEach((s) => {
      const f = s.followUp;
      if (f && (f.isShared || (f.progressPercent && f.progressPercent > 0))) {
        totalDisposed++;
        if (f.progressPercent === 100 || f.status === "selesai") completed++;
        else if (f.progressPercent >= 50) inProgress++;
        else if (f.isViewed) viewed++;
      } else {
        notDisposed++;
      }
    });

    return { totalDisposed, completed, inProgress, viewed, notDisposed };
  }, [schedulesList]);

  const handleExportBackup = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin/management/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meetdewan_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      alert("Gagal mengunduh berkas cadangan");
    }
  };

  const tabs: TabDef[] = [
    { key: "overview", label: "Ringkasan", icon: LayoutDashboard },
    { key: "aspirasi", label: "E-Aspirasi", icon: MessageSquare },
    { key: "schedules", label: "Jadwal Sesi", icon: CalendarDays, count: schedulesList.length },
    { key: "users", label: "Pengguna", icon: Users, count: users.length },
    { key: "ratings", label: "Rapor Legislator", icon: Award, count: ratings.length },
  ];

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background text-foreground pb-16">

        {/* ── Admin Page Header & Navigation Bar ── */}
        <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Identity Badge */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-foreground leading-snug">
                  Panel Super Administrator
                </h1>
                <p className="text-xs text-muted-foreground">
                  Pusat Kendali Aspirasi &amp; Pengawasan DPRD Provinsi Jawa Barat
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                id="admin-refresh-btn"
                onClick={fetchData}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border bg-card/90 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-all shadow-xs active:scale-95 disabled:opacity-50"
                title="Muat Ulang Data"
              >
                <RefreshCw size={13} className={loading ? "animate-spin text-primary" : ""} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>

              <button
                id="admin-settings-btn"
                onClick={() => router.push("/admin/settings")}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border bg-card/90 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                title="Pengaturan Sistem"
              >
                <Settings size={13} />
                <span className="hidden sm:inline">Pengaturan</span>
              </button>
            </div>
          </div>

          {/* ── Modern Floating Pill Tab Bar ── */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
            <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 dark:bg-muted/25 rounded-2xl border border-border/70 overflow-x-auto custom-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    id={`admin-tab-${tab.key}`}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 select-none ${
                      isActive
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/70"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted-foreground/15 text-muted-foreground"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* ── Main Tab Content ── */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {activeTab === "overview" && (
            <AdminOverviewTab
              stats={stats}
              followUpStats={followUpStats}
              ratings={ratings}
              setActiveTab={setActiveTab}
              onExportBackup={handleExportBackup}
            />
          )}

          {activeTab === "schedules" && (
            <AdminSchedulesTab
              schedules={schedulesList}
              token={token}
              backendUrl={backendUrl}
              onRefreshSchedules={fetchData}
              onOpenAnalysis={(id, title) => {
                setViewingScheduleId(id);
                setAnalysisTitle(title);
              }}
              onOpenFollowUp={(id) => setFollowUpScheduleId(id)}
            />
          )}

          {activeTab === "users" && (
            <AdminUsersTab
              users={users}
              token={token}
              backendUrl={backendUrl}
              onRefreshUsers={fetchData}
            />
          )}

          {activeTab === "ratings" && (
            <AdminRatingsTab ratings={ratings} dewanList={dewanList} />
          )}

          {activeTab === "aspirasi" && (
            <AdminAspirasiTab />
          )}
        </main>

        {/* Analysis Modal */}
        {viewingSchedule && (
          <AnalysisModal
            isOpen={Boolean(viewingScheduleId)}
            onClose={() => setViewingScheduleId(null)}
            title={analysisTitle}
            data={viewingSchedule.analysis || { pending: true }}
            transcription={viewingSchedule.transcription || ""}
          />
        )}

        {/* Follow Up Timeline Modal */}
        {followUpSchedule && (
          <FollowUpTimelineModal
            isOpen={Boolean(followUpScheduleId)}
            onClose={() => setFollowUpScheduleId(null)}
            schedule={followUpSchedule}
            onUpdate={handleFollowUpUpdate}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}