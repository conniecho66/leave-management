import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || 'dummy-key',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  const PORT = Number(process.env.PORT || 3000);

  // API Routes
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, model = 'gemini-3.8-flash', systemInstruction, thinkingLevel, responseSchema } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (thinkingLevel && ['LOW', 'MEDIUM', 'HIGH', 'XHIGH'].includes(thinkingLevel)) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel[thinkingLevel as keyof typeof ThinkingLevel] };
      }
      if (responseSchema) {
        config.responseMimeType = 'application/json';
        config.responseSchema = responseSchema;
      }

      const response = await ai.models.generateContent({
        model: model || 'gemini-3.8-flash',
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      res.json({ text: response.text || '' });
    } catch (error: any) {
      console.error('Gemini generate error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  });

  // Streaming endpoint
  app.post('/api/ai/stream', async (req, res) => {
    try {
      const { prompt, model = 'gemini-3.8-flash', systemInstruction, thinkingLevel } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const config: any = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (thinkingLevel && ['LOW', 'MEDIUM', 'HIGH', 'XHIGH'].includes(thinkingLevel)) {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel[thinkingLevel as keyof typeof ThinkingLevel] };
      }

      const streamResponse = await ai.models.generateContentStream({
        model: model || 'gemini-3.8-flash',
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      for await (const chunk of streamResponse) {
        const textChunk = chunk.text || '';
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Gemini stream error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message || 'Stream error' })}\n\n`);
      res.end();
    }
  });

  // Multimodal Document & File Analysis Endpoint
  app.post('/api/ai/analyze-document', async (req, res) => {
    try {
      const { base64Data, mimeType, fileName, prompt = 'Extract document type, employee name, leave dates, diagnosis/reason, and key audit verification details.' } = req.body;

      if (!base64Data) {
        return res.status(400).json({ error: 'base64Data is required' });
      }

      // Strip data uri prefix if present
      const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64Clean, 'base64');

      let effectiveMime = mimeType;
      const lowerName = (fileName || '').toLowerCase();
      if (!effectiveMime || effectiveMime === 'application/octet-stream' || effectiveMime === '') {
        if (lowerName.endsWith('.pdf')) effectiveMime = 'application/pdf';
        else if (lowerName.endsWith('.png')) effectiveMime = 'image/png';
        else if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) effectiveMime = 'image/jpeg';
        else if (lowerName.endsWith('.webp')) effectiveMime = 'image/webp';
        else if (lowerName.endsWith('.docx')) effectiveMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (lowerName.endsWith('.xlsx')) effectiveMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        else effectiveMime = 'application/pdf'; // fallback for pdf receipts
      }

      let contents: any = null;

      // 1. Excel files (.xlsx, .xls)
      if (
        effectiveMime.includes('spreadsheetml') ||
        effectiveMime.includes('excel') ||
        lowerName.endsWith('.xlsx') ||
        lowerName.endsWith('.xls')
      ) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        let extractedText = '';
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          extractedText += `--- Sheet: ${sheetName} ---\n${csv}\n`;
        });
        contents = `Analyze the following spreadsheet data extracted from ${fileName}:\n\n${extractedText}\n\nTask: ${prompt}`;
      }
      // 2. Word documents (.docx)
      else if (
        effectiveMime.includes('wordprocessingml') ||
        lowerName.endsWith('.docx')
      ) {
        const result = await mammoth.extractRawText({ buffer });
        contents = `Analyze the following Word document extracted from ${fileName}:\n\n${result.value}\n\nTask: ${prompt}`;
      }
      // 3. Plain Text or CSV files
      else if (
        effectiveMime.includes('text/plain') ||
        effectiveMime.includes('text/csv') ||
        lowerName.endsWith('.txt') ||
        lowerName.endsWith('.csv')
      ) {
        const textContent = buffer.toString('utf-8');
        contents = `Analyze the following text file from ${fileName}:\n\n${textContent}\n\nTask: ${prompt}`;
      }
      // 4. PDFs and Images (application/pdf, image/*)
      else {
        contents = [
          {
            inlineData: {
              mimeType: effectiveMime,
              data: base64Clean,
            },
          },
          prompt || 'Analyze this document. Extract the leave period, purpose or itinerary, passenger/employee name, issuer, and validity.',
        ];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: 'You are an Enterprise HR Document Auditor for TAICHONG AUTOMATION / ENGINEERING. Inspect uploaded documents (flight tickets, e-receipts, medical certificates, hospitalization notes, official letters). Extract passenger/employee name, coverage dates, destination or diagnosis, issuer (airline, clinic, or travel agency), and determine validity.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              documentType: { type: Type.STRING, description: 'Type of document e.g. Flight Ticket / E-Ticket, Medical Certificate (MC), Travel Itinerary, Official Receipt' },
              employeeName: { type: Type.STRING, description: 'Passenger or employee name if found' },
              startDate: { type: Type.STRING, description: 'Leave or flight start date YYYY-MM-DD' },
              endDate: { type: Type.STRING, description: 'Leave or flight end date YYYY-MM-DD' },
              totalDays: { type: Type.NUMBER, description: 'Number of days' },
              reasonOrDiagnosis: { type: Type.STRING, description: 'Reason, diagnosis, flight route, or booking details' },
              issuerOrClinic: { type: Type.STRING, description: 'Airline, clinic, or issuer name' },
              isValid: { type: Type.BOOLEAN, description: 'Whether the document appears authentic and valid' },
              summary: { type: Type.STRING, description: 'Brief audit summary' },
            },
          },
        },
      });

      res.json({ analysis: JSON.parse(response.text || '{}') });
    } catch (error: any) {
      console.error('Analyze document error:', error);
      res.status(500).json({ error: error.message || 'Document analysis failed' });
    }
  });

  // Vite middleware for frontend
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeaveFlow Pro server running on http://localhost:${PORT}`);
  });
}

startServer();
