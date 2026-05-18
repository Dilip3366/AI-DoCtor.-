const OpenAI = require('openai');

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

/**
 * PrescriptionAgent — Checks drug interactions in a prescription
 */
async function checkDrugInteractions(medicineNames) {
  const client = getClient();

  const systemPrompt = `You are a pharmaceutical AI assistant (PrescriptionAgent).
Check the provided list of medicines for potential drug interactions.
Respond ONLY with a JSON array of warning strings. Example:
["Warning: Ibuprofen + Warfarin may increase bleeding risk", "Monitor: Metformin + Alcohol - avoid combination"]
If no interactions found, return an empty array: []`;

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Check interactions for: ${medicineNames.join(', ')}` },
    ],
    temperature: 0.1,
    max_tokens: 500,
  });

  const content = response.choices[0].message.content.trim();
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

module.exports = { checkDrugInteractions };
