import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { syncHubData } from '../src/services/hubSync';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Mulai seeding data lengkap...\n');

    const passwordHash = await bcrypt.hash('password', 10);
    const now = new Date();
    const h = (hours: number) => new Date(now.getTime() + hours * 3600 * 1000);
    const d = (days: number) => new Date(now.getTime() + days * 86400 * 1000);

    // ──────────────────────────────────────────────────
    // 1. ADMIN
    // ──────────────────────────────────────────────────
    console.log('👤 Seeding admin...');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@dewan.id' },
        update: { passwordHash },
        create: { name: 'Super Admin', role: 'admin', email: 'admin@dewan.id', passwordHash },
    });

    // ──────────────────────────────────────────────────
    // 2. ANGGOTA DEWAN (6 orang)
    // ──────────────────────────────────────────────────
    console.log('🏛️  Seeding anggota dewan...');
    const dewanData = [
        { email: 'ahmad@dewan.id',   name: 'Ahmad Kurniawan',    fraksi: 'Fraksi Golkar',   jabatan: 'Wakil Ketua Komisi II', dapil: 'Dapil Jabar I',   bio: 'Fokus pada infrastruktur jalan dan irigasi.' },
        { email: 'siti@dewan.id',    name: 'Siti Aminah',        fraksi: 'Fraksi PKS',      jabatan: 'Ketua Komisi IV',       dapil: 'Dapil Jabar II',  bio: 'Fokus pada pendidikan dan kesehatan masyarakat.' },
        { email: 'budi@dewan.id',    name: 'Budi Santoso',       fraksi: 'Fraksi PDIP',     jabatan: 'Anggota Komisi I',      dapil: 'Dapil Jabar III', bio: 'Fokus pada ketenagakerjaan dan ekonomi UMKM.' },
        { email: 'dewi@dewan.id',    name: 'Dewi Ratnasari',     fraksi: 'Fraksi Gerindra',  jabatan: 'Wakil Ketua Komisi III', dapil: 'Dapil Jabar IV', bio: 'Fokus pada lingkungan hidup dan pertanian.' },
        { email: 'hendra@dewan.id',  name: 'Hendra Wijaya',      fraksi: 'Fraksi Nasdem',   jabatan: 'Ketua Komisi I',        dapil: 'Dapil Jabar V',  bio: 'Fokus pada hukum, HAM, dan keamanan daerah.' },
        { email: 'ratih@dewan.id',   name: 'Ratih Kusumawati',   fraksi: 'Fraksi PKB',      jabatan: 'Anggota Komisi V',      dapil: 'Dapil Jabar VI',  bio: 'Fokus pada keagamaan, sosial, dan pemberdayaan perempuan.' },
        { centreId: 'dc8625c9-e952-4722-b619-c850ea8d9e93', email: 'dedi@dewan.id', name: 'H. Dedi Aroza, S.Ag., M.Si.', fraksi: 'Fraksi PKS', jabatan: 'Anggota Komisi I', dapil: 'Dapil Jabar VI (Bogor)', bio: 'Anggota Komisi I DPRD Jawa Barat.' },
    ];

    const dewanList: any[] = [];
    for (const d of dewanData) {
        // Find existing user by centreId OR email to prevent duplicates
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    d.centreId ? { centreId: d.centreId } : {},
                    { email: d.email }
                ]
            }
        });

        const u = await prisma.user.upsert({
            where: { id: existingUser?.id || -1 }, // Use ID if found, else -1 to force create
            update: { 
                passwordHash, 
                fraksi: d.fraksi, 
                jabatan: d.jabatan, 
                dapil: d.dapil, 
                name: d.name, 
                email: d.email,
                centreId: d.centreId as string | undefined
            },
            create: { ...d as any, role: 'dewan', passwordHash },
        });
        dewanList.push(u);
    }

    // ──────────────────────────────────────────────────
    // 3. MASYARAKAT (20 orang tersebar di Jabar)
    // ──────────────────────────────────────────────────
    console.log('👥 Seeding masyarakat di berbagai wilayah Jawa Barat...');
    const masyarakatData = [
        { email: 'masyarakat@demo.id',   name: 'User Demo Masyarakat', kabupaten: 'Kota Bandung', kecamatan: 'Cibiru' },
        { email: 'andi@warga.id',        name: 'Andi Prasetyo', kabupaten: 'Kota Bandung', kecamatan: 'Antapani' },
        { email: 'nina@warga.id',        name: 'Nina Fitriani', kabupaten: 'Kota Bandung', kecamatan: 'Cicendo' },
        { email: 'rudi@warga.id',        name: 'Rudi Hartono', kabupaten: 'Kota Bandung', kecamatan: 'Ujungberung' },
        { email: 'maya@warga.id',        name: 'Maya Sari', kabupaten: 'Kota Bandung', kecamatan: 'Buah Batu' },
        { email: 'joko@warga.id',        name: 'Joko Susilo', kabupaten: 'Kabupaten Karawang', kecamatan: 'Telukjambe Timur' },
        { email: 'wulan@warga.id',       name: 'Wulan Gustiani', kabupaten: 'Kabupaten Bogor', kecamatan: 'Cibinong' },
        { email: 'dimas@warga.id',       name: 'Dimas Nugraha', kabupaten: 'Kota Bekasi', kecamatan: 'Bekasi Selatan' },
        { email: 'rian@warga.id',        name: 'Rian Hidayat', kabupaten: 'Kabupaten Bogor', kecamatan: 'Ciawi' },
        { email: 'cecep@warga.id',       name: 'Cecep Setiawan', kabupaten: 'Kabupaten Garut', kecamatan: 'Tarogong Kidul' },
        { email: 'asep@warga.id',        name: 'Asep Saepudin', kabupaten: 'Kabupaten Cianjur', kecamatan: 'Cipanas' },
        { email: 'suryadi@warga.id',     name: 'Suryadi', kabupaten: 'Kabupaten Cirebon', kecamatan: 'Sumber' },
        { email: 'dadang@warga.id',      name: 'Dadang Hermawan', kabupaten: 'Kabupaten Sukabumi', kecamatan: 'Cisaat' },
        { email: 'eka@warga.id',         name: 'Eka Saputra', kabupaten: 'Kabupaten Subang', kecamatan: 'Kalijati' },
        { email: 'heri@warga.id',         name: 'Heri Susanto', kabupaten: 'Kabupaten Purwakarta', kecamatan: 'Jatiluhur' },
        { email: 'agus@warga.id',         name: 'Agus Salim', kabupaten: 'Kabupaten Sumedang', kecamatan: 'Jatinangor' },
        { email: 'taufik@warga.id',       name: 'Taufik Hidayat', kabupaten: 'Kabupaten Indramayu', kecamatan: 'Jatibarang' },
        { email: 'yayan@warga.id',        name: 'Yayan Rusyandi', kabupaten: 'Kabupaten Ciamis', kecamatan: 'Kawali' },
        { email: 'nyoman@warga.id',       name: 'Nyoman Tri', kabupaten: 'Kabupaten Pangandaran', kecamatan: 'Parigi' },
        { email: 'mamat@warga.id',        name: 'Mamat Rohimat', kabupaten: 'Kabupaten Tasikmalaya', kecamatan: 'Singaparna' }
    ];
    const masyList: any[] = [];
    for (const m of masyarakatData) {
        const u = await prisma.user.upsert({
            where: { email: m.email },
            update: { passwordHash, kabupaten: m.kabupaten, kecamatan: m.kecamatan },
            create: { ...m, role: 'masyarakat', passwordHash },
        });
        masyList.push(u);
    }
    const [
        masyarakat, andi, nina, rudi, maya, joko, wulan, dimas,
        rian, cecep, asep, suryadi, dadang, eka, heri, agus, taufik, yayan, nyoman, mamat
    ] = masyList;

    // ──────────────────────────────────────────────────
    // 4. AVAILABILITY (per dewan)
    // ──────────────────────────────────────────────────
    console.log('📅 Seeding ketersediaan waktu...');
    await prisma.availability.deleteMany({});
    const availabilities: any[] = [];
    for (const dewan of dewanList) {
        availabilities.push(
            { dewanId: dewan.id, startTime: h(1),  endTime: h(2) },
            { dewanId: dewan.id, startTime: h(24), endTime: h(25) },
            { dewanId: dewan.id, startTime: h(48), endTime: h(50) },
            { dewanId: dewan.id, startTime: h(72), endTime: h(74) },
        );
    }
    await prisma.availability.createMany({ data: availabilities });

    // ──────────────────────────────────────────────────
    // 5. SCHEDULES + RATINGS WITH SPATIAL GEOJSON CONTEXT
    // ──────────────────────────────────────────────────
    console.log('📋 Seeding jadwal dan penilaian spasial...');
    await prisma.rating.deleteMany({});
    await prisma.schedule.deleteMany({});

    const [dewan1, dewan2, dewan3, dewan4, dewan5, dewan6] = dewanList;

    // Helper to create schedule + optional rating + optional AI analysis
    const makeSchedule = async (
        title: string,
        masyarakatId: number,
        dewanId: number,
        startTime: Date,
        status: string,
        rating?: { sp: number; cx: number; tm: number; rs: number; sl: number; comment: string },
        analysis?: any
    ) => {
        const s = await prisma.schedule.create({
            data: { 
                title, 
                masyarakatId, 
                startTime,
                analysis: analysis || undefined
            },
        });
        
        await prisma.scheduleParticipant.create({
            data: {
                scheduleId: s.id,
                dewanId,
                status // mapping overall status to participant status
            }
        });

        if (rating) {
            await prisma.rating.create({
                data: {
                    scheduleId: s.id,
                    dewanId,
                    speakingScore: rating.sp,
                    contextScore: rating.cx,
                    timeScore: rating.tm,
                    responsivenessScore: rating.rs,
                    solutionScore: rating.sl,
                    comment: rating.comment,
                },
            });
        }
        return s;
    };

    // ── Sesi Aktif ──
    await makeSchedule('Diskusi Jalan Rusak di Cibiru', masyarakat.id, dewan1.id, h(-0.08), 'confirmed');
    await makeSchedule('Revitalisasi Pasar Tradisional Ujungberung', andi.id, dewan3.id, h(-0.05), 'confirmed');

    // ── Jadwal Mendatang ──
    await makeSchedule('Pemerataan Fasilitas Sekolah Dasar', masyarakat.id, dewan2.id, h(2), 'confirmed');
    await makeSchedule('Penanganan Kemacetan Ruas Buah Batu', nina.id, dewan1.id, h(4), 'confirmed');
    await makeSchedule('Usulan Beasiswa bagi Pelajar Berprestasi', rudi.id, dewan4.id, h(6), 'confirmed');
    await makeSchedule('Pengembangan BUMDes Wilayah Selatan', maya.id, dewan5.id, h(26), 'confirmed');
    await makeSchedule('Perizinan Kegiatan Kesenian Daerah', joko.id, dewan6.id, h(48), 'confirmed');

    // ── Menunggu Konfirmasi (pending) ──
    await makeSchedule('Rekomendasi Penyaluran Pupuk Subsidi', masyarakat.id, dewan1.id, h(25), 'pending');
    await makeSchedule('Bantuan Modal UMKM Terdampak Banjir', wulan.id, dewan3.id, h(36), 'pending');
    await makeSchedule('Permohonan Pembangunan Jembatan Desa', mamat.id, dewan1.id, h(48), 'pending');
    await makeSchedule('Permohonan Audiensi Kelompok Tani', joko.id, dewan1.id, h(50), 'pending');

    // ── Selesai + Penilaian Spasial Terdistribusi Indah (Rainbow colors!) ──

    // 1. Kota Bandung (Rating: 4.6 - Hijau)
    await makeSchedule('Evaluasi Penanganan Banjir Musiman Kota Bandung', masyarakat.id, dewan1.id, d(-1), 'confirmed', 
        { sp: 5, cx: 5, tm: 4, rs: 5, sl: 4, comment: 'Bapak Ahmad sangat responsif mendengarkan keluhan banjir warga.' },
        { sentiment: 'Positif', topics: ['Infrastruktur', 'Banjir', 'Tata Kota'], citizenSatisfaction: 4.6, dewanResponsiveness: 4.8, discussionQuality: 4.5, problemSolving: 4.2 }
    );

    // 2. Kabupaten Bogor (Rating: 3.8 - Kuning)
    await makeSchedule('Aspirasi Guru Honorer SDN Ciawi', rian.id, dewan2.id, d(-2), 'confirmed', 
        { sp: 4, cx: 4, tm: 3, rs: 4, sl: 4, comment: 'Cukup bagus, menjelaskan langkah kuota guru honorer PPPK.' },
        { sentiment: 'Netral', topics: ['Pendidikan', 'Guru Honorer', 'Sekolah'], citizenSatisfaction: 3.8, dewanResponsiveness: 4.0, discussionQuality: 3.9, problemSolving: 3.5 }
    );

    // 3. Kabupaten Karawang (Rating: 2.2 - Oranye/Merah)
    await makeSchedule('Keluhan Limbah Industri Sungai Citarum Karawang', joko.id, dewan3.id, d(-3), 'confirmed', 
        { sp: 2, cx: 3, tm: 2, rs: 2, sl: 2, comment: 'Respon lambat, rapat ditunda-tunda dan belum ada solusi konkrit.' },
        { sentiment: 'Negatif', topics: ['Lingkungan', 'Limbah', 'Polusi'], citizenSatisfaction: 2.2, dewanResponsiveness: 2.0, discussionQuality: 2.5, problemSolving: 2.0 }
    );

    // 4. Kota Bekasi (Rating: 4.2 - Hijau)
    await makeSchedule('Integrasi Saluran Drainase Kali Bekasi', dimas.id, dewan4.id, d(-4), 'confirmed', 
        { sp: 4, cx: 4, tm: 5, rs: 4, sl: 4, comment: 'Bagus sekali, dewan berjanji mengawal koordinasi lintas wilayah.' },
        { sentiment: 'Positif', topics: ['Infrastruktur', 'Saluran Air', 'Banjir'], citizenSatisfaction: 4.2, dewanResponsiveness: 4.5, discussionQuality: 4.2, problemSolving: 4.0 }
    );

    // 5. Kabupaten Garut (Rating: 4.8 - Hijau)
    await makeSchedule('Pengembangan UMKM Dodol dan Kulit Garut', cecep.id, dewan5.id, d(-5), 'confirmed', 
        { sp: 5, cx: 5, tm: 5, rs: 5, sl: 4, comment: 'Luar biasa, Bapak Hendra langsung menghubungkan dengan dinas koperasi.' },
        { sentiment: 'Positif', topics: ['UMKM', 'Ekonomi', 'Modal Usaha'], citizenSatisfaction: 4.8, dewanResponsiveness: 5.0, discussionQuality: 4.8, problemSolving: 4.6 }
    );

    // 6. Kabupaten Cianjur (Rating: 1.8 - Merah)
    await makeSchedule('Penyaluran Pupuk Subsidi Pertanian Cianjur', asep.id, dewan6.id, d(-6), 'confirmed', 
        { sp: 2, cx: 2, tm: 1, rs: 2, sl: 2, comment: 'Sangat mengecewakan, dewan tidak memahami akar masalah kelangkaan pupuk.' },
        { sentiment: 'Negatif', topics: ['Pertanian', 'Pupuk Subsidi', 'Sosial'], citizenSatisfaction: 1.8, dewanResponsiveness: 2.0, discussionQuality: 2.0, problemSolving: 1.5 }
    );

    // 7. Kabupaten Cirebon (Rating: 3.4 - Kuning)
    await makeSchedule('Layanan Kesehatan BPJS RS Sumber', suryadi.id, dewan1.id, d(-7), 'confirmed', 
        { sp: 3, cx: 4, tm: 3, rs: 4, sl: 3, comment: 'Dewan menjanjikan evaluasi rujukan berjenjang BPJS Kesehatan.' },
        { sentiment: 'Netral', topics: ['Kesehatan', 'BPJS', 'Layanan Publik'], citizenSatisfaction: 3.4, dewanResponsiveness: 3.8, discussionQuality: 3.5, problemSolving: 3.0 }
    );

    // 8. Kabupaten Sukabumi (Rating: 4.5 - Hijau)
    await makeSchedule('Akses Jalan Wisata Geopark Ciletuh Sukabumi', dadang.id, dewan2.id, d(-8), 'confirmed', 
        { sp: 5, cx: 4, tm: 4, rs: 5, sl: 5, comment: 'Sangat positif, langsung didorong masuk prioritas APBD Perubahan.' },
        { sentiment: 'Positif', topics: ['Infrastruktur', 'Pariwisata', 'Jalan Raya'], citizenSatisfaction: 4.5, dewanResponsiveness: 4.8, discussionQuality: 4.4, problemSolving: 4.7 }
    );

    // 9. Kabupaten Subang (Rating: 2.8 - Oranye)
    await makeSchedule('Perbaikan Jalan Poros Kalijati Subang', eka.id, dewan3.id, d(-9), 'confirmed', 
        { sp: 3, cx: 3, tm: 2, rs: 3, sl: 3, comment: 'Penjelasan berbelit-belit soal wewenang jalan kabupaten vs provinsi.' },
        { sentiment: 'Negatif', topics: ['Infrastruktur', 'Jalan Rusak', 'Anggaran'], citizenSatisfaction: 2.8, dewanResponsiveness: 3.0, discussionQuality: 3.0, problemSolving: 2.5 }
    );

    // 10. Kabupaten Purwakarta (Rating: 3.9 - Kuning)
    await makeSchedule('Suplai Air Bersih PDAM Jatiluhur', heri.id, dewan4.id, d(-10), 'confirmed', 
        { sp: 4, cx: 4, tm: 4, rs: 4, sl: 3, comment: 'Diskusi berjalan lancar, dewan menyetujui program pipa air bersih baru.' },
        { sentiment: 'Netral', topics: ['Air Bersih', 'PDAM', 'Kebutuhan Dasar'], citizenSatisfaction: 3.9, dewanResponsiveness: 4.1, discussionQuality: 4.0, problemSolving: 3.6 }
    );

    // 11. Kabupaten Sumedang (Rating: 4.7 - Hijau)
    await makeSchedule('Program Beasiswa Pelajar Jatinangor Sumedang', agus.id, dewan5.id, d(-11), 'confirmed', 
        { sp: 5, cx: 5, tm: 4, rs: 5, sl: 5, comment: 'Sangat solutif, memberikan skema beasiswa bagi warga kurang mampu.' },
        { sentiment: 'Positif', topics: ['Pendidikan', 'Beasiswa', 'Mahasiswa'], citizenSatisfaction: 4.7, dewanResponsiveness: 4.9, discussionQuality: 4.7, problemSolving: 4.8 }
    );

    // 12. Kabupaten Indramayu (Rating: 2.4 - Oranye)
    await makeSchedule('Kerusakan Saluran Irigasi Sawah Jatibarang', taufik.id, dewan6.id, d(-12), 'confirmed', 
        { sp: 3, cx: 2, tm: 2, rs: 2, sl: 3, comment: 'Pembahasan kurang terarah dan belum ada jadwal survei lokasi sawah.' },
        { sentiment: 'Negatif', topics: ['Pertanian', 'Irigasi', 'Sawah'], citizenSatisfaction: 2.4, dewanResponsiveness: 2.5, discussionQuality: 2.8, problemSolving: 2.0 }
    );

    // 13. Kabupaten Ciamis (Rating: 4.4 - Hijau)
    await makeSchedule('Pemberdayaan Karang Taruna Kawali Ciamis', yayan.id, dewan1.id, d(-13), 'confirmed', 
        { sp: 4, cx: 5, tm: 4, rs: 4, sl: 5, comment: 'Sangat membina dan setuju mengalokasikan dana hibah pembinaan pemuda.' },
        { sentiment: 'Positif', topics: ['UMKM', 'Kepemudaan', 'Sosial'], citizenSatisfaction: 4.4, dewanResponsiveness: 4.5, discussionQuality: 4.3, problemSolving: 4.5 }
    );

    // 14. Kabupaten Pangandaran (Rating: 4.9 - Hijau)
    await makeSchedule('Promosi Wisata Pantai Parigi Pangandaran', nyoman.id, dewan2.id, d(-14), 'confirmed', 
        { sp: 5, cx: 5, tm: 5, rs: 5, sl: 5, comment: 'Luar biasa sekali programnya! Dewan sangat komit memajukan pariwisata.' },
        { sentiment: 'Positif', topics: ['Pariwisata', 'UMKM', 'Ekonomi Kreatif'], citizenSatisfaction: 4.9, dewanResponsiveness: 5.0, discussionQuality: 4.9, problemSolving: 4.9 }
    );

    // 15. Kabupaten Tasikmalaya (Rating: 1.6 - Merah)
    await makeSchedule('Perbaikan Jembatan Gantung Singaparna Tasikmalaya', mamat.id, dewan3.id, d(-15), 'confirmed', 
        { sp: 2, cx: 1, tm: 2, rs: 1, sl: 2, comment: 'Dewan tidak mendengarkan urgensi jembatan yang hampir roboh ini.' },
        { sentiment: 'Negatif', topics: ['Infrastruktur', 'Jembatan', 'Akses Desa'], citizenSatisfaction: 1.6, dewanResponsiveness: 1.5, discussionQuality: 2.0, problemSolving: 1.2 }
    );

    // ── 6. Sinkronisasi Master Hub ──
    console.log('\n🔄 Menghubungi Master Hub untuk sinkronisasi dewan...');
    await syncHubData();

    console.log('\n✅ Seeding selesai!');
    console.log('──────────────────────────────────');
    console.log(`  Admin          : 1 akun`);
    console.log(`  Anggota Dewan  : ${dewanList.length} akun`);
    console.log(`  Masyarakat     : ${masyList.length} akun`);
    console.log(`  Ketersediaan   : ${availabilities.length} slot`);
    console.log('──────────────────────────────────');
    console.log('  Semua password : "password"');
    console.log('──────────────────────────────────');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
