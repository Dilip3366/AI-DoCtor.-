const OpenAI = require('openai');

const getClient = () => {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

/**
 * DiagnosisAgent — Analyzes patient symptoms and suggests possible conditions
 */
async function analyzeSymptoms(symptoms, patientContext = {}) {
  const client = getClient();

  const systemPrompt = `You are an advanced medical AI assistant (DiagnosisAgent) for a clinic management system.
Your role is to analyze patient symptoms and provide preliminary assessments to ASSIST doctors — NOT replace them.
Always recommend consulting a qualified physician.

Respond in this exact JSON format:
{
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "urgencyLevel": "low|medium|high|critical",
  "recommendedTests": ["test1", "test2"],
  "recommendedSpecialist": "Specialist type",
  "generalAdvice": "Brief general advice",
  "redFlags": ["any warning signs that need immediate attention"],
  "aiNotes": "Brief explanation of your analysis"
}`;

  const userPrompt = `Patient Symptoms: ${symptoms.join(', ')}
${patientContext.age ? `Age: ${patientContext.age}` : ''}
${patientContext.gender ? `Gender: ${patientContext.gender}` : ''}
${patientContext.medicalHistory ? `Medical History: ${JSON.stringify(patientContext.medicalHistory)}` : ''}

Analyze these symptoms and provide a structured assessment.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch {
    return { aiNotes: content, possibleConditions: [], urgencyLevel: 'low', recommendedTests: [] };
  }
}

module.exports = { analyzeSymptoms };
