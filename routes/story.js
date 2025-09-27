const express = require('express');
const router = express.Router();
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai"); 

const API_KEY = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// API endpoint to generate Story
router.post('/', async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!API_KEY) {
      return res.status(401).json({ message: 'Missing GEMINI_API_KEY environment variable' });
    }

    if (!keyword) {
      return res.status(400).json({ message: 'Missing keyword in request body' });
    }

    // Generate Story and send response
    const story = await generateShayari(keyword);
    res.json({ story });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Function to generate Story
async function generateShayari(keyword) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prompt: Include keyword and specify creative text generation
    const prompt = `Tell me a nice story on ${keyword} in less than 100 words.`;

    // New SDK usage: pass prompt directly
    const result = await model.generateContent(prompt);

    const story = result.response.text() || 'Could not generate Story at this time.';
    return story;

  } catch (error) {
    if (error.message.includes('SAFETY')) {
      console.warn('Story generation failed due to safety concerns:', error);
      return 'Story generation failed due to safety concern. Please try a different keyword.';
    } else {
      console.error('Error generating Story:', error);
      return 'Error generating story.';
    }
  }
}

module.exports = router;
