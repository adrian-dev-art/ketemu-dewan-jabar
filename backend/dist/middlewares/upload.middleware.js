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
exports.sanitizeFileName = exports.MAX_FILE_SIZE_BYTES = exports.ALLOWED_EXTENSIONS = exports.documentsDir = exports.uploadsDir = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
exports.uploadsDir = path.join(__dirname, '../../uploads');
exports.documentsDir = path.join(exports.uploadsDir, 'documents');
if (!fs.existsSync(exports.documentsDir)) {
    fs.mkdirSync(exports.documentsDir, { recursive: true });
}
exports.ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
exports.MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
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
