import nodemailer from 'nodemailer';
import { envConfig } from '../config/env';

// Konfigurasi transporter SMTP
const createTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
    }

    // Default fallback transporter (JSON / Stream preview untuk logging aman di development)
    return nodemailer.createTransport({
        jsonTransport: true
    });
};

const transporter = createTransporter();
const SENDER_EMAIL = process.env.SMTP_FROM || 'sekretariat@dprd.jabarprov.go.id';
const FRONTEND_PUBLIC_URL = (envConfig.FRONTEND_URLS && envConfig.FRONTEND_URLS[0]) || 'http://localhost:3001';

interface SendAspirasiResponseParams {
    to: string;
    recipientName: string;
    ticketNumber: string;
    judulAspirasi: string;
    dapil: string;
    status: string;
    tanggapanDewan: string;
    dewanName?: string;
    dewanFraksi?: string;
}

interface SendAspirasiStatusParams {
    to: string;
    recipientName: string;
    ticketNumber: string;
    judulAspirasi: string;
    dapil: string;
    newStatus: string;
    keterangan: string;
    aktor: string;
}

/**
 * Mengirimkan surel (email) pemberitahuan tanggapan resmi dari Anggota DPRD / Sekretariat kepada konstituen.
 */
export const sendAspirasiResponseEmail = async (params: SendAspirasiResponseParams): Promise<boolean> => {
    try {
        const {
            to,
            recipientName,
            ticketNumber,
            judulAspirasi,
            dapil,
            status,
            tanggapanDewan,
            dewanName,
            dewanFraksi
        } = params;

        const subject = `[HUDANG DPRD JABAR] Tanggapan Resmi E-Aspirasi ${ticketNumber}: ${judulAspirasi}`;

        const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pemberitahuan Tanggapan Resmi Aspirasi</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #047857; color: #ffffff; padding: 24px; text-align: left; }
        .header h1 { margin: 0; font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }
        .content { padding: 24px; line-height: 1.6; font-size: 13px; }
        .ticket-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-family: monospace; font-size: 13px; margin-bottom: 12px; }
        .detail-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; }
        .detail-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
        .detail-table td.label { width: 35%; color: #64748b; font-weight: 600; }
        .detail-table td.value { width: 65%; color: #0f172a; font-weight: 700; }
        .quote-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 14px 16px; margin: 16px 0; border-radius: 0 8px 8px 0; font-style: normal; }
        .quote-title { font-weight: 700; color: #065f46; font-size: 12px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .quote-text { color: #1e293b; font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
        .btn { display: inline-block; background: #047857; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; margin: 16px 0; text-align: center; }
        .footer { background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SEKRETARIAT DPRD PROVINSI JAWA BARAT</h1>
            <p>Platform HUDANG (Hadirkan Usulan, Dengar Aspirasi, Nyata untuk Gerak rakyat)</p>
        </div>
        <div class="content">
            <p>Kepada Yth. <strong>${recipientName}</strong>,</p>
            <p>Kami memberitahukan bahwa permohonan aspirasi pembangunan yang Anda sampaikan melalui Platform HUDANG telah mendapatkan <strong>Tanggapan Resmi</strong> dari Kedewanan.</p>
            
            <div class="ticket-badge">Nomor Registrasi: ${ticketNumber}</div>
            
            <table class="detail-table">
                <tr>
                    <td class="label">Judul Aspirasi</td>
                    <td class="value">${judulAspirasi}</td>
                </tr>
                <tr>
                    <td class="label">Daerah Pemilihan</td>
                    <td class="value">${dapil}</td>
                </tr>
                <tr>
                    <td class="label">Status Penanganan</td>
                    <td class="value" style="color: #047857;">Tuntas / Selesai Ditanggapi</td>
                </tr>
                ${dewanName ? `
                <tr>
                    <td class="label">Legislator Penanggap</td>
                    <td class="value">${dewanName} ${dewanFraksi ? `(${dewanFraksi})` : ''}</td>
                </tr>` : ''}
            </table>

            <div class="quote-box">
                <div class="quote-title">Isi Tanggapan Resmi Kedewanan:</div>
                <div class="quote-text">${tanggapanDewan}</div>
            </div>

            <p>Riwayat kronologis dan bukti kelengkapan tindak lanjut dapat Anda pantau secara langsung melalui portal warga:</p>
            
            <div style="text-align: center;">
                <a href="${FRONTEND_PUBLIC_URL}/masyarakat" class="btn">Pantau Timeline Aspirasi</a>
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                Terima kasih atas partisipasi aktif Anda dalam mengawal pembangunan di wilayah Provinsi Jawa Barat.
            </p>
        </div>
        <div class="footer">
            Surat elektronik ini diterbitkan secara otomatis oleh Sistem HUDANG Sekretariat DPRD Provinsi Jawa Barat.<br>
            Jl. Diponegoro No. 27, Citarum, Kec. Bandung Wetan, Kota Bandung, Jawa Barat 40115.
        </div>
    </div>
</body>
</html>
`;

        const mailOptions = {
            from: `"Sekretariat DPRD Jawa Barat" <${SENDER_EMAIL}>`,
            to,
            subject,
            html,
            text: `Yth. ${recipientName},\n\nAspirasi Anda dengan Nomor Tiket ${ticketNumber} (${judulAspirasi}) telah menerima tanggapan resmi dari Anggota DPRD Jawa Barat:\n\n"${tanggapanDewan}"\n\nSilakan kunjungi ${FRONTEND_PUBLIC_URL}/masyarakat untuk melihat timeline lengkap.\n\nSekretariat DPRD Provinsi Jawa Barat.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Berhasil mengirim surel tanggapan aspirasi ke: ${to} (MessageId: ${info.messageId || 'simulated'})`);
        return true;
    } catch (err: any) {
        console.error('[EmailService] Gagal mengirim surel tanggapan aspirasi:', err);
        return false;
    }
};

/**
 * Mengirimkan surel pembaruan status alur (misal: diverifikasi, diteruskan ke dewan, dll.)
 */
export const sendAspirasiStatusUpdateEmail = async (params: SendAspirasiStatusParams): Promise<boolean> => {
    try {
        const {
            to,
            recipientName,
            ticketNumber,
            judulAspirasi,
            dapil,
            newStatus,
            keterangan,
            aktor
        } = params;

        let statusText = "Pembaruan Status";
        if (newStatus === 'verifikasi') statusText = "Verifikasi Administrasi Selesai";
        else if (newStatus === 'diteruskan') statusText = "Diteruskan ke Meja Dewan";
        else if (newStatus === 'tindak_lanjut') statusText = "Sedang Ditindaklanjuti Dewan";
        else if (newStatus === 'selesai') statusText = "Aspirasi Selesai Ditangani";
        else if (newStatus === 'ditolak') statusText = "Aspirasi Belum Dapat Diproses";

        const subject = `[HUDANG DPRD JABAR] Pembaruan Status E-Aspirasi ${ticketNumber}: ${statusText}`;

        const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Pembaruan Status Aspirasi</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #1e293b; color: #ffffff; padding: 20px 24px; text-align: left; }
        .header h1 { margin: 0; font-size: 17px; font-weight: 800; }
        .header p { margin: 4px 0 0 0; font-size: 12px; opacity: 0.8; }
        .content { padding: 24px; line-height: 1.6; font-size: 13px; }
        .status-badge { display: inline-block; background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; margin-bottom: 12px; }
        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 16px 0; font-size: 12px; }
        .btn { display: inline-block; background: #1e293b; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-top: 12px; text-align: center; }
        .footer { background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SEKRETARIAT DPRD PROVINSI JAWA BARAT</h1>
            <p>Platform HUDANG - Layanan Penyerapan Aspirasi Publik</p>
        </div>
        <div class="content">
            <p>Kepada Yth. <strong>${recipientName}</strong>,</p>
            <p>Status permohonan E-Aspirasi Anda telah diperbarui pada sistem:</p>
            
            <div class="status-badge">Tahap Baru: ${statusText}</div>
            
            <div class="info-box">
                <div><strong>Nomor Tiket:</strong> ${ticketNumber}</div>
                <div style="margin-top: 4px;"><strong>Judul:</strong> ${judulAspirasi}</div>
                <div style="margin-top: 4px;"><strong>Daerah Pemilihan:</strong> ${dapil}</div>
                <div style="margin-top: 4px;"><strong>Keterangan:</strong> ${keterangan}</div>
                <div style="margin-top: 4px; color: #64748b;"><strong>Pelaksana:</strong> ${aktor}</div>
            </div>

            <p>Anda dapat memeriksa rincian perkembangan dan dokumen berkas secara berkala melalui tautan berikut:</p>
            <div style="text-align: center;">
                <a href="${FRONTEND_PUBLIC_URL}/masyarakat" class="btn">Lihat Perkembangan Aspirasi</a>
            </div>
        </div>
        <div class="footer">
            Sekretariat DPRD Provinsi Jawa Barat • Platform HUDANG 2026.
        </div>
    </div>
</body>
</html>
`;

        const mailOptions = {
            from: `"Sekretariat DPRD Jawa Barat" <${SENDER_EMAIL}>`,
            to,
            subject,
            html,
            text: `Yth. ${recipientName},\n\nStatus aspirasi ${ticketNumber} (${judulAspirasi}) kini diperbarui menjadi: ${statusText}.\nKeterangan: ${keterangan} (oleh ${aktor}).\n\nKunjungi ${FRONTEND_PUBLIC_URL}/masyarakat untuk melihat timeline lengkap.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Berhasil mengirim surel pembaruan status aspirasi ke: ${to} (MessageId: ${info.messageId || 'simulated'})`);
        return true;
    } catch (err: any) {
        console.error('[EmailService] Gagal mengirim surel status aspirasi:', err);
        return false;
    }
};
