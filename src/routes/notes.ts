import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../lib/supabase.js";
import { jsPDF, type jsPDFOptions } from "jspdf";
import { readFileSync } from "fs";
import { join } from "path";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;

		if (!id) {
			return res
				.status(400)
				.json({ error: "Conversation ID is required" });
		}

		// Get session data from Supabase
		const { data: session, error } = await supabase
			.from("sessions")
			.select("title, description, notes")
			.eq("conversation_id", id)
			.single();

		if (error || !session) {
			console.log(error);
			return res.status(404).json({ error: "Session not found" });
		}

		if (!session.notes) {
			return res
				.status(400)
				.json({ error: "No transcripts available for this session" });
		}

		// Generate study notes using Gemini
		const model = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
		});
		const prompt = `Based on the following transcripts, create review notes of the subject of discussion that is presented in paragraphs (exactly 500 words for the entire review notes). Generate lesson notes on the topic use these breaks (separate paragraphs with \n\n). The notes are like lesson notes that a person can read to understand the subject of discussion better. Do not include any headers, titles, or "Study Notes:" labels - just provide the content in the paragraphs:

Transcripts:
${session.notes}`;

		const result = await model.generateContent(prompt);
		const studyNotes = result.response.text().trim();

		// Create PDF
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();
		const margin = 20;
		const maxWidth = pageWidth - margin * 2;

		// Load and add logo
		try {
			const logoPath = join(
				process.cwd(),
				"public",
				"images",
				"logo.png"
			);
			const logoData = readFileSync(logoPath);
			const logoBase64 = `data:image/png;base64,${logoData.toString(
				"base64"
			)}`;

			// Add logo centered at top
			const logoWidth = 20;
			const logoHeight = 20;
			const logoX = (pageWidth - logoWidth) / 2;
			doc.addImage(logoBase64, "PNG", logoX, 20, logoWidth, logoHeight);
		} catch (logoError) {
			console.error("Error loading logo:", logoError);
			// Fallback to text if logo fails
			doc.setFontSize(20);
			doc.setFont("Helvetica", "bold");
			doc.text("NORA", pageWidth / 2, 30, { align: "center" });
		}

		// Session title
		doc.setFontSize(23);
		doc.setFont("Helvetica", "bold");
		doc.setTextColor(50, 50, 50);
		const titleText = session.title || "Untitled Session";
		doc.text(titleText, pageWidth / 2, 60, { align: "center" });

		// Description with grey color
		doc.setFontSize(12);
		doc.setFont("Helvetica", "normal");
		doc.setTextColor(80, 80, 80); // Dark grey color
		if (session.description) {
			const descLines = doc.splitTextToSize(
				session.description,
				maxWidth
			);
			doc.text(descLines, pageWidth / 2, 68, { align: "center" });
		}

		// Reset text color to black for body
		doc.setTextColor(0, 0, 0);

		// Study notes body with paragraph spacing
		doc.setFontSize(13);
		doc.setFont("Helvetica", "normal");
		doc.setTextColor(50, 50, 50);
		const bodyStartY = session.description ? 85 : 75;

		// Split the study notes into paragraphs and add spacing between them
		const paragraphs = studyNotes.split("\n\n").filter((p) => p.trim());
		let currentY = bodyStartY;

		paragraphs.forEach((paragraph, index) => {
			const paragraphLines = doc.splitTextToSize(
				paragraph.trim(),
				maxWidth,
				{ align: "justify" }
			);

			doc.text(paragraphLines, margin, currentY, {
				lineHeightFactor: 1.4,
				align: "justify",
			});

			// Use the same factor in height calculation
			const paragraphHeight = paragraphLines.length * 6;
			currentY += paragraphHeight + 8;
		});

		// Footer with current date and time
		const currentDate = new Date();
		const readableDate = currentDate.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		const readableTime = currentDate.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});

		const topic = session.title || "this topic";
		const footerText = `This document is a summary of the Nora conversation on ${topic}. It was generated on ${readableDate} at ${readableTime}.`;

		doc.setFontSize(12);
		doc.setFont("Helvetica", "italic");
		doc.setTextColor(100, 100, 100); // Light grey for footer
		const footerLines = doc.splitTextToSize(footerText, maxWidth);
		doc.text(footerLines, pageWidth / 2, 270, { align: "center" });

		// Send PDF
		const pdfBuffer = doc.output("arraybuffer");

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${titleText
				.toLowerCase()
				.split(" ")
				.join("_")}-${id}.pdf"`
		);
		res.send(Buffer.from(pdfBuffer));
	} catch (error) {
		console.error("Error generating PDF notes:", error);
		res.status(500).json({ error: "Failed to generate PDF notes" });
	}
});

export { router as notesRouter };
