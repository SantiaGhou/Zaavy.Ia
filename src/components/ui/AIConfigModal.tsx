import React, { useState, useEffect } from 'react';
import { X, Settings, Zap, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { AIModel } from '../../types';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  currentConfig: {
    temperature: number;
    model: string;
    maxTokens: number;
  };
  onSave: (config: any) => void;
}

export function AIConfigModal({ 
  isOpen, 
  onClose, 
  botId, 
  currentConfig, 
  onSave 
}: AIConfigModalProps) {
  const { state } = useApp();
  const [temperature, setTemperature] = useState(currentConfig.temperature);
  const [model, setModel] = useState(currentConfig.model);
  const [maxTokens, setMaxTokens] = useState(currentConfig.maxTokens);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadModels();
      setTemperature(currentConfig.temperature);
      setModel(currentConfig.model);
      setMaxTokens(currentConfig.maxTokens);
      setTestResult(null);
      setError('');
    }
  }, [isOpen, currentConfig]);

  const loadModels = async () => {
    try {
      const availableModels = await apiService.getAIModels();
      setModels(availableModels);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const config = {
        temperature,
        model,
        maxTokens
      };

      await onSave(config);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!state.user?.hasOpenAIKey) {
      setError('Configure sua chave da OpenAI primeiro');
      return;
    }

    setTesting(true);
    setTestResult(null);
    setError('');

    try {
      const result = await apiService.testAI({
        apiKey: 'test', // Will use session key
        message: 'Olá! Este é um teste de configuração.',
        model,
        temperature,
        maxTokens,
        prompt: 'Responda de forma amigável e concisa.'
      });

      setTestResult(result.response);
    } catch (error: any) {
      setError(error.message || 'Erro ao testar configuração');
    } finally {
      setTesting(false);
    }
  };

  const getTemperatureDescription = (temp: number) => {
    if (temp <= 0.3) return 'Muito conservador - respostas previsíveis';
    if (temp <= 0.7) return 'Balanceado - boa mistura de criatividade e consistência';
    if (temp <= 1.2) return 'Criativo - respostas mais variadas';
    return 'Muito criativo - respostas imprevisíveis';
  };

  const selectedModel = models.find(m => m.id === model);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Configurações de IA</h2>
              <p className="text-sm text-gray-400">Ajuste o comportamento da inteligência artificial</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Modelo de IA
            </label>
            <div className="space-y-3">
              {models.map((modelOption) => (
                <div
                  key={modelOption.id}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                    model === modelOption.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setModel(modelOption.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">{modelOption.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{modelOption.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Max tokens: {modelOption.maxTokens.toLocaleString()}</span>
                        <span>Custo: ${modelOption.costPer1k}/1k tokens</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      model === modelOption.id
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-600'
                    }`}>
                      {model === modelOption.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Criatividade (Temperature): {temperature}
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Conservador</span>
                <span>Balanceado</span>
                <span>Criativo</span>
              </div>
              <p className="text-sm text-gray-400">
                {getTemperatureDescription(temperature)}
              </p>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <Input
              label="Máximo de Tokens"
              type="text"
              value={maxTokens.toString()}
              onChange={(value) => {
                const num = parseInt(value) || 0;
                setMaxTokens(Math.min(Math.max(num, 50), selectedModel?.maxTokens || 4096));
              }}
              placeholder="500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Controla o tamanho máximo das respostas. 
              {selectedModel && ` Máximo para ${selectedModel.name}: ${selectedModel.maxTokens.toLocaleString()}`}
            </p>
          </div>

          {/* Test Configuration */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
            <h4 className="font-medium text-blue-300 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Testar Configuração
            </h4>
            <p className="text-sm text-gray-300 mb-4">
              Teste suas configurações com uma mensagem de exemplo
            </p>
            <Button
              onClick={handleTest}
              disabled={testing || !state.user?.hasOpenAIKey}
              icon={Zap}
              className="w-full"
            >
              {testing ? 'Testando...' : 'Testar Agora'}
            </Button>
            
            {testResult && (
              <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Resposta de Teste:</span>
                </div>
                <p className="text-sm text-gray-300">{testResult}</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Help */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-300 mb-2 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              Dicas de Configuração
            </h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• <strong>Temperature baixa (0.0-0.3):</strong> Para respostas consistentes e factuais</li>
              <li>• <strong>Temperature média (0.4-0.8):</strong> Equilibrio entre criatividade e consistência</li>
              <li>• <strong>Temperature alta (0.9-2.0):</strong> Para respostas criativas e variadas</li>
              <li>• <strong>Mais tokens:</strong> Respostas mais longas e detalhadas</li>
              <li>• <strong>Menos tokens:</strong> Respostas mais concisas e diretas</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
              icon={Settings}
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  );
}