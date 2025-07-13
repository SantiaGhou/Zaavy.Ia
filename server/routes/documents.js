import express from 'express';
import { upload, handleUploadError } from '../middleware/upload.js';
import { documentService } from '../services/documentService.js';

const router = express.Router();

// Upload document
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID é obrigatório' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const document = await documentService.uploadDocument(req.file, sessionId);
    
    res.json({
      id: document.id,
      originalName: document.originalName,
      size: document.size,
      pageCount: document.pageCount,
      createdAt: document.createdAt
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user documents
router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID é obrigatório' });
    }

    const documents = await documentService.getDocuments(sessionId);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

// Get specific document
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID é obrigatório' });
    }

    const document = await documentService.getDocument(id, sessionId);
    
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Erro ao buscar documento' });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID é obrigatório' });
    }

    await documentService.deleteDocument(id, sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search documents
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { sessionId, limit = 5 } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID é obrigatório' });
    }

    const results = await documentService.searchDocuments(query, sessionId, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('Error searching documents:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos' });
  }
});

// Apply error handling middleware
router.use(handleUploadError);

export default router;