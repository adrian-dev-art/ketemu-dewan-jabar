"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, Save, Globe, Youtube, RefreshCw, Database, 
  Download, Trash2, ShieldCheck, Info, Loader2, CheckCircle2, 
  AlertCircle, ChevronRight, LayoutDashboard, Server, Link as LinkIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

type SettingTab = "general" | "streaming" | "sync" | "data";

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const [activeTab, setActiveTab] = useState<SettingTab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const [settings, setSettings] = useState<Record<string, string>>({
    app_name: "DPRD HUDANG",
    app_logo: "/images/logo-1.png",
    app_description: "Konferensi video aspirasi masyarakat bersama DPRD.",
    stream_url: "",
    stream_key: "",
    is_auto_stream: "false",
    hub_api_url: "",
    hub_secret: "",
    livekit_url: "",
  });

  const [cleanupDays, setCleanupDays] = useState("30");

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setStatus({ type: null, message: "" });
    try {
      const res = await fetch(`${backendUrl}/api/admin/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Pengaturan berhasil disimpan!" });
        // Refresh local settings to ensure consistency
        fetchSettings();
      } else {
        setStatus({ type: "error", message: "Gagal menyimpan pengaturan." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Kesalahan koneksi ke server." });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncCenter = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/sync-centre`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: `Sinkronisasi berhasil: ${data.members_processed || 0} data diproses.` });
      } else {
        setStatus({ type: "error", message: data.error || "Gagal sinkronisasi." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Kesalahan koneksi saat sinkronisasi." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportData = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/management/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meetdewan_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setStatus({ type: "success", message: "Data berhasil diekspor." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Gagal mengekspor data." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCleanupData = async () => {
    if (!confirm(`Hapus semua jadwal rapat yang lebih lama dari ${cleanupDays} hari? Tindakan ini tidak dapat dibatalkan.`)) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/management/cleanup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ daysOld: cleanupDays, type: "schedules" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: data.message });
      } else {
        setStatus({ type: "error", message: data.error || "Gagal melakukan cleanup." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Kesalahan koneksi saat cleanup." });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Menyiapkan Control Center...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <LayoutDashboard size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Administrator</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                Sistem & Manajemen Data
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Konfigurasi pusat untuk mengelola identitas aplikasi, infrastruktur streaming, sinkronisasi data pusat, dan pemeliharaan basis data.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push("/admin")}
                className="px-4 py-2 text-sm font-medium border border-border rounded-xl hover:bg-muted transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:transform-none"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Simpan Perubahan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Tabs */}
            <aside className="lg:col-span-3">
              <nav className="flex lg:flex-col p-1 bg-muted/50 rounded-2xl gap-1 border border-border">
                {[
                  { id: "general", label: "Aplikasi", icon: Globe, desc: "Identitas platform" },
                  { id: "streaming", label: "Streaming", icon: Youtube, desc: "Egress & LiveKit" },
                  { id: "sync", label: "Sinkronisasi", icon: RefreshCw, desc: "Master Hub Sync" },
                  { id: "data", label: "Manajemen Data", icon: Database, desc: "Export & Cleanup" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingTab)}
                    className={`flex items-center lg:flex-row flex-col gap-3 px-4 py-4 rounded-xl transition-all ${
                      activeTab === tab.id 
                        ? "bg-background shadow-md shadow-black/5 ring-1 ring-border text-primary" 
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    }`}
                  >
                    <tab.icon size={20} className={activeTab === tab.id ? "text-primary" : "text-muted-foreground"} />
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-bold">{tab.label}</p>
                      <p className="text-[10px] opacity-70 font-medium">{tab.desc}</p>
                    </div>
                  </button>
                ))}
              </nav>

              {status.type && (
                <div className={`mt-6 p-4 rounded-2xl border flex gap-3 animate-in fade-in slide-in-from-top-2 duration-500 ${
                  status.type === "success" 
                    ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                }`}>
                  {status.type === "success" ? <CheckCircle2 className="shrink-0 w-5 h-5" /> : <AlertCircle className="shrink-0 w-5 h-5" />}
                  <p className="text-sm font-semibold">{status.message}</p>
                </div>
              )}
            </aside>

            {/* Main Content Area */}
            <main className="lg:col-span-9">
              <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm backdrop-blur-sm bg-opacity-80">
                
                {/* General Settings Tab */}
                {activeTab === "general" && (
                  <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                        <Globe className="text-primary" size={20} /> Identitas Aplikasi
                      </h3>
                      <p className="text-sm text-muted-foreground">Sesuaikan bagaimana platform tampil kepada pengguna.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-1.5 ml-1">Nama Aplikasi</label>
                          <input
                            type="text"
                            value={settings.app_name}
                            onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                            className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                            placeholder="e.g. DPRD HUDANG"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-1.5 ml-1">URL Logo (PNG/SVG)</label>
                          <input
                            type="text"
                            value={settings.app_logo}
                            onChange={(e) => setSettings({ ...settings, app_logo: e.target.value })}
                            className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                            placeholder="https://example.com/logo.png"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold mb-1.5 ml-1">Deskripsi Platform</label>
                          <textarea
                            rows={4}
                            value={settings.app_description}
                            onChange={(e) => setSettings({ ...settings, app_description: e.target.value })}
                            className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                            placeholder="Deskripsi singkat tentang kegunaan aplikasi ini..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Streaming Settings Tab */}
                {activeTab === "streaming" && (
                  <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                        <Youtube className="text-red-500" size={20} /> Konfigurasi Egress & LiveKit
                      </h3>
                      <p className="text-sm text-muted-foreground">Kelola infrastruktur penyiaran langsung ke platform luar.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-muted/20 border border-border rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500/50" />
                        <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><Server size={16} /> YouTube RTMP Server</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Stream URL</label>
                            <input
                              type="text"
                              value={settings.stream_url}
                              onChange={(e) => setSettings({ ...settings, stream_url: e.target.value })}
                              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 font-mono text-xs"
                              placeholder="rtmp://a.rtmp.youtube.com/live2"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Stream Key</label>
                            <input
                              type="password"
                              value={settings.stream_key}
                              onChange={(e) => setSettings({ ...settings, stream_key: e.target.value })}
                              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 font-mono text-xs"
                              placeholder="•••• •••• ••••"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-muted/20 border border-border rounded-2xl italic">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="text-green-500" />
                          <div>
                            <p className="text-sm font-bold">Otomatisasi Streaming</p>
                            <p className="text-xs text-muted-foreground">Mulai streaming segera setelah rapat dimulai.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettings({ ...settings, is_auto_stream: settings.is_auto_stream === "true" ? "false" : "true" })}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${settings.is_auto_stream === "true" ? "bg-primary" : "bg-muted-foreground/30"}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${settings.is_auto_stream === "true" ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sync Center Tab */}
                {activeTab === "sync" && (
                  <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                          <RefreshCw className="text-blue-500" size={20} /> Sinkronisasi Master Hub
                        </h3>
                        <p className="text-sm text-muted-foreground">Hubungkan dengan Server Pusat untuk sinkronisasi data Aggota Dewan dan Organisasi (AKD).</p>
                        
                        <div className="mt-8 space-y-4">
                           <div>
                            <label className="block text-sm font-bold mb-1.5 ml-1">Master Hub API URL</label>
                            <div className="relative">
                              <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                              <input
                                type="text"
                                value={settings.hub_api_url}
                                onChange={(e) => setSettings({ ...settings, hub_api_url: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                placeholder="https://centre.dprd-hudang.com/api"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold mb-1.5 ml-1">Sync Shared Secret</label>
                            <input
                              type="password"
                              value={settings.hub_secret}
                              onChange={(e) => setSettings({ ...settings, hub_secret: e.target.value })}
                              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                              placeholder="••••••••••••••••"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-64">
                         <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                          <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Tindakan Cepat</h4>
                          <button
                            onClick={handleSyncCenter}
                            disabled={actionLoading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                          >
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            Sync Sekarang
                          </button>
                          <p className="text-[10px] text-muted-foreground mt-3 text-center italic">
                            Terakhir disinkronkan: <br /> {new Date().toLocaleDateString('id-ID')} {new Date().toLocaleTimeString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data Management Tab */}
                {activeTab === "data" && (
                  <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                        <Database className="text-amber-500" size={20} /> Pemeliharaan & Data
                      </h3>
                      <p className="text-sm text-muted-foreground">Ekspor cadangan atau bersihkan data lama untuk menjaga performa server.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-6 border border-border rounded-3xl bg-muted/10 hover:bg-muted/20 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Download className="text-primary" size={24} />
                        </div>
                        <h4 className="text-lg font-bold mb-2">Ekspor Cadangan</h4>
                        <p className="text-sm text-muted-foreground mb-6">Unduh seluruh snapshot data penting (Pengguna, Jadwal, Penilaian) dalam format JSON.</p>
                        <button
                          onClick={handleExportData}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-6 py-2.5 bg-background border border-border rounded-xl text-sm font-bold hover:bg-muted transition-all"
                        >
                          <Download size={16} /> Unduh JSON
                        </button>
                      </div>

                      <div className="p-6 border border-border rounded-3xl bg-red-500/5 hover:bg-red-500/10 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Trash2 className="text-red-500" size={24} />
                        </div>
                        <h4 className="text-lg font-bold mb-2">Pembersihan Otomatis</h4>
                        <p className="text-sm text-muted-foreground mb-4">Hapus riwayat pertemuan lama untuk mengosongkan ruang penyimpanan.</p>
                        
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-xs font-bold opacity-60">Hapus lebih dari:</span>
                          <select 
                            value={cleanupDays}
                            onChange={(e) => setCleanupDays(e.target.value)}
                            className="bg-background border border-border rounded-lg px-2 py-1 text-xs font-bold outline-none"
                          >
                            <option value="7">7 Hari</option>
                            <option value="30">30 Hari</option>
                            <option value="90">90 Hari</option>
                            <option value="365">1 Tahun</option>
                          </select>
                        </div>

                        <button
                          onClick={handleCleanupData}
                          disabled={actionLoading}
                          className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        >
                          <Trash2 size={16} /> Jalankan Cleanup
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                      <AlertCircle className="text-amber-500 shrink-0" size={20} />
                      <div>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Peringatan Keamanan</p>
                        <p className="text-[10px] text-amber-600/80 dark:text-amber-400/60 font-medium">
                          Gunakan fitur Pembersihan Otomatis dengan hati-hati. Data yang dihapus tidak dapat dipulihkan kembali kecuali Anda memiliki cadangan manual.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </main>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
