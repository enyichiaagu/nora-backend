import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateTitleAndDescription(conversational_context: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Generate title
  const titlePrompt = `Based on the following conversation context, a lesson description using exactly 4 words for a tutoring session about. The description should explain what the student will learn from the subject:

Context: ${conversational_context}

Title:`;

  // Generate description
  const descriptionPrompt = `Based on the following conversation context, generate a short description (1 sentence) that summarizes what the user will learn from the discussion. Make it 9 words:

Context: ${conversational_context}

Description:`;

  // Run both prompts concurrently
  const [titleResult, descriptionResult] = await Promise.all([
    model.generateContent(titlePrompt),
    model.generateContent(descriptionPrompt),
  ]);

  const title = titleResult.response.text().trim();
  const description = descriptionResult.response.text().trim();

  return { title, description };
}