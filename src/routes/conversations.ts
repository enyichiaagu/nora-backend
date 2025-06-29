import { Router } from "express";
import { generateTitleAndDescription } from "../utils/geminiHelpers.js";

const router = Router();

router.post("/", async (req, res) => {
	try {
		const { conversational_context } = req.body;

		if (!conversational_context) {
			return res.status(400).json({
				error: "conversational_context is required",
			});
		}

		const { title, description } = await generateTitleAndDescription(conversational_context);

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