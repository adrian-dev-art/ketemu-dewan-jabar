"use client";

import { useState, useEffect } from "react";
import { Users, Video, Star, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, meetings: 0, avgRating: 0 });
  
  useEffect(() => {
    setStats({ users: 125, meetings: 48, avgRating: 4.6 });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Administrasi Sistem</h2>
        <p className="text-gray-500">Ringkasan global platform MEETDEWAN</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg border-b-4 border-blue-600">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><Users size={32} /></div>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase">Total Pengguna</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.users}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg border-b-4 border-green-600">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 text-green-600 rounded-xl"><Video size={32} /></div>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase">Konferensi</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.meetings}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg border-b-4 border-yellow-600">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-yellow-100 text-yellow-600 rounded-xl"><Star size={32} /></div>
            <div>
              <p className="text-gray-500 text-sm font-bold uppercase">Rating Rata-rata</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.avgRating}</h3>
            </div>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-700">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aktivitas Platform Terbaru</h3>
          <button className="text-blue-600 font-bold hover:underline flex items-center">
            <Settings size={18} className="mr-2" /> Pengaturan Global
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-zinc-900 text-gray-500 uppercase text-xs font-black">
              <tr>
                <th scope="col" className="px-6 py-4">Tipe Pengguna</th>
                <th scope="col" className="px-6 py-4">Tindakan</th>
                <th scope="col" className="px-6 py-4">Waktu</th>
                <th scope="col" className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                <td className="px-6 py-4 font-bold text-blue-600">Masyarakat</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">Meminta pertemuan dengan Ahmad</td>
                <td className="px-6 py-4 text-gray-500 text-sm">2 menit yang lalu</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-black uppercase">Menunggu</span></td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                <td className="px-6 py-4 font-bold text-green-600">Dewan</td>
                <td className="px-6 py-4 text-gray-900 dark:text-white">Mengonfirmasi pertemuan #402</td>
                <td className="px-6 py-4 text-gray-500 text-sm">15 menit yang lalu</td>
                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black uppercase">Aktif</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}