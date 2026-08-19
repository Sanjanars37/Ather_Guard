import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

interface IncomingAlert {
  hazard: string;
  severity: string;
  location: string;
  reasoning: string[];
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    corridors: { type: Type.ARRAY, items: { type: Type.STRING } },
    shelters: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['summary', 'corridors', 'shelters'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const alerts: IncomingAlert[] = req.body?.alerts ?? [];
  if (!Array.isArray(alerts) || alerts.length === 0) {
    res.status(400).json({ error: 'alerts must be a non-empty array' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' });
    return;
  }

  const alertLines = alerts
    .map((a) => `- ${a.hazard} (${a.severity}) near ${a.location}: ${a.reasoning.join('; ')}`)
    .join('\n');

  const prompt = `You are a disaster relief and logistics coordinator. These hazard alerts are currently active, drawn from live monitoring feeds:

${alertLines}

Reason over these active hazards as a group and produce a JSON object with:
- summary: a 2-3 sentence situational overview of the combined risk picture across these hazards.
- corridors: 3-5 general evacuation-corridor recommendations (direction/strategy relative to each hazard, not literal street-level routing since exact road data isn't available).
- shelters: 3-5 shelter/resource-allocation recommendations (what kind of resource to prioritize where, given the hazard mix).

Be concrete and specific to the hazards listed, not generic disaster-preparedness boilerplate.`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      res.status(502).json({ error: 'No recommendation returned from the model.' });
      return;
    }

    const recommendation = JSON.parse(text);
    res.status(200).json(recommendation);
  } catch (err: any) {
    console.error('Relief recommendation generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate relief recommendation.' });
  }
}
