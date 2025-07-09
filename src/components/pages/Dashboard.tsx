import React from 'react';
import { Plus, Bot, MessageCircle, Activity, Settings, LogOut, Key, Zap, Users, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Logo } from '../ui/Logo';
import { ApiKeyModal } from '../ui/ApiKeyModal';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export function Dashboard() {
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    apiService.logout();
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_TOKEN', payload: null });
    dispatch({ type: 'SET_AUTHENTICATED', payload: false });
    dispatch({ type: 'SET_CURRENT_PAGE', payload: 'landing' });
  };

  const totalMessages = state.bots.reduce((sum, bot) => sum + bot.messagesCount, 0);
  const activeBots = state.bots.filter(bot => bot.status === 'online').length;

  return (
    <div className="min-h-screen bg-black text-white">
      <ApiKeyModal />
      
      {/* Header */}
      <header className="border-b border-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              {!state.user?.hasOpenAIKey && (
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'SET_SHOW_API_KEY_MODAL', payload: true })}
                  icon={Key}
                  className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                >
                  Configurar OpenAI
                </Button>
              )}
              <span className="text-gray-300">Olá, {state.user?.name}</span>
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: 'SET_SHOW_API_KEY_MODAL', payload: true })}
                icon={Settings}
              >
                Configurações
              </Button>
              <Button variant="ghost" onClick={handleLogout} icon={LogOut}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-blue-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Bots</p>
                <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {state.bots.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Bot className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-green-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bots Ativos</p>
                <p className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">
                  {activeBots}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Mensagens Totais</p>
                <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {totalMessages.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'create-bot' })}
            icon={Plus}
          >
            Criar Novo Bot
          </Button>
          <Button
            variant="outline"
            onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'saved-sessions' })}
          >
            Sessões Salvas
          </Button>
        </div>

        {/* Bots List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Seus Bots</h2>
          
          {state.bots.length === 0 ? (
            <Card className="p-12 text-center bg-gray-900/30 backdrop-blur-sm border-gray-800">
              <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum bot criado ainda</h3>
              <p className="text-gray-400 mb-4">
                Crie seu primeiro bot para começar a automatizar suas conversas
              </p>
              <Button
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'create-bot' })}
                icon={Plus}
              >
                Criar Primeiro Bot
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {state.bots.map((bot) => (
                <Card key={bot.id} className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-blue-500/30 transition-all duration-300 group" hover>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Bot className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                          {bot.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {bot.messagesCount} mensagens
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(bot.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant={bot.status === 'online' ? 'success' : bot.status === 'offline' ? 'error' : 'warning'}>
                          {bot.status === 'online' ? 'Online' : bot.status === 'offline' ? 'Offline' : 'Conectando'}
                        </Badge>
                        {bot.lastActivity && (
                          <p className="text-xs text-gray-500 mt-1">
                            Última atividade: {new Date(bot.lastActivity).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          dispatch({ type: 'SET_CURRENT_BOT', payload: bot.id });
                          dispatch({ type: 'SET_CURRENT_PAGE', payload: 'bot-session' });
                        }}
                        className="hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        Abrir
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bot prompt preview */}
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <p className="text-sm text-gray-300 line-clamp-2">
                      <span className="font-medium text-gray-200">Prompt:</span> {bot.prompt}
                        </p>
                      </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}