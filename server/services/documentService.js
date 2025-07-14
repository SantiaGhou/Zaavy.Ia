import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';
import { prisma } from '../lib/prisma.js';

class DocumentService {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadDocument(file, userId) {
    try {
      // Validate file type
      if (file.mimetype !== 'application/pdf') {
        throw new Error('Apenas arquivos PDF são suportados');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 10MB');
      }

      // Generate unique filename
      const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.pdf`;
      const filepath = path.join(this.uploadDir, filename);

      // Save file
      await fs.writeFile(filepath, file.buffer);

      // Extract text from PDF
      const pdfData = await pdf(file.buffer);
      const content = pdfData.text;

      if (!content || content.trim().length === 0) {
        await fs.unlink(filepath); // Clean up file
        throw new Error('Não foi possível extrair texto do PDF');
      }

      // Create text chunks for better processing
      const chunks = this.createTextChunks(content);

      // Save to database
      const document = await prisma.document.create({
        data: {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          content,
          chunks: JSON.stringify(chunks),
          pageCount: pdfData.numpages,
          userId
        }
      });

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  createTextChunks(text, maxChunkSize = 1000) {
    const chunks = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      
      if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        } else {
          // Sentence is too long, split by words
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if (wordChunk.length + word.length > maxChunkSize) {
              if (wordChunk) {
                chunks.push(wordChunk.trim());
                wordChunk = word;
              } else {
                chunks.push(word); // Single word longer than max
              }
            } else {
              wordChunk += (wordChunk ? ' ' : '') + word;
            }
          }
          
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        }
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  async getDocuments(userId) {
    try {
      return await prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          filename: true,
          originalName: true,
          size: true,
          pageCount: true,
          createdAt: true
        }
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getDocument(documentId, userId) {
    try {
      return await prisma.document.findFirst({
        where: { 
          id: documentId,
          userId 
        }
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId, userId) {
    try {
      const document = await prisma.document.findFirst({
        where: { 
          id: documentId,
          userId 
        }
      });

      if (!document) {
        throw new Error('Documento não encontrado');
      }

      // Delete file from filesystem
      const filepath = path.join(this.uploadDir, document.filename);
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.warn('Could not delete file:', filepath);
      }

      // Delete from database
      await prisma.document.delete({
        where: { id: documentId }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  async searchDocuments(query, userId, limit = 5) {
    try {
      const documents = await prisma.document.findMany({
        where: { 
          userId,
          OR: [
            { originalName: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });

      // Return relevant chunks for each document
      return documents.map(doc => {
        const chunks = JSON.parse(doc.chunks || '[]');
        const relevantChunks = chunks.filter(chunk => 
          chunk.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3); // Top 3 relevant chunks per document

        return {
          id: doc.id,
          originalName: doc.originalName,
          content: relevantChunks.join('\n\n'),
          relevance: relevantChunks.length
        };
      }).filter(doc => doc.relevance > 0);
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }
}

export const documentService = new DocumentService();