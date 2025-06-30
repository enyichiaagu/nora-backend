import { Router } from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync, unlinkSync } from "fs";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Configure multer for file uploads
const upload = multer({
	dest: "/tmp/uploads/",
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		// Accept common file types that Gemini can process
		const allowedTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"application/pdf",
			"text/plain",
			"text/csv",
			"application/json",
		];
		
		if (allowedTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("File type not supported"));
		}
	},
});

router.post("/", upload.single("file"), async (req, res) => {
	let filePath: string | null = null;
	
	try {
		const { conversational_context } = req.body;
		const file = req.file;

		if (!file) {
			return res.status(400).json({
				error: "File is required",
			});
		}

		if (!conversational_context) {
			return res.status(400).json({
				error: "conversational_context is required",
			});
		}

		filePath = file.path;
		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

		// Prepare file data for Gemini
		let fileData;
		
		if (file.mimetype.startsWith("image/")) {
			const imageBuffer = readFileSync(filePath);
			fileData = {
				inlineData: {
					data: imageBuffer.toString("base64"),
					mimeType: file.mimetype,
				},
			};
		} else if (file.mimetype === "application/pdf" || file.mimetype.startsWith("text/")) {
			const fileBuffer = readFileSync(filePath);
			fileData = {
				inlineData: {
					data: fileBuffer.toString("base64"),
					mimeType: file.mimetype,
				},
			};
		} else {
			throw new Error("Unsupported file type for processing");
		}

		const prompt = `Based on the attached file and the following conversational context, create comprehensive lesson notes that blend both the file content and the discussion context. The lesson notes should be grounded in the attachment content and enhanced by the conversational context.

Conversational Context: ${conversational_context}

Please generate exactly 200 words of lesson notes that:
1. Extract key information from the attached file
2. Integrate it with the conversational context
3. Create a cohesive learning experience
4. Focus on practical understanding

Lesson Notes:`;

		const result = await model.generateContent([prompt, fileData]);
		const generatedContext = result.response.text().trim();

		res.json({
			generated_context: generatedContext,
		});

	} catch (error) {
		console.error("Error processing attachment:", error);
		res.status(500).json({
			error: "Failed to process attachment and generate lesson notes",
		});
	} finally {
		// Clean up uploaded file
		if (filePath) {
			try {
				unlinkSync(filePath);
			} catch (cleanupError) {
				console.error("Error cleaning up file:", cleanupError);
			}
		}
	}
});

export { router as attachmentsRouter };