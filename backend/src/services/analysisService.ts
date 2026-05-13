import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const prisma = new PrismaClient();
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Process audio file using Gemini Multimodal
 * Transcribes and Analyzes in one request to save tokens/RPM
 */
export async function processMeetingAudio(scheduleId: number, audioPath: string) {
    try {
        console.log(`[AI-PIPELINE] Processing audio for schedule: ${scheduleId}`);

        if (!apiKey) {
            console.warn("[AI-PIPELINE] GEMINI_API_KEY not found. Skipping AI process.");
            return;
        }

        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }

        // 1. Mark as processing
        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { isTranscribing: true, isAnalyzing: true }
        });

        // 2. Upload file to Gemini File API
        console.log(`[AI-PIPELINE] Uploading audio to Gemini File API...`);
        const uploadResult = await fileManager.uploadFile(audioPath, {
            mimeType: "audio/wav",
            displayName: `Meeting_${scheduleId}`,
        });

        console.log(`[AI-PIPELINE] File uploaded: ${uploadResult.file.uri}`);

        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { 
                transcriptionProgress: 60,
                transcriptionStatus: "AI sedang mendengarkan & menganalisis..."
            }
        });

        // 3. Generate Transcription + Analysis
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const prompt = `
        Anda adalah asisten cerdas untuk DPRD Jawa Barat. Dengarkan audio rekaman pertemuan ini.
        Tugas Anda:
        1. Berikan transkripsi lengkap (verbatim) dalam Bahasa Indonesia.
           Gunakan format percakapan yang sangat rapi:
           [Nama Pembicara]: [Isi Pembicaraan]
           
           Jika nama tidak diketahui secara pasti, gunakan "Pembicara 1", "Pembicara 2", dst. 
           Jika nama atau peran disebutkan dalam percakapan, gunakan identitas tersebut (misal: [Dewan Ratih], [Warga Joko]).
           Tambahkan label waktu kasar di awal setiap paragraf jika memungkinkan (misal [00:15]).

        2. Analisis kualitas diskusi dan berikan ringkasan.
        
        Berikan respons dalam format JSON murni:
        {
            "transcription": "Teks transkripsi dengan format percakapan...",
            "analysis": {
                "summary": "Ringkasan singkat pertemuan dalam 2-3 kalimat",
                "sentiment": "Positif/Netral/Negatif",
                "topics": ["Topik 1", "Topik 2"],
                "actionItems": ["Tindakan 1", "Tindakan 2"],
                "citizenSatisfaction": 1-10,
                "dewanResponsiveness": 1-10,
                "discussionQuality": 1-10,
                "problemSolving": 1-10
            }
        }
        `;

		console.log(`[AI-PIPELINE] Calling Gemini API (Streaming Mode)...`);
		
		let result;
		let retries = 3;
		while (retries > 0) {
			try {
				result = await model.generateContentStream([
					{
						fileData: {
							mimeType: uploadResult.file.mimeType,
							fileUri: uploadResult.file.uri
						}
					},
					{ text: prompt }
				]);
				break; // Success!
			} catch (err: any) {
				if ((err.status === 503 || err.status === 429) && retries > 1) {
					console.warn(`[AI-PIPELINE] Gemini busy (503/429). Retrying in 10s... (${retries - 1} left)`);
					await new Promise(resolve => setTimeout(resolve, 10000));
					retries--;
				} else {
					throw err;
				}
			}
		}

		if (!result) throw new Error("Failed to get response from Gemini after retries");

		let fullText = "";
		for await (const chunk of result.stream) {
			const chunkText = chunk.text();
			fullText += chunkText;
			process.stdout.write("."); // Simple visual indicator in console
			if (fullText.length % 500 < 50) { // Log every ~500 chars
				console.log(`[AI-PIPELINE] Received ${fullText.length} characters of response...`);
			}
		}
		console.log("\n[AI-PIPELINE] Full AI response received.");

		await prisma.schedule.update({
			where: { id: scheduleId },
			data: { 
				transcriptionProgress: 95,
				transcriptionStatus: "Menyimpan hasil analisis..."
			}
		});

		// Extract JSON
		const jsonMatch = fullText.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			console.error("[AI-PIPELINE] Raw AI Response:", fullText);
			throw new Error("Failed to parse AI response: No JSON found");
		}
		
		const data = JSON.parse(jsonMatch[0]);

		// 4. Update Database
		await prisma.schedule.update({
			where: { id: scheduleId },
			data: { 
				transcription: data.transcription,
				analysis: data.analysis,
				isTranscribing: false,
				isAnalyzing: false,
				transcriptionProgress: 100,
				transcriptionStatus: "Selesai"
			}
		});

		// 5. Cleanup: Delete from Gemini storage
		try {
			await fileManager.deleteFile(uploadResult.file.name);
		} catch (e) {
			console.warn("[AI-PIPELINE] Cleanup failed, but proceeding:", e);
		}
		
		console.log(`[AI-PIPELINE] Success for schedule: ${scheduleId}`);
    } catch (err) {
        console.error(`[AI-PIPELINE] Error for schedule ${scheduleId}:`, err);
        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { 
                isTranscribing: false, 
                isAnalyzing: false,
                transcriptionStatus: "Gagal: " + (err instanceof Error ? err.message : "AI Error")
            }
        });
        throw err; // Re-throw so the parent knows it failed
    }
}

export async function analyzeTranscript(scheduleId: number, transcript: string) {
    // Keep existing function for fallback or manual text analysis
    try {
        console.log(`[ANALYSIS] Starting text analysis for schedule: ${scheduleId}`);
        if (!apiKey) return;

        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { isAnalyzing: true }
        });

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Analisis transkrip berikut dan berikan JSON: ${transcript}`;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            await prisma.schedule.update({
                where: { id: scheduleId },
                data: { analysis: JSON.parse(jsonMatch[0]), isAnalyzing: false }
            });
        }
    } catch (err) {
        console.error(err);
        await prisma.schedule.update({ where: { id: scheduleId }, data: { isAnalyzing: false } });
    }
}
