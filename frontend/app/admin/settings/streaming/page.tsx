"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  Youtube, 
  Save, 
  ShieldCheck, 
  Info, 
  Radio, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";

export default function StreamingSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  
  const [settings, setSettings] = useState({
    stream_url: "",
    stream_key: "",
    is_auto_stream: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/settings/streaming`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else if (res.status === 403) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: '' });

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/settings/streaming`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setStatus({ type: 'success', message: 'Pengaturan streaming berhasil disimpan!' });
      } else {
        setStatus({ type: 'error', message: 'Gagal menyimpan pengaturan.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Terjadi kesalahan koneksi.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Streaming</h1>
          <p className="text-muted-foreground">Kelola integrasi live streaming ke YouTube atau platform lain.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            {/* YouTube Settings Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
              
              <div className="flex items-center gap-2 mb-6">
                <Youtube className="w-5 h-5 text-red-600" />
                <h2 className="font-semibold text-lg">YouTube Live Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium mb-1.5 opacity-80">
                    Stream URL (RTMP Server)
                  </label>
                  <input
                    id="url"
                    type="text"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-mono"
                    placeholder="rtmp://a.rtmp.youtube.com/live2"
                    value={settings.stream_url}
                    onChange={(e) => setSettings({...settings, stream_url: e.target.value})}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Dapatkan URL ini dari YouTube Studio Live.
                  </p>
                </div>

                <div>
                  <label htmlFor="key" className="block text-sm font-medium mb-1.5 opacity-80">
                    Stream Key
                  </label>
                  <div className="relative">
                    <input
                      id="key"
                      type="password"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm font-mono"
                      placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
                      value={settings.stream_key}
                      onChange={(e) => setSettings({...settings, stream_key: e.target.value})}
                    />
                    <ShieldCheck className="absolute right-3 top-3 w-4 h-4 text-muted-foreground opacity-50" />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Kunci ini bersifat rahasia. Jangan bagikan kepada siapa pun.
                  </p>
                </div>
              </div>
            </div>

            {/* Automation Settings Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm ring-1 ring-primary/5 hover:ring-primary/10 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Radio className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Otomatisasi Streaming</h3>
                    <p className="text-sm text-muted-foreground">Mulai streaming secara otomatis saat rapat dimulai.</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setSettings({...settings, is_auto_stream: !settings.is_auto_stream})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-primary/20 ${settings.is_auto_stream ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.is_auto_stream ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Feedback Message */}
            {status.type && (
              <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                status.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{status.message}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Pengaturan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Informasi Penting</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                <p className="opacity-80">Streaming akan menggunakan fitur <strong>LiveKit Egress</strong> yang berjalan di server.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                <p className="opacity-80">Pastikan server memiliki resource CPU yang cukup untuk proses encoding video.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                <p className="opacity-80">Hanya Admin yang dapat mengubah pengaturan Stream Key.</p>
              </li>
            </ul>
          </div>

          <div className="bg-muted/50 rounded-2xl p-6 border border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 opacity-50">Status Egress</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse" />
              Menunggu session aktif...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
