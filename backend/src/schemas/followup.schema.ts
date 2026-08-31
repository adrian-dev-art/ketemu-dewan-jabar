import { z } from 'zod';

export const createFollowUpSchema = z.object({
    sharedTo: z.string().min(1, "Tujuan disposisi harus diisi"),
    sharedToEmail: z.string().email("Format email tujuan tidak valid").optional().or(z.literal('')),
    shareChannel: z.string().optional().default("Disposisi Resmi"),
    shareNotes: z.string().optional(),
    suratDisposisiNo: z.string().optional(),
    suratDisposisiUrl: z.string().optional(),
    suratDisposisiTgl: z.string().optional(),
});

export const updateFollowUpSchema = z.object({
    isShared: z.boolean().optional(),
    sharedTo: z.string().optional(),
    sharedToEmail: z.string().optional(),
    shareChannel: z.string().optional(),
    shareNotes: z.string().optional(),
    suratDisposisiNo: z.string().optional(),
    suratDisposisiUrl: z.string().optional(),
    suratDisposisiTgl: z.string().optional(),
    
    isViewed: z.boolean().optional(),
    viewedBy: z.string().optional(),
    viewedPosition: z.string().optional(),
    viewedAt: z.string().optional(),

    hasComment: z.boolean().optional(),
    recipientComment: z.string().optional(),
    recipientName: z.string().optional(),
    recipientPosition: z.string().optional(),
    recipientCommentAt: z.string().optional(),
    actionCategory: z.string().optional(),
    suratTanggapanNo: z.string().optional(),
    suratTanggapanUrl: z.string().optional(),
    suratTanggapanTgl: z.string().optional(),

    status: z.enum(['pending', 'diproses', 'selesai', 'terkendala']).optional(),
    isCompleted: z.boolean().optional(),
    actionReport: z.string().optional(),
    actionReportAt: z.string().optional(),
    picName: z.string().optional(),
    picContact: z.string().optional(),
    evidenceUrl: z.string().optional(),
    suratLaporanNo: z.string().optional(),
    suratLaporanUrl: z.string().optional(),
    suratLaporanTgl: z.string().optional(),
    progressPercent: z.number().min(0).max(100).optional(),
});

export const publicSubmitFeedbackSchema = z.object({
    recipientComment: z.string().min(3, "Tanggapan minimal 3 karakter"),
    recipientName: z.string().min(2, "Nama penanggung jawab harus diisi"),
    recipientPosition: z.string().min(2, "Jabatan harus diisi"),
    actionCategory: z.string().optional(),
    suratTanggapanNo: z.string().optional(),
    suratTanggapanUrl: z.string().optional(),
    suratTanggapanTgl: z.string().optional(),
});

export const publicSubmitReportSchema = z.object({
    actionReport: z.string().min(3, "Laporan hasil minimal 3 karakter"),
    picName: z.string().min(2, "Nama PIC harus diisi"),
    picContact: z.string().optional(),
    status: z.enum(['diproses', 'selesai', 'terkendala']).default('selesai'),
    progressPercent: z.number().min(0).max(100).optional(),
    evidenceUrl: z.string().optional(),
    suratLaporanNo: z.string().optional(),
    suratLaporanUrl: z.string().optional(),
    suratLaporanTgl: z.string().optional(),
});
