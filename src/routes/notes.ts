import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase.js';
import { jsPDF } from 'jspdf';
import { readFileSync } from 'fs';
import { join } from 'path';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Get session data from Supabase
    const { data: session, error } = await supabase
      .from('sessions')
      .select('title, description, notes')
      .eq('conversation_id', id)
      .single();

    if (error || !session) {
      console.log(error);
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.notes) {
      return res
        .status(400)
        .json({ error: 'No transcripts available for this session' });
    }

    // Generate study notes using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
    const prompt = `Based on the following transcripts, create concise study notes in paragraph format (maximum 400 words). Focus only on the content from the transcripts and organize key points in flowing paragraphs rather than bullet points. Separate different topics or concepts into distinct paragraphs. Do not include any headers, titles, or labels like "Study Notes:" - just provide the content directly:

Transcripts:
${session.notes}`;

    const result = await model.generateContent(prompt);
    const studyNotes = result.response.text().trim();

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;

    // Load and add logo
    try {
      const logoPath = join(process.cwd(), 'public', 'images', 'logo.png');
      const logoData = readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
      
      // Add logo centered at top
      const logoWidth = 60;
      const logoHeight = 20;
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(logoBase64, 'PNG', logoX, 20, logoWidth, logoHeight);
    } catch (logoError) {
      console.error('Error loading logo:', logoError);
      // Fallback to text if logo fails
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      doc.text('NORA', pageWidth / 2, 30, { align: 'center' });
    }

    // Session title
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    const titleText = session.title || 'Untitled Session';
    doc.text(titleText, pageWidth / 2, 60, { align: 'center' });

    // Description with dark grey color
    doc.setFontSize(12);
    doc.setFont('times', 'italic');
    doc.setTextColor(80, 80, 80); // Dark grey color
    if (session.description) {
      const descLines = doc.splitTextToSize(session.description, maxWidth);
      doc.text(descLines, pageWidth / 2, 68, { align: 'center' });
    }

    // Reset text color to black for body
    doc.setTextColor(0, 0, 0);

    // Study notes body with paragraph spacing
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    const bodyStartY = session.description ? 85 : 75;
    
    // Split notes into paragraphs and add spacing between them
    const paragraphs = studyNotes.split('\n\n').filter(p => p.trim());
    let currentY = bodyStartY;
    const lineHeight = 6; // Increased line spacing
    
    paragraphs.forEach((paragraph, index) => {
      const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
      
      // Add paragraph spacing (except for first paragraph)
      if (index > 0) {
        currentY += 8; // Extra space between paragraphs
      }
      
      lines.forEach((line: string) => {
        if (currentY > 250) { // Check if we need a new page
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      });
    });

    // Footer with date and time
    const currentDate = new Date();
    const readableDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const readableTime = currentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const topic = session.title || 'this topic';
    const footerText = `This document is a summary of the Nora conversation on ${topic}. It was generated on ${readableDate} at ${readableTime}`;
    
    doc.setFontSize(10);
    doc.setFont('times', 'italic');
    doc.setTextColor(100, 100, 100); // Light grey for footer
    const footerLines = doc.splitTextToSize(footerText, maxWidth);
    doc.text(footerLines, pageWidth / 2, 270, { align: 'center' });

    // Send PDF
    const pdfBuffer = doc.output('arraybuffer');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${titleText.toLowerCase().split(' ').join('_')}-${id}.pdf"`
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error generating PDF notes:', error);
    res.status(500).json({ error: 'Failed to generate PDF notes' });
  }
});

export { router as notesRouter };