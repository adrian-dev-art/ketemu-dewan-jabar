import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

// Helper normalizer for West Java 27 Regencies/Cities
export const normalizeCityName = (lokasi: string | null): string => {
    if (!lokasi) return 'KOTA BANDUNG';
    const l = lokasi.toUpperCase().trim();

    if (l.startsWith('KAB. ') || l.startsWith('KOTA ')) {
        return l;
    }

    if (l.includes('BANDUNG BARAT') || l.includes('KBB')) return 'KAB. BANDUNG BARAT';
    if (l.includes('KAB. BANDUNG') || l.includes('KABUPATEN BANDUNG')) return 'KAB. BANDUNG';
    if (l.includes('CIMAHI')) return 'KOTA CIMAHI';
    if (l.includes('BANDUNG')) return 'KOTA BANDUNG';

    if (l.includes('KOTA BOGOR')) return 'KOTA BOGOR';
    if (l.includes('BOGOR')) return 'KAB. BOGOR';

    if (l.includes('KOTA SUKABUMI')) return 'KOTA SUKABUMI';
    if (l.includes('SUKABUMI')) return 'KAB. SUKABUMI';

    if (l.includes('KOTA BEKASI')) return 'KOTA BEKASI';
    if (l.includes('BEKASI')) return 'KAB. BEKASI';

    if (l.includes('KOTA CIREBON')) return 'KOTA CIREBON';
    if (l.includes('CIREBON')) return 'KAB. CIREBON';

    if (l.includes('KOTA TASIKMALAYA')) return 'KOTA TASIKMALAYA';
    if (l.includes('TASIKMALAYA')) return 'KAB. TASIKMALAYA';

    if (l.includes('GARUT')) return 'KAB. GARUT';
    if (l.includes('CIANJUR')) return 'KAB. CIANJUR';
    if (l.includes('PURWAKARTA')) return 'KAB. PURWAKARTA';
    if (l.includes('KARAWANG')) return 'KAB. KARAWANG';
    if (l.includes('SUBANG')) return 'KAB. SUBANG';
    if (l.includes('DEPOK')) return 'KOTA DEPOK';
    if (l.includes('INDRAMAYU')) return 'KAB. INDRAMAYU';
    if (l.includes('MAJALENGKA')) return 'KAB. MAJALENGKA';
    if (l.includes('KUNINGAN')) return 'KAB. KUNINGAN';
    if (l.includes('SUMEDANG')) return 'KAB. SUMEDANG';
    if (l.includes('CIAMIS')) return 'KAB. CIAMIS';
    if (l.includes('BANJAR')) return 'KOTA BANJAR';
    if (l.includes('PANGANDARAN')) return 'KAB. PANGANDARAN';

    return 'KOTA BANDUNG';
};

// GET /api/gis/recap
router.get('/gis/recap', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { topic, dewanId } = req.query;
    try {
        const schedules = await prisma.schedule.findMany({
            include: {
                masyarakat: {
                    select: {
                        id: true,
                        name: true,
                        kabupaten: true,
                        kecamatan: true
                    }
                },
                ratings: true,
                participants: {
                    include: {
                        dewan: {
                            select: {
                                id: true,
                                name: true,
                                dapil: true,
                                fraksi: true
                            }
                        }
                    }
                }
            }
        });

        const aggregated: Record<string, any> = {};

        for (const s of schedules) {
            const kab = s.masyarakat?.kabupaten || "Tidak Diketahui";
            const kec = s.masyarakat?.kecamatan || "Tidak Diketahui";

            let aiAnalysis: any = null;
            if (s.analysis) {
                try {
                    aiAnalysis = typeof s.analysis === 'string' ? JSON.parse(s.analysis) : s.analysis;
                } catch (e) {
                    aiAnalysis = s.analysis;
                }
            }

            const activeTopics = aiAnalysis?.topics || [];

            if (topic) {
                const searchTopic = String(topic).toLowerCase();
                const titleMatch = s.title.toLowerCase().includes(searchTopic);
                const topicMatch = activeTopics.some((t: string) => t.toLowerCase().includes(searchTopic));
                if (!titleMatch && !topicMatch) {
                    continue;
                }
            }

            if (dewanId) {
                const targetDewanId = Number(dewanId);
                const hasDewan = s.participants.some(p => p.dewanId === targetDewanId);
                if (!hasDewan) {
                    continue;
                }
            }

            if (!aggregated[kab]) {
                aggregated[kab] = {
                    kabupaten: kab,
                    meetingsCount: 0,
                    ratingsCount: 0,
                    speakingSum: 0,
                    contextSum: 0,
                    timeSum: 0,
                    responsivenessSum: 0,
                    solutionSum: 0,
                    citizenSatisfactionSum: 0,
                    citizenSatisfactionCount: 0,
                    dewanResponsivenessSum: 0,
                    dewanResponsivenessCount: 0,
                    discussionQualitySum: 0,
                    discussionQualityCount: 0,
                    problemSolvingSum: 0,
                    problemSolvingCount: 0,
                    sentiments: { Positif: 0, Netral: 0, Negatif: 0 },
                    topicsMap: {},
                    kecamatanData: {},
                    meetings: []
                };
            }

            const kabObj = aggregated[kab];
            kabObj.meetingsCount++;

            if (!kabObj.kecamatanData[kec]) {
                kabObj.kecamatanData[kec] = {
                    kecamatan: kec,
                    meetingsCount: 0,
                    ratingsCount: 0,
                    speakingSum: 0,
                    contextSum: 0,
                    timeSum: 0,
                    responsivenessSum: 0,
                    solutionSum: 0,
                    sentiments: { Positif: 0, Netral: 0, Negatif: 0 },
                    topicsMap: {}
                };
            }

            const kecObj = kabObj.kecamatanData[kec];
            kecObj.meetingsCount++;

            for (const r of s.ratings) {
                kabObj.ratingsCount++;
                kabObj.speakingSum += r.speakingScore;
                kabObj.contextSum += r.contextScore;
                kabObj.timeSum += r.timeScore;
                kabObj.responsivenessSum += r.responsivenessScore;
                kabObj.solutionSum += r.solutionScore;

                kecObj.ratingsCount++;
                kecObj.speakingSum += r.speakingScore;
                kecObj.contextSum += r.contextScore;
                kecObj.timeSum += r.timeScore;
                kecObj.responsivenessSum += r.responsivenessScore;
                kecObj.solutionSum += r.solutionScore;
            }

            if (aiAnalysis) {
                const sent = aiAnalysis.sentiment || "Netral";
                const sentimentKey = (sent === "Positif" || sent === "Positive") ? "Positif" :
                                     (sent === "Negatif" || sent === "Negative") ? "Negatif" : "Netral";
                kabObj.sentiments[sentimentKey]++;
                kecObj.sentiments[sentimentKey]++;

                for (const t of activeTopics) {
                    kabObj.topicsMap[t] = (kabObj.topicsMap[t] || 0) + 1;
                    kecObj.topicsMap[t] = (kecObj.topicsMap[t] || 0) + 1;
                }

                if (typeof aiAnalysis.citizenSatisfaction === 'number') {
                    kabObj.citizenSatisfactionSum += aiAnalysis.citizenSatisfaction;
                    kabObj.citizenSatisfactionCount++;
                }
                if (typeof aiAnalysis.dewanResponsiveness === 'number') {
                    kabObj.dewanResponsivenessSum += aiAnalysis.dewanResponsiveness;
                    kabObj.dewanResponsivenessCount++;
                }
                if (typeof aiAnalysis.discussionQuality === 'number') {
                    kabObj.discussionQualitySum += aiAnalysis.discussionQuality;
                    kabObj.discussionQualityCount++;
                }
                if (typeof aiAnalysis.problemSolving === 'number') {
                    kabObj.problemSolvingSum += aiAnalysis.problemSolving;
                    kabObj.problemSolvingCount++;
                }
            }

            kabObj.meetings.push({
                id: s.id,
                title: s.title,
                startTime: s.startTime,
                citizenName: s.masyarakat?.name || "Masyarakat",
                dewanParticipants: s.participants.map((p: any) => p.dewan?.name).filter(Boolean),
                topics: activeTopics,
                sentiment: aiAnalysis?.sentiment || "Netral",
                averageRating: s.ratings.length > 0 ? (s.ratings.reduce((sum: number, r: any) => sum + (r.speakingScore + r.contextScore + r.timeScore + r.responsivenessScore + r.solutionScore) / 5, 0) / s.ratings.length) : null,
                kecamatan: kec
            });
        }

        const result = Object.values(aggregated).map((kab: any) => {
            const rCount = kab.ratingsCount || 1;

            const kecamatanList = Object.values(kab.kecamatanData).map((kec: any) => {
                const kecRCount = kec.ratingsCount || 1;
                return {
                    kecamatan: kec.kecamatan,
                    meetingsCount: kec.meetingsCount,
                    ratingsCount: kec.ratingsCount,
                    aspects: {
                        speaking: kec.ratingsCount > 0 ? Number((kec.speakingSum / kecRCount).toFixed(2)) : 0,
                        context: kec.ratingsCount > 0 ? Number((kec.contextSum / kecRCount).toFixed(2)) : 0,
                        time: kec.ratingsCount > 0 ? Number((kec.timeSum / kecRCount).toFixed(2)) : 0,
                        responsiveness: kec.ratingsCount > 0 ? Number((kec.responsivenessSum / kecRCount).toFixed(2)) : 0,
                        solution: kec.ratingsCount > 0 ? Number((kec.solutionSum / kecRCount).toFixed(2)) : 0,
                        average: kec.ratingsCount > 0 ? Number(((kec.speakingSum + kec.contextSum + kec.timeSum + kec.responsivenessSum + kec.solutionSum) / (5 * kecRCount)).toFixed(2)) : 0
                    },
                    sentiments: kec.sentiments,
                    topics: Object.entries(kec.topicsMap).map(([name, count]) => ({ name, count })).sort((a: any, b: any) => b.count - a.count)
                };
            });

            return {
                kabupaten: kab.kabupaten,
                meetingsCount: kab.meetingsCount,
                ratingsCount: kab.ratingsCount,
                aspects: {
                    speaking: kab.ratingsCount > 0 ? Number((kab.speakingSum / rCount).toFixed(2)) : 0,
                    context: kab.ratingsCount > 0 ? Number((kab.contextSum / rCount).toFixed(2)) : 0,
                    time: kab.ratingsCount > 0 ? Number((kab.timeSum / rCount).toFixed(2)) : 0,
                    responsiveness: kab.ratingsCount > 0 ? Number((kab.responsivenessSum / rCount).toFixed(2)) : 0,
                    solution: kab.ratingsCount > 0 ? Number((kab.solutionSum / rCount).toFixed(2)) : 0,
                    average: kab.ratingsCount > 0 ? Number(((kab.speakingSum + kab.contextSum + kab.timeSum + kab.responsivenessSum + kab.solutionSum) / (5 * rCount)).toFixed(2)) : 0
                },
                aiAspects: {
                    citizenSatisfaction: kab.citizenSatisfactionCount > 0 ? Number((kab.citizenSatisfactionSum / kab.citizenSatisfactionCount).toFixed(2)) : 0,
                    dewanResponsiveness: kab.dewanResponsivenessCount > 0 ? Number((kab.dewanResponsivenessSum / kab.dewanResponsivenessCount).toFixed(2)) : 0,
                    discussionQuality: kab.discussionQualityCount > 0 ? Number((kab.discussionQualitySum / kab.discussionQualityCount).toFixed(2)) : 0,
                    problemSolving: kab.problemSolvingCount > 0 ? Number((kab.problemSolvingSum / kab.problemSolvingCount).toFixed(2)) : 0,
                },
                sentiments: kab.sentiments,
                topics: Object.entries(kab.topicsMap).map(([name, count]) => ({ name, count })).sort((a: any, b: any) => b.count - a.count),
                kecamatanList,
                meetings: kab.meetings.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            };
        });

        res.json(result);
    } catch (err) {
        console.error("Error generating GIS recap:", err);
        res.status(500).json({ error: "Gagal memproses data GIS" });
    }
});

// GET /api/gis/kunjungan
router.get('/gis/kunjungan', async (req: Request, res: Response) => {
    try {
        const travels = await (prisma as any).perjalananDinas.findMany({
            orderBy: { tanggalPublikasi: 'desc' }
        });

        if (travels && travels.length > 0) {
            const cityMap: Record<string, { city: string; count: number; types: Record<string, number>; akds: Record<string, number> }> = {};

            travels.forEach((t: any) => {
                const normCity = normalizeCityName(t.lokasi);
                if (!cityMap[normCity]) {
                    cityMap[normCity] = {
                        city: normCity,
                        count: 0,
                        types: {},
                        akds: {}
                    };
                }

                cityMap[normCity].count += 1;
                const kat = t.kategori || 'Kunjungan Kerja';
                cityMap[normCity].types[kat] = (cityMap[normCity].types[kat] || 0) + 1;

                const kom = t.komisi || 'DPRD Jabar / Pimpinan';
                cityMap[normCity].akds[kom] = (cityMap[normCity].akds[kom] || 0) + 1;
            });

            return res.json(Object.values(cityMap));
        }

        res.json([]);
    } catch (err: any) {
        console.error("Error fetching travel GIS recap:", err);
        res.status(500).json({ error: "Gagal memproses data GIS Kunjungan Kerja" });
    }
});

// GET /api/perjalanan-dinas
router.get('/perjalanan-dinas', async (req: Request, res: Response) => {
    try {
        const { q, komisi, kategori, lokasi, page = '1', limit = '50' } = req.query;
        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(250, Math.max(1, parseInt(limit as string) || 50));
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (q && typeof q === 'string') {
            where.OR = [
                { judul: { contains: q, mode: 'insensitive' } },
                { lokasi: { contains: q, mode: 'insensitive' } },
                { sumber: { contains: q, mode: 'insensitive' } }
            ];
        }

        if (komisi && typeof komisi === 'string') {
            where.komisi = { contains: komisi, mode: 'insensitive' };
        }

        if (kategori && typeof kategori === 'string') {
            where.kategori = { contains: kategori, mode: 'insensitive' };
        }

        if (lokasi && typeof lokasi === 'string') {
            where.lokasi = { contains: lokasi, mode: 'insensitive' };
        }

        const [total, items] = await Promise.all([
            (prisma as any).perjalananDinas.count({ where }),
            (prisma as any).perjalananDinas.findMany({
                where,
                orderBy: { tanggalPublikasi: 'desc' },
                skip,
                take: limitNum
            })
        ]);

        res.json({
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            data: items
        });
    } catch (err: any) {
        console.error("Error fetching perjalanan dinas list:", err);
        res.status(500).json({ error: "Gagal memuat data perjalanan dinas" });
    }
});

export default router;
