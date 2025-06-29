import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../lib/supabase.js";
import { jsPDF } from "jspdf";
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
		const prompt = `Based on the following transcripts, create review notes of the subject of discussion that is presented in paragraphs (exactly 500 words for the entire review notes). Generate lesson notes on the topic use these breaks (separate paragraphs with \\n\\n). The notes are like lesson notes that a person can read to understand the subject of discussion better. Do not include any headers, titles, or "Study Notes:" labels - just provide the content in the paragraphs:

Transcripts:
${session.notes}`;

		const result = await model.generateContent(prompt);
		const studyNotes = result.response.text().trim();

		// Create PDF
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		const margin = 20;
		const maxWidth = pageWidth - margin * 2;
		const footerHeight = 25; // Reserve space for footer
		const titleText = session.title || "Untitled Session";

		// Function to add the footer to each page
		const addFooter = (pageNum: number) => {
			// Save the current state
			const currentFontSize = doc.getFontSize();
			const currentFont = doc.getFont();
			const currentTextColor = doc.getTextColor();

			// Set footer styles
			doc.setFontSize(10);
			doc.setFont("Helvetica", "italic");
			doc.setTextColor(100, 100, 100); // Light grey for footer

			// Get current date/time info
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

			const topic = titleText;
			const footerText = `This document is a summary of the Nora conversation on ${topic}. It was generated on ${readableDate} at ${readableTime}.`;

			const footerLines = doc.splitTextToSize(footerText, maxWidth);
			doc.text(footerLines, pageWidth / 2, pageHeight - 15, {
				align: "center",
			});

			// Add page number if there are multiple pages
			doc.setFontSize(9);
			doc.text(`Page ${pageNum}`, pageWidth - margin, pageHeight - 10);

			// Restore the state
			doc.setFontSize(currentFontSize);
			doc.setFont(currentFont.fontName, currentFont.fontStyle);
			doc.setTextColor(currentTextColor);
		};

		// Initialize first page
		let pageNum = 1;

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
		doc.text(titleText, pageWidth / 2, 60, { align: "center" });

		// Description with grey color
		doc.setFontSize(12);
		doc.setFont("Helvetica", "normal");
		doc.setTextColor(80, 80, 80); // Dark grey color
		let bodyStartY = 75;

		if (session.description) {
			const descLines = doc.splitTextToSize(
				session.description,
				maxWidth
			);
			doc.text(descLines, pageWidth / 2, 68, { align: "center" });
			bodyStartY = 85; // Adjust starting position if description exists
		}

		// Add a little extra space
		let currentY = bodyStartY;

		// Split the study notes into paragraphs
		const paragraphs = studyNotes.split("\\n\\n").filter((p) => p.trim());

		// Study notes body with paragraph spacing and page management
		doc.setFontSize(13);
		doc.setFont("Helvetica", "normal");
		doc.setTextColor(50, 50, 50);

		// Line height and spacing values
		const lineHeight = 7;
		const paragraphSpacing = 8;
		const maxY = pageHeight - footerHeight; // Maximum Y position before footer

		// Process each paragraph
		paragraphs.forEach((paragraph, index) => {
			// Split text to respect max width
			const paragraphLines = doc.splitTextToSize(
				paragraph.trim(),
				maxWidth
			);
			const paragraphHeight = paragraphLines.length * lineHeight;

			// Check if we need a new page
			if (currentY + paragraphHeight > maxY) {
				// Add footer to current page
				addFooter(pageNum);

				// Add new page
				doc.addPage();
				pageNum++;
				currentY = margin + 10; // Reset Y position with some padding at top
			}

			// Render paragraph with justified text
			doc.text(paragraphLines, margin, currentY, {
				align: "justify",
				lineHeightFactor: 1.4,
				maxWidth: maxWidth,
			});

			// Move Y position for next paragraph
			currentY += paragraphHeight + paragraphSpacing;
		});

		// Add footer to the last page
		addFooter(pageNum);

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
