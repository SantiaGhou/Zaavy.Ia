import { prisma } from '../lib/prisma.js';

class ConversationService {
  async getOrCreateConversation(botId, phoneNumber, userName) {
    try {
      let conversation = await prisma.conversation.findUnique({
        where: {
          botId_phoneNumber: {
            botId,
            phoneNumber
          }
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 20 // Last 20 messages for context
          }
        }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            botId,
            phoneNumber,
            userName,
            isActive: true
          },
          include: {
            messages: true
          }
        });
      } else {
        // Update last activity and user name if provided
        conversation = await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessage: new Date(),
            userName: userName || conversation.userName
          },
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 20
            }
          }
        });
      }

      return conversation;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw error;
    }
  }

  async saveMessage(conversationId, botId, content, sender, metadata = {}) {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId,
          botId,
          content,
          sender,
          phoneNumber: metadata.phoneNumber,
          userName: metadata.userName,
          tokensUsed: metadata.tokensUsed,
          model: metadata.model,
          temperature: metadata.temperature
        }
      });

      // Update conversation last message time
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessage: new Date() }
      });

      // Update bot message count
      await prisma.bot.update({
        where: { id: botId },
        data: {
          messagesCount: { increment: 1 },
          lastActivity: new Date()
        }
      });

      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  async getConversationHistory(botId, phoneNumber, limit = 50) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: {
          botId_phoneNumber: {
            botId,
            phoneNumber
          }
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: limit
          }
        }
      });

      return conversation?.messages || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  async getAllConversations(botId) {
    try {
      return await prisma.conversation.findMany({
        where: { botId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1 // Just the last message for preview
          }
        },
        orderBy: { lastMessage: 'desc' }
      });
    } catch (error) {
      console.error('Error getting all conversations:', error);
      throw error;
    }
  }

  async getConversationStats(botId) {
    try {
      const totalConversations = await prisma.conversation.count({
        where: { botId }
      });

      const totalMessages = await prisma.message.count({
        where: { botId }
      });

      const activeConversations = await prisma.conversation.count({
        where: {
          botId,
          lastMessage: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      const avgMessagesPerConversation = totalConversations > 0 
        ? Math.round(totalMessages / totalConversations) 
        : 0;

      return {
        totalConversations,
        totalMessages,
        activeConversations,
        avgMessagesPerConversation
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      throw error;
    }
  }

  async compressConversationContext(conversationId, maxMessages = 10) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 50 // Get more messages to analyze
          }
        }
      });

      if (!conversation || conversation.messages.length <= maxMessages) {
        return conversation;
      }

      // Keep the most recent messages
      const recentMessages = conversation.messages.slice(0, maxMessages);
      
      // Create a summary of older messages
      const olderMessages = conversation.messages.slice(maxMessages);
      const summary = this.createConversationSummary(olderMessages);

      // Update conversation with compressed context
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          context: summary
        }
      });

      return {
        ...conversation,
        messages: recentMessages,
        context: summary
      };
    } catch (error) {
      console.error('Error compressing conversation context:', error);
      throw error;
    }
  }

  createConversationSummary(messages) {
    if (messages.length === 0) return '';

    const userMessages = messages.filter(m => m.sender === 'user').length;
    const botMessages = messages.filter(m => m.sender === 'bot').length;
    
    const topics = this.extractTopics(messages);
    const timespan = this.getTimespan(messages);

    return `Resumo da conversa anterior (${timespan}): ${userMessages} mensagens do usuário, ${botMessages} respostas do bot. Tópicos discutidos: ${topics.join(', ')}.`;
  }

  extractTopics(messages) {
    // Simple keyword extraction - could be enhanced with NLP
    const text = messages.map(m => m.content).join(' ').toLowerCase();
    const commonWords = ['o', 'a', 'de', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'numa', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'pelas'];
    
    const words = text.split(/\s+/).filter(word => 
      word.length > 3 && !commonWords.includes(word)
    );
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  getTimespan(messages) {
    if (messages.length === 0) return '';
    
    const oldest = new Date(messages[messages.length - 1].createdAt);
    const newest = new Date(messages[0].createdAt);
    const diffHours = Math.round((newest - oldest) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'última hora';
    if (diffHours < 24) return `últimas ${diffHours} horas`;
    
    const diffDays = Math.round(diffHours / 24);
    return `últimos ${diffDays} dias`;
  }
}

export const conversationService = new ConversationService();