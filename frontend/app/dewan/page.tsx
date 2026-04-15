"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Calendar, User, Clock, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AvailabilityManager from "@/components/AvailabilityManager";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DewanDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const router = useRouter();
  const { user, token } = useAuth();
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const fetchSchedules = () => {
    if (!token || !user) return;
    fetch(`${backendUrl}/api/schedules?role=dewan&userId=${user.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        } else {
          console.error("Fetched schedules is not an array:", data);
          setSchedules([]);
        }
      });
  };

  useEffect(() => {
    fetchSchedules();
  }, [backendUrl, token, user]);

  const updateStatus = async (id: number, status: string) => {
    if (!token) return;
    const res = await fetch(`${backendUrl}/api/schedules/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      setSchedules(schedules.map(s => s.id === id ? { ...s, status } : s));
      setAnnouncement(`Permohonan telah ${status === 'confirmed' ? 'disetujui' : 'ditolak'}.`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['dewan', 'admin']}>
      <div className="flex flex-col min-h-screen">
        <div aria-live="polite" className="sr-only">{announcement}</div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-primary tracking-wide uppercase mb-1">Portal Legislator</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Panel Dewan
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                  Kelola aspirasi masyarakat dan jadwalkan pertemuan video dengan konstituen Anda.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs font-medium text-muted-foreground">
                <User size={14} />
                Panel Kontrol
              </div>
            </div>
          </header>

          {/* Announcement */}
          {announcement && (
            <div className="mb-6 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
              <CheckCircle size={16} className="text-primary shrink-0" />
              <span className="text-sm font-medium flex-grow">{announcement}</span>
              <button onClick={() => setAnnouncement("")} className="p-1 hover:bg-muted rounded text-muted-foreground">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schedules */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <Calendar size={18} className="text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Permohonan</h3>
                  <p className="text-xs text-muted-foreground">Aspirasi yang butuh respon Anda</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {schedules.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-border rounded-lg">
                    <Calendar size={20} className="mx-auto mb-2 text-muted-foreground opacity-40" />
                    <p className="text-sm font-medium text-muted-foreground mb-1">Kosong</p>
                    <p className="text-xs text-muted-foreground">Semua aspirasi masyarakat telah diproses.</p>
                  </div>
                ) : (
                  schedules.map(s => (
                    <div key={s.id} className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                            <User size={18} />
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card flex items-center justify-center ${
                            s.status === 'confirmed' ? 'bg-primary' : s.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                          }`}>
                            {s.status === 'confirmed' ? <CheckCircle className="text-white" size={8} /> : <Clock className="text-white" size={8} />}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold">{s.title || `Agenda Aspirasi #${s.id}`}</h4>
                          <p className="text-xs text-primary font-medium mt-0.5">Pemohon: {s.masyarakat?.name || 'Masyarakat'}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <Clock size={12} className="mr-1" />
                            {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })} WIB
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {s.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateStatus(s.id, 'rejected')}
                              className="px-3 py-1.5 bg-muted text-muted-foreground font-medium rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors text-xs"
                            >
                              Tolak
                            </button>
                            <button
                              onClick={() => updateStatus(s.id, 'confirmed')}
                              className="px-3 py-1.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors text-xs"
                            >
                              Setujui
                            </button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            s.status === 'confirmed' ? 'bg-primary/10 text-primary' : 'bg-red-100 dark:bg-red-950/30 text-red-500'
                          }`}>
                            {s.status === 'confirmed' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {s.status === 'confirmed' ? 'Dikonfirmasi' : 'Ditolak'}
                          </span>
                        )}
                        
                        {s.status === 'confirmed' && (
                          <button 
                            onClick={() => router.push(`/room/${s.id}`)}
                            className="px-3 py-1.5 bg-foreground text-background font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 text-xs"
                          >
                            <Video size={12} />
                            Gabung
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar (Removed AvailabilityManager per request) */}
            <div>
              <div className="border border-border rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-2">Informasi Penting</h3>
                <p className="text-xs text-muted-foreground text-left">
                  Modul pengaturan jadwal ketersediaan kini dikelola secara terpusat oleh Admin.
                  Untuk menambah atau mengubah slot ketersediaan waktu Anda, harap hubungi administrator sistem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}