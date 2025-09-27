const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

router.post('/', async (req, res) => {
  try {
    console.log("POST / - Received request body:", req.body);

    const { keyword } = req.body;

    if (!API_KEY) {
      console.error('Missing GEMINI_API_KEY environment variable');
      return res.status(401).json({ message: 'Missing GEMINI_API_KEY environment variable' });
    }

    if (!keyword) {
      console.warn('Missing keyword in request body');
      return res.status(400).json({ message: 'Missing keyword in request body' });
    }

    // console.log(`Generating joke for keyword: "${keyword}"`);

    const joke = await generateJoke(keyword);

    // console.log('Generated joke:', joke);

    res.json({ joke });

  } catch (error) {
    console.error('Error handling / POST request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function generateJoke(keyword) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.9,   // higher creativity for humour
        topK: 50,           // broader range of words
        topP: 0.95,         // diverse, less predictable punchlines
        maxOutputTokens: 80 // short, snappy jokes
      }
    });

    // Rotate prompts for humour variety
    const promptTemplates = [
      `Tell me a hilarious joke that involves "${keyword}". Make it witty and original.`,
      `Create an extremely funny joke about "${keyword}". Keep it short and punchy.`,
      `Write a sarcastic but humorous one-liner joke on "${keyword}".`,
      `Give me a creative and laugh-out-loud joke about "${keyword}".`
    ];
    const prompt =
      promptTemplates[Math.floor(Math.random() * promptTemplates.length)];

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text || 'Could not generate joke at this time.';

  } catch (error) {
    if (error.message.includes('SAFETY')) {
      console.warn('Joke generation failed due to safety concerns:', error);
      return 'Joke generation failed due to safety concerns. Please try a different keyword.';
    } else {
      console.error('Error generating joke:', error);
      return 'Error generating joke.';
    }
  }
}


module.exports = router;
