import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bot, MessageCircle, Send, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Logo } from '../ui/Logo';
import { QRCodeDisplay } from '../ui/QRCodeDisplay';
import { LoadingBot } from '../ui/LoadingBot';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export function BotSession() {
  const { state, dispatch } = useApp();
  const [message, setMessage] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const currentBot = state.bots.find(bot => bot.id === state.currentBotId);
  const botMessages = state.messages.filter(msg => msg.botId === state.currentBotId);

  useEffect(() => {
    const loadMessages = async () => {
      if (state.currentBotId) {
        try {
          const messages = await apiService.getMessages(state.currentBotId);
          messages.forEach(msg => {
            dispatch({ type: 'ADD_MESSAGE', payload: {
              ...msg,
              id: msg.id,
              botId: msg.botId,
              timestamp: new Date(msg.timestamp)
            }});
          });
        } catch (error) {
          console.error('Error loading messages:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadMessages();
  }, [state.currentBotId, dispatch]);

  useEffect(() => {
    const socket = apiService.connect();
    
    socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('✅ Socket authenticated successfully');
      } else {
        console.error('❌ Socket authentication failed:', data.error);
      }
    });
    
    socket.on('qr-code', (data) => {
      console.log('📱 QR Code received from backend:', data);
      if (data.botId === state.currentBotId) {
        console.log('📱 Setting QR Code for current bot:', data.botId);
        setQrCode(data.qrCode);
        setIsConnecting(true);
        setLoading(false);
      }
    });

    socket.on('bot-ready', (data) => {
      console.log('✅ Bot ready event received:', data);
      if (data.botId === state.currentBotId) {
        dispatch({
          type: 'UPDATE_BOT',
          payload: {
            id: data.botId,
            updates: {
              status: 'online',
              isConnected: true,
              lastActivity: new Date(),
            }
          }
        });
        setQrCode(null);
        setIsConnecting(false);
        setLoading(false);
      }
    });

    socket.on('new-message', (messageData) => {
      if (messageData.botId === state.currentBotId) {
        dispatch({ type: 'ADD_MESSAGE', payload: messageData });
      }
    });

    socket.on('bot-disconnected', (data) => {
      console.log('❌ Bot disconnected event received:', data);
      if (data.botId === state.currentBotId) {
        dispatch({
          type: 'UPDATE_BOT',
          payload: {
            id: data.botId,
            updates: {
              status: 'offline',
              isConnected: false,
            }
          }
        });
        setQrCode(null);
        setIsConnecting(false);
      }
    });

    socket.on('bot-error', (data) => {
      console.error('❌ Bot error received:', data);
      if (data.botId === state.currentBotId) {
        setLoading(false);
        setIsConnecting(false);
      }
    });

    return () => {
      socket.off('authenticated');
      socket.off('qr-code');
      socket.off('bot-ready');
      socket.off('new-message');
      socket.off('bot-disconnected');
      socket.off('bot-error');
    };
  }, [state.currentBotId, dispatch]);

  useEffect(() => {
    if (currentBot && !currentBot.isConnected) {
      console.log('🔄 Attempting to create bot:', currentBot.id);
      setLoading(true);
      setIsConnecting(false);
      setQrCode(null);
      
      const socket = apiService.getSocket();
      if (socket) {
        console.log('🔄 Emitting create-bot event for:', currentBot.id);
        socket.emit('create-bot', {
          botId: currentBot.id
        });
      } else {
        console.error('❌ Socket not available');
        setLoading(false);
      }
    }
  }, [currentBot]);

  const handleConnect = () => {
    console.log('Connection will be handled automatically via QR code scan');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentBot) return;

    const userMessage = {
      id: Date.now().toString(),
      botId: currentBot.id,
      content: message,
      sender: 'user' as const,
      timestamp: new Date(),
      phoneNumber: '+55 11 99999-9999',
      userName: 'Usuário Teste',
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        botId: currentBot.id,
        content: `Olá! Recebi sua mensagem: "${message}". Como posso ajudá-lo?`,
        sender: 'bot' as const,
        timestamp: new Date(),
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: botResponse });
      dispatch({
        type: 'UPDATE_BOT',
        payload: {
          id: currentBot.id,
          updates: {
            messagesCount: currentBot.messagesCount + 2,
            lastActivity: new Date(),
          }
        }
      });
    }, 1000);

    setMessage('');
  };

  const handleDeleteBot = () => {
    if (currentBot && confirm('Tem certeza que deseja deletar este bot? Esta ação não pode ser desfeita.')) {
      apiService.deleteBot(currentBot.id).then(() => {
        dispatch({ type: 'DELETE_BOT', payload: currentBot.id });
        dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' });
      }).catch(error => {
        console.error('Error deleting bot:', error);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <LoadingBot message="Conectando bot..." size="lg" />
      </div>
    );
  }

  if (!currentBot) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Bot não encontrado</h2>
          <Button
            onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' })}
            icon={ArrowLeft}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-black text-white">
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
            <div className="flex items-center space-x-4">
              <Badge variant={currentBot.status === 'online' ? 'success' : 'error'}>
                {currentBot.status === 'online' ? 'Online' : 'Offline'}
              </Badge>
              <Button
                variant="ghost"
                onClick={handleDeleteBot}
                icon={Trash2}
              >
                Deletar Bot
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Bot className="w-12 h-12 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">{currentBot.name}</h1>
              <p className="text-gray-400">
                {currentBot.messagesCount} mensagens • Criado em {new Date(currentBot.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <Card className="p-4">
            <h3 className="font-medium mb-2">Prompt Configurado:</h3>
            <p className="text-gray-300 text-sm">{currentBot.prompt}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Status da Conexão</h2>
            
            {!state.user?.hasOpenAIKey && (
              <Card className="p-6 text-center bg-yellow-900/20 backdrop-blur-sm border-yellow-600/50 mb-4">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-medium mb-2 text-yellow-300">OpenAI não configurada</h3>
                <p className="text-yellow-200 mb-4 text-sm">
                  Configure sua chave da OpenAI para que o bot possa responder com inteligência artificial.
                </p>
              </Card>
            )}

            <QRCodeDisplay
              qrCode={qrCode}
              isConnecting={isConnecting}
              isConnected={currentBot.isConnected}
              botName={currentBot.name}
              onRetry={() => {
                console.log('🔄 Retry button clicked, recreating bot');
                setLoading(true);
                setIsConnecting(false);
                setQrCode(null);
                
                const socket = apiService.getSocket();
                if (socket) {
                  socket.emit('create-bot', { botId: currentBot.id });
                } else {
                  console.error('❌ Socket not available for retry');
                  setLoading(false);
                }
              }}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Mensagens</h2>
            
            <Card className="p-4 h-96 flex flex-col bg-gray-900/50 backdrop-blur-sm border-gray-800">
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {loading ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Carregando mensagens...</p>
                  </div>
                ) : botMessages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  botMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {currentBot.isConnected && (
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite uma mensagem de teste..."
                    className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <Button type="submit" disabled={!message.trim()} icon={Send}>
                    Enviar
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}