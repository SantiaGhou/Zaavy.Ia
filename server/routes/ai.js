import express from 'express';
import { aiService } from '../services/aiService.js';

const router = express.Router();

// Get available AI models
router.get('/models', (req, res) => {
  try {
    const models = aiService.getAvailableModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching AI models:', error);
    res.status(500).json({ error: 'Erro ao buscar modelos' });
  }
});

// Validate API key
router.post('/validate-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key é obrigatória' });
    }

    const result = await aiService.validateApiKey(apiKey);
    res.json(result);
  } catch (error) {
    console.error('Error validating API key:', error);
    res.status(500).json({ error: 'Erro ao validar chave' });
  }
});

// Test AI response
router.post('/test', async (req, res) => {
  try {
    const { 
      apiKey, 
      message, 
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 500,
      prompt = 'Você é um assistente útil.'
    } = req.body;
    
    if (!apiKey || !message) {
      return res.status(400).json({ error: 'API key e mensagem são obrigatórios' });
    }

    const result = await aiService.generateResponse(message, {
      apiKey,
      prompt,
      model,
      temperature,
      maxTokens
    });

    res.json(result);
  } catch (error) {
    console.error('Error testing AI:', error);
    res.status(500).json({ error: error.message });
  }
});

// Count tokens in text
router.post('/count-tokens', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Texto é obrigatório' });
    }

    const tokenCount = aiService.countTokens(text);
    res.json({ tokenCount });
  } catch (error) {
    console.error('Error counting tokens:', error);
    res.status(500).json({ error: 'Erro ao contar tokens' });
  }
});

export default router;