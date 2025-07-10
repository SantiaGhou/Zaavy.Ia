import React, { useState } from 'react';
import { X, Key, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export function ApiKeyModal() {
  const { state, dispatch } = useApp();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!state.showApiKeyModal) return null;

  const handleClose = () => {
    dispatch({ type: 'SET_SHOW_API_KEY_MODAL', payload: false });
    setApiKey('');
    setError('');
    setSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await apiService.saveOpenAIKey(apiKey);
      setSuccess(true);
      
      // Update user state
      if (state.user) {
        dispatch({
          type: 'SET_USER',
          payload: { ...state.user, hasOpenAIKey: true }
        });
      }

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar chave da OpenAI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Configurar OpenAI</h2>
              <p className="text-sm text-gray-400">Configure sua chave da API para usar IA</p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h3 className="font-medium text-blue-300 mb-3 flex items-center">
              <Key className="w-4 h-4 mr-2" />
              Como conseguir sua chave da OpenAI:
            </h3>
            <ol className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">1</span>
                <div>
                  Acesse:{' '}
                  <a
                    href="https://platform.openai.com/account/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                  >
                    https://platform.openai.com/account/api-keys
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">2</span>
                <span>Faça login com sua conta da OpenAI</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">3</span>
                <span>Clique em "Create new secret key"</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">4</span>
                <span>Copie a chave gerada (começa com sk-) e cole no campo abaixo</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">5</span>
                <span className="text-yellow-400">Salve — a chave só aparece uma vez!</span>
              </li>
            </ol>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Chave da API OpenAI"
              placeholder="sk-..."
              value={apiKey}
              onChange={setApiKey}
              required
              className="font-mono"
            />

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-sm">Chave salva com sucesso!</span>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={!apiKey.trim() || loading || success}
                className="flex-1"
              >
                {loading ? 'Salvando...' : success ? 'Salvo!' : 'Salvar Chave'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                {state.user?.hasOpenAIKey ? 'Fechar' : 'Pular'}
              </Button>
            </div>
          </form>

          {/* Security Note */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-300 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Segurança
            </h4>
            <p className="text-sm text-gray-400">
              Sua chave da OpenAI é armazenada de forma segura em nosso banco de dados e nunca é compartilhada. 
              Ela é usada apenas para processar suas mensagens de IA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}