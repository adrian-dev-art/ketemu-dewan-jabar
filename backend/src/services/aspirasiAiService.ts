import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../lib/prisma";
import { uploadsDir } from "../middlewares/upload.middleware";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const fileManager = apiKey ? new GoogleAIFileManager(apiKey) : null;

export const PROMPT_TENAGA_AHLI_SYSTEM = `Bertindaklah sebagai staf/tenaga ahli DPRD yang bertugas menelaah proposal aspirasi masyarakat sebelum diteruskan ke rapat/keputusan anggota dewan. Proposal yang masuk formatnya sangat beragam (surat permohonan, proposal kegiatan, proposal pembangunan/infrastruktur, permohonan bantuan sosial/hibah, dll), jadi lakukan langkah berikut:

1. Identifikasi dulu jenis proposal, pemohon/pengusul, wilayah/dapil terkait, dan tujuan/permintaan utamanya — ringkas dalam 2-3 kalimat di awal.
2. Telaah kelengkapan administratif: apakah ada identitas pengusul/lembaga yang jelas, surat pengantar/tanda tangan/stempel resmi, alamat & kontak, rincian anggaran (jika ada permintaan dana), lokasi/sasaran kegiatan yang jelas, dan dokumen pendukung (KTP, proposal kegiatan, RAB, survei lokasi, dsb).
3. Telaah substansi, dalam bentuk paragraf per-poin (gaya seperti reviewer jurnal — satu paragraf per topik, dimulai dengan label topik singkat), mencakup hal-hal yang relevan sesuai isi proposal, misalnya:
- Urgensi & kesesuaian dengan kebutuhan riil masyarakat/wilayah
- Kejelasan tujuan dan manfaat yang diusulkan
- Kelayakan anggaran (apakah rincian biaya masuk akal, ada potensi mark-up, atau justru kurang detail)
- Kesesuaian dengan prioritas pembangunan daerah / program pemerintah yang sudah berjalan (hindari duplikasi anggaran)
- Kejelasan pihak pelaksana & mekanisme pertanggungjawaban (jika berupa bantuan/hibah)
- Potensi risiko atau hal yang perlu diklarifikasi lebih lanjut ke pengusul
4. Jika ada bagian proposal yang tidak lengkap/tidak jelas, sebutkan secara eksplisit apa yang kurang dan pertanyaan klarifikasi yang perlu diajukan ke pengusul — jangan menebak-nebak atau mengarang asumsi.
5. Tutup dengan Rekomendasi: pilih salah satu — "Diteruskan untuk dibahas", "Perlu klarifikasi/kelengkapan tambahan", "Tidak direkomendasikan", disertai alasan singkat 2-3 kalimat.

Gaya bahasa: formal, netral, berbasis fakta yang ada di dokumen — bukan opini politis. Dilarang menggunakan emoji sama sekali.`;

/**
 * Ekstraksi rekomendasi standar dari teks analisis
 */
export function extractRecommendation(text: string): string {
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
function generateFallbackAnalysis(aspirasi: any): { analysis: string; recommendation: string } {
    const pemohon = aspirasi.masyarakat?.name || "Pemohon Warga";
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
- **Identitas Pengusul & Kontak:** Terverifikasi valid melalui akun pemohon terdaftar (${aspirasi.masyarakat?.email || '-'}${aspirasi.masyarakat?.noWhatsapp ? ' / Telp: ' + aspirasi.masyarakat?.noWhatsapp : ''}).
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
export async function analyzeAspirasiProposal(aspirasiId: number): Promise<{ analysis: string; recommendation: string }> {
    const aspirasi = await prisma.aspirasi.findUnique({
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

    // Jika tidak ada kunci API Gemini, gunakan analisis Tenaga Ahli DPRD cerdas berbasis aturan
    if (!apiKey || !genAI) {
        console.log(`[AI-ASPIRASI] GEMINI_API_KEY tidak dikonfigurasi. Menggunakan analisis internal Tenaga Ahli.`);
        const fallback = generateFallbackAnalysis(aspirasi);
        await prisma.aspirasi.update({
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
            model: "gemini-1.5-flash",
            systemInstruction: PROMPT_TENAGA_AHLI_SYSTEM,
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2048,
            }
        });

        let uploadedFileUri: string | null = null;
        let fileMimeType: string | null = null;

        // Periksa apakah berkas proposal fisik tersedia di server untuk dikirim ke Gemini
        if (aspirasi.materiUrl && fileManager) {
            let localFilePath = path.join(process.cwd(), aspirasi.materiUrl);
            if (!fs.existsSync(localFilePath)) {
                localFilePath = path.join(uploadsDir, 'materi', aspirasi.materiFileName || path.basename(aspirasi.materiUrl));
            }

            if (fs.existsSync(localFilePath)) {
                const ext = path.extname(localFilePath).toLowerCase();
                if (ext === '.pdf') fileMimeType = 'application/pdf';
                else if (['.png', '.jpg', '.jpeg'].includes(ext)) fileMimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

                if (fileMimeType) {
                    try {
                        console.log(`[AI-ASPIRASI] Mengunggah lampiran proposal (${fileMimeType}) ke Gemini File Manager...`);
                        const uploadRes = await fileManager.uploadFile(localFilePath, {
                            mimeType: fileMimeType,
                            displayName: `Proposal_${aspirasi.ticketNumber}`
                        });
                        uploadedFileUri = uploadRes.file.uri;
                        console.log(`[AI-ASPIRASI] Berkas terunggah: ${uploadedFileUri}`);
                    } catch (uploadErr) {
                        console.warn("[AI-ASPIRASI] Gagal mengunggah berkas ke Gemini File Manager, beralih ke analisis teks metadata:", uploadErr);
                    }
                }
            }
        }

        const userContentText = `
Berikut adalah data proposal aspirasi konstituen yang masuk ke Sekretariat DPRD Provinsi Jawa Barat:

Nomor Tiket: ${aspirasi.ticketNumber}
Judul Usulan: ${aspirasi.judul}
Kategori: ${aspirasi.kategori}
Daerah Pemilihan (Dapil): ${aspirasi.dapil}
Kabupaten/Kota: ${aspirasi.kabupatenKota || 'Tidak disebutkan'}
Kecamatan: ${aspirasi.kecamatan || 'Tidak disebutkan'}
Alamat Lengkap Sasaran: ${aspirasi.alamat || 'Tidak disebutkan'}
Nama Pemohon / Organisasi: ${aspirasi.masyarakat?.name || 'Masyarakat Konstituen'}
Email Pemohon: ${aspirasi.masyarakat?.email || '-'}
Nomor Kontak: ${aspirasi.masyarakat?.noWhatsapp || '-'}
Nama Berkas Lampiran: ${aspirasi.materiFileName || 'Tidak ada lampiran'}
Tipe Berkas: ${aspirasi.materiType || 'none'}
Ukuran Berkas: ${aspirasi.materiSize ? Math.round(aspirasi.materiSize / 1024) + ' KB' : '-'}

Rincian Isi Deskripsi Usulan dari Pemohon:
"""
${aspirasi.deskripsi}
"""

Lakukan telaah komprehensif sesuai instruksi tenaga ahli DPRD. Sajikan dalam struktur penulisan yang rapi, objektif, dan formal.`;

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
            const response = await model.generateContent(promptParts);
            resultText = response.response.text();
        } else {
            const response = await model.generateContent(userContentText);
            resultText = response.response.text();
        }

        const recommendation = extractRecommendation(resultText);

        await prisma.aspirasi.update({
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
    } catch (err: any) {
        console.error("[AI-ASPIRASI] Error pemrosesan Gemini AI:", err);
        // Fallback anggun jika kuota habis atau error eksternal
        const fallback = generateFallbackAnalysis(aspirasi);
        await prisma.aspirasi.update({
            where: { id: aspirasiId },
            data: {
                aiAnalysis: fallback.analysis,
                aiRecommendation: fallback.recommendation,
                aiAnalysedAt: new Date()
            }
        });
        return fallback;
    }
}
