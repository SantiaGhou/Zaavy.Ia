import React, { useState } from 'react';
import { ArrowLeft, Bot, Wand2, AlertCircle, Settings, MessageSquare, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Logo } from '../ui/Logo';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export function CreateBot() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState('');
  const [botType, setBotType] = useState<'ai' | 'rules' | 'hybrid'>('ai');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const botData = {
        name,
        type: botType,
        prompt: botType === 'ai' ? prompt : undefined,
        flowData: botType !== 'ai' ? { nodes: [], connections: [] } : undefined
      };

      const newBot = await apiService.createBot(botData);
      
      dispatch({ type: 'ADD_BOT', payload: newBot });
      
      if (botType === 'ai') {
        dispatch({ type: 'SET_CURRENT_BOT', payload: newBot.id });
        dispatch({ type: 'SET_CURRENT_PAGE', payload: 'bot-session' });
      } else {
        dispatch({ type: 'SET_CURRENT_BOT', payload: newBot.id });
        dispatch({ type: 'SET_CURRENT_PAGE', payload: 'bot-builder' });
      }
    } catch (error) {
      setError(error.message || 'Erro ao criar bot');
    } finally {
      setLoading(false);
    }
  };

  const botTypes = [
    {
      id: 'ai',
      title: 'Bot com IA',
      description: 'Respostas inteligentes usando ChatGPT',
      icon: Wand2,
      color: 'blue',
      features: ['Respostas naturais', 'Entende contexto', 'Aprende com conversas']
    },
    {
      id: 'rules',
      title: 'Bot com Regras',
      description: 'Fluxo fixo de perguntas e respostas',
      icon: Settings,
      color: 'green',
      features: ['Respostas precisas', 'Fluxo controlado', 'Sem custos de IA']
    },
    {
      id: 'hybrid',
      title: 'Bot Híbrido',
      description: 'Combina regras fixas com IA',
      icon: Zap,
      color: 'purple',
      features: ['Melhor dos dois mundos', 'Flexível', 'Controle total']
    }
  ];

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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Bot className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Criar Novo Bot</h1>
          <p className="text-gray-400">
            Escolha o tipo de bot e configure seu comportamento
          </p>
        </div>

        <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border-gray-800">
          {!state.user?.hasOpenAIKey && botType === 'ai' && (
            <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-yellow-300">Configuração Necessária</span>
              </div>
              <p className="text-sm text-yellow-200 mb-3">
                Você precisa configurar sua chave da OpenAI para criar bots com IA.
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bot Name */}
            <Input
              label="Nome do Bot"
              placeholder="Ex: Atendimento Loja, Suporte Técnico..."
              value={name}
              onChange={setName}
              required
            />

            {/* Bot Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Tipo de Bot <span className="text-red-400">*</span>
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {botTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = botType === type.id;
                  const colorClasses = {
                    blue: isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500/50',
                    green: isSelected ? 'border-green-500 bg-green-500/10' : 'border-gray-700 hover:border-green-500/50',
                    purple: isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-purple-500/50'
                  };

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setBotType(type.id as any)}
                      className={`p-6 border rounded-xl transition-all duration-200 text-left ${colorClasses[type.color]}`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          type.color === 'blue' ? 'bg-blue-500/20' :
                          type.color === 'green' ? 'bg-green-500/20' : 'bg-purple-500/20'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            type.color === 'blue' ? 'text-blue-400' :
                            type.color === 'green' ? 'text-green-400' : 'text-purple-400'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{type.title}</h3>
                          <p className="text-sm text-gray-400">{type.description}</p>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {type.features.map((feature, index) => (
                          <li key={index} className="text-xs text-gray-400 flex items-center">
                            <div className="w-1 h-1 bg-gray-500 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Prompt (only for AI bots) */}
            {botType === 'ai' && (
              <div>
                <Input
                  label="Prompt Personalizado"
                  type="textarea"
                  placeholder="Descreva como seu bot deve se comportar e responder..."
                  value={prompt}
                  onChange={setPrompt}
                  required
                />

                <div className="mt-4 border-t border-gray-700 pt-4">
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
              </div>
            )}

            {/* Info for Rules/Hybrid bots */}
            {botType !== 'ai' && (
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-blue-300">Próximo Passo</span>
                </div>
                <p className="text-sm text-gray-300">
                  Após criar o bot, você será direcionado para o construtor de fluxo onde poderá 
                  configurar as regras, condições e respostas do seu bot.
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="flex-1" 
                icon={botType === 'ai' ? Wand2 : Settings}
                disabled={loading || (botType === 'ai' && !state.user?.hasOpenAIKey)}
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