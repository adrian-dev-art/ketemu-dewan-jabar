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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeMateriFileName = exports.sanitizeFileName = exports.getMateriCategory = exports.MAX_MATERI_SIZE_BYTES = exports.ALLOWED_MATERI_EXTENSIONS = exports.MAX_FILE_SIZE_BYTES = exports.ALLOWED_EXTENSIONS = exports.materiDir = exports.documentsDir = exports.uploadsDir = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.uploadsDir = path.join(__dirname, '../../uploads');
exports.documentsDir = path.join(exports.uploadsDir, 'documents');
exports.materiDir = path.join(exports.uploadsDir, 'materi');
if (!fs.existsSync(exports.documentsDir)) {
    fs.mkdirSync(exports.documentsDir, { recursive: true });
}
if (!fs.existsSync(exports.materiDir)) {
    fs.mkdirSync(exports.materiDir, { recursive: true });
}
exports.ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
exports.MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
exports.ALLOWED_MATERI_EXTENSIONS = [
    '.pdf', '.doc', '.docx',
    '.mp4', '.webm', '.mov', '.mkv',
    '.png', '.jpg', '.jpeg'
];
exports.MAX_MATERI_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const getMateriCategory = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    if (['.mp4', '.webm', '.mov', '.mkv'].includes(ext))
        return 'video';
    if (ext === '.pdf')
        return 'pdf';
    if (['.png', '.jpg', '.jpeg'].includes(ext))
        return 'image';
    if (['.doc', '.docx'].includes(ext))
        return 'document';
    return 'other';
};
exports.getMateriCategory = getMateriCategory;
const sanitizeFileName = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    if (!exports.ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error(`Ekstensi berkas ${ext} tidak diizinkan. Hanya PDF, PNG, JPG, JPEG yang didukung.`);
    }
    const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseName}_${timestamp}_${randomSuffix}${ext}`;
};
exports.sanitizeFileName = sanitizeFileName;
const sanitizeMateriFileName = (fileName) => {
    const ext = path.extname(fileName).toLowerCase();
    if (!exports.ALLOWED_MATERI_EXTENSIONS.includes(ext)) {
        throw new Error(`Ekstensi berkas ${ext} tidak didukung. Didukung: PDF, DOC/DOCX, Video (MP4/WEBM/MOV/MKV), dan Foto (PNG/JPG).`);
    }
    const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `materi_${baseName}_${timestamp}_${randomSuffix}${ext}`;
};
exports.sanitizeMateriFileName = sanitizeMateriFileName;
