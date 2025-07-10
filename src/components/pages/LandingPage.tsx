import React, { useEffect, useState } from 'react';
import { Bot, MessageCircle, Zap, Shield, ArrowRight, Sparkles, Users, BarChart3, Play, CheckCircle } from 'lucide-react';
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
      description: 'Bots inteligentes que aprendem e se adaptam usando GPT',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Nativo',
      description: 'Integração perfeita via QR Code e whatsapp-web.js',
    },
    {
      icon: Zap,
      title: 'Setup em 2 Minutos',
      description: 'Configure e ative seus bots em segundos',
    },
    {
      icon: Shield,
      title: 'Seguro e Confiável',
      description: 'Dados protegidos com criptografia de ponta',
    },
  ];

  const benefits = [
    'Atendimento 24/7 automatizado',
    'Reduz 80% do tempo de resposta',
    'Integração nativa com WhatsApp',
    'Configuração sem código',
    'Respostas inteligentes com IA',
    'Fluxos personalizáveis'
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="relative z-10 border-b border-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <Button
              onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' })}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300">Powered by OpenAI GPT</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
                  Automatize seu
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  WhatsApp com IA
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                Crie bots inteligentes em minutos. Atenda clientes 24/7, automatize vendas e 
                escale seu negócio com a força da inteligência artificial.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' })}
                  icon={ArrowRight}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Criar Meu Bot Grátis
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-4 border-gray-600 hover:bg-gray-800"
                  icon={Play}
                >
                  Ver Demo
                </Button>
              </div>
              
              {/* Benefits List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
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
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Tudo que Você Precisa
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Funcionalidades poderosas para criar bots inteligentes e automatizar conversas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 text-center hover:scale-105 transition-all duration-300 bg-gray-900/50 backdrop-blur-sm border-gray-800 hover:border-blue-500/50 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Como Funciona
            </h2>
            <p className="text-xl text-gray-400">
              3 passos simples para ter seu bot funcionando
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Configure',
                description: 'Defina o nome e comportamento do seu bot',
                icon: Bot
              },
              {
                step: '2',
                title: 'Conecte',
                description: 'Escaneie o QR Code com seu WhatsApp',
                icon: MessageCircle
              },
              {
                step: '3',
                title: 'Automatize',
                description: 'Seu bot responde automaticamente 24/7',
                icon: Zap
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Pronto para Automatizar?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Crie seu primeiro bot agora e veja a diferença em segundos
            </p>
            <Button
              size="lg"
              onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' })}
              icon={Bot}
              className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Começar Gratuitamente
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-900/50 py-12 px-4 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <Logo size="md" />
          <p className="text-gray-400 mt-4">
            © 2024 Zaavy.ia. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}