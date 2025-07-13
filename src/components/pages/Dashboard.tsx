import React, { useEffect, useState } from 'react';
import { Plus, Bot, MessageCircle, Activity, Settings, Key, Zap, Users, Clock, ArrowLeft, TrendingUp, Calendar, BarChart3, FileText, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Logo } from '../ui/Logo';
import { ApiKeyModal } from '../ui/ApiKeyModal';
import { AIConfigModal } from '../ui/AIConfigModal';
import { DocumentManager } from '../ui/DocumentManager';
import { DeleteConfirmModal } from '../ui/DeleteConfirmModal';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export function Dashboard() {
  const { state, dispatch } = useApp();
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBot, setSelectedBot] = useState<any>(null);
  const [deletingBot, setDeletingBot] = useState(false);
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeBots: 0,
    todayMessages: 0,
    avgResponseTime: '2.3s'
  });

  // Load bots on dashboard mount
  useEffect(() => {
    const loadBots = async () => {
      try {
        const bots = await apiService.getBots();
        dispatch({ type: 'SET_BOTS', payload: bots });
        
        // Calculate stats
        const totalMessages = bots.reduce((sum, bot) => sum + bot.messagesCount, 0);
        const activeBots = bots.filter(bot => bot.status === 'online').length;
        
        setStats({
          totalMessages,
          activeBots,
          todayMessages: Math.floor(totalMessages * 0.3), // Simulate today's messages
          avgResponseTime: '2.3s'
        });
      } catch (error) {
        console.error('Error loading bots:', error);
      }
    };

    if (state.isAuthenticated) {
      loadBots();
    }
  }, [state.isAuthenticated, dispatch]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai': return Zap;
      case 'rules': return Settings;
      case 'hybrid': return Activity;
      default: return Bot;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ai': return 'text-purple-400';
      case 'rules': return 'text-green-400';
      case 'hybrid': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ai': return 'Inteligência Artificial';
      case 'rules': return 'Baseado em Regras';
      case 'hybrid': return 'Híbrido (IA + Regras)';
      default: return 'Desconhecido';
    }
  };

  const handleStopBot = async (botId: string) => {
    try {
      await apiService.stopBot(botId);
      dispatch({
        type: 'UPDATE_BOT',
        payload: {
          id: botId,
          updates: { status: 'offline', isConnected: false }
        }
      });
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  };

  const handleStartBot = async (botId: string) => {
    try {
      await apiService.startBot(botId);
      // Status will be updated via socket events
    } catch (error) {
      console.error('Error starting bot:', error);
    }
  };

  const handleDeleteBot = (bot: any) => {
    setSelectedBot(bot);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBot = async () => {
    if (!selectedBot) return;
    
    setDeletingBot(true);
    try {
      await apiService.deleteBot(selectedBot.id);
      dispatch({ type: 'DELETE_BOT', payload: selectedBot.id });
      setShowDeleteConfirm(false);
      setSelectedBot(null);
    } catch (error) {
      console.error('Error deleting bot:', error);
    } finally {
      setDeletingBot(false);
    }
  };

  const handleConfigureAI = (bot: any) => {
    setSelectedBot(bot);
    setShowAIConfig(true);
  };

  const handleSaveAIConfig = async (config: any) => {
    if (!selectedBot) return;
    
    try {
      const updatedBot = await apiService.updateBot(selectedBot.id, config);
      dispatch({
        type: 'UPDATE_BOT',
        payload: {
          id: selectedBot.id,
          updates: config
        }
      });
    } catch (error) {
      console.error('Error updating AI config:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <ApiKeyModal />
      
      {selectedBot && (
        <AIConfigModal
          isOpen={showAIConfig}
          onClose={() => {
            setShowAIConfig(false);
            setSelectedBot(null);
          }}
          botId={selectedBot.id}
          currentConfig={{
            temperature: selectedBot.temperature || 0.7,
            model: selectedBot.model || 'gpt-3.5-turbo',
            maxTokens: selectedBot.maxTokens || 500
          }}
          onSave={handleSaveAIConfig}
        />
      )}
      
      <DocumentManager
        isOpen={showDocuments}
        onClose={() => setShowDocuments(false)}
      />
      
      {selectedBot && (
        <DeleteConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedBot(null);
          }}
          onConfirm={confirmDeleteBot}
          title="Deletar Bot"
          message={`Tem certeza que deseja deletar o bot "${selectedBot.name}"?`}
          itemName={selectedBot.name}
          loading={deletingBot}
        />
      )}
      
      {/* Header */}
      <header className="border-b border-gray-900/50 backdrop-blur-sm bg-gray-950/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'landing' })}
                icon={ArrowLeft}
              >
                Voltar
              </Button>
              <Logo size="md" />
              <div>
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <p className="text-sm text-gray-400">Sessão: {state.user?.sessionId?.slice(0, 8)}...</p>
              </div>
            </div>
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
              <Button
                variant="outline"
                onClick={() => setShowDocuments(true)}
                icon={FileText}
              >
                Base de Conhecimento
              </Button>
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: 'SET_SHOW_API_KEY_MODAL', payload: true })}
                icon={Settings}
              >
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Bem-vindo ao Zaavy.ia
          </h1>
          <p className="text-gray-400">
            Gerencie seus bots inteligentes e automatize suas conversas no WhatsApp
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total de Bots</p>
                <p className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {state.bots.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {state.bots.length > 0 ? 'Bots criados' : 'Nenhum bot ainda'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:border-green-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Bots Ativos</p>
                <p className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors">
                  {stats.activeBots}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.activeBots > 0 ? 'Online agora' : 'Nenhum ativo'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Mensagens Totais</p>
                <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  {stats.totalMessages.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Todas as conversas
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <MessageCircle className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Hoje</p>
                <p className="text-3xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  {stats.todayMessages}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Mensagens hoje
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'create-bot' })}
              icon={Plus}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Criar Novo Bot
            </Button>
            <Button
              variant="outline"
              onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'saved-sessions' })}
              icon={BarChart3}
            >
              Ver Estatísticas
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDocuments(true)}
              icon={FileText}
            >
              Base de Conhecimento
            </Button>
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
          </div>
        </div>

        {/* Performance Metrics */}
        {state.bots.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <h3 className="font-semibold mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-blue-400" />
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Tempo médio de resposta</span>
                  <span className="font-medium text-green-400">{stats.avgResponseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Taxa de sucesso</span>
                  <span className="font-medium text-green-400">98.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Uptime</span>
                  <span className="font-medium text-green-400">99.9%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <h3 className="font-semibold mb-4 flex items-center">
                <Users className="w-4 h-4 mr-2 text-purple-400" />
                Usuários
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Usuários únicos</span>
                  <span className="font-medium">{Math.floor(stats.totalMessages * 0.6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Novos hoje</span>
                  <span className="font-medium text-blue-400">{Math.floor(stats.todayMessages * 0.4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Retornaram</span>
                  <span className="font-medium text-green-400">{Math.floor(stats.todayMessages * 0.6)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <h3 className="font-semibold mb-4 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-orange-400" />
                Tipos de Bot
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">IA</span>
                  <span className="font-medium text-purple-400">
                    {state.bots.filter(b => b.type === 'ai').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Regras</span>
                  <span className="font-medium text-green-400">
                    {state.bots.filter(b => b.type === 'rules').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Híbrido</span>
                  <span className="font-medium text-blue-400">
                    {state.bots.filter(b => b.type === 'hybrid').length}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Bots List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Seus Bots ({state.bots.length})</h2>
            {state.bots.length > 0 && (
              <Button
                variant="outline"
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'create-bot' })}
                icon={Plus}
                className="text-sm"
              >
                Novo Bot
              </Button>
            )}
          </div>
          
          {state.bots.length === 0 ? (
            <Card className="p-12 text-center bg-gray-900/30 backdrop-blur-sm border-gray-800">
              <Bot className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-3">Nenhum bot criado ainda</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Crie seu primeiro bot inteligente para começar a automatizar suas conversas no WhatsApp
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'create-bot' })}
                  icon={Plus}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Criar Primeiro Bot
                </Button>
                <Button
                  variant="outline"
                  onClick={() => dispatch({ type: 'SET_SHOW_API_KEY_MODAL', payload: true })}
                  icon={Key}
                >
                  Configurar OpenAI
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6">
              {state.bots.map((bot) => {
                const TypeIcon = getTypeIcon(bot.type);
                const typeColor = getTypeColor(bot.type);
                const typeLabel = getTypeLabel(bot.type);

                return (
                  <Card key={bot.id} className="p-6 bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-blue-500/30 transition-all duration-300 group" hover>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
                          <Bot className="w-7 h-7 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                            {bot.name}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <span className={`flex items-center ${typeColor}`}>
                              <TypeIcon className="w-4 h-4 mr-1" />
                              {typeLabel}
                            </span>
                            <span className="flex items-center">
                              <Zap className="w-4 h-4 mr-1" />
                              {bot.model || 'gpt-3.5-turbo'}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {bot.messagesCount} mensagens
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(bot.createdAt).toLocaleDateString('pt-BR')}
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
                              Última atividade: {new Date(bot.lastActivity).toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {/* Control Buttons */}
                          {bot.status === 'online' ? (
                            <Button
                              variant="ghost"
                              onClick={() => handleStopBot(bot.id)}
                              className="hover:bg-red-500/10 hover:text-red-400"
                              icon={Pause}
                            >
                              Parar
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => handleStartBot(bot.id)}
                              className="hover:bg-green-500/10 hover:text-green-400"
                              icon={Play}
                            >
                              Iniciar
                            </Button>
                          )}
                          
                          {/* AI Config Button (only for AI bots) */}
                          {bot.type === 'ai' && (
                            <Button
                              variant="ghost"
                              onClick={() => handleConfigureAI(bot)}
                              className="hover:bg-purple-500/10 hover:text-purple-400"
                              icon={Settings}
                            >
                              IA
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            onClick={() => {
                              dispatch({ type: 'SET_CURRENT_BOT', payload: bot.id });
                              dispatch({ type: 'SET_CURRENT_PAGE', payload: bot.type === 'ai' ? 'bot-session' : 'bot-builder' });
                            }}
                            className="hover:bg-blue-500/10 hover:text-blue-400"
                          >
                            {bot.type === 'ai' ? 'Abrir' : 'Editar'}
                          </Button>
                          {bot.type !== 'ai' && (
                            <Button
                              variant="ghost"
                              onClick={() => {
                                dispatch({ type: 'SET_CURRENT_BOT', payload: bot.id });
                                dispatch({ type: 'SET_CURRENT_PAGE', payload: 'bot-session' });
                              }}
                              className="hover:bg-green-500/10 hover:text-green-400"
                            >
                              Testar
                            </Button>
                          )}
                          
                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteBot(bot)}
                            className="hover:bg-red-500/10 hover:text-red-400"
                            icon={Trash2}
                          >
                            Deletar
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bot preview */}
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {bot.type === 'ai' ? (
                              <>
                                <span className="font-medium text-purple-400">Prompt:</span> {bot.prompt}
                              </>
                            ) : (
                              <>
                                <span className="font-medium text-green-400">Fluxo:</span> {
                                  bot.flowData?.nodes?.length 
                                    ? `${bot.flowData.nodes.length} blocos configurados`
                                    : 'Fluxo não configurado'
                                }
                              </>
                            )}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          {bot.type === 'ai' ? (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-500">
                                Temp: {bot.temperature || 0.7}
                              </div>
                              <div className="text-xs text-gray-500">
                                Tokens: {bot.maxTokens || 500}
                              </div>
                            </div>
                          ) : bot.flowData?.nodes && (
                          <div className="ml-4 text-right">
                            <div className="text-xs text-gray-500">
                              {bot.flowData.nodes.filter(n => n.type === 'condition').length} condições
                            </div>
                            <div className="text-xs text-gray-500">
                              {bot.flowData.nodes.filter(n => n.type === 'message').length} mensagens
                            </div>
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}