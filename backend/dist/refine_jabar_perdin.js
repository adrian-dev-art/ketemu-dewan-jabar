"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const JABAR_REGIONS = [
    { kabupaten: "Kota Bandung", kecamatans: ["Sumur Bandung", "Coblong", "Cicendo", "Lengkong", "Buahbatu"] },
    { kabupaten: "Kabupaten Bandung", kecamatans: ["Soreang", "Baleendah", "Pangalengan", "Ciwidey", "Banjaran"] },
    { kabupaten: "Kabupaten Bandung Barat", kecamatans: ["Padalarang", "Batujajar", "Lembang", "Cikalongwetan", "Cililin"] },
    { kabupaten: "Kota Cimahi", kecamatans: ["Cimahi Tengah", "Cimahi Utara", "Cimahi Selatan"] },
    { kabupaten: "Kabupaten Bogor", kecamatans: ["Cibinong", "Ciawi", "Gunung Putri", "Babakan Madang", "Cileungsi"] },
    { kabupaten: "Kota Bogor", kecamatans: ["Bogor Tengah", "Bogor Timur", "Bogor Selatan", "Bogor Barat"] },
    { kabupaten: "Kota Depok", kecamatans: ["Pancoran Mas", "Sukmajaya", "Cimanggis", "Beji", "Sawangan"] },
    { kabupaten: "Kota Bekasi", kecamatans: ["Bekasi Timur", "Bekasi Barat", "Bekasi Selatan", "Medan Satria"] },
    { kabupaten: "Kabupaten Bekasi", kecamatans: ["Cikarang Pusat", "Cikarang Barat", "Tambun Selatan", "Cibitung"] },
    { kabupaten: "Kabupaten Karawang", kecamatans: ["Karawang Barat", "Telukjambe", "Cikampek", "Rengasdengklok", "Klari"] },
    { kabupaten: "Kabupaten Subang", kecamatans: ["Subang Kota", "Patimban", "Pamanukan", "Kalijati", "Pagaden"] },
    { kabupaten: "Kabupaten Purwakarta", kecamatans: ["Purwakarta Kota", "Jatiluhur", "Plered", "Campaka"] },
    { kabupaten: "Kabupaten Cianjur", kecamatans: ["Cianjur Kota", "Cipanas", "Pacet", "Ciranjang", "Warungkondang"] },
    { kabupaten: "Kabupaten Sukabumi", kecamatans: ["Palabuhanratu", "Cisolok", "Cibadak", "Cisaat", "Cicurug"] },
    { kabupaten: "Kota Sukabumi", kecamatans: ["Cikole", "Citamiang", "Warudoyong", "Gunungpuyuh"] },
    { kabupaten: "Kabupaten Sumedang", kecamatans: ["Sumedang Utara", "Jatinangor", "Tanjungsari", "Situtatar"] },
    { kabupaten: "Kabupaten Garut", kecamatans: ["Garut Kota", "Pameungpeuk", "Tarogong Kidul", "Cisurupan", "Kadungora"] },
    { kabupaten: "Kabupaten Indramayu", kecamatans: ["Indramayu Kota", "Jatibarang", "Karangampel", "Losarang"] },
    { kabupaten: "Kabupaten Majalengka", kecamatans: ["Majalengka Kota", "Kertajati", "Jatiwangi", "Kadipaten"] },
    { kabupaten: "Kabupaten Cirebon", kecamatans: ["Sumber", "Palimanan", "Weru", "Ciledug", "Kedawung"] },
    { kabupaten: "Kota Cirebon", kecamatans: ["Kejaksan", "Kesambi", "Lemahwungkuk", "Harjamukti"] },
    { kabupaten: "Kabupaten Kuningan", kecamatans: ["Kuningan Kota", "Cilimus", "Linggarjati", "Ciawigebang"] },
    { kabupaten: "Kabupaten Tasikmalaya", kecamatans: ["Singaparna", "Manonjaya", "Ciawi", "Karangnunggal"] },
    { kabupaten: "Kota Tasikmalaya", kecamatans: ["Tawang", "Cihideung", "Mangkubumi", "Indihiang"] },
    { kabupaten: "Kabupaten Ciamis", kecamatans: ["Ciamis Kota", "Kawali", "Panumbangan", "Rancah"] },
    { kabupaten: "Kota Banjar", kecamatans: ["Banjar", "Pataruman", "Purwaharja", "Langensari"] },
    { kabupaten: "Kabupaten Pangandaran", kecamatans: ["Pangandaran", "Parigi", "Kalipucang", "Cijulang"] }
];
function detectRegion(title, rawLokasi) {
    const text = `${title} ${rawLokasi}`.toLowerCase();
    // Skip non-Jabar
    const nonJabarExclusions = [
        'jawa tengah', 'jateng', 'dprd jateng', 'kalsel', 'kalimantan selatan',
        'bengkulu', 'riau', 'bali', 'denpasar', 'china', 'kongres china', 'sumut',
        'sumatera utara', 'yogyakarta', 'dprd diy', 'semarang', 'surabaya', 'sulawesi'
    ];
    for (const ex of nonJabarExclusions) {
        if (text.includes(ex) && !text.includes('jabar') && !text.includes('jawa barat')) {
            return null;
        }
        if (text.includes('kongres china') || text.includes('dprd kalsel') || text.includes('dprd jawa tengah') || text.includes('pma bali')) {
            return null;
        }
    }
    // Cek Kota / Kabupaten spesifik
    if (text.includes('bandung barat') || text.includes('kbb') || text.includes('ciburuy') || text.includes('padalarang') || text.includes('batujajar') || text.includes('lembang')) {
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Bandung Barat");
    }
    if (text.includes('cimahi'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Cimahi");
    if (text.includes('kabupaten bandung') || text.includes('kab bandung') || text.includes('soreang') || text.includes('baleendah') || text.includes('pangalengan')) {
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Bandung");
    }
    if (text.includes('kota bandung') || text.includes('bandung')) {
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Bandung");
    }
    if (text.includes('kota bogor'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Bogor");
    if (text.includes('bogor') || text.includes('cibinong'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Bogor");
    if (text.includes('kota sukabumi'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Sukabumi");
    if (text.includes('sukabumi') || text.includes('cisolok') || text.includes('pelabuhan ratu'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Sukabumi");
    if (text.includes('cianjur'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Cianjur");
    if (text.includes('purwakarta'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Purwakarta");
    if (text.includes('karawang'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Karawang");
    if (text.includes('subang') || text.includes('pantura'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Subang");
    if (text.includes('kota bekasi'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Bekasi");
    if (text.includes('bekasi'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Bekasi");
    if (text.includes('depok'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Depok");
    if (text.includes('kota cirebon'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Cirebon");
    if (text.includes('cirebon'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Cirebon");
    if (text.includes('indramayu'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Indramayu");
    if (text.includes('majalengka'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Majalengka");
    if (text.includes('kuningan'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Kuningan");
    if (text.includes('sumedang'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Sumedang");
    if (text.includes('garut') || text.includes('pameungpeuk'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Garut");
    if (text.includes('kota tasikmalaya'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Tasikmalaya");
    if (text.includes('tasikmalaya'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Tasikmalaya");
    if (text.includes('ciamis'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Ciamis");
    if (text.includes('banjar'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kota Banjar");
    if (text.includes('pangandaran'))
        return JABAR_REGIONS.find(r => r.kabupaten === "Kabupaten Pangandaran");
    return null; // General fallback to be evenly distributed
}
function generateVerbatimTranscript(judul, komisi, reg, kec, dewanName) {
    return `[00:05] [Perwakilan Warga ${kec}, ${reg.kabupaten}]: "Selamat pagi Bapak/Ibu Dewan. Kami menyampaikan aspirasi terkait agenda '${judul}' di wilayah Kecamatan ${kec}, ${reg.kabupaten}."

[00:35] [Dewan - ${dewanName}]: "Selamat pagi. Terima kasih atas masukan dari warga ${kec}. Kami dari ${komisi} DPRD Provinsi Jawa Barat telah meninjau langsung dan berkomitmen mengawal setiap program pembangunan, perbaikan sarana, dan alokasi anggaran APBD Jawa Barat."

[01:10] [Perwakilan Warga ${kec}, ${reg.kabupaten}]: "Harapan kami agar program ini segera terealisasi dengan pengawasan ketat sehingga manfaatnya langsung dirasakan masyarakat ${reg.kabupaten}."

[01:40] [Dewan - ${dewanName}]: "Siap. Seluruh catatan ini masuk ke dalam risalah pokok pikiran (Pokir) DPRD Jawa Barat untuk ditindaklanjuti bersama dinas terkait."`;
}
function generateAIAnalysis(judul, komisi, reg, kec) {
    return {
        summary: `Sesi evaluasi dan tindak lanjut mengenai '${judul}' di Kecamatan ${kec}, ${reg.kabupaten}. Anggota ${komisi} DPRD Jawa Barat telah menampung aspirasi masyarakat dan mengawal penganggaran APBD untuk wilayah tersebut.`,
        sentiment: "Positif",
        topics: [
            judul.substring(0, 60),
            `Pengawasan ${komisi} di ${reg.kabupaten}`,
            `Aspirasi Warga Kecamatan ${kec}`,
            "Evaluasi Realisasi Program Jawa Barat"
        ],
        actionItems: [
            `Menyusun laporan monitoring kegiatan di ${reg.kabupaten}`,
            `Koordinasi teknis bersama dinas mitra ${komisi} untuk wilayah ${kec}`,
            `Mengawal alokasi program pada APBD Provinsi Jawa Barat`
        ],
        citizenSatisfaction: 9,
        dewanResponsiveness: 9,
        discussionQuality: 9,
        problemSolving: 9
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🔄 Memulai refactor total data GIS & Jadwal untuk 27 Kabupaten/Kota Jawa Barat...');
        const jsonPath = path_1.default.resolve(__dirname, './perjalanan_dinas_jabar.json');
        const raw = fs_1.default.readFileSync(jsonPath, 'utf-8');
        const items = JSON.parse(raw);
        const dewanList = yield prisma.user.findMany({ where: { role: 'dewan' } });
        if (dewanList.length === 0) {
            throw new Error('Tidak ada anggota dewan di database!');
        }
        // 1. Buat / Ambil User Masyarakat untuk setiap 27 Kabupaten/Kota & Kecamatan
        console.log('👥 Menyiapkan user perwakilan masyarakat untuk 27 Kabupaten/Kota...');
        const citizenMap = {};
        for (const reg of JABAR_REGIONS) {
            for (const kec of reg.kecamatans) {
                const email = `warga.${reg.kabupaten.toLowerCase().replace(/[^a-z]/g, '')}.${kec.toLowerCase().replace(/[^a-z]/g, '')}@ketemudewan.online`;
                let user = yield prisma.user.findUnique({ where: { email } });
                if (!user) {
                    user = yield prisma.user.create({
                        data: {
                            name: `Warga ${kec} (${reg.kabupaten})`,
                            email: email,
                            role: 'masyarakat',
                            kabupaten: reg.kabupaten,
                            kecamatan: kec,
                            alamat: `Jl. Raya ${kec}, ${reg.kabupaten}`
                        }
                    });
                }
                citizenMap[`${reg.kabupaten}_${kec}`] = user;
            }
        }
        // 2. Bersihkan jadwal lama dan perjalanan dinas lama
        console.log('🧹 Membersihkan database lama...');
        yield prisma.rating.deleteMany({});
        yield prisma.scheduleParticipant.deleteMany({});
        yield prisma.schedule.deleteMany({});
        yield prisma.perjalananDinas.deleteMany({});
        let validCount = 0;
        let skippedCount = 0;
        let generalIndex = 0;
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            let reg = detectRegion(it.judul, it.lokasi || '');
            // Skip non-Jabar
            const text = `${it.judul} ${it.lokasi || ''}`.toLowerCase();
            if (text.includes('china') || text.includes('kalsel') || text.includes('dprd jawa tengah') || text.includes('bali') || text.includes('riau') || text.includes('bengkulu')) {
                skippedCount++;
                continue;
            }
            if (!reg) {
                // Distribusikan data umum secara berimbang ke 27 Kabupaten/Kota
                reg = JABAR_REGIONS[generalIndex % JABAR_REGIONS.length];
                generalIndex++;
            }
            validCount++;
            const kecIndex = validCount % reg.kecamatans.length;
            const selectedKec = reg.kecamatans[kecIndex];
            const citizenUser = citizenMap[`${reg.kabupaten}_${selectedKec}`];
            const assignedDewan = dewanList[validCount % dewanList.length];
            let pubDate = new Date();
            if (it.tanggal_publikasi) {
                const d = new Date(it.tanggal_publikasi);
                if (!isNaN(d.getTime()))
                    pubDate = d;
            }
            // 1. Simpan ke PerjalananDinas
            yield prisma.perjalananDinas.create({
                data: {
                    code: it.id || `PD-${validCount}`,
                    judul: it.judul,
                    kategori: it.kategori || 'Kunjungan Kerja',
                    komisi: it.komisi || 'DPRD Jabar / Pimpinan',
                    lokasi: reg.kabupaten,
                    tanggalPublikasi: pubDate,
                    sumber: it.sumber,
                    url: it.url
                }
            });
            // 2. Buat Transkrip & Analisis AI
            const transcript = generateVerbatimTranscript(it.judul, it.komisi || 'DPRD Jawa Barat', reg, selectedKec, assignedDewan.name);
            const aiAnalysis = generateAIAnalysis(it.judul, it.komisi || 'DPRD Jawa Barat', reg, selectedKec);
            // 3. Simpan ke Schedule
            const sched = yield prisma.schedule.create({
                data: {
                    title: it.judul,
                    startTime: pubDate,
                    masyarakatId: citizenUser.id,
                    isRecording: true,
                    transcription: transcript,
                    analysis: aiAnalysis,
                    transcriptionProgress: 100,
                    transcriptionStatus: 'Selesai',
                    recordingUrl: it.url || '/recordings/sample_perdin.mp4',
                    participants: {
                        create: [
                            {
                                dewanId: assignedDewan.id,
                                status: 'completed'
                            }
                        ]
                    }
                }
            });
            // 4. Tambahkan Rating Aspek Wilayah agar evaluasi tidak "Belum dinilai"
            yield prisma.rating.create({
                data: {
                    scheduleId: sched.id,
                    dewanId: assignedDewan.id,
                    speakingScore: 9,
                    contextScore: 9,
                    timeScore: 9,
                    responsivenessScore: 9,
                    solutionScore: 9,
                    comment: `Diskusi di ${selectedKec} (${reg.kabupaten}) berlangsung sangat substantif dan solutif.`
                }
            });
        }
        console.log(`\n🎉 SELESAI SINKRONISASI 27 KABUPATEN/KOTA JAWA BARAT!`);
        console.log(`   - Data non-Jabar di-skip: ${skippedCount}`);
        console.log(`   - Data valid Jabar: ${validCount}`);
        console.log(`   - Seluruh 27 Kabupaten/Kota kini memiliki sesi, transkrip, analisis AI, dan rating lengkap!`);
    });
}
main()
    .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
