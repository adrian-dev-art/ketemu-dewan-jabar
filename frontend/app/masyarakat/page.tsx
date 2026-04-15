"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import DewanCard from "@/components/DewanCard";
import RatingSystem from "@/components/RatingSystem";
import { Clock, Calendar, CheckCircle, X, ExternalLink, Award, Video } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function MasyarakatDashboardContent() {
  const [dewanList, setDewanList] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedDewans, setSelectedDewans] = useState<number[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [announcement, setAnnouncement] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [groupBy, setGroupBy] = useState<'none' | 'komisi' | 'dapil'>('komisi');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  
  const ratedMeetingId = searchParams.get("ratedMeetingId");
  const dewanIdForRating = searchParams.get("dewanId");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (!token || !user) return;

    fetch(`${backendUrl}/api/dewan`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => res.json()).then(data => setDewanList(data));

    fetch(`${backendUrl}/api/schedules?role=masyarakat&userId=${user?.id}`, {
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
  }, [backendUrl, token, user]);

  const activeSchedules = schedules.filter(s => {
    if (s.status !== 'confirmed') return false;
    const startTime = new Date(s.startTime).getTime();
    const now = new Date().getTime();
    const buffer = 30 * 60 * 1000;
    return now >= startTime && now <= startTime + buffer;
  });

  const incomingSchedules = schedules.filter(s => {
    if (s.status !== 'confirmed') return false;
    const startTime = new Date(s.startTime).getTime();
    const now = new Date().getTime();
    return startTime > now;
  });

  const otherSchedules = schedules.filter(s => 
    s.status !== 'confirmed' || (new Date(s.startTime).getTime() + 30 * 60 * 1000 < new Date().getTime())
  );

  const groupedDewan = useMemo(() => {
    if (groupBy === 'none') return { 'Semua Anggota': dewanList };
    
    const grouped = dewanList.reduce((acc, dewan) => {
      const key = dewan[groupBy] || "Lainnya";
      if (!acc[key]) acc[key] = [];
      acc[key].push(dewan);
      return acc;
    }, {} as Record<string, any[]>);
    
    const sortedKeys = Object.keys(grouped).sort();
    const sortedGrouped: Record<string, any[]> = {};
    sortedKeys.forEach(k => {
      sortedGrouped[k] = grouped[k];
    });
    
    return sortedGrouped;
  }, [dewanList, groupBy]);

  const toggleDewanSelection = (id: number) => {
    setSelectedDewans(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDewans.length === 0) {
      setAnnouncement("Mohon pilih setidaknya satu Anggota Dewan.");
      return;
    }
    if (!selectedSlot) {
      setAnnouncement("Mohon pilih tanggal dan waktu terlebih dahulu.");
      return;
    }
    if (!token) return;

    const res = await fetch(`${backendUrl}/api/schedules`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        dewan_ids: selectedDewans,
        start_time: new Date(selectedSlot).toISOString(),
        title: meetingTitle || "Diskusi Aspirasi"
      })
    });

    if (res.ok) {
      const newSchedule = await res.json();
      setSchedules([newSchedule, ...schedules]);
      setSelectedDewans([]);
      setSelectedSlot("");
      setMeetingTitle("");
      setAnnouncement("Permohonan pertemuan berhasil dikirim. Menunggu konfirmasi Anggota Dewan.");
    } else {
      const error = await res.json();
      setAnnouncement(`Gagal: ${error.error}`);
    }
  };

  const onRatingSubmit = async (scores: any, comment: string) => {
    if (!token) return;
    const res = await fetch(`${backendUrl}/api/ratings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        schedule_id: Number(ratedMeetingId),
        dewan_id: Number(dewanIdForRating),
        speaking_score: scores.speaking_score,
        context_score: scores.context_score,
        time_score: scores.time_score,
        responsiveness_score: scores.responsiveness_score,
        solution_score: scores.solution_score,
        comment
      })
    });

    if (res.ok) {
      setAnnouncement("Terima kasih atas penilaian Anda!");
      setTimeout(() => router.replace("/masyarakat"), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div aria-live="polite" className="sr-only">{announcement}</div>
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-primary tracking-wide uppercase mb-1">Layanan Publik Digital</p>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Portal Aspirasi
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                Suarakan pendapat Anda secara langsung kepada wakil rakyat Jawa Barat.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-muted rounded-lg text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Dewan</p>
                <p className="text-lg font-bold">{dewanList.length}</p>
              </div>
              <div className="px-4 py-2 bg-muted rounded-lg text-center">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Aktif</p>
                <p className="text-lg font-bold text-primary">{schedules.filter(s => s.status === 'confirmed').length}</p>
              </div>
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

        {/* Replaced Modal with Inline Form */}

        {/* Rating Modal */}
        {ratedMeetingId && (
          <section className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md">
              <button 
                onClick={() => router.replace("/masyarakat")}
                className="absolute -top-10 right-0 p-1.5 bg-muted hover:bg-border rounded-lg text-muted-foreground transition-colors"
              >
                <X size={18} />
              </button>
              <RatingSystem onRatingSubmit={onRatingSubmit} />
            </div>
          </section>
        )}

        {/* Inline Schedule Form & Dewan List */}
        <section className="mb-10 p-6 bg-card border border-border rounded-xl">
          <form onSubmit={handleScheduleSubmit} className="mb-8">
            <h3 className="text-lg font-bold mb-4">Buat Permohonan Jadwal Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Judul / Topik Pertemuan</label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  placeholder="Cth: Sosialisasi UMKM Daerah"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Pilih Tanggal & Waktu</label>
                <input
                  type="datetime-local"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <p className="text-sm">Anda mengundang <strong>{selectedDewans.length}</strong> Anggota Dewan</p>
              <button
                type="submit"
                disabled={selectedDewans.length === 0 || !selectedSlot}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedDewans.length === 0 || !selectedSlot 
                    ? 'bg-muted-foreground/30 text-white cursor-not-allowed' 
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                Kirim Permohonan
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <Award size={18} className="text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Daftar Anggota Dewan</h3>
                <p className="text-xs text-muted-foreground">Pilih perwakilan yang ingin diundang</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm z-10">
              <span className="text-muted-foreground">Grup Berdasarkan:</span>
              <select 
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="bg-background border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
              >
                <option value="komisi">Komisi</option>
                <option value="dapil">Dapil</option>
                <option value="none">Semua</option>
              </select>
            </div>
          </div>
          
          {dewanList.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Mengambil data Legislator...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedDewan).map(([groupName, groupList]) => (
                <div key={groupName}>
                  {groupBy !== 'none' && (
                    <div className="flex items-center gap-3 mb-4">
                      <h4 className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">{groupName}</h4>
                      <div className="h-px bg-border flex-grow"></div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupList.map(dewan => (
                      <DewanCard 
                        key={dewan.id} 
                        dewan={dewan} 
                        isSelected={selectedDewans.includes(dewan.id)}
                        onSelect={(d) => toggleDewanSelection(d.id)} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Sessions */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-5">
            <Video size={18} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Sesi Aktif</h3>
              <p className="text-xs text-muted-foreground">Sesi pertemuan yang sedang berlangsung</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSchedules.length === 0 ? (
              <div className="md:col-span-2 py-10 text-center border border-dashed border-border rounded-lg">
                <Video size={20} className="mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">Belum ada konferensi yang sedang aktif.</p>
              </div>
            ) : (
              activeSchedules.map(s => (
                <div key={s.id} className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-500">
                      <Video size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-500 text-white">Live</span>
                        <p className="text-xs text-muted-foreground">{s.title || "Pertemuan Aspirasi"}</p>
                      </div>
                      <p className="text-sm font-semibold">Anggota Dewan Jabar</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <Clock size={12} className="mr-1" />
                        Sedang Berjalan
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/room/${s.id}`)}
                    className="flex items-center justify-center gap-2 bg-amber-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors text-sm"
                  >
                    <ExternalLink size={14} />
                    Gabung
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Upcoming */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-5">
            <Calendar size={18} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Jadwal Mendatang</h3>
              <p className="text-xs text-muted-foreground">Sesi yang telah dikonfirmasi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingSchedules.length === 0 ? (
              <div className="md:col-span-2 py-10 text-center border border-dashed border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Tidak ada jadwal dalam antrian</p>
              </div>
            ) : (
              incomingSchedules.map(s => (
                <div key={s.id} className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.title || "Pertemuan Aspirasi"}</p>
                      <p className="text-sm font-semibold">Anggota Dewan Jabar</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <Clock size={12} className="mr-1" />
                        {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    <CheckCircle size={12} />
                    Dikonfirmasi
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* History */}
        <section className="mb-10">
          <div className="flex items-center gap-2.5 mb-5">
            <Clock size={18} className="text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Riwayat & Status</h3>
              <p className="text-xs text-muted-foreground">Pantau perkembangan aspirasi Anda</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherSchedules.length === 0 ? (
              <div className="md:col-span-2 py-10 text-center border border-dashed border-border rounded-lg">
                <Calendar size={20} className="mx-auto mb-2 text-muted-foreground opacity-40" />
                <p className="text-sm font-medium text-muted-foreground mb-1">Kosong</p>
                <p className="text-xs text-muted-foreground">Mulai dengan memilih wakil rakyat di atas.</p>
              </div>
            ) : (
              otherSchedules.map(s => (
                <div key={s.id} className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      s.status === 'rejected' ? 'bg-red-100 dark:bg-red-950/30 text-red-500' : 
                      s.status === 'confirmed' ? 'bg-muted text-muted-foreground' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-500'
                    }`}>
                      {s.status === 'confirmed' ? <CheckCircle size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{s.title || "Pertemuan Aspirasi"}</p>
                      <p className="text-sm font-semibold">Anggota Dewan Jabar</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                        <Calendar size={12} className="mr-1" />
                        {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                    s.status === 'confirmed' 
                      ? 'bg-muted text-muted-foreground' 
                      : s.status === 'rejected'
                      ? 'bg-red-100 dark:bg-red-950/30 text-red-500'
                      : 'bg-amber-100 dark:bg-amber-950/30 text-amber-500'
                  }`}>
                    {s.status === 'confirmed' ? 'Selesai' : s.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function MasyarakatDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground h-screen flex items-center justify-center text-sm">Memuat Portal Aspirasi...</div>}>
      <ProtectedRoute allowedRoles={['masyarakat', 'admin']}>
        <MasyarakatDashboardContent />
      </ProtectedRoute>
    </Suspense>
  );
}