const mockUpdate = jest.fn().mockResolvedValue({});
const mockProcessMeetingAudio = jest.fn().mockResolvedValue({});
const mockExistsSync = jest.fn().mockReturnValue(true);
const mockSpawn = jest.fn();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    schedule: { update: mockUpdate }
  }))
}));

jest.mock('../analysisService', () => ({
  processMeetingAudio: mockProcessMeetingAudio
}));

jest.mock('fs', () => ({
  existsSync: mockExistsSync,
  unlinkSync: jest.fn(),
}));

jest.mock('child_process', () => ({
  spawn: mockSpawn
}));

import { transcribeVideo } from '../transcriptionService';

describe('transcribeVideo', () => {
  const scheduleId = 1;
  const videoPath = 'test.mp4';
  const audioPath = 'test.wav';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-key';
    
    mockExistsSync.mockImplementation((path) => {
      return path === videoPath || path === audioPath;
    });

    mockSpawn.mockReturnValue({
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === 'close') callback(0);
      }),
    });
  });

  it('should successfully transcribe video', async () => {
    await transcribeVideo(scheduleId, videoPath);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: scheduleId },
      data: {
        isTranscribing: true,
        isAnalyzing: true,
        transcriptionProgress: 10,
        transcriptionStatus: "Mengekstrak audio dari video..."
      },
    });

    expect(mockSpawn).toHaveBeenCalled();
    expect(mockProcessMeetingAudio).toHaveBeenCalledWith(scheduleId, expect.stringContaining('.wav'));
  });

  it('should handle missing video file', async () => {
    mockExistsSync.mockReturnValue(false);

    await transcribeVideo(scheduleId, videoPath);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: scheduleId },
      data: {
        isTranscribing: false,
        isAnalyzing: false,
        transcriptionStatus: expect.stringContaining("Gagal: Video file not found")
      },
    });
  });

  it('should handle ffmpeg failure', async () => {
    mockExistsSync.mockReturnValue(true);

    mockSpawn.mockReturnValue({
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === 'close') callback(1);
      }),
    });

    await transcribeVideo(scheduleId, videoPath);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: scheduleId },
      data: {
        isTranscribing: false,
        isAnalyzing: false,
        transcriptionStatus: expect.stringContaining("Gagal: ffmpeg failed with code 1")
      },
    });
  });
});
