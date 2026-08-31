import * as fs from 'fs';
import * as path from 'path';

export const uploadsDir = path.join(__dirname, '../../uploads');
export const documentsDir = path.join(uploadsDir, 'documents');

if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
}

export const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

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
