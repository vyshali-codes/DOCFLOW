import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Hocuspocus } from '@hocuspocus/server';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = process.env.K_SERVICE ? (process.env.PORT || 8080) : 3000;

  app.use(cors());
  app.use(express.json());

  // Ensure uploads directory exists
  const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
  fs.ensureDirSync(UPLOADS_DIR);

  // Setup multer
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
      const uniqueName = `${uuidv4()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });

  const upload = multer({ storage: storage });

  const httpServer = createServer(app);
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/files/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, req.query.originalName as string || filename);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  app.post('/api/files/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: `/uploads/${req.file.filename}`
      }
    });
  });

  // Gemini API Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }
      
      const { contents, systemInstruction } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate response' });
    }
  });

  const hocuspocusServer = new Hocuspocus({
    name: 'DocFlow-Server'
  });
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url?.startsWith('/collaboration')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        hocuspocusServer.handleConnection(ws, request as any);
      });
    } else if (request.url?.startsWith('/live')) {
      wss.handleUpgrade(request, socket, head, async (ws) => {
        try {
          if (!process.env.GEMINI_API_KEY) {
            ws.close(1011, 'GEMINI_API_KEY is not configured');
            return;
          }
          const { GoogleGenAI, Modality } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          
          const session = await ai.live.connect({
            model: "gemini-3.1-flash-live-preview",
            config: {
              responseModalities: [Modality.AUDIO],
              systemInstruction: "You are a helpful assistant. Keep your answers brief.",
            },
            callbacks: {
              onmessage: (message: any) => {
                const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audio) {
                  ws.send(JSON.stringify({ audio }));
                }
                if (message.serverContent?.interrupted) {
                  ws.send(JSON.stringify({ interrupted: true }));
                }
              }
            }
          });

          ws.on('message', (data) => {
            try {
              const msg = JSON.parse(data.toString());
              if (msg.audio) {
                session.sendRealtimeInput({
                  audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" }
                });
              }
            } catch(e) {
              console.error(e);
            }
          });

          ws.on('close', () => {
             // Close session if supported (session.close may not exist, but let's ignore or catch)
          });

        } catch(error) {
          console.error("Live API Error:", error);
          ws.close(1011, "Internal server error");
        }
      });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
