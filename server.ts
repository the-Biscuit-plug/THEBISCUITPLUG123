import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  // --- API Routes ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', business: 'The Biscuit Plug', country: 'ZA' });
  });

  // Products
  app.get('/api/products', (req, res) => {
    const { category, search } = req.query;
    let products = db.getProducts();

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
      );
    }

    res.json({ products });
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Biscuit not found babes!' });
    }
    res.json({ product });
  });

  app.post('/api/products', (req, res) => {
    try {
      const product = db.addProduct(req.body);
      res.status(201).json({ product });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to add biscuit' });
    }
  });

  app.put('/api/products/:id', (req, res) => {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Biscuit not found' });
    }
    res.json({ product: updated });
  });

  app.delete('/api/products/:id', (req, res) => {
    const success = db.deleteProduct(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Biscuit not found' });
    }
    res.json({ success: true });
  });

  // Orders
  app.get('/api/orders', (req, res) => {
    const orders = db.getOrders();
    res.json({ orders });
  });

  app.get('/api/orders/:orderId', (req, res) => {
    const order = db.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found! Double check your tracking code e.g. TBP-4892' });
    }
    res.json({ order });
  });

  app.post('/api/orders', (req, res) => {
    try {
      const order = db.createOrder(req.body);
      res.status(201).json({ order });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Could not place your order babes' });
    }
  });

  app.patch('/api/orders/:orderId/status', (req, res) => {
    const { status } = req.body;
    const order = db.updateOrderStatus(req.params.orderId, status);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order });
  });

  // Memes & Vibe Board
  app.get('/api/memes', (req, res) => {
    const memes = db.getMemes();
    res.json({ memes });
  });

  app.post('/api/memes', (req, res) => {
    try {
      const meme = db.addMeme(req.body);
      res.status(201).json({ meme });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Could not post meme' });
    }
  });

  app.post('/api/memes/:id/like', (req, res) => {
    const meme = db.likeMeme(req.params.id);
    if (!meme) {
      return res.status(404).json({ error: 'Meme not found' });
    }
    res.json({ meme });
  });

  // Baker Stats
  app.get('/api/stats', (req, res) => {
    const stats = db.getStats();
    res.json({ stats });
  });

  // Reset database
  app.post('/api/reset-db', (req, res) => {
    db.resetToDefaults();
    res.json({ success: true, message: 'Reset to default bakery goodies!' });
  });

  // AI Biscuit Slogan / Stamped Message / Vibe Generator
  app.post('/api/generate-biscuit-message', async (req, res) => {
    const { occasion, recipient, vibe } = req.body;

    const fallbackIdeas = [
      { message: 'DUMP HIM & EAT COOKIES', reason: 'Because carbs are loyal and won\'t leave you on delivered.' },
      { message: 'SLAY QUEEN HAPPY BIRTHDAY', reason: 'You are aging like fine vanilla extract.' },
      { message: 'CORPORATE BURNOUT CURE', reason: 'Per my last biscuit, I am clocking out early.' },
      { message: 'CERTIFIED LOVER GIRL', reason: '10/10 sweet tooth, zero bad vibes.' },
      { message: 'LOADSHEDDING SURVIVOR', reason: 'Stage 6 cannot melt this freshly baked energy.' },
      { message: 'YOU ARE LIKE REALLY PRETTY', reason: 'Mean Girls approved, butter-infused.' },
      { message: 'PROUD OF YOU BABES', reason: 'Celebrating your quiet wins with high sugar content.' }
    ];

    try {
      const ai = getGeminiClient();
      if (ai) {
        const prompt = `You are the sassy, warm, playful South African baker behind "The Biscuit Plug" - a trendy girly artisan bakery on Stanley Street in Richmond Hill, Port Elizabeth (Gqeberha), South Africa.
The user wants custom stamped cookie ideas for:
- Occasion: ${occasion || 'General treat / Just because'}
- Recipient: ${recipient || 'Bestie / Self'}
- Vibe: ${vibe || 'Sassy & meme-inspired'}

Generate 4 ultra-punchy, funny, girly biscuit stamp text ideas (under 28 characters each in all-caps) with a short 1-sentence hilarious explanation each. Incorporate relatable girl-energy, soft South African slang (like babes, yebo, bestie, lekker, no cap) where natural.
Return ONLY a valid JSON array of objects with keys "message" and "reason".`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({ ideas: parsed });
        }
      }
    } catch (err) {
      console.warn('Gemini generation fallback used:', err);
    }

    // Return randomized selection of playful ideas
    res.json({ ideas: fallbackIdeas.slice(0, 4) });
  });

  // --- Vite Middleware for SPA ---
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ The Biscuit Plug server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
