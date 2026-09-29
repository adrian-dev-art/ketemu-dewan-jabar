"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Edit,
  Trash2,
  X,
  Filter,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowUpDown,
} from "lucide-react";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  bio?: string;
  nip?: string;
  fraksi?: string;
  jabatan?: string;
  dapil?: string;
  noKtp?: string;
  instansi?: string;
  noWhatsapp?: string;
  isSync?: boolean;
}

interface AdminUsersTabProps {
  users: UserItem[];
  token: string | null;
  backendUrl: string;
  onRefreshUsers: () => void;
}

const ROLE_BADGE: Record<string, { label: string; bg: string; text: string; border: string }> = {
  admin: { label: "Administrator", bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/20" },
  dewan: { label: "Anggota Dewan", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  masyarakat: { label: "Masyarakat", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
};

export default function AdminUsersTab({
  users,
  token,
  backendUrl,
  onRefreshUsers,
}: AdminUsersTabProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"id" | "name" | "role" | "email">("id");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        const q = search.toLowerCase();
        const matchSearch =
          !search ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.instansi && u.instansi.toLowerCase().includes(q)) ||
          (u.nip && u.nip.toLowerCase().includes(q));
        return matchRole && matchSearch;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "id") diff = a.id - b.id;
        else if (sortBy === "name") diff = a.name.localeCompare(b.name);
        else if (sortBy === "role") diff = a.role.localeCompare(b.role);
        else if (sortBy === "email") diff = a.email.localeCompare(b.email);
        return sortDir === "desc" ? -diff : diff;
      });
  }, [users, roleFilter, search, sortBy, sortDir]);

  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || "",
      email: u.email || "",
      role: u.role || "masyarakat",
      nip: u.nip || "",
      fraksi: u.fraksi || "",
      jabatan: u.jabatan || "",
      dapil: u.dapil || "",
      instansi: u.instansi || "",
      noKtp: u.noKtp || "",
      noWhatsapp: u.noWhatsapp || "",
      password: "",
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);

    try {
      const payload: any = { ...editForm };
      if (!payload.password) delete payload.password;

      const res = await fetch(`${backendUrl}/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditingUser(null);
        onRefreshUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memperbarui data pengguna");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus akun pengguna ini secara permanen?")) return;

    try {
      const res = await fetch(`${backendUrl}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        onRefreshUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus pengguna");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menghapus pengguna");
    }
  };

  const roleCounts = {
    masyarakat: users.filter((u) => u.role === "masyarakat").length,
    dewan: users.filter((u) => u.role === "dewan").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            id="users-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, email, NIP, instansi..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-foreground transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-[130px] sm:flex-none">
            <Filter size={14} className="text-muted-foreground shrink-0 hidden sm:block" />
            <select
              id="users-role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto text-xs bg-muted/40 border border-border rounded-xl px-3 sm:px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-semibold transition-all"
            >
              <option value="all">Semua Peran ({users.length})</option>
              <option value="masyarakat">Masyarakat ({roleCounts.masyarakat})</option>
              <option value="dewan">Anggota Dewan ({roleCounts.dewan})</option>
              <option value="admin">Administrator ({roleCounts.admin})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 flex-1 min-w-[160px] sm:flex-none">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto text-xs bg-muted/40 border border-border rounded-xl px-3 sm:px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-semibold transition-all"
            >
              <option value="id">Terbaru (ID)</option>
              <option value="name">Nama Pengguna</option>
              <option value="role">Peran / Role</option>
              <option value="email">Email</option>
            </select>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              className="p-2.5 bg-muted/40 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
              title={sortDir === "desc" ? "Urutan: Terbaru ke Terlama (Desc)" : "Urutan: Terlama ke Terbaru (Asc)"}
            >
              {sortDir === "desc" ? <ArrowDownWideNarrow size={14} /> : <ArrowUpNarrowWide size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Result count text */}
      <div className="text-xs text-muted-foreground px-1">
        Menampilkan <strong className="text-foreground">{filteredUsers.length}</strong> dari{" "}
        <strong className="text-foreground">{users.length}</strong> total pengguna (Urut: <span className="text-foreground font-semibold">{sortBy === "id" ? "Pendaftar Terbaru" : sortBy}</span>)
      </div>

      {/* ── Mobile Card List View (< md) ── */}
      <div className="block md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-2.5">
              <Users size={24} className="opacity-40 text-muted-foreground" />
            </div>
            <p className="text-xs font-bold text-foreground">Pengguna Tidak Ditemukan</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Coba sesuaikan kata kunci pencarian.</p>
          </div>
        ) : (
          filteredUsers.map((u) => {
            const roleBadge = ROLE_BADGE[u.role] || { label: u.role, bg: "bg-muted", text: "text-foreground", border: "border-border" };
            return (
              <div key={u.id} className="bg-card border border-border rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-500/20">
                      {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">ID #{u.id} {u.nip ? `• NIP: ${u.nip}` : ""}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider shrink-0 ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                    {roleBadge.label}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground bg-muted/20 rounded-xl p-2.5 border border-border/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium truncate">{u.email}</span>
                    {u.noWhatsapp && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">{u.noWhatsapp}</span>
                    )}
                  </div>
                  {u.role === "dewan" ? (
                    <div className="pt-0.5 border-t border-border/40 text-[11px]">
                      <span className="font-semibold text-foreground">{u.fraksi || "Fraksi -"}</span>
                      {(u.jabatan || u.dapil) && <span> &middot; {u.jabatan || u.dapil}</span>}
                    </div>
                  ) : u.instansi ? (
                    <div className="pt-0.5 border-t border-border/40 text-[11px] text-foreground font-medium">
                      Instansi: {u.instansi}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="flex-1 py-2 px-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit size={13} />
                    <span>Edit Profil</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="py-2 px-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    title="Hapus Pengguna"
                  >
                    <Trash2 size={13} />
                    <span className="sr-only sm:not-sr-only">Hapus</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Desktop Users Table (>= md) ── */}
      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/60 dark:bg-muted/40 border-b border-border text-muted-foreground">
              <tr>
                <th
                  onClick={() => {
                    if (sortBy === "id") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    else { setSortBy("id"); setSortDir("desc"); }
                  }}
                  className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  style={{ minWidth: 180 }}
                  title="Klik untuk mengurutkan berdasarkan ID/Terbaru"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Pengguna (ID)</span>
                    {sortBy === "id" ? (
                      <span className="text-primary font-bold text-xs">{sortDir === "desc" ? "↓" : "↑"}</span>
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 200 }}>Email / Kontak</th>
                <th
                  onClick={() => {
                    if (sortBy === "role") setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    else { setSortBy("role"); setSortDir("desc"); }
                  }}
                  className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors select-none"
                  style={{ minWidth: 130 }}
                  title="Klik untuk mengurutkan berdasarkan Peran"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Peran</span>
                    {sortBy === "role" ? (
                      <span className="text-primary font-bold text-xs">{sortDir === "desc" ? "↓" : "↑"}</span>
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>
                <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider" style={{ minWidth: 160 }}>Fraksi / Instansi</th>
                <th className="px-5 py-3.5 font-bold text-[10px] uppercase tracking-wider text-right" style={{ minWidth: 80 }}>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                      <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center mb-3">
                        <Users size={32} className="opacity-40 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-bold text-foreground mb-1">Pengguna Tidak Ditemukan</p>
                      <p className="text-xs text-muted-foreground">Coba sesuaikan kata kunci pencarian atau ganti filter peran.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadge = ROLE_BADGE[u.role] || { label: u.role, bg: "bg-muted", text: "text-foreground", border: "border-border" };

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground leading-snug">{u.name}</div>
                        {u.nip && (
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5 font-medium">NIP: {u.nip}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="semibold text-foreground">{u.email}</div>
                        {u.noWhatsapp && (
                          <div className="text-[11px] text-muted-foreground mt-0.5">{u.noWhatsapp}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border tracking-wide uppercase ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {u.role === "dewan" ? (
                          <div>
                            <p className="font-bold text-foreground">{u.fraksi || "-"}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{u.jabatan || u.dapil || "-"}</p>
                          </div>
                        ) : (
                          <div className="text-muted-foreground font-medium">{u.instansi || "-"}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-2 text-muted-foreground hover:text-purple-600 hover:bg-purple-500/10 rounded-xl transition-all"
                            title="Edit Pengguna"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Hapus Pengguna"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl w-full max-w-lg p-4 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate pr-2">
                Edit Profil: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1.5 font-bold">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1.5 font-bold">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5 font-bold">Peran Pengguna</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-bold"
                  >
                    <option value="masyarakat">Masyarakat</option>
                    <option value="dewan">Anggota Dewan</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              {editForm.role === "dewan" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-muted/20 p-3 sm:p-3.5 rounded-2xl border border-border">
                  {["fraksi", "jabatan", "dapil"].map((field) => (
                    <div key={field}>
                      <label className="block text-muted-foreground mb-1 text-[10px] font-bold uppercase tracking-wider">{field}</label>
                      <input
                        type="text"
                        value={editForm[field]}
                        onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                        className="w-full px-3 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground text-xs font-medium"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1.5 font-bold">Instansi / Ormas</label>
                  <input
                    type="text"
                    value={editForm.instansi}
                    onChange={(e) => setEditForm({ ...editForm, instansi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5 font-bold">No. WhatsApp</label>
                  <input
                    type="text"
                    value={editForm.noWhatsapp}
                    onChange={(e) => setEditForm({ ...editForm, noWhatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1.5 font-bold">
                  Ubah Password <span className="text-[10px] font-normal opacity-70">(kosongkan jika tidak ingin mengubah)</span>
                </label>
                <input
                  type="password"
                  placeholder="Password baru (min. 6 karakter)"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-foreground font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 border border-border rounded-xl hover:bg-muted text-muted-foreground text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 text-xs shadow-sm shadow-purple-600/20 active:scale-95"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
