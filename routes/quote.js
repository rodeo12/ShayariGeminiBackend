const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

router.post('/', async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(401).json({ message: 'Missing GEMINI_API_KEY environment variable' });
    }

    if (!keyword) {
      console.warn('Missing keyword in request body');
      return res.status(400).json({ message: 'Missing keyword in request body' });
    }

    const quote = await generateQuote(keyword);

    res.json({ quote });

  } catch (error) {
    console.error('Error handling / POST request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// async function generateQuote(keyword) {
//   try {
//     const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

//     const prompt = `Tell me a nice quote on "${keyword}" in less than 50 words.`;

//     // new SDK format: directly pass input
//     const result = await model.generateContent(prompt);

//     const text = result.response.text();

//     return text || 'Could not generate quote at this time.';

//   } catch (error) {
//     if (error.message.includes('SAFETY')) {
//       console.warn('Quote generation failed due to safety concerns:', error);
//       return 'Quote generation failed due to safety concerns. Please try a different keyword.';
//     } else {
//       console.error('Error generating quote:', error);
//       return 'Error generating quote.';
//     }
//   }
// }

async function generateQuote(keyword) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,   // balanced creativity
        topK: 40,           // diverse vocabulary
        topP: 0.9,          // natural variation
        maxOutputTokens: 60 // short, crisp quotes
      }
    });

    // Rotate prompts for freshness
    const promptTemplates = [
      `Give me a fresh and original quote on "${keyword}" in less than 50 words.`,
      `Write a unique quote about "${keyword}" in under 50 words. Keep it inspiring and meaningful.`,
      `Create a short, creative quote related to "${keyword}", strictly below 50 words, and avoid clichés.`
    ];
    const prompt =
      promptTemplates[Math.floor(Math.random() * promptTemplates.length)];

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text || 'Could not generate quote at this time.';

  } catch (error) {
    if (error.message.includes('SAFETY')) {
      console.warn('Quote generation failed due to safety concerns:', error);
      return 'Quote generation failed due to safety concerns. Please try a different keyword.';
    } else {
      console.error('Error generating quote:', error);
      return 'Error generating quote.';
    }
  }
}


module.exports = router;
