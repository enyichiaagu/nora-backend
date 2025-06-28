import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../lib/supabase.js';
import { jsPDF } from 'jspdf';

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
    const prompt = `Based on the following transcripts, create concise study notes (maximum 200 words). Focus only on the content from the transcripts and organize key points clearly:

Transcripts:
${session.notes}

Study Notes:`;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // AI Stuff
    const result = await model.generateContent(prompt);
    const studyNotes = result.response.text().trim();

    // Header with logo placeholder and title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('[LOGO]', margin, 30);

    doc.setFontSize(20);
    doc.text('Nora Summary Note', pageWidth / 2, 30, { align: 'center' });

    // Session title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titleText = `Title: ${session.title || 'Untitled Session'}`;
    doc.text(titleText, margin, 50);

    // Description
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    if (session.description) {
      const descLines = doc.splitTextToSize(session.description, maxWidth);
      doc.text(descLines, margin, 65);
    }

    // Study notes body
    doc.setFontSize(11);
    const bodyStartY = session.description ? 85 : 70;
    const noteLines = doc.splitTextToSize(studyNotes, maxWidth);
    doc.text(noteLines, margin, bodyStartY);

    // Footer
    const currentTime = new Date().toLocaleString();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on ${currentTime}`, pageWidth / 2, 280, {
      align: 'center',
    });

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
