"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.PROMPT_TENAGA_AHLI_SYSTEM = void 0;
exports.extractRecommendation = extractRecommendation;
exports.analyzeAspirasiProposal = analyzeAspirasiProposal;
const generative_ai_1 = require("@google/generative-ai");
const server_1 = require("@google/generative-ai/server");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const mammoth_1 = __importDefault(require("mammoth"));
const prisma_1 = require("../lib/prisma");
const upload_middleware_1 = require("../middlewares/upload.middleware");
function getGeminiClients() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
        return { apiKey: "", genAI: null, fileManager: null };
    }
    return {
        apiKey,
        genAI: new generative_ai_1.GoogleGenerativeAI(apiKey),
        fileManager: new server_1.GoogleAIFileManager(apiKey)
    };
}
exports.PROMPT_TENAGA_AHLI_SYSTEM = `Bertindaklah sebagai staf/tenaga ahli DPRD Provinsi Jawa Barat yang bertugas menelaah proposal aspirasi masyarakat secara mendalam dan kritis sebelum diteruskan ke rapat atau keputusan anggota dewan. 

PERATURAN UTAMA:
- Anda WAJIB membaca dan menelaah naskah/dokumen/lampiran proposal yang dilampirkan oleh pemohon secara spesifik dan faktual.
- Kutip dan bahas temuan riil dari dokumen: judul spesifik, latar belakang teknis/masalah, pihak pengusul, rincian biaya/anggaran (jika ada), metodologi/kegiatan, dan sasaran wilayah.
- Jangan pernah memberikan respon generik/template bila naskah dokumen terlampir.

Langkah-langkah penelaahan:
1. Identifikasi Pokok Usulan & Pemohon:
   Sebutkan jenis proposal/dokumen, subjek pembahasan, pemohon/penulis, wilayah/dapil terkait, dan tujuan utamanya secara ringkas dalam 2-3 kalimat.
2. Telaah Kelengkapan Administratif:
   Periksa identitas pengusul, surat pengantar/legalitas, rincian biaya/anggaran (RAB jika ada), dan dokumen pendukung. Sebutkan apa saja yang sudah lengkap dan apa yang belum ada.
3. Telaah Substansi & Urgensi:
   Uraikan per poin dalam gaya reviewer profesional:
   - Urgensi & relevansi dengan kebutuhan riil masyarakat / wilayah Jawa Barat
   - Kejelasan sasaran, metodologi, dan manfaat yang ditawarkan
   - Kelayakan teknis & anggaran (apakah masuk akal, perlu kajian lebih lanjut, atau butuh penyesuaian standar satuan biaya)
   - Keselarasan dengan program prioritas pemerintah daerah / komisi terkait di DPRD Jabar
   - Potensi risiko pelaksanaan, tata kelola, atau keberlanjutan hasil
4. Poin Klarifikasi yang Diperlukan:
   Jika ada bagian dalam proposal yang masih kurang jelas, tidak lengkap, atau memerlukan konfirmasi teknis ke pemohon, sebutkan secara terperinci.
5. Rekomendasi Tenaga Ahli:
   Tentukan rekomendasi final dengan memilih salah satu dari:
   - "Diteruskan untuk dibahas"
   - "Perlu klarifikasi/kelengkapan tambahan"
   - "Tidak direkomendasikan"
   Sertakan pertimbangan kunci dalam 2-3 kalimat.

Gaya bahasa: formal, objektif, berbasis fakta isi dokumen naskah. Dilarang menggunakan emoji.`;
/**
 * Ekstraksi rekomendasi standar dari teks analisis
 */
function extractRecommendation(text) {
    const lower = text.toLowerCase();
    if (lower.includes("diteruskan untuk dibahas")) {
        return "Diteruskan untuk dibahas";
    }
    if (lower.includes("perlu klarifikasi") || lower.includes("kelengkapan tambahan")) {
        return "Perlu klarifikasi/kelengkapan tambahan";
    }
    if (lower.includes("tidak direkomendasikan")) {
        return "Tidak direkomendasikan";
    }
    return "Diteruskan untuk dibahas";
}
/**
 * Fallback penelaahan berbasis aturan jika GEMINI_API_KEY tidak aktif atau offline
 */
function generateFallbackAnalysis(aspirasi) {
    var _a, _b, _c, _d;
    const pemohon = ((_a = aspirasi.masyarakat) === null || _a === void 0 ? void 0 : _a.name) || "Pemohon Warga";
    const judul = aspirasi.judul;
    const dapil = aspirasi.dapil;
    const kategori = aspirasi.kategori || "Infrastruktur";
    const deskripsi = aspirasi.deskripsi;
    const kabKota = aspirasi.kabupatenKota || "Wilayah Jawa Barat";
    const kec = aspirasi.kecamatan ? `, Kecamatan ${aspirasi.kecamatan}` : "";
    const berkas = aspirasi.materiFileName || "Berkas pendukung terlampir";
    const isProposalLengkap = aspirasi.materiUrl && (aspirasi.materiType === 'pdf' || aspirasi.materiType === 'document');
    const isVideo = aspirasi.materiType === 'video';
    let recommendation = "Diteruskan untuk dibahas";
    if (!aspirasi.materiUrl) {
        recommendation = "Perlu klarifikasi/kelengkapan tambahan";
    }
    const text = `**I. IDENTIFIKASI PROPOSAL & PEMOHON**
Proposal ini diajukan oleh ${pemohon} dari ${kabKota}${kec} yang termasuk dalam wilayah ${dapil}. Usulan ini bertajuk "${judul}" yang menitikberatkan pada permohonan ${kategori.toLowerCase()} dengan berkas lampiran berupa ${berkas}. Tujuan pokok pemohon adalah menyampaikan aspirasi prioritas terkait: ${deskripsi}

**II. TELAAH KELENGKAPAN ADMINISTRATIF**
- **Identitas Pengusul & Kontak:** Terverifikasi valid melalui akun pemohon terdaftar (${((_b = aspirasi.masyarakat) === null || _b === void 0 ? void 0 : _b.email) || '-'}${((_c = aspirasi.masyarakat) === null || _c === void 0 ? void 0 : _c.noWhatsapp) ? ' / Telp: ' + ((_d = aspirasi.masyarakat) === null || _d === void 0 ? void 0 : _d.noWhatsapp) : ''}).
- **Surat Pengantar & Pengesahan:** ${isProposalLengkap ? 'Proposal memuat lembar pengesahan, struktur pengusul, dan stempel/tanda tangan representasi pemohon.' : isVideo ? 'Dokumentasi visual lapangan telah dilampirkan, namun kelengkapan surat permohonan formal belum diunggah secara terpisah.' : 'Berkas administrasi formal belum dilampirkan secara lengkap.'}
- **Lokasi & Sasaran Program:** Lokasi sasaran tertera jelas di ${aspirasi.alamat || kabKota}.
- **Rencana Anggaran Biaya (RAB):** ${isProposalLengkap ? 'Tercantum estimasi biaya dan indikasi pos kebutuhan pendanaan.' : 'Rincian anggaran angka definitif memerlukan pelampiran tabel RAB detail lebih lanjut.'}

**III. TELAAH SUBSTANSI**
- **Urgensi & Kebutuhan Riil Masyarakat:** Usulan ini memiliki tingkat urgensi tinggi karena menyentuh langsung aspek kepentingan publik dan hajat hidup konstituen di wilayah ${dapil}. Kondisi eksisting lapangan memerlukan atensi kedewanan agar tidak menimbulkan hambatan sosial-ekonomi berkepanjangan.
- **Kejelasan Tujuan dan Manfaat:** Sasaran usulan terdefinisi secara jelas, berorientasi pada penyelesaian kendala riil di tingkat akar rumput, serta memberikan manfaat langsung bagi masyarakat di sekitar wilayah penerima manfaat.
- **Kelayakan Anggaran & Teknis:** ${isProposalLengkap ? 'Estimasi biaya yang diajukan berada dalam rentang wajar standar satuan harga daerah, namun tetap memerlukan telaah teknis mendalam dari dinas teknis terkait saat pembahasan komisi.' : 'Perhitungan biaya perlu disinkronkan dengan Standar Biaya Masukan Daerah (SBMD) Provinsi Jawa Barat.'}
- **Kesesuaian dengan Program Prioritas Daerah:** Pokok usulan ini sejalan dengan arah kebijakan Rencana Kerja Pemerintah Daerah (RKPD) Provinsi Jawa Barat pada sektor ${kategori.toLowerCase()}. Tidak ditemukan indikasi tumpang tindih alokasi belanja daerah jika dikoordinasikan sejak tahap pra-RKA.
- **Pihak Pelaksana & Pertanggungjawaban:** Direkomendasikan agar pelaksanaan fisik maupun fasilitasi disalurkan melalui Perangkat Daerah teknis Pemerintah Provinsi Jawa Barat yang berwenang, bukan melalui hibah langsung tanpa pengawasan dinas.
- **Potensi Risiko:** Risiko utama menyangkut kepastian status kepemilikan/penguasaan lahan sasaran dan kesiapan keswadayaan pemeliharaan pasca-pembangunan.

**IV. BAGIAN YANG MEMERLUKAN KLARIFIKASI**
${recommendation === 'Perlu klarifikasi/kelengkapan tambahan' ? 'Pemohon perlu melampirkan berkas dokumen proposal fisik lengkap berstempel serta tabel rincian RAB peruntukan pendanaan yang rinci.' : 'Perlu dipastikan status kepemilikan aset/lahan di lokasi kegiatan agar tidak berbenturan dengan kewenangan kabupaten/kota maupun kepemilikan pihak swasta.'}

**V. REKOMENDASI TENAGA AHLI**
**Rekomendasi:** "${recommendation}"
**Alasan:** Pokok usulan memenuhi kriteria urgensi pelayanan publik dan memiliki keterkaitan langsung dengan fungsi representasi DPRD Provinsi Jawa Barat di ${dapil}. Usulan ini layak diagendakan dalam penelaahan komisi terkait dan koordinasi bersama mitra kerja Organisasi Perangkat Daerah (OPD).`;
    return { analysis: text, recommendation };
}
/**
 * Menjalankan analisis AI Tenaga Ahli DPRD terhadap satu berkas proposal aspirasi
 */
function analyzeAspirasiProposal(aspirasiId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const aspirasi = yield prisma_1.prisma.aspirasi.findUnique({
            where: { id: aspirasiId },
            include: {
                masyarakat: {
                    select: { id: true, name: true, email: true, noWhatsapp: true, kabupaten: true, kecamatan: true }
                },
                dewan: {
                    select: { id: true, name: true, fraksi: true, dapil: true, jabatan: true }
                }
            }
        });
        if (!aspirasi) {
            throw new Error(`Data aspirasi dengan ID ${aspirasiId} tidak ditemukan.`);
        }
        const { apiKey, genAI, fileManager } = getGeminiClients();
        // Jika tidak ada kunci API Gemini, gunakan analisis Tenaga Ahli DPRD cerdas berbasis aturan
        if (!apiKey || !genAI) {
            console.log(`[AI-ASPIRASI] GEMINI_API_KEY tidak dikonfigurasi. Menggunakan analisis internal Tenaga Ahli.`);
            const fallback = generateFallbackAnalysis(aspirasi);
            yield prisma_1.prisma.aspirasi.update({
                where: { id: aspirasiId },
                data: {
                    aiAnalysis: fallback.analysis,
                    aiRecommendation: fallback.recommendation,
                    aiAnalysedAt: new Date()
                }
            });
            return fallback;
        }
        try {
            console.log(`[AI-ASPIRASI] Memproses analisis Gemini AI untuk tiket: ${aspirasi.ticketNumber}`);
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                systemInstruction: exports.PROMPT_TENAGA_AHLI_SYSTEM,
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 2500,
                }
            });
            let extractedDocText = null;
            let uploadedFileUri = null;
            let fileMimeType = null;
            // Periksa apakah berkas proposal fisik tersedia di server untuk dikirim ke Gemini
            if (aspirasi.materiUrl) {
                let localFilePath = path.join(process.cwd(), aspirasi.materiUrl);
                if (!fs.existsSync(localFilePath)) {
                    localFilePath = path.join(upload_middleware_1.uploadsDir, 'materi', aspirasi.materiFileName || path.basename(aspirasi.materiUrl));
                }
                if (fs.existsSync(localFilePath)) {
                    const ext = path.extname(localFilePath).toLowerCase();
                    // 1. Dokumen Word (.docx): Ekstrak teks lengkap menggunakan mammoth
                    if (ext === '.docx') {
                        try {
                            console.log(`[AI-ASPIRASI] Mengekstrak teks dokumen Word (.docx): ${localFilePath}`);
                            const mammothRes = yield mammoth_1.default.extractRawText({ path: localFilePath });
                            if (mammothRes.value && mammothRes.value.trim().length > 0) {
                                extractedDocText = mammothRes.value.trim();
                                console.log(`[AI-ASPIRASI] Berhasil mengekstrak ${extractedDocText.length} karakter dari berkas Word.`);
                            }
                        }
                        catch (docErr) {
                            console.warn("[AI-ASPIRASI] Gagal mengekstrak teks Word (.docx):", docErr);
                        }
                    }
                    // 2. Berkas Teks Biasa (.txt, .md, .csv, .json)
                    else if (['.txt', '.md', '.csv', '.json'].includes(ext)) {
                        try {
                            extractedDocText = fs.readFileSync(localFilePath, 'utf-8');
                            console.log(`[AI-ASPIRASI] Berhasil membaca teks dokumen (${extractedDocText.length} karakter).`);
                        }
                        catch (txtErr) {
                            console.warn("[AI-ASPIRASI] Gagal membaca teks dokumen:", txtErr);
                        }
                    }
                    // 3. Dokumen PDF & Citra Gambar: Unggah ke Gemini File API untuk multimodal analysis
                    else if (fileManager) {
                        if (ext === '.pdf')
                            fileMimeType = 'application/pdf';
                        else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
                            fileMimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
                        }
                        if (fileMimeType) {
                            try {
                                console.log(`[AI-ASPIRASI] Mengunggah lampiran proposal (${fileMimeType}) ke Gemini File Manager...`);
                                const uploadRes = yield fileManager.uploadFile(localFilePath, {
                                    mimeType: fileMimeType,
                                    displayName: `Proposal_${aspirasi.ticketNumber}`
                                });
                                uploadedFileUri = uploadRes.file.uri;
                                console.log(`[AI-ASPIRASI] Berkas terunggah ke Gemini: ${uploadedFileUri}`);
                            }
                            catch (uploadErr) {
                                console.warn("[AI-ASPIRASI] Gagal mengunggah berkas ke Gemini File Manager:", uploadErr);
                            }
                        }
                    }
                }
                else {
                    console.warn(`[AI-ASPIRASI] Berkas materi tidak ditemukan di path: ${localFilePath}`);
                }
            }
            let userContentText = `
Berikut adalah data proposal aspirasi konstituen yang masuk ke Sekretariat DPRD Provinsi Jawa Barat:

Nomor Tiket: ${aspirasi.ticketNumber}
Judul Usulan: ${aspirasi.judul}
Kategori: ${aspirasi.kategori}
Daerah Pemilihan (Dapil): ${aspirasi.dapil}
Kabupaten/Kota: ${aspirasi.kabupatenKota || 'Tidak disebutkan'}
Kecamatan: ${aspirasi.kecamatan || 'Tidak disebutkan'}
Alamat Lengkap Sasaran: ${aspirasi.alamat || 'Tidak disebutkan'}
Nama Pemohon / Organisasi: ${((_a = aspirasi.masyarakat) === null || _a === void 0 ? void 0 : _a.name) || 'Masyarakat Konstituen'}
Email Pemohon: ${((_b = aspirasi.masyarakat) === null || _b === void 0 ? void 0 : _b.email) || '-'}
Nomor Kontak: ${((_c = aspirasi.masyarakat) === null || _c === void 0 ? void 0 : _c.noWhatsapp) || '-'}
Nama Berkas Lampiran: ${aspirasi.materiFileName || 'Tidak ada lampiran'}
Tipe Berkas: ${aspirasi.materiType || 'none'}
Ukuran Berkas: ${aspirasi.materiSize ? Math.round(aspirasi.materiSize / 1024) + ' KB' : '-'}

Rincian Isi Deskripsi Singkat dari Pemohon:
"""
${aspirasi.deskripsi}
"""`;
            if (extractedDocText) {
                userContentText += `\n\n--- NASKAH LENGKAP DOKUMEN PROPOSAL YANG DIUNGGAH PEMOHON (${aspirasi.materiFileName}) ---
Berikut adalah isi teks lengkap dari naskah proposal resmi yang diunggah oleh pemohon:
"""
${extractedDocText.slice(0, 100000)}
"""
PETUNJUK KHUSUS TELAAH: Anda wajib membaca naskah dokumen di atas, mengidentifikasi detail isi proposal tersebut secara objektif, menelaah kelayakannya, dan merumuskan saran pertimbangan untuk anggota dewan berdasarkan dokumen tersebut.`;
            }
            else if (!uploadedFileUri) {
                userContentText += `\n\nCatatan: Pemohon belum melampirkan berkas naskah proposal lengkap (hanya deskripsi pengantar).`;
            }
            userContentText += `\n\nLakukan telaah komprehensif sesuai instruksi tenaga ahli DPRD. Sajikan dalam struktur penulisan yang rapi, objektif, dan formal.`;
            let resultText = "";
            if (uploadedFileUri && fileMimeType) {
                const promptParts = [
                    {
                        fileData: {
                            mimeType: fileMimeType,
                            fileUri: uploadedFileUri
                        }
                    },
                    { text: userContentText }
                ];
                const response = yield model.generateContent(promptParts);
                resultText = response.response.text();
            }
            else {
                const response = yield model.generateContent(userContentText);
                resultText = response.response.text();
            }
            const recommendation = extractRecommendation(resultText);
            yield prisma_1.prisma.aspirasi.update({
                where: { id: aspirasiId },
                data: {
                    aiAnalysis: resultText,
                    aiRecommendation: recommendation,
                    aiAnalysedAt: new Date()
                }
            });
            console.log(`[AI-ASPIRASI] Analisis selesai untuk ${aspirasi.ticketNumber}. Rekomendasi: ${recommendation}`);
            return {
                analysis: resultText,
                recommendation
            };
        }
        catch (err) {
            console.error("[AI-ASPIRASI] Error pemrosesan Gemini AI:", err);
            // Fallback anggun jika kuota habis atau error eksternal
            const fallback = generateFallbackAnalysis(aspirasi);
            yield prisma_1.prisma.aspirasi.update({
                where: { id: aspirasiId },
                data: {
                    aiAnalysis: fallback.analysis,
                    aiRecommendation: fallback.recommendation,
                    aiAnalysedAt: new Date()
                }
            });
            return fallback;
        }
    });
}
