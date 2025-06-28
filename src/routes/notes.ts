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
    const prompt = `Based on the following transcripts, create concise study notes in paragraph format (maximum 200 words). Focus only on the content from the transcripts and organize key points in flowing paragraphs rather than bullet points:

Transcripts:
${session.notes}

Study Notes:`;

    const result = await model.generateContent(prompt);
    const studyNotes = result.response.text().trim();

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Load and add logo
    try {
      const logoPath = join(process.cwd(), 'public', 'images', 'logo.png');
      const logoData = readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;
      
      // Add logo centered at top
      const logoWidth = 40;
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

    // Session title (using Times as it's closer to marlin-soft style)
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    const titleText = session.title || 'Untitled Session';
    doc.text(titleText, pageWidth / 2, 60, { align: 'center' });

    // Description
    doc.setFontSize(12);
    doc.setFont('times', 'italic');
    if (session.description) {
      const descLines = doc.splitTextToSize(session.description, maxWidth);
      doc.text(descLines, pageWidth / 2, 70, { align: 'center' });
    }

    // Study notes body
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    const bodyStartY = session.description ? 85 : 75;
    const noteLines = doc.splitTextToSize(studyNotes, maxWidth);
    doc.text(noteLines, margin, bodyStartY);

    // Footer
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const topic = session.title || 'this topic';
    const footerText = `This document is a summary of the nora conversation on ${topic}. It was generated on ${currentDate}`;
    
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    const footerLines = doc.splitTextToSize(footerText, maxWidth);
    doc.text(footerLines, pageWidth / 2, 270, { align: 'center' });

    // Send PDF
    const pdfBuffer = doc.output('arraybuffer');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="notes-${id}.pdf"`
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error('Error generating PDF notes:', error);
    res.status(500).json({ error: 'Failed to generate PDF notes' });
  }
});

export { router as notesRouter };