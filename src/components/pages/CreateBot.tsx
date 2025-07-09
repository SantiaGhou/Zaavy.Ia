import React, { useState } from 'react';
import { ArrowLeft, Bot, Wand2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Logo } from '../ui/Logo';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export function CreateBot() {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newBot = await apiService.createBot(name, prompt);
      
      dispatch({ type: 'ADD_BOT', payload: newBot });
      dispatch({ type: 'SET_CURRENT_BOT', payload: newBot.id });
      dispatch({ type: 'SET_CURRENT_PAGE', payload: 'bot-session' });
    } catch (error) {
      setError(error.message || 'Erro ao criar bot');
    } finally {
      setLoading(false);
    }
  };

  const promptExamples = [
    'Você é um assistente de atendimento ao cliente especializado em vendas.',
    'Você é um chatbot para agendamento de consultas médicas.',
    'Você é um assistente pessoal que ajuda com tarefas do dia a dia.',
    'Você é um suporte técnico especializado em produtos de tecnologia.',
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' })}
                icon={ArrowLeft}
              >
                Voltar
              </Button>
              <Logo size="md" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <Bot className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Criar Novo Bot</h1>
          <p className="text-gray-400">
            Configure seu bot com inteligência artificial para WhatsApp
          </p>
        </div>

        <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          {!state.user?.hasOpenAIKey && (
            <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-yellow-300">Configuração Necessária</span>
              </div>
              <p className="text-sm text-yellow-200 mb-3">
                Você precisa configurar sua chave da OpenAI antes de criar um bot.
              </p>
              <Button
                variant="outline"
                onClick={() => dispatch({ type: 'SET_SHOW_API_KEY_MODAL', payload: true })}
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
              >
                Configurar OpenAI
              </Button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nome do Bot"
              placeholder="Ex: Atendimento Loja, Suporte Técnico..."
              value={name}
              onChange={setName}
              required
            />

            <Input
              label="Prompt Personalizado"
              type="textarea"
              placeholder="Descreva como seu bot deve se comportar e responder..."
              value={prompt}
              onChange={setPrompt}
              required
            />

            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Exemplos de Prompts:</h3>
              <div className="space-y-2">
                {promptExamples.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPrompt(example)}
                    className="block w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm text-gray-300"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="flex-1" 
                icon={Wand2}
                disabled={loading || !state.user?.hasOpenAIKey}
              >
                {loading ? 'Criando...' : 'Criar Bot'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' })}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}