import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

router.post("/", async (req, res) => {
	try {
		const { conversational_context } = req.body;

		if (!conversational_context) {
			return res.status(400).json({
				error: "conversational_context is required",
			});
		}

		if (!process.env.GEMINI_API_KEY) {
			return res.status(500).json({
				error: "Gemini API key not configured",
			});
		}

		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

		// Generate title
		const titlePrompt = `Based on the following conversation context, a lesson description using exactly 9 words for a tutoring session about. The description should explain what the student will learn from the subject:

Context: ${conversational_context}

Title:`;

		// Generate description
		const descriptionPrompt = `Based on the following conversation context, generate a short description (1 sentence) that summarizes what the user woll learn from the discussion. Make it at most 10 words:

Context: ${conversational_context}

Description:`;

		// Run both prompts concurrently
		const [titleResult, descriptionResult] = await Promise.all([
			model.generateContent(titlePrompt),
			model.generateContent(descriptionPrompt),
		]);

		const title = titleResult.response.text().trim();
		const description = descriptionResult.response.text().trim();

		res.json({
			title,
			description,
			conversational_context,
		});
	} catch (error) {
		console.error("Error generating conversation data:", error);
		res.status(500).json({
			error: "Failed to generate conversation data",
		});
	}
});

export { router as conversationRouter };
