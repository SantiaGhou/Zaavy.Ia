import OpenAI from 'openai';
import { encoding_for_model } from 'tiktoken';

const encode = encoding_for_model('gpt-3.5-turbo');

class AIService {
  constructor() {
    this.openaiInstances = new Map();
    this.availableModels = [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Rápido e eficiente para a maioria das tarefas',
        maxTokens: 4096,
        costPer1k: 0.002
      },
      {
        id: 'gpt-3.5-turbo-16k',
        name: 'GPT-3.5 Turbo 16K',
        description: 'Versão com contexto estendido',
        maxTokens: 16384,
        costPer1k: 0.004
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Mais inteligente, melhor para tarefas complexas',
        maxTokens: 8192,
        costPer1k: 0.03
      },
      {
        id: 'gpt-4-turbo-preview',
        name: 'GPT-4 Turbo',
        description: 'Versão mais rápida do GPT-4',
        maxTokens: 128000,
        costPer1k: 0.01
      }
    ];
  }

  getOrCreateOpenAI(apiKey) {
    if (!this.openaiInstances.has(apiKey)) {
      this.openaiInstances.set(apiKey, new OpenAI({ apiKey }));
    }
    return this.openaiInstances.get(apiKey);
  }

  getAvailableModels() {
    return this.availableModels;
  }

  countTokens(text) {
    try {
      return encode(text).length;
    } catch (error) {
      return Math.ceil(text.length / 4);
    }
  }

  async generateResponse(userMessage, config) {
    const {
      apiKey,
      prompt = "Você é um assistente útil e amigável.",
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 500,
      conversationHistory = [],
      documents = []
    } = config;

    if (!apiKey) {
      throw new Error('Chave da OpenAI não configurada');
    }

    try {
      const openai = this.getOrCreateOpenAI(apiKey);

      let documentContext = '';
      if (documents.length > 0) {
        documentContext = '\n\nBase de conhecimento:\n' + 
          documents.map(doc => doc.content).join('\n\n');
      }

      const messages = [
        {
          role: "system",
          content: prompt + documentContext
        }
      ];

      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      messages.push({
        role: "user",
        content: userMessage
      });

      const totalTokens = messages.reduce((sum, msg) => 
        sum + this.countTokens(msg.content), 0
      );

      const modelInfo = this.availableModels.find(m => m.id === model);
      const maxContextTokens = modelInfo ? modelInfo.maxTokens - maxTokens : 4096 - maxTokens;

      if (totalTokens > maxContextTokens) {
        while (messages.length > 2 && totalTokens > maxContextTokens) {
          messages.splice(1, 1);
        }
      }

      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: Math.max(0, Math.min(2, temperature)),
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0].message.content;
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        response,
        tokensUsed,
        model,
        temperature
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      if (error.code === 'invalid_api_key') {
        throw new Error('Chave da OpenAI inválida');
      } else if (error.code === 'insufficient_quota') {
        throw new Error('Cota da OpenAI esgotada');
      } else if (error.code === 'model_not_found') {
        throw new Error(`Modelo ${model} não encontrado`);
      }
      
      throw new Error('Erro ao processar resposta da IA');
    }
  }

  async validateApiKey(apiKey) {
    try {
      const openai = this.getOrCreateOpenAI(apiKey);
      await openai.models.list();
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.code === 'invalid_api_key' ? 'Chave inválida' : 'Erro de conexão'
      };
    }
  }

  cleanup() {
    this.openaiInstances.clear();
  }
}

export const aiService = new AIService();