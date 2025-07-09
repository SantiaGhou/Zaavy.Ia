import React from 'react';
import { ArrowLeft, Bot, Calendar, MessageCircle, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Logo } from '../ui/Logo';
import { useApp } from '../../context/AppContext';

export function SavedSessions() {
  const { state, dispatch } = useApp();

  const handleReconnect = (botId: string) => {
    dispatch({
      type: 'UPDATE_BOT',
      payload: {
        id: botId,
        updates: {
          status: 'online',
          isConnected: true,
          lastActivity: new Date(),
        }
      }
    });
  };

  const handlePause = (botId: string) => {
    dispatch({
      type: 'UPDATE_BOT',
      payload: {
        id: botId,
        updates: {
          status: 'offline',
          isConnected: false,
        }
      }
    });
  };

  const handleDelete = (botId: string) => {
    if (confirm('Tem certeza que deseja deletar este bot?')) {
      dispatch({ type: 'DELETE_BOT', payload: botId });
    }
  };

  const handleOpenSession = (botId: string) => {
    dispatch({ type: 'SET_CURRENT_BOT', payload: botId });
    dispatch({ type: 'SET_CURRENT_PAGE', payload: 'bot-session' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sessões Salvas</h1>
          <p className="text-gray-400">
            Gerencie todos os seus bots e suas sessões do WhatsApp
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total de Bots</p>
                <p className="text-xl font-bold">{state.bots.length}</p>
              </div>
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ativos</p>
                <p className="text-xl font-bold">
                  {state.bots.filter(bot => bot.status === 'online').length}
                </p>
              </div>
              <Play className="w-6 h-6 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pausados</p>
                <p className="text-xl font-bold">
                  {state.bots.filter(bot => bot.status === 'offline').length}
                </p>
              </div>
              <Pause className="w-6 h-6 text-yellow-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Mensagens</p>
                <p className="text-xl font-bold">
                  {state.bots.reduce((sum, bot) => sum + bot.messagesCount, 0)}
                </p>
              </div>
              <MessageCircle className="w-6 h-6 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Bots List */}
        <div className="space-y-4">
          {state.bots.length === 0 ? (
            <Card className="p-8 text-center">
              <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma sessão salva</h3>
              <p className="text-gray-400 mb-4">
                Crie seu primeiro bot para começar a gerenciar sessões
              </p>
              <Button
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'create-bot' })}
              >
                Criar Bot
              </Button>
            </Card>
          ) : (
            state.bots.map((bot) => (
              <Card key={bot.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Bot className="w-10 h-10 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-lg">{bot.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {bot.createdAt.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {bot.messagesCount} mensagens
                        </span>
                        {bot.lastActivity && (
                          <span>
                            Última atividade: {bot.lastActivity.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Badge variant={bot.status === 'online' ? 'success' : 'error'}>
                      {bot.status === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => handleOpenSession(bot.id)}
                      >
                        Abrir
                      </Button>
                      
                      {bot.status === 'online' ? (
                        <Button
                          variant="ghost"
                          onClick={() => handlePause(bot.id)}
                          icon={Pause}
                        >
                          Pausar
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => handleReconnect(bot.id)}
                          icon={Play}
                        >
                          Reconectar
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(bot.id)}
                        icon={Trash2}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Prompt:</span> {bot.prompt}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}