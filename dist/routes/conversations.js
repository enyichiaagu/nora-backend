import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
router.post('/', async (req, res) => {
    try {
        const { conversational_context } = req.body;
        if (!conversational_context) {
            return res.status(400).json({
                error: 'conversational_context is required'
            });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Gemini API key not configured'
            });
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Based on the following conversation context, generate a short, descriptive title (maximum 6 words) that captures the main topic or theme of the conversation:

Context: ${conversational_context}

Title:`;
        const result = await model.generateContent(prompt);
        const title = result.response.text().trim();
        res.json({
            title,
            conversational_context
        });
    }
    catch (error) {
        console.error('Error generating conversation title:', error);
        res.status(500).json({
            error: 'Failed to generate conversation title'
        });
    }
});
export { router as conversationRouter };
//# sourceMappingURL=conversations.js.map