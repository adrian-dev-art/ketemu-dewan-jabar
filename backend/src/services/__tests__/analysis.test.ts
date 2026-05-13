import fs from "fs";

jest.mock("fs");

describe('processMeetingAudio', () => {
  let processMeetingAudio: any;
  let mockUpdate: jest.Mock;
  let mockGenerateContent: jest.Mock;
  let mockUploadFile: jest.Mock;
  let mockDeleteFile: jest.Mock;
  let mockExistsSync: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env.GEMINI_API_KEY = 'test-key';

    // 1. Setup mock functions
    mockUpdate = jest.fn().mockResolvedValue({});
    mockGenerateContent = jest.fn();
    mockUploadFile = jest.fn();
    mockDeleteFile = jest.fn();
    mockExistsSync = jest.fn().mockReturnValue(true);

    // 2. Define mocks using doMock
    jest.doMock("@prisma/client", () => ({
      PrismaClient: jest.fn().mockImplementation(() => ({
        schedule: { update: mockUpdate },
      })),
    }));

    jest.doMock("@google/generative-ai", () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn(() => ({
          generateContent: mockGenerateContent,
        })),
      })),
    }));

    jest.doMock("@google/generative-ai/server", () => ({
      GoogleAIFileManager: jest.fn().mockImplementation(() => ({
        uploadFile: mockUploadFile,
        deleteFile: mockDeleteFile,
      })),
    }));

    jest.doMock("fs", () => ({
      existsSync: mockExistsSync,
      unlinkSync: jest.fn(),
    }));

    // 3. Require service AFTER setting env and mocks
    processMeetingAudio = require('../analysisService').processMeetingAudio;
  });

  const scheduleId = 1;
  const audioPath = 'test.wav';

  it('should successfully transcribe and analyze audio', async () => {
    mockUploadFile.mockResolvedValue({
      file: { uri: 'file-uri', mimeType: 'audio/wav', name: 'file-name' }
    });

    const mockAIResponse = {
      response: {
        text: () => JSON.stringify({
          transcription: "Halo Dunia",
          analysis: {
            summary: "Pertemuan membahas dunia",
            sentiment: "Positif",
            topics: ["Dunia"],
            actionItems: ["Terus hidup"],
            citizenSatisfaction: 9,
            dewanResponsiveness: 9
          }
        })
      }
    };
    mockGenerateContent.mockResolvedValue(mockAIResponse);

    await processMeetingAudio(scheduleId, audioPath);

    // Verify Prisma updates
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: scheduleId },
      data: { isTranscribing: true, isAnalyzing: true },
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: scheduleId },
      data: {
        transcription: "Halo Dunia",
        analysis: expect.any(Object),
        isTranscribing: false,
        isAnalyzing: false
      },
    });

    expect(mockUploadFile).toHaveBeenCalled();
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('should handle missing audio file', async () => {
    mockExistsSync.mockReturnValue(false);

    await processMeetingAudio(scheduleId, audioPath);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: scheduleId },
      data: { isTranscribing: false, isAnalyzing: false },
    });
  });

  it('should handle AI parsing failure', async () => {
    mockUploadFile.mockResolvedValue({
      file: { uri: 'file-uri', mimeType: 'audio/wav', name: 'file-name' }
    });

    const mockAIResponse = {
      response: {
        text: () => "Invalid JSON Response"
      }
    };
    mockGenerateContent.mockResolvedValue(mockAIResponse);

    await processMeetingAudio(scheduleId, audioPath);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: scheduleId },
      data: { isTranscribing: false, isAnalyzing: false },
    });
  });
});
