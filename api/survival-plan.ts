import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

const VALID_HAZARDS = ['earthquake', 'flood', 'wildfire'];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    immediateSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    firstAid: { type: Type.ARRAY, items: { type: Type.STRING } },
    goBag: { type: Type.ARRAY, items: { type: Type.STRING } },
    communication: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['immediateSteps', 'firstAid', 'goBag', 'communication'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { hazard, severity, location, coords } = req.body ?? {};
  if (!VALID_HAZARDS.includes(hazard)) {
    res.status(400).json({ error: `hazard must be one of ${VALID_HAZARDS.join(', ')}` });
    return;
  }
  if (!VALID_SEVERITIES.includes(severity)) {
    res.status(400).json({ error: `severity must be one of ${VALID_SEVERITIES.join(', ')}` });
    return;
  }
  if (typeof location !== 'string' || !location.trim()) {
    res.status(400).json({ error: 'location is required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' });
    return;
  }

  const coordsLine = coords?.lat != null && coords?.lon != null
    ? ` at coordinates ${coords.lat}, ${coords.lon}`
    : '';

  const prompt = `You are an emergency survival planning assistant. A civilian is facing a ${severity} severity ${hazard} near ${location}${coordsLine}.

Produce a concise, actionable, situation-specific survival protocol as JSON with exactly these four arrays:
- immediateSteps: sequential, high-priority actions to evade imminent danger from this specific hazard, ordered by urgency.
- firstAid: critical first-aid/triage instructions relevant to injuries typical of this hazard (e.g. crush injuries and dust inhalation for earthquakes, drowning/hypothermia for floods, burns and smoke inhalation for wildfires).
- goBag: a packing checklist adapted to this exact hazard and severity, not a generic list.
- communication: distress signaling instructions and family rendezvous guidance appropriate to this hazard.

Each array should have 4-7 short, concrete, plain-language items. Do not include markdown formatting or numbering in the strings themselves — return clean sentences.`;

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
      res.status(502).json({ error: 'No plan returned from the model.' });
      return;
    }

    const plan = JSON.parse(text);
    res.status(200).json(plan);
  } catch (err: any) {
    console.error('Survival plan generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate survival plan.' });
  }
}
