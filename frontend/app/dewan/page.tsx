"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Calendar, User, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DewanDashboard() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const router = useRouter();
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const dewanId = 1;

  useEffect(() => {
    fetch(`${backendUrl}/api/schedules?role=dewan&userId=${dewanId}`)
      .then(res => res.json())
      .then(data => setSchedules(data));
  }, [backendUrl]);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch(`${backendUrl}/api/schedules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (res.ok) {
      setSchedules(schedules.map(s => s.id === id ? { ...s, status } : s));
      setAnnouncement(`Pertemuan telah ${status === 'confirmed' ? 'disetujui' : 'ditolak'}.`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      <header className="mb-12 bg-blue-900 text-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Selamat Datang, Bapak/Ibu Dewan</h2>
        <p className="text-blue-100">Kelola permintaan pertemuan dan aspirasi dari masyarakat</p>
      </header>

      <section>
        <h3 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white flex items-center">
          <Calendar className="mr-3 text-blue-600" /> Permintaan Pertemuan Masuk
        </h3>
        
        <div className="grid grid-cols-1 gap-6">
          {schedules.length === 0 ? (
            <div className="bg-gray-50 dark:bg-zinc-800 p-12 rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-zinc-700">
              <p className="text-gray-500 text-lg">Tidak ada permintaan tertunda saat ini.</p>
            </div>
          ) : (
            schedules.map(s => (
              <div key={s.id} className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <User size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">ID Masyarakat #{s.masyarakat_id}</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                      <Clock size={16} className="mr-2" /> {new Date(s.start_time).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {s.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => updateStatus(s.id, 'rejected')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors focus:ring-4 focus:ring-red-200"
                        aria-label="Tolak permintaan pertemuan"
                      >
                        <XCircle size={20} /> Tolak
                      </button>
                      <button
                        onClick={() => updateStatus(s.id, 'confirmed')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors focus:ring-4 focus:ring-green-300"
                        aria-label="Setujui permintaan pertemuan"
                      >
                        <CheckCircle size={20} /> Setujui
                      </button>
                    </>
                  ) : (
                    <div className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 ${
                      s.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status === 'confirmed' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      {s.status === 'confirmed' ? 'DISETUJUI' : 'DITOLAK'}
                    </div>
                  )}
                  
                  {s.status === 'confirmed' && (
                    <button 
                      onClick={() => router.push(`/room/${s.id}`)}
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg focus:ring-4 focus:ring-blue-300 focus:outline-none"
                      aria-label={`Gabung panggilan pertemuan ID ${s.id}`}
                    >
                      Gabung Panggilan
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}