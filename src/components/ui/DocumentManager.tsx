import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, Download, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { apiService } from '../../services/api';
import { Document } from '../../types';

interface DocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentManager({ isOpen, onClose }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await apiService.getDocuments();
      setDocuments(docs);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Apenas arquivos PDF são suportados');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const result = await apiService.uploadDocument(file);
      setDocuments(prev => [result, ...prev]);
      setSuccess(`Documento "${result.originalName}" enviado com sucesso!`);
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleDelete = async (documentId: string, fileName: string) => {
    if (!confirm(`Tem certeza que deseja deletar "${fileName}"?`)) {
      return;
    }

    try {
      await apiService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setSuccess('Documento deletado com sucesso');
    } catch (error: any) {
      setError(error.message || 'Erro ao deletar documento');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Base de Conhecimento</h2>
              <p className="text-sm text-gray-400">Gerencie documentos PDF para seus bots</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/5'
                : uploading
                ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
                : 'border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                <Upload className={`w-8 h-8 text-blue-500 ${uploading ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {uploading ? 'Enviando documento...' : 'Enviar PDF'}
                </h3>
                <p className="text-gray-400">
                  {isDragActive
                    ? 'Solte o arquivo aqui'
                    : 'Arraste um arquivo PDF ou clique para selecionar'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Máximo 10MB • Apenas arquivos PDF
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-green-300 text-sm">{success}</span>
            </div>
          )}

          {/* Documents List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Documentos ({documents.length})
              </h3>
              {documents.length > 0 && (
                <Button
                  variant="outline"
                  onClick={loadDocuments}
                  disabled={loading}
                  className="text-sm"
                >
                  Atualizar
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-400">Carregando documentos...</p>
              </div>
            ) : documents.length === 0 ? (
              <Card className="p-8 text-center bg-gray-800/50">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Nenhum documento ainda
                </h3>
                <p className="text-gray-500">
                  Envie seu primeiro PDF para criar uma base de conhecimento
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4 bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{doc.originalName}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <span>{formatFileSize(doc.size)}</span>
                            {doc.pageCount && <span>{doc.pageCount} páginas</span>}
                            <span>{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          className="p-2 hover:bg-red-500/20"
                          onClick={() => handleDelete(doc.id, doc.originalName)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h4 className="font-medium text-blue-300 mb-2">Como funciona</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Os documentos são processados e divididos em seções</li>
              <li>• O conteúdo é usado automaticamente como contexto para respostas</li>
              <li>• Bots com IA buscam informações relevantes nos documentos</li>
              <li>• Quanto mais específico o documento, melhores as respostas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}