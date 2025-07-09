import React, { useEffect, useState } from 'react';
import { Bot, MessageCircle, Zap, Shield, ArrowRight, Sparkles, Users, BarChart3 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Logo } from '../ui/Logo';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { ChatAnimation } from '../ui/ChatAnimation';
import { useApp } from '../../context/AppContext';

export function LandingPage() {
  const { dispatch } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Bot,
      title: 'IA Avançada',
      description: 'Bots inteligentes que aprendem e se adaptam às suas necessidades usando GPT',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Nativo',
      description: 'Integração perfeita com o WhatsApp através de QR Code e whatsapp-web.js',
    },
    {
      icon: Zap,
      title: 'Configuração Rápida',
      description: 'Crie e configure seus bots em minutos, não horas',
    },
    {
      icon: Shield,
      title: 'Seguro e Confiável',
      description: 'Suas conversas e dados estão protegidos com criptografia',
    },
  ];

  const stats = [
    { icon: Users, value: '10K+', label: 'Usuários Ativos' },
    { icon: MessageCircle, value: '1M+', label: 'Mensagens Processadas' },
    { icon: Bot, value: '5K+', label: 'Bots Criados' },
    { icon: BarChart3, value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'login' })}
              >
                Entrar
              </Button>
              <Button
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'login' })}
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300">Powered by OpenAI GPT</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
                  Bots Inteligentes
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  para WhatsApp
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Crie, gerencie e otimize bots com inteligência artificial no WhatsApp. 
                Automatize suas conversas, melhore o atendimento ao cliente e escale seu negócio 24/7.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'login' })}
                  icon={ArrowRight}
                  className="text-lg px-8 py-4"
                >
                  Criar Meu Bot Grátis
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4"
                >
                  Ver Demonstração
                </Button>
              </div>
              
              <div className="flex items-center space-x-8 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="w-5 h-5 text-blue-400 mr-2" />
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <span className="text-sm text-gray-400">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-10'} delay-300`}>
              <ChatAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Funcionalidades Poderosas
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Tudo que você precisa para criar bots inteligentes e automatizar suas conversas no WhatsApp
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-8 text-center hover:scale-105 transition-all duration-300 bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-blue-500/50 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 py-32 px-4 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Em apenas 3 passos simples, seu bot estará funcionando
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Configure seu Bot',
                description: 'Defina o nome e o prompt personalizado que determinará como seu bot irá responder',
                icon: Bot
              },
              {
                step: '02',
                title: 'Conecte ao WhatsApp',
                description: 'Escaneie o QR Code gerado para conectar seu bot ao WhatsApp Web',
                icon: MessageCircle
              },
              {
                step: '03',
                title: 'Automatize Conversas',
                description: 'Seu bot está pronto! Ele responderá automaticamente usando inteligência artificial',
                icon: Zap
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Pronto para Revolucionar suas Conversas?
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Junte-se a milhares de empresas que já automatizam suas conversas com Zaavy.ia
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'login' })}
                icon={Bot}
                className="text-lg px-10 py-4"
              >
                Criar Meu Primeiro Bot
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-10 py-4"
              >
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900/50 py-16 px-4 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <Logo size="md" />
          <p className="text-gray-400 mt-6 text-lg">
            © 2024 Zaavy.ia. Todos os direitos reservados.
          </p>
          <div className="flex justify-center space-x-8 mt-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Termos</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}