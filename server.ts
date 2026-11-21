import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

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
  app.use(express.json({ limit: '10mb' }));

  const PORT = Number(process.env.PORT || 3000);

  // API Routes
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, model = 'gemini-4-hydrogen', systemInstruction, thinkingLevel, responseSchema, temperature } = req.body;
      
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
      // Note: gemini-4 models don't support temperature, but other models might or we omit if not needed.

      const response = await ai.models.generateContent({
        model: model || 'gemini-4-hydrogen',
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
      const { prompt, model = 'gemini-4-hydrogen', systemInstruction, thinkingLevel } = req.body;
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
        model: model || 'gemini-4-hydrogen',
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

  // Vite middleware for frontend
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NexusAI Studio server running on http://localhost:${PORT}`);
  });
}

startServer();
