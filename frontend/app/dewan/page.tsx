"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Calendar, User, Clock, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import AvailabilityManager from "@/components/AvailabilityManager";

export default function DewanDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const router = useRouter();
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const dewanId = 1;

  const fetchSchedules = () => {
    fetch(`${backendUrl}/api/schedules?role=dewan&userId=${dewanId}`)
      .then(res => res.json())
      .then(data => setSchedules(data));
  };

  useEffect(() => {
    fetchSchedules();
  }, [backendUrl]);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`${backendUrl}/api/schedules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      setSchedules(schedules.map(s => s.id === id ? { ...s, status } : s));
      setAnnouncement(`Permohonan telah ${status === 'confirmed' ? 'disetujui' : 'ditolak'}.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-background min-h-screen">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-border overflow-hidden relative">
        <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang, Bapak/Ibu Dewan</h2>
          <p className="text-gray-500 font-medium">Kelola aspirasi masyarakat dan jadwal konferensi Anda.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
          <LayoutDashboard className="text-primary" size={24} />
          <span className="font-bold text-primary">Dasbor Utama</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h3 className="text-xl font-bold mb-8 text-gray-800 flex items-center">
              <Calendar className="mr-3 text-primary" size={24} /> Permohonan Pertemuan Masuk
            </h3>
            
            <div className="space-y-6">
              {schedules.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl text-center border-2 border-dashed border-border group hover:border-primary/30 transition-colors">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/5 transition-colors">
                    <Calendar className="text-gray-300 group-hover:text-primary/30" size={32} />
                  </div>
                  <p className="text-gray-400 font-medium">Tidak ada permohonan tertunda saat ini.</p>
                </div>
              ) : (
                schedules.map(s => (
                  <div key={s.id} className="premium-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center border border-primary/10">
                        <User size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Masyarakat #{s.masyarakat_id}</h4>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock size={14} className="mr-1.5" />
                          {new Date(s.startTime).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {s.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => updateStatus(s.id, 'rejected')}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-border hover:border-red-200"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() => updateStatus(s.id, 'confirmed')}
                            className="flex-1 md:flex-none px-6 py-2.5 btn-primary shadow-lg shadow-primary/20"
                          >
                            Setujui
                          </button>
                        </>
                      ) : (
                        <div className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 border ${
                          s.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {s.status === 'confirmed' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                          {s.status === 'confirmed' ? 'DISETUJUI' : 'DITOLAK'}
                        </div>
                      )}
                      
                      {s.status === 'confirmed' && (
                        <button 
                          onClick={() => router.push(`/room/${s.id}`)}
                          className="px-6 py-2.5 btn-secondary shadow-lg shadow-secondary/20 ml-2"
                        >
                          Gabung
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <AvailabilityManager dewanId={dewanId} onAvailabilityUpdate={fetchSchedules} />
        </div>
      </div>
    </div>
  );
}