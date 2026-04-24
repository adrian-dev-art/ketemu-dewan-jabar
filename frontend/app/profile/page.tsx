"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Save, Loader2, CheckCircle2, AlertCircle, Info, ChevronRight, Briefcase, MapPin, Building, CreditCard, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
  const { token, user: authUser } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    bio: "",
    nip: "",
    fraksi: "",
    jabatan: "",
    dapil: "",
    noKtp: "",
    instansi: "",
  });

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch(`${backendUrl}/api/user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Profil berhasil diperbarui!" });
        // Update local storage name if it changed
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          userObj.name = profile.name;
          localStorage.setItem('auth_user', JSON.stringify(userObj));
        }
      } else {
        setStatus({ type: "error", message: "Gagal memperbarui profil." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Kesalahan koneksi ke server." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium text-sm">Memuat data profil...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["masyarakat", "dewan", "admin"]}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Pengaturan Profil</h1>
            <p className="text-muted-foreground mt-1">Kelola informasi pribadi dan identitas Anda di platform.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl">
             <Shield size={16} className="text-primary" />
             <span className="text-xs font-bold text-primary uppercase tracking-wider">{profile.role}</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Sidebar Info */}
            <div className="md:col-span-4 space-y-6">
              <div className="p-6 bg-card border border-border rounded-3xl text-center shadow-sm">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/5">
                  <User size={40} className="text-primary" />
                </div>
                <h2 className="font-bold text-lg leading-tight">{profile.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{profile.email}</p>
                
                <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2">
                   <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground">ID Akun</span>
                      <span className="tabular-nums">#{authUser?.id}</span>
                   </div>
                   <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground">Status Verifikasi</span>
                      <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={10} /> Terverifikasi</span>
                   </div>
                </div>
              </div>

              <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                 <h3 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                    <Info size={14} /> Tips Keamanan
                 </h3>
                 <p className="text-[10px] text-blue-600/80 font-medium leading-relaxed">
                    Pastikan informasi NIP (untuk Dewan) atau No. KTP (untuk Masyarakat) sesuai dengan identitas resmi untuk kelancaran sinkronisasi data.
                 </p>
              </div>
            </div>

            {/* Main Form Fields */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Basic Info Section */}
              <div className="p-8 bg-card border border-border rounded-3xl shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                   <FileText size={18} className="text-primary" />
                   <h3 className="font-bold">Informasi Dasar</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground ml-1">Nama Lengkap</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground ml-1">Email (Hanya Baca)</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
                      <input
                        type="email"
                        value={profile.email}
                        readOnly
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/10 border border-border rounded-xl text-sm font-medium text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground ml-1">Bio / Deskripsi Singkat</label>
                  <textarea
                    rows={3}
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium resize-none"
                    placeholder="Tuliskan sedikit tentang diri Anda..."
                  />
                </div>
              </div>

              {/* Role Specific Section */}
              <div className="p-8 bg-card border border-border rounded-3xl shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                   {profile.role === 'dewan' ? <Briefcase size={18} className="text-primary" /> : <CreditCard size={18} className="text-primary" />}
                   <h3 className="font-bold">{profile.role === 'dewan' ? 'Data Legislator' : 'Identitas Masyarakat'}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.role === 'dewan' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground ml-1">NIP</label>
                        <input
                          type="text"
                          value={profile.nip || ""}
                          onChange={(e) => setProfile({ ...profile, nip: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground ml-1">Fraksi</label>
                        <input
                          type="text"
                          value={profile.fraksi || ""}
                          onChange={(e) => setProfile({ ...profile, fraksi: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground ml-1">Jabatan</label>
                        <input
                          type="text"
                          value={profile.jabatan || ""}
                          onChange={(e) => setProfile({ ...profile, jabatan: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground ml-1">Dapil</label>
                        <input
                          type="text"
                          value={profile.dapil || ""}
                          onChange={(e) => setProfile({ ...profile, dapil: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground ml-1">No. KTP</label>
                        <input
                          type="text"
                          value={profile.noKtp || ""}
                          onChange={(e) => setProfile({ ...profile, noKtp: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground ml-1">Instansi / Pekerjaan</label>
                        <input
                          type="text"
                          value={profile.instansi || ""}
                          onChange={(e) => setProfile({ ...profile, instansi: e.target.value })}
                          className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Status Message */}
              {status.type && (
                <div className={`p-4 rounded-2xl border flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  status.type === "success" 
                    ? "bg-green-500/10 border-green-500/20 text-green-600" 
                    : "bg-red-500/10 border-red-500/20 text-red-600"
                }`}>
                  {status.type === "success" ? <CheckCircle2 className="shrink-0 w-5 h-5" /> : <AlertCircle className="shrink-0 w-5 h-5" />}
                  <p className="text-sm font-bold">{status.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                 <button
                  type="button"
                  onClick={fetchProfile}
                  className="px-6 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Simpan Perubahan
                </button>
              </div>

            </div>
          </div>
        </form>

      </div>
    </ProtectedRoute>
  );
}
