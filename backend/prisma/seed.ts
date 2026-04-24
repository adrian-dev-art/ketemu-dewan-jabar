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
    // 3. MASYARAKAT (8 orang)
    // ──────────────────────────────────────────────────
    console.log('👥 Seeding masyarakat...');
    const masyarakatData = [
        { email: 'masyarakat@demo.id',   name: 'User Demo Masyarakat' },
        { email: 'andi@warga.id',        name: 'Andi Prasetyo' },
        { email: 'nina@warga.id',        name: 'Nina Fitriani' },
        { email: 'rudi@warga.id',        name: 'Rudi Hartono' },
        { email: 'maya@warga.id',        name: 'Maya Sari' },
        { email: 'joko@warga.id',        name: 'Joko Susilo' },
        { email: 'wulan@warga.id',       name: 'Wulan Gustiani' },
        { email: 'dimas@warga.id',       name: 'Dimas Nugraha' },
    ];
    const masyList: any[] = [];
    for (const m of masyarakatData) {
        const u = await prisma.user.upsert({
            where: { email: m.email },
            update: { passwordHash },
            create: { ...m, role: 'masyarakat', passwordHash },
        });
        masyList.push(u);
    }
    const [masyarakat, andi, nina, rudi, maya, joko, wulan, dimas] = masyList;

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
    // 5. SCHEDULES + RATINGS
    // ──────────────────────────────────────────────────
    console.log('📋 Seeding jadwal dan penilaian...');
    await prisma.rating.deleteMany({});
    await prisma.schedule.deleteMany({});

    const [dewan1, dewan2, dewan3, dewan4, dewan5, dewan6] = dewanList;

    // Helper to create schedule + optional rating
    const makeSchedule = async (
        title: string,
        masyarakatId: number,
        dewanId: number,
        startTime: Date,
        status: string,
        rating?: { sp: number; cx: number; tm: number; rs: number; sl: number; comment: string }
    ) => {
        const s = await prisma.schedule.create({
            data: { title, masyarakatId, startTime },
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

    // ── Sesi Aktif (sedang berlangsung, ~5 menit yang lalu) ──
    await makeSchedule('Diskusi Jalan Rusak di Cibiru', masyarakat.id, dewan1.id, h(-0.08), 'confirmed');
    await makeSchedule('Revitalisasi Pasar Tradisional Ujungberung', andi.id, dewan3.id, h(-0.05), 'confirmed');

    // ── Jadwal Mendatang (confirmed, dalam beberapa jam/hari) ──
    await makeSchedule('Pemerataan Fasilitas Sekolah Dasar', masyarakat.id, dewan2.id, h(2), 'confirmed');
    await makeSchedule('Penanganan Kemacetan Ruas Buah Batu', nina.id, dewan1.id, h(4), 'confirmed');
    await makeSchedule('Usulan Beasiswa bagi Pelajar Berprestasi', rudi.id, dewan4.id, h(6), 'confirmed');
    await makeSchedule('Pengembangan BUMDes Wilayah Selatan', maya.id, dewan5.id, h(26), 'confirmed');
    await makeSchedule('Perizinan Kegiatan Kesenian Daerah', joko.id, dewan6.id, h(48), 'confirmed');

    // ── Menunggu Konfirmasi (pending) ──
    await makeSchedule('Rekomendasi Penyaluran Pupuk Subsidi', masyarakat.id, dewan1.id, h(25), 'pending');
    await makeSchedule('Bantuan Modal UMKM Terdampak Banjir', wulan.id, dewan3.id, h(36), 'pending');
    await makeSchedule('Aspirasi Perluasan Jalur Angkot', dimas.id, dewan2.id, h(72), 'pending');
    await makeSchedule('Pengaduan Limbah Industri di Sungai Citarum', andi.id, dewan4.id, h(50), 'pending');

    // ── Ditolak ──
    await makeSchedule('Izin Pembangunan Lapangan Basket', masyarakat.id, dewan2.id, d(-2), 'rejected');
    await makeSchedule('Permohonan Tambahan Lampu Jalan', nina.id, dewan5.id, d(-3), 'rejected');

    // ── Selesai + Penilaian (riwayat dengan rating) ──
    await makeSchedule('Evaluasi Penanganan Banjir Musiman', masyarakat.id, dewan1.id, d(-1), 'confirmed', {
        sp: 4, cx: 5, tm: 4, rs: 4, sl: 3,
        comment: 'Bapak Ahmad sangat mendengarkan aspirasi, akan menindaklanjuti ke dinas PU.',
    });
    await makeSchedule('Kondisi Drainase RT 05 Kelurahan Antapani', andi.id, dewan1.id, d(-2), 'confirmed', {
        sp: 5, cx: 4, tm: 5, rs: 5, sl: 4,
        comment: 'Respon cepat dan langsung turun lapangan bersama tim teknis.',
    });
    await makeSchedule('Ketersediaan Guru di SDN 12 Cicendo', nina.id, dewan2.id, d(-3), 'confirmed', {
        sp: 3, cx: 5, tm: 3, rs: 4, sl: 3,
        comment: 'Penjelasan mendalam terkait kuota guru, namun solusi belum konkret.',
    });
    await makeSchedule('Program Beasiswa KIP Kuliah 2025', rudi.id, dewan2.id, d(-4), 'confirmed', {
        sp: 5, cx: 5, tm: 5, rs: 5, sl: 5,
        comment: 'Luar biasa! Ibu Siti langsung membantu proses administrasi di tempat.',
    });
    await makeSchedule('Krisis Air Bersih PDAM Wilayah Timur', maya.id, dewan3.id, d(-5), 'confirmed', {
        sp: 4, cx: 4, tm: 3, rs: 4, sl: 3,
        comment: 'Cukup responsif meski solusi masih butuh tindak lanjut jangka panjang.',
    });
    await makeSchedule('Keluhan Asap Pabrik Kawasan Industri Karawang', joko.id, dewan4.id, d(-6), 'confirmed', {
        sp: 5, cx: 5, tm: 4, rs: 5, sl: 4,
        comment: 'Ibu Dewi sangat aktif dan berjanji akan memanggil pihak industri.',
    });
    await makeSchedule('Hak Pesangon Karyawan Dirumahkan', wulan.id, dewan3.id, d(-7), 'confirmed', {
        sp: 3, cx: 4, tm: 4, rs: 3, sl: 2,
        comment: 'Memahami masalah, tapi belum ada kejelasan langkah selanjutnya.',
    });
    await makeSchedule('Permasalahan Sertifikat Tanah Warga', dimas.id, dewan5.id, d(-8), 'confirmed', {
        sp: 4, cx: 3, tm: 4, rs: 4, sl: 3,
        comment: 'Bapak Hendra merespons dengan baik namun topik agak melebar.',
    });
    await makeSchedule('Pengembalian Dana BOS yang Tidak Tepat Sasaran', andi.id, dewan2.id, d(-9), 'confirmed', {
        sp: 5, cx: 5, tm: 5, rs: 5, sl: 4,
        comment: 'Sangat profesional, langsung direspons dengan surat ke Disdik Provinsi.',
    });
    await makeSchedule('Usulan Pembangunan Posyandu di Dusun Terpencil', nina.id, dewan6.id, d(-10), 'confirmed', {
        sp: 4, cx: 4, tm: 4, rs: 5, sl: 4,
        comment: 'Ibu Ratih sangat peduli dan akan membawa usulan ke musrenbang.',
    });
    await makeSchedule('Konflik Pemilihan Ketua RT', maya.id, dewan5.id, d(-12), 'confirmed', {
        sp: 3, cx: 3, tm: 3, rs: 4, sl: 2,
        comment: 'Kurang bisa memberikan solusi konkret untuk kasus ini.',
    });
    await makeSchedule('Aspirasi Perawatan Makam Pahlawan Setempat', joko.id, dewan6.id, d(-15), 'confirmed', {
        sp: 5, cx: 4, tm: 5, rs: 5, sl: 5,
        comment: 'Sangat antusias dan berkomitmen menganggarkan di APBD perubahan.',
    });

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
