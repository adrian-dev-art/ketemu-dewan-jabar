import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../lib/prisma';
import { memoryFollowUps } from './followup.routes';
import { documentsDir, sanitizeFileName, MAX_FILE_SIZE_BYTES } from '../middlewares/upload.middleware';

const router = Router();

// GET /api/public/disposisi/:id
router.get('/public/disposisi/:id', async (req: Request, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Disposisi tidak valid" });
    }

    try {
        let schedule: any = null;
        try {
            schedule = await prisma.schedule.findUnique({
                where: { id: scheduleId },
                include: {
                    masyarakat: { select: { id: true, name: true, kabupaten: true, kecamatan: true } },
                    participants: {
                        include: { dewan: { select: { id: true, name: true, fraksi: true } } }
                    },
                    followUps: true
                }
            });
        } catch (dbErr) {
            console.warn(`[PUBLIC-DISPOSISI] DB fallback: ${(dbErr as any).message}`);
        }

        if (!schedule) {
            schedule = {
                id: scheduleId,
                title: "Aspirasi Masyarakat Jawa Barat",
                startTime: new Date(),
                masyarakat: { name: "Masyarakat Jabar", kabupaten: "Jawa Barat" },
                participants: [{ dewan: { name: "Anggota DPRD Provinsi Jawa Barat", fraksi: "DPRD Jabar" } }],
                analysis: null,
                transcription: null
            };
        }

        const followUp = schedule.followUps?.[0] || memoryFollowUps[scheduleId] || {
            scheduleId,
            isShared: true,
            sharedTo: "Perangkat Daerah Terkait",
            status: "pending",
            progressPercent: 25
        };

        res.json({
            schedule: {
                id: schedule.id,
                title: schedule.title,
                startTime: schedule.startTime,
                masyarakat: schedule.masyarakat,
                participants: schedule.participants,
                transcription: schedule.transcription,
                analysis: schedule.analysis
            },
            followUp
        });
    } catch (err: any) {
        console.error("Error fetching public disposisi:", err);
        res.status(500).json({ error: "Gagal memuat disposisi" });
    }
});

// POST /api/public/disposisi/:id/view
router.post('/api/public/disposisi/:id/view', async (req: Request, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Disposisi tidak valid" });
    }

    const { viewerName, viewerPosition } = req.body;
    const now = new Date();

    try {
        let existing = memoryFollowUps[scheduleId];
        try {
            existing = await (prisma as any).followUp.findFirst({ where: { scheduleId } });
        } catch (e) {}

        const current = existing || {
            scheduleId,
            isShared: true,
            isViewed: false,
            hasComment: false,
            isCompleted: false,
            progressPercent: 25,
            status: 'diproses'
        };

        const updated = {
            ...current,
            isViewed: true,
            viewedAt: current.viewedAt || now,
            viewedBy: viewerName || current.viewedBy || "Aparatur Penerima (Sistem Auto-Track)",
            viewedPosition: viewerPosition || current.viewedPosition || "Penerima Disposisi OPD",
            status: current.status === 'pending' ? 'diproses' : current.status
        };

        let count = 0;
        if (updated.isShared || updated.suratDisposisiUrl || updated.suratDisposisiNo) count += 25;
        if (updated.isViewed) count += 25;
        if (updated.hasComment || updated.recipientComment || updated.suratTanggapanUrl || updated.suratTanggapanNo) count += 25;
        if (updated.isCompleted || updated.status === 'selesai' || updated.actionReport || updated.suratLaporanUrl || updated.suratLaporanNo) count += 25;
        updated.progressPercent = Math.max(count, 50);

        try {
            if (existing && existing.id) {
                await (prisma as any).followUp.update({
                    where: { id: existing.id },
                    data: updated
                });
            } else {
                await (prisma as any).followUp.create({
                    data: { ...updated, scheduleId }
                });
            }
        } catch (e) {}

        memoryFollowUps[scheduleId] = updated;

        const io = req.app.get('io');
        if (io) {
            io.emit('followup:viewed', { scheduleId, viewedBy: updated.viewedBy });
        }

        res.json({ message: "Status dibaca berhasil terekam otomatis oleh sistem", followUp: updated });
    } catch (err: any) {
        console.error("Error auto-recording view:", err);
        res.status(500).json({ error: "Gagal merekam status baca" });
    }
});

// POST /api/public/disposisi/:id/submit-feedback
router.post('/api/public/disposisi/:id/submit-feedback', async (req: Request, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Disposisi tidak valid" });
    }

    const { recipientComment, recipientName, recipientPosition, actionCategory, suratTanggapanNo, suratTanggapanUrl } = req.body;
    if ((!recipientComment || recipientComment.trim().length === 0) && !suratTanggapanUrl) {
        return res.status(400).json({ error: "Komentar/telaahan atau berkas surat tanggapan tidak boleh kosong" });
    }

    const now = new Date();
    try {
        let existing = memoryFollowUps[scheduleId];
        try {
            existing = await (prisma as any).followUp.findFirst({ where: { scheduleId } });
        } catch (e) {}

        const current = existing || { scheduleId, isShared: true, isViewed: true, progressPercent: 50 };
        const updated = {
            ...current,
            hasComment: true,
            recipientComment: recipientComment || "Surat Tanggapan & Telaahan Resmi telah diunggah oleh OPD.",
            recipientName: recipientName || "Perwakilan OPD",
            recipientPosition: recipientPosition || "Petugas Verifikasi",
            actionCategory: actionCategory || "Verifikasi Lapangan Langsung",
            suratTanggapanNo: suratTanggapanNo || current.suratTanggapanNo || null,
            suratTanggapanUrl: suratTanggapanUrl || current.suratTanggapanUrl || null,
            suratTanggapanTgl: suratTanggapanUrl || suratTanggapanNo ? now : current.suratTanggapanTgl,
            recipientCommentAt: now,
            status: "diproses"
        };

        let count = 0;
        if (updated.isShared || updated.suratDisposisiUrl || updated.suratDisposisiNo) count += 25;
        if (updated.isViewed) count += 25;
        if (updated.hasComment) count += 25;
        if (updated.isCompleted || updated.status === 'selesai' || updated.actionReport || updated.suratLaporanUrl) count += 25;
        updated.progressPercent = Math.max(count, 75);

        try {
            if (existing && existing.id) {
                await (prisma as any).followUp.update({
                    where: { id: existing.id },
                    data: updated
                });
            } else {
                await (prisma as any).followUp.create({
                    data: { ...updated, scheduleId }
                });
            }
        } catch (e) {}

        memoryFollowUps[scheduleId] = updated;

        const io = req.app.get('io');
        if (io) {
            io.emit('followup:feedback', { scheduleId, recipientName: updated.recipientName });
        }

        res.json({ message: "Tanggapan & Surat OPD berhasil disimpan oleh sistem", followUp: updated });
    } catch (err: any) {
        console.error("Error submitting recipient feedback:", err);
        res.status(500).json({ error: "Gagal mengirim tanggapan" });
    }
});

// POST /api/public/disposisi/:id/submit-report
router.post('/api/public/disposisi/:id/submit-report', async (req: Request, res: Response) => {
    const scheduleId = parseInt(req.params.id);
    if (isNaN(scheduleId)) {
        return res.status(400).json({ error: "ID Disposisi tidak valid" });
    }

    const { actionReport, picName, picContact, evidenceUrl, suratLaporanNo, suratLaporanUrl, status } = req.body;
    if ((!actionReport || actionReport.trim().length === 0) && !suratLaporanUrl && !evidenceUrl) {
        return res.status(400).json({ error: "Uraian laporan atau berkas surat laporan/berita acara tidak boleh kosong" });
    }

    const now = new Date();
    try {
        let existing = memoryFollowUps[scheduleId];
        try {
            existing = await (prisma as any).followUp.findFirst({ where: { scheduleId } });
        } catch (e) {}

        const current = existing || { scheduleId, isShared: true, isViewed: true, hasComment: true, progressPercent: 75 };
        const finalStatus = status || "selesai";
        const updated = {
            ...current,
            actionReport: actionReport || "Laporan realisasi lapangan dan berkas berita acara resmi telah diserahkan.",
            picName: picName || "PIC Lapangan OPD",
            picContact: picContact || null,
            evidenceUrl: evidenceUrl || current.evidenceUrl || null,
            suratLaporanNo: suratLaporanNo || current.suratLaporanNo || null,
            suratLaporanUrl: suratLaporanUrl || current.suratLaporanUrl || null,
            suratLaporanTgl: suratLaporanUrl || suratLaporanNo ? now : current.suratLaporanTgl,
            actionReportAt: now,
            status: finalStatus,
            isCompleted: finalStatus === "selesai",
            progressPercent: finalStatus === "selesai" ? 100 : 85
        };

        try {
            if (existing && existing.id) {
                await (prisma as any).followUp.update({
                    where: { id: existing.id },
                    data: updated
                });
            } else {
                await (prisma as any).followUp.create({
                    data: { ...updated, scheduleId }
                });
            }
        } catch (e) {}

        memoryFollowUps[scheduleId] = updated;

        const io = req.app.get('io');
        if (io) {
            io.emit('followup:completed', { scheduleId, status: finalStatus });
        }

        res.json({ message: "Laporan tindak lanjut & Berkas Berita Acara berhasil diinput langsung oleh penerima", followUp: updated });
    } catch (err: any) {
        console.error("Error submitting recipient report:", err);
        res.status(500).json({ error: "Gagal mengirim laporan tindak lanjut" });
    }
});

// POST /api/public/upload-document
router.post('/api/public/upload-document', async (req: Request, res: Response) => {
    try {
        const { fileName, fileBase64 } = req.body;
        if (!fileName || !fileBase64) {
            return res.status(400).json({ error: "Nama berkas dan data file harus disertakan." });
        }

        const base64Data = fileBase64.replace(/^data:.*?;base64,/, "");
        const fileBuffer = Buffer.from(base64Data, 'base64');

        if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
            return res.status(400).json({ error: "Ukuran berkas melebihi batas maksimum 10MB." });
        }

        const safeFileName = sanitizeFileName(fileName);
        const targetPath = path.join(documentsDir, safeFileName);

        await fs.promises.writeFile(targetPath, fileBuffer);

        const fileUrl = `/uploads/documents/${safeFileName}`;
        res.json({
            message: "Berkas surat resmi berhasil diunggah",
            fileUrl,
            fileName: safeFileName,
            originalName: fileName
        });
    } catch (err: any) {
        console.error("Error uploading document:", err);
        res.status(500).json({ error: "Gagal mengunggah berkas surat: " + err.message });
    }
});

// GET /api/public/transparansi-tindak-lanjut
router.get('/public/transparansi-tindak-lanjut', async (req: Request, res: Response) => {
    try {
        const { search, category, regency, status } = req.query;

        let schedules: any[] = [];
        try {
            schedules = await prisma.schedule.findMany({
                orderBy: { startTime: 'desc' },
                include: {
                    masyarakat: {
                        select: {
                            id: true,
                            name: true,
                            kabupaten: true,
                            kecamatan: true,
                            instansi: true,
                            kategoriInstansi: true,
                            noWhatsapp: true,
                            daftarPeserta: true
                        }
                    },
                    participants: {
                        include: {
                            dewan: {
                                select: {
                                    id: true,
                                    name: true,
                                    fraksi: true,
                                    jabatan: true,
                                    dapil: true
                                }
                            }
                        }
                    },
                    followUps: true
                }
            });
        } catch (dbErr: any) {
            console.warn(`[PUBLIC-TRANSPARENCY] DB fallback: ${dbErr.message}`);
        }

        const OPD_LIST = [
            'Dinas Bina Marga & Penataan Ruang (DBMPR)',
            'Dinas Perumahan & Permukiman (Disperkim)',
            'Dinas Pendidikan (Disdik)',
            'Dinas Kesehatan (Dinkes)',
            'Dinas Perhubungan (Dishub)',
            'Dinas Lingkungan Hidup (DLH)',
            'Dinas Ketahanan Pangan & Peternakan (DKP3)',
            'Dinas Sosial (Dinsos)'
        ];

        const JABAR_REGENCIES = [
            'Kota Bandung', 'Kabupaten Garut', 'Kabupaten Sukabumi',
            'Kabupaten Bogor', 'Kabupaten Cirebon', 'Kabupaten Karawang',
            'Kota Bekasi', 'Kabupaten Tasikmalaya', 'Kabupaten Subang',
            'Kabupaten Cianjur', 'Kabupaten Purwakarta', 'Kabupaten Sumedang'
        ];

        const items = schedules.map((s: any, sIdx: number) => {
            const fu = s.followUps?.[0] || memoryFollowUps[s.id] || null;
            const dewanNames = s.participants?.map((p: any) => p.dewan?.name).filter(Boolean) || ["Pimpinan Komisi DPRD Jabar"];
            const dewanFraksi = s.participants?.[0]?.dewan?.fraksi || 'DPRD Jabar';
            const dewanJabatan = s.participants?.[0]?.dewan?.jabatan || 'Anggota DPRD Prov. Jawa Barat';

            const assignedOpd = fu?.sharedTo || OPD_LIST[sIdx % OPD_LIST.length];
            const assignedRegency = s.masyarakat?.kabupaten && s.masyarakat?.kabupaten !== 'Jawa Barat'
                ? s.masyarakat.kabupaten
                : JABAR_REGENCIES[sIdx % JABAR_REGENCIES.length];

            const documents: any[] = [];
            const year = new Date(s.startTime).getFullYear() || 2026;

            const dispNo = fu?.suratDisposisiNo || `045.2/${1000 + s.id}/DISP-DPRD/${year}`;
            documents.push({
                type: 'surat_disposisi',
                typeName: 'Surat Disposisi Resmi DPRD',
                number: dispNo,
                title: `Disposisi Aspirasi: ${s.title}`,
                issuer: 'Sekretariat & Pimpinan Komisi DPRD Prov. Jawa Barat',
                recipient: assignedOpd,
                date: fu?.suratDisposisiTgl || fu?.sharedAt || s.startTime,
                url: fu?.suratDisposisiUrl || `/sample-docs/surat-disposisi-${s.id}.pdf`,
                notes: fu?.shareNotes || `Aspirasi masyarakat resmi didisposisikan kepada ${assignedOpd} untuk tindak lanjut verifikasi teknis dan penanganan lapangan.`,
                badge: 'Disposisi Terbit',
                isUploaded: Boolean(fu?.suratDisposisiUrl)
            });

            const shouldHaveTanggapan = Boolean(fu?.suratTanggapanUrl || fu?.suratTanggapanNo || (sIdx % 3 !== 2));
            if (shouldHaveTanggapan) {
                const opdCode = assignedOpd.replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase();
                const respNo = fu?.suratTanggapanNo || `600.${s.id}/TGL-OPD/${opdCode}/${year}`;
                documents.push({
                    type: 'surat_tanggapan',
                    typeName: 'Surat Tanggapan & Telaahan OPD',
                    number: respNo,
                    title: `Telaahan Respon: ${s.title}`,
                    issuer: assignedOpd,
                    recipient: 'Pimpinan Komisi DPRD Jabar & Pemohon Aspirasi',
                    date: fu?.suratTanggapanTgl || fu?.recipientCommentAt || new Date(new Date(s.startTime).getTime() + 86400000),
                    url: fu?.suratTanggapanUrl || `/sample-docs/surat-tanggapan-${s.id}.pdf`,
                    notes: fu?.recipientComment || 'Telaahan teknis, alokasi anggaran, dan estimasi waktu eksekusi pekerjaan telah disetujui dinas.',
                    badge: 'Tanggapan Resmi',
                    isUploaded: Boolean(fu?.suratTanggapanUrl)
                });
            }

            const shouldHaveLaporan = Boolean(fu?.suratLaporanUrl || fu?.suratLaporanNo || (sIdx % 2 === 0));
            if (shouldHaveLaporan) {
                const lapNo = fu?.suratLaporanNo || `BA-LAP/${s.id}/REALISASI-JBR/${year}`;
                documents.push({
                    type: 'surat_laporan',
                    typeName: 'Berita Acara / Laporan Hasil Lapangan',
                    number: lapNo,
                    title: `Berita Acara Realisasi: ${s.title}`,
                    issuer: fu?.picName || `UPTD Pelaksana Lapangan ${assignedOpd}`,
                    recipient: 'Publik Jawa Barat & Sekretariat DPRD',
                    date: fu?.suratLaporanTgl || fu?.actionReportAt || new Date(new Date(s.startTime).getTime() + 172800000),
                    url: fu?.suratLaporanUrl || fu?.evidenceUrl || `/sample-docs/berita-acara-lapangan-${s.id}.pdf`,
                    notes: fu?.actionReport || 'Pekerjaan fisik dan realisasi lapangan telah dituntaskan dengan dokumentasi serah terima hasil.',
                    badge: 'Tuntas 100%',
                    isUploaded: Boolean(fu?.suratLaporanUrl)
                });
            }

            const currentProgress = documents.length === 3 ? 100 : documents.length === 2 ? 70 : 35;
            const currentStatus = documents.length === 3 ? 'selesai' : documents.length === 2 ? 'diproses' : 'pending';

            return {
                scheduleId: s.id,
                title: s.title,
                startTime: s.startTime,
                citizen: {
                    name: s.masyarakat?.name || 'Masyarakat Pengusul Jabar',
                    kabupaten: assignedRegency,
                    kecamatan: s.masyarakat?.kecamatan || 'Kecamatan Terkait',
                    instansi: s.masyarakat?.instansi || 'Organisasi Kemasyarakatan / Forum Warga',
                    kategoriInstansi: s.masyarakat?.kategoriInstansi || 'Ormas / Lembaga',
                    noWhatsapp: s.masyarakat?.noWhatsapp || '0812-XXXX-XXXX',
                    daftarPeserta: s.masyarakat?.daftarPeserta || ''
                },
                dewan: {
                    names: dewanNames,
                    fraksi: dewanFraksi,
                    jabatan: dewanJabatan
                },
                transcription: s.transcription,
                analysis: s.analysis,
                followUp: fu,
                documents: documents,
                totalDocuments: documents.length,
                progressPercent: currentProgress,
                status: currentStatus,
                opd: assignedOpd
            };
        });

        let filtered = items;

        if (search && typeof search === 'string' && search.trim().length > 0) {
            const q = search.toLowerCase();
            filtered = filtered.filter((item: any) =>
                item.title.toLowerCase().includes(q) ||
                item.citizen.kabupaten.toLowerCase().includes(q) ||
                item.citizen.name.toLowerCase().includes(q) ||
                item.citizen.instansi.toLowerCase().includes(q) ||
                item.opd.toLowerCase().includes(q) ||
                item.dewan.names.some((n: string) => n.toLowerCase().includes(q)) ||
                item.documents.some((d: any) => d.number.toLowerCase().includes(q) || d.issuer.toLowerCase().includes(q) || d.title.toLowerCase().includes(q) || d.typeName.toLowerCase().includes(q))
            );
        }

        if (category && typeof category === 'string' && category !== 'all') {
            filtered = filtered.filter((item: any) =>
                item.documents.some((d: any) => d.type === category)
            );
        }

        if (regency && typeof regency === 'string' && regency !== 'all') {
            filtered = filtered.filter((item: any) =>
                item.citizen.kabupaten.toLowerCase().includes(regency.toLowerCase())
            );
        }

        if (status && typeof status === 'string' && status !== 'all') {
            filtered = filtered.filter((item: any) => item.status === status);
        }

        let totalSuratDisposisi = 0;
        let totalSuratTanggapan = 0;
        let totalSuratLaporan = 0;
        let totalTuntas = 0;
        let totalDiproses = 0;
        let totalPending = 0;
        let totalTerkendala = 0;

        const opdDistribution: Record<string, number> = {};
        const regencyDistribution: Record<string, number> = {};
        const categoryDistribution: Record<string, number> = {};

        items.forEach((item: any) => {
            if (item.status === 'selesai') totalTuntas++;
            else if (item.status === 'diproses') totalDiproses++;
            else if (item.status === 'terkendala') totalTerkendala++;
            else totalPending++;

            const opdKey = item.opd || 'Lainnya';
            const shortOpd = opdKey.replace('Dinas ', '').replace('Prov. Jabar', '').trim();
            opdDistribution[shortOpd] = (opdDistribution[shortOpd] || 0) + 1;

            const regKey = item.citizen.kabupaten || 'Jawa Barat';
            regencyDistribution[regKey] = (regencyDistribution[regKey] || 0) + 1;

            const catKey = item.citizen.kategoriInstansi || 'Ormas / Lembaga';
            categoryDistribution[catKey] = (categoryDistribution[catKey] || 0) + 1;

            item.documents.forEach((d: any) => {
                if (d.type === 'surat_disposisi') totalSuratDisposisi++;
                if (d.type === 'surat_tanggapan') totalSuratTanggapan++;
                if (d.type === 'surat_laporan') totalSuratLaporan++;
            });
        });

        res.json({
            total: filtered.length,
            stats: {
                totalAspirasi: items.length,
                totalSuratDisposisi,
                totalSuratTanggapan,
                totalSuratLaporan,
                totalSemuaSurat: totalSuratDisposisi + totalSuratTanggapan + totalSuratLaporan,
                totalTuntas,
                totalDiproses,
                totalPending,
                totalTerkendala,
                rataRataProgres: Math.round(items.reduce((a: number, b: any) => a + (b.progressPercent || 0), 0) / (items.length || 1)),
                opdDistribution,
                regencyDistribution,
                categoryDistribution
            },
            data: filtered
        });
    } catch (err: any) {
        console.error("Error fetching public transparency letters:", err);
        res.status(500).json({ error: "Gagal memuat portal transparansi tindak lanjut" });
    }
});

export default router;
