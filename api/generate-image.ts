import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt, imageSize } = req.body ?? {};
  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'A non-empty prompt is required.' });
    return;
  }
  if (!['1K', '2K', '4K'].includes(imageSize)) {
    res.status(400).json({ error: 'imageSize must be one of 1K, 2K, 4K.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: '16:9', imageSize },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((part) => part.inlineData);

    if (!imagePart?.inlineData) {
      res.status(502).json({ error: 'No image data found in the response.' });
      return;
    }

    res.status(200).json({ image: imagePart.inlineData.data });
  } catch (err: any) {
    console.error('Gemini generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate image.' });
  }
}
