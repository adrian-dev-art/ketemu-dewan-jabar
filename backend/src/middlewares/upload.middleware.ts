import * as fs from 'fs';
import * as path from 'path';

export const uploadsDir = path.join(__dirname, '../../uploads');
export const documentsDir = path.join(uploadsDir, 'documents');
export const materiDir = path.join(uploadsDir, 'materi');

if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
}

if (!fs.existsSync(materiDir)) {
    fs.mkdirSync(materiDir, { recursive: true });
}

export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_MATERI_EXTENSIONS = [
    '.pdf', '.doc', '.docx',
    '.mp4', '.webm', '.mov', '.mkv',
    '.png', '.jpg', '.jpeg'
];
export const MAX_MATERI_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export const getMateriCategory = (fileName: string): string => {
    const ext = path.extname(fileName).toLowerCase();
    if (['.mp4', '.webm', '.mov', '.mkv'].includes(ext)) return 'video';
    if (ext === '.pdf') return 'pdf';
    if (['.png', '.jpg', '.jpeg'].includes(ext)) return 'image';
    if (['.doc', '.docx'].includes(ext)) return 'document';
    return 'other';
};

export const sanitizeFileName = (fileName: string): string => {
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error(`Ekstensi berkas ${ext} tidak diizinkan. Hanya PDF, PNG, JPG, JPEG yang didukung.`);
    }
    const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseName}_${timestamp}_${randomSuffix}${ext}`;
};

export const sanitizeMateriFileName = (fileName: string): string => {
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_MATERI_EXTENSIONS.includes(ext)) {
        throw new Error(`Ekstensi berkas ${ext} tidak didukung. Didukung: PDF, DOC/DOCX, Video (MP4/WEBM/MOV/MKV), dan Foto (PNG/JPG).`);
    }
    const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `materi_${baseName}_${timestamp}_${randomSuffix}${ext}`;
};

