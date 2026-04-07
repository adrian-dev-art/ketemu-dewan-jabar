// test_rating_api.mjs
// Jalankan: node test_rating_api.mjs

const BASE = "http://localhost:5001";

async function log(label, res, data) {
  const ok = res.ok ? "✅" : "❌";
  console.log(`\n${ok} [${res.status}] ${label}`);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function run() {
  console.log("━".repeat(50));
  console.log("  MEETDEWAN RATING API TEST");
  console.log("━".repeat(50));

  // ── 1. Login sebagai masyarakat ──────────────────────
  console.log("\n[1] Login sebagai masyarakat...");
  let res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "masyarakat@demo.id", password: "password" }),
  });
  const masyarakatAuth = await log("Login Masyarakat", res, await res.json());
  if (!masyarakatAuth.token) {
    console.error("❌ Login masyarakat gagal, aborting.");
    process.exit(1);
  }
  const masyarakatToken = masyarakatAuth.token;

  // ── 2. Ambil jadwal (untuk dapatkan schedule_id & dewan_id) ──
  console.log("\n[2] Mengambil daftar jadwal...");
  res = await fetch(`${BASE}/api/schedules`, {
    headers: { Authorization: `Bearer ${masyarakatToken}` },
  });
  const schedules = await log("Daftar Jadwal", res, await res.json());

  if (!Array.isArray(schedules) || schedules.length === 0) {
    console.error("❌ Tidak ada jadwal. Jalankan seed terlebih dahulu.");
    process.exit(1);
  }

  // Cari jadwal yang paling cocok untuk dirating (confirmed atau yang ada)
  const target = schedules.find((s) => s.status === "confirmed" && !s.rating) || schedules[0];
  console.log(`\n  → Menggunakan jadwal: ID=${target.id}, Title="${target.title}", DewanId=${target.dewanId}`);

  // ── 3. Submit penilaian ──────────────────────────────
  console.log("\n[3] Mengirim penilaian 5 aspek...");
  res = await fetch(`${BASE}/api/ratings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${masyarakatToken}`,
    },
    body: JSON.stringify({
      schedule_id: target.id,
      dewan_id: target.dewanId,
      speaking_score: 5,
      context_score: 4,
      time_score: 4,
      responsiveness_score: 5,
      solution_score: 3,
      comment: "Sangat informatif, dewan merespons dengan baik dan memberikan gambaran solusi yang jelas.",
    }),
  });
  const ratingResult = await log("Submit Penilaian", res, await res.json());

  if (!res.ok) {
    console.log("\n  ℹ️  Kemungkinan jadwal ini sudah pernah dirating (uniqueness constraint).");
    console.log("     Lanjut ke pengecekan admin stats...");
  }

  // ── 4. Login sebagai admin ───────────────────────────
  console.log("\n[4] Login sebagai admin...");
  res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@dewan.id", password: "password" }),
  });
  const adminAuth = await log("Login Admin", res, await res.json());
  if (!adminAuth.token) {
    console.error("❌ Login admin gagal.");
    process.exit(1);
  }
  const adminToken = adminAuth.token;

  // ── 5. Cek statistik admin ───────────────────────────
  console.log("\n[5] Mengambil statistik platform...");
  res = await fetch(`${BASE}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  await log("Admin Stats", res, await res.json());

  // ── 6. Cek semua penilaian ───────────────────────────
  console.log("\n[6] Mengambil semua data penilaian...");
  res = await fetch(`${BASE}/api/admin/ratings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const allRatings = await log("Admin All Ratings", res, await res.json());

  // ── 7. Test akses unauthorized (masyarakat coba akses endpoint admin) ──
  console.log("\n[7] Memastikan endpoint admin DITOLAK untuk masyarakat...");
  res = await fetch(`${BASE}/api/admin/ratings`, {
    headers: { Authorization: `Bearer ${masyarakatToken}` },
  });
  await log("Akses Admin oleh Masyarakat (harus 403)", res, await res.json());

  // ── Ringkasan ────────────────────────────────────────
  console.log("\n" + "━".repeat(50));
  console.log("  RINGKASAN HASIL TEST");
  console.log("━".repeat(50));
  if (Array.isArray(allRatings)) {
    console.log(`  Total penilaian di DB : ${allRatings.length}`);
    allRatings.forEach((r) => {
      console.log(`  - ${r.dewanName}: ⭐ ${r.avgScore}/5 (${r.masyarakatName})`);
      console.log(`    Artikulasi:${r.speakingScore} | Relevansi:${r.contextScore} | Waktu:${r.timeScore} | Responsif:${r.responsivenessScore} | Solusi:${r.solutionScore}`);
      if (r.comment) console.log(`    💬 "${r.comment}"`);
    });
  }
  console.log("━".repeat(50));
}

run().catch(console.error);
