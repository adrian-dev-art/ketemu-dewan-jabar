"use client";

import { useState, useEffect } from "react";
import { Users, Video, Star, Settings, ShieldCheck } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, meetings: 0, avgRating: 0 });
  
  useEffect(() => {
    setStats({ users: 125, meetings: 48, avgRating: 4.6 });
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex flex-col min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-primary tracking-wide uppercase mb-1">Manajemen Sistem</p>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Control Center
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                  Pantau seluruh aktivitas platform Ketemu Dewan secara real-time.
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-xs font-medium text-muted-foreground">
                <ShieldCheck size={14} />
                Administrator
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="border border-border rounded-lg p-4 flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Pengguna</p>
                <h3 className="text-2xl font-bold">{stats.users}</h3>
              </div>
            </div>
            
            <div className="border border-border rounded-lg p-4 flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                <Video size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Konferensi</p>
                <h3 className="text-2xl font-bold">{stats.meetings}</h3>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 flex items-center gap-4">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg">
                <Star size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Rating Platform</p>
                <h3 className="text-2xl font-bold">{stats.avgRating}</h3>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <section className="border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <Settings size={16} className="text-muted-foreground" />
                <h3 className="text-base font-semibold">Log Aktivitas Platform</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg hover:opacity-90 transition-opacity">
                <Settings size={14} />
                Konfigurasi
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted text-muted-foreground text-xs font-medium">
                  <tr>
                    <th scope="col" className="px-4 py-3">Entitas</th>
                    <th scope="col" className="px-4 py-3">Deskripsi</th>
                    <th scope="col" className="px-4 py-3">Waktu</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-xs font-medium text-primary">Masyarakat</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium">Diskusi Pembangunan Jabar</p>
                      <p className="text-xs text-muted-foreground">Meminta pertemuan dengan Bp. Ahmad Syarif</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">Baru Saja</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded text-xs font-medium">Proses</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-medium text-amber-500">Legislator</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium">Pemerataan Pendidikan</p>
                      <p className="text-xs text-muted-foreground">Sesi #402 telah dikonfirmasi dan siap live</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">15 Menit Lalu</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">Aktif</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}