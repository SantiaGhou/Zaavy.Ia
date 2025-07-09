import React, { useState, useEffect } from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export function ChatAnimation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const demoMessages: Message[] = [
    { id: 1, text: "Olá! Como posso ajudá-lo hoje?", sender: 'bot' },
    { id: 2, text: "Preciso de informações sobre seus produtos", sender: 'user' },
    { id: 3, text: "Claro! Temos várias opções disponíveis. Que tipo de produto você procura?", sender: 'bot' },
    { id: 4, text: "Estou interessado em automação", sender: 'user' },
    { id: 5, text: "Perfeito! Nossos bots de IA podem automatizar seu atendimento 24/7", sender: 'bot' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentIndex < demoMessages.length) {
        setMessages(prev => [...prev, demoMessages[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      } else {
        // Reset animation
        setTimeout(() => {
          setMessages([]);
          setCurrentIndex(0);
        }, 2000);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 h-80 overflow-hidden">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-800">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-xs text-gray-400 ml-4">WhatsApp Bot Demo</span>
      </div>
      
      <div className="space-y-3 h-full overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 animate-slide-up ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.sender === 'bot' ? 'bg-blue-600' : 'bg-gray-700'
            }`}>
              {message.sender === 'bot' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
              message.sender === 'bot'
                ? 'bg-gray-800 text-gray-200'
                : 'bg-blue-600 text-white'
            }`}>
              {message.text}
            </div>
          </div>
        ))}
        
        {messages.length > 0 && currentIndex < demoMessages.length && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800 px-3 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}