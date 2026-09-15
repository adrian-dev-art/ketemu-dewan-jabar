"use strict";
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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const livekit_server_sdk_1 = require("livekit-server-sdk");
// Mock dependencies
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        schedule: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});
jest.mock('livekit-server-sdk', () => {
    const mEgressClient = {
        startRoomCompositeEgress: jest.fn(),
        stopEgress: jest.fn(),
    };
    return {
        EgressClient: jest.fn(() => mEgressClient),
        EncodingOptionsPreset: { H264_1080P_30: 0 },
    };
});
describe('Recording API Tests', () => {
    let prismaMock;
    let egressMock;
    let token;
    beforeAll(() => {
        // Generate a valid JWT token for an admin user
        token = jsonwebtoken_1.default.sign({ id: 1, email: 'admin@dewan.id', role: 'admin' }, process.env.JWT_SECRET || 'dev-secret-key-only', { expiresIn: '1h' });
    });
    beforeEach(() => {
        jest.clearAllMocks();
        // Since we mocked PrismaClient constructor, we need to access its mock instance
        const prismaInstance = new client_1.PrismaClient();
        prismaMock = prismaInstance;
        const egressInstance = new livekit_server_sdk_1.EgressClient('url', 'key', 'secret');
        egressMock = egressInstance;
    });
    describe('POST /api/livekit/record/start', () => {
        it('should start recording successfully if schedule is valid and not already recording', () => __awaiter(void 0, void 0, void 0, function* () {
            // Setup mock data
            const scheduleId = 26;
            const roomName = '26';
            prismaMock.schedule.findUnique.mockResolvedValue({
                id: scheduleId,
                isRecording: false,
            });
            egressMock.startRoomCompositeEgress.mockResolvedValue({
                egressId: 'EG_test_123',
            });
            prismaMock.schedule.update.mockResolvedValue({
                id: scheduleId,
                isRecording: true,
                egressId: 'EG_test_123',
            });
            // Perform API request
            const response = yield (0, supertest_1.default)(server_1.app)
                .post('/api/livekit/record/start')
                .set('Authorization', `Bearer ${token}`)
                .send({ scheduleId, roomName });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Rekaman dimulai');
            expect(response.body.egressId).toBe('EG_test_123');
            // Verify EgressClient was called correctly
            expect(egressMock.startRoomCompositeEgress).toHaveBeenCalledWith(roomName, expect.objectContaining({
                file: expect.any(Object),
                options: expect.any(Object)
            }));
            // Verify Prisma was called correctly
            expect(prismaMock.schedule.update).toHaveBeenCalledWith({
                where: { id: scheduleId },
                data: expect.objectContaining({
                    isRecording: true,
                    egressId: 'EG_test_123',
                    recordingUrl: expect.stringContaining('recording_26_')
                })
            });
        }));
        it('should return 400 if already recording', () => __awaiter(void 0, void 0, void 0, function* () {
            const scheduleId = 26;
            prismaMock.schedule.findUnique.mockResolvedValue({
                id: scheduleId,
                isRecording: true, // Already recording
            });
            const response = yield (0, supertest_1.default)(server_1.app)
                .post('/api/livekit/record/start')
                .set('Authorization', `Bearer ${token}`)
                .send({ scheduleId, roomName: '26' });
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Sesi sudah merekam atau tidak ditemukan');
            expect(egressMock.startRoomCompositeEgress).not.toHaveBeenCalled();
        }));
    });
    describe('POST /api/livekit/record/stop', () => {
        it('should stop recording successfully if active', () => __awaiter(void 0, void 0, void 0, function* () {
            const scheduleId = 26;
            prismaMock.schedule.findUnique.mockResolvedValue({
                id: scheduleId,
                isRecording: true,
                egressId: 'EG_test_123'
            });
            egressMock.stopEgress.mockResolvedValue({});
            prismaMock.schedule.update.mockResolvedValue({});
            const response = yield (0, supertest_1.default)(server_1.app)
                .post('/api/livekit/record/stop')
                .set('Authorization', `Bearer ${token}`)
                .send({ scheduleId });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Rekaman dihentikan');
            expect(egressMock.stopEgress).toHaveBeenCalledWith('EG_test_123');
            expect(prismaMock.schedule.update).toHaveBeenCalledWith({
                where: { id: scheduleId },
                data: {
                    isRecording: false,
                    egressId: null
                }
            });
        }));
        it('should return 404 if no active recording found', () => __awaiter(void 0, void 0, void 0, function* () {
            const scheduleId = 26;
            prismaMock.schedule.findUnique.mockResolvedValue({
                id: scheduleId,
                isRecording: false, // Not recording
            });
            const response = yield (0, supertest_1.default)(server_1.app)
                .post('/api/livekit/record/stop')
                .set('Authorization', `Bearer ${token}`)
                .send({ scheduleId });
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Tidak ada sesi rekaman aktif');
            expect(egressMock.stopEgress).not.toHaveBeenCalled();
        }));
    });
});
