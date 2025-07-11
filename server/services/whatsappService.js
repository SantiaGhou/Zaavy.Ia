import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { prisma } from '../config/database.js';
import { createMessage } from '../controllers/messageController.js';
import { getIO } from '../index.js';

// Active WhatsApp clients
const { Client, LocalAuth } = pkg;

const activeClients = new Map();

class WhatsAppBot {
  constructor(botData, sessionOpenAIKey, socketId) {
    this.botData = botData;
    this.sessionOpenAIKey = sessionOpenAIKey;
    this.socketId = socketId;
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
  }

  async initialize() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.botData.id
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.client.on('qr', async (qr) => {
      try {
        this.qrCode = await qrcode.toDataURL(qr);
        
        console.log(`📱 QR Code generated for bot: ${this.botData.name}`);
        
        // Save QR to database
        await prisma.whatsappSession.upsert({
          where: { botId: this.botData.id },
          update: { qrCode: this.qrCode, isActive: false },
          create: {
            botId: this.botData.id,
            qrCode: this.qrCode,
            isActive: false
          }
        });

        // Emit to specific socket
        const io = getIO();
        io.to(this.socketId).emit('qr-code', {
          botId: this.botData.id,
          qrCode: this.qrCode
        });
        
        console.log(`✅ QR Code emitted to socket: ${this.socketId}`);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    this.client.on('ready', async () => {
      this.isReady = true;
      
      console.log(`✅ Bot ${this.botData.name} is ready!`);
      
      // Update bot status in database
      await prisma.bot.update({
        where: { id: this.botData.id },
        data: {
          status: 'online',
          isConnected: true,
          lastActivity: new Date()
        }
      });

      // Update whatsapp session
      await prisma.whatsappSession.upsert({
        where: { botId: this.botData.id },
        update: { isActive: true, connectedAt: new Date(), qrCode: null },
        create: {
          botId: this.botData.id,
          isActive: true,
          connectedAt: new Date()
        }
      });

      const io = getIO();
      io.to(this.socketId).emit('bot-ready', {
        botId: this.botData.id,
        status: 'online'
      });
    });

    this.client.on('message', async (message) => {
      if (message.from !== 'status@broadcast') {
        await this.handleMessage(message);
      }
    });

    this.client.on('disconnected', async (reason) => {
      console.log(`❌ Bot ${this.botData.name} disconnected:`, reason);
      this.isReady = false;
      
      // Update bot status
      await prisma.bot.update({
        where: { id: this.botData.id },
        data: {
          status: 'offline',
          isConnected: false
        }
      });

      // Update whatsapp session
      await prisma.whatsappSession.updateMany({
        where: { botId: this.botData.id },
        data: { isActive: false }
      });

      const io = getIO();
      io.to(this.socketId).emit('bot-disconnected', {
        botId: this.botData.id,
        reason
      });
    });

    await this.client.initialize();
  }

  async handleMessage(message) {
    try {
      const messageData = {
        content: message.body,
        sender: 'user',
        phoneNumber: message.from,
        userName: message._data.notifyName || 'Unknown',
        timestamp: new Date()
      };

      // Save user message
      const savedMessage = await createMessage(this.botData.id, messageData);

      // Update whatsapp session last message
      await prisma.whatsappSession.updateMany({
        where: { botId: this.botData.id },
        data: { lastMessage: new Date() }
      });

      // Emit to frontend
      const io = getIO();
      io.to(this.socketId).emit('new-message', {
        ...messageData,
        id: savedMessage.id,
        botId: this.botData.id
      });

      // Generate response based on bot type
      let response = null;
      
      if (this.botData.type === 'ai') {
        response = await this.generateAIResponse(message.body);
      } else if (this.botData.type === 'rules' || this.botData.type === 'hybrid') {
        response = await this.processRulesFlow(message.body);
      }
      
      if (response) {
        // Send response via WhatsApp
        await message.reply(response);

        // Save bot response
        const botMessageData = {
          content: response,
          sender: 'bot',
          timestamp: new Date()
        };

        const savedBotMessage = await createMessage(this.botData.id, botMessageData);

        io.to(this.socketId).emit('new-message', {
          ...botMessageData,
          id: savedBotMessage.id,
          botId: this.botData.id
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async generateAIResponse(userMessage) {
    try {
      if (!this.sessionOpenAIKey) {
        return "Erro: Chave da OpenAI não configurada. Configure sua chave nas configurações.";
      }

      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: this.sessionOpenAIKey,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: this.botData.prompt || "Você é um assistente útil."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (error.code === 'invalid_api_key') {
        return "Erro: Chave da OpenAI inválida. Verifique sua chave nas configurações.";
      }
      return "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.";
    }
  }

  async processRulesFlow(userMessage) {
    try {
      if (!this.botData.flowData) {
        return "Bot não configurado. Configure o fluxo de conversação.";
      }

      const flowData = JSON.parse(this.botData.flowData);
      const { nodes } = flowData;

      // Find condition nodes and check matches
      for (const node of nodes) {
        if (node.type === 'condition' && node.data.conditions) {
          for (const condition of node.data.conditions) {
            if (this.checkCondition(userMessage, condition)) {
              return condition.response;
            }
          }
        }
      }

      // If hybrid bot and no rule matches, try AI
      if (this.botData.type === 'hybrid') {
        // Find AI nodes
        const aiNode = nodes.find(node => node.type === 'ai');
        if (aiNode && this.sessionOpenAIKey) {
          return await this.generateAIResponseWithPrompt(userMessage, aiNode.data.aiPrompt);
        }
      }

      // Default response
      return "Desculpe, não entendi sua mensagem. Pode reformular?";
    } catch (error) {
      console.error('Error processing rules flow:', error);
      return "Erro ao processar sua mensagem.";
    }
  }

  checkCondition(message, condition) {
    const messageText = message.toLowerCase();
    const conditionValue = condition.value.toLowerCase();

    switch (condition.type) {
      case 'contains':
        return messageText.includes(conditionValue);
      case 'equals':
        return messageText === conditionValue;
      case 'starts_with':
        return messageText.startsWith(conditionValue);
      case 'ends_with':
        return messageText.endsWith(conditionValue);
      default:
        return false;
    }
  }

  async generateAIResponseWithPrompt(userMessage, customPrompt) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: this.sessionOpenAIKey,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: customPrompt || "Você é um assistente útil."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response with prompt:', error);
      return "Erro ao gerar resposta com IA.";
    }
  }

  async destroy() {
    if (this.client) {
      await this.client.destroy();
    }
  }
}

// Create WhatsApp bot instance
export const createWhatsAppBot = async (botData, sessionOpenAIKey, socketId) => {
  const bot = new WhatsAppBot(botData, sessionOpenAIKey, socketId);
  activeClients.set(botData.id, bot);
  await bot.initialize();
  return bot;
};

// Destroy WhatsApp bot instance
export const destroyWhatsAppBot = async (botId) => {
  const bot = activeClients.get(botId);
  if (bot) {
    await bot.destroy();
    activeClients.delete(botId);
  }
};

// Get active bot
export const getActiveBot = (botId) => {
  return activeClients.get(botId);
};

// Cleanup all bots
export const cleanupAllBots = async () => {
  for (const [botId, client] of activeClients) {
    try {
      await client.destroy();
    } catch (error) {
      console.error(`Error destroying client ${botId}:`, error);
    }
  }
  activeClients.clear();
};