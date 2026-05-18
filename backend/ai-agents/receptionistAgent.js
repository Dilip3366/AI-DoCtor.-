const OpenAI = require('openai');

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not set');
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

/**
 * ReceptionistAgent
 * Handles:
 * - Appointment booking guidance
 * - General clinic information
 * - Prescription pickup info
 * - General wellness queries
 */

async function receptionistChat(
  message,
  conversationHistory = [],
  user = {}
) {
  const client = getClient();

  const systemPrompt = `
You are Maya, a friendly and professional AI receptionist for HealthCare Clinic.

Your responsibilities:
- Help patients book appointments
- Answer clinic-related questions
- Provide non-diagnostic wellness guidance
- Help with prescription pickup information

Rules:
- Be polite and concise
- Do NOT diagnose diseases
- Do NOT prescribe medications
- Encourage patients to consult doctors for serious symptoms

Patient Name: ${user.name || 'Guest'}
Patient Role: ${user.role || 'Patient'}
`;

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },

    ...conversationHistory,

    {
      role: 'user',
      content: message,
    },
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 300,
  });

  return response.choices[0].message.content;
}

module.exports = {
  receptionistChat,
};
