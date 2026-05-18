const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { analyzeSymptoms } = require('../ai-agents/diagnosisAgent');
const { receptionistChat } = require('../ai-agents/receptionistAgent');
const { checkDrugInteractions } = require('../ai-agents/prescriptionAgent');

// @POST /api/ai/symptom-check
router.post('/symptom-check', protect, async (req, res) => {
  try {
    const { symptoms, age, gender, medicalHistory } = req.body;
    if (!symptoms || symptoms.length === 0)
      return res.status(400).json({ success: false, message: 'Symptoms are required' });

    const result = await analyzeSymptoms(symptoms, { age, gender, medicalHistory });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI service unavailable: ' + err.message });
  }
});

// @POST /api/ai/chat — Receptionist AI
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const reply = await receptionistChat(message, conversationHistory || [], req.user);
    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI chat unavailable: ' + err.message });
  }
});

// @POST /api/ai/drug-interactions
router.post('/drug-interactions', protect, async (req, res) => {
  try {
    const { medicines } = req.body;
    const warnings = await checkDrugInteractions(medicines);
    res.json({ success: true, warnings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI service error: ' + err.message });
  }
});

module.exports = router;
