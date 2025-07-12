import React, { useState, useEffect } from 'react';
import { QrCode, Smartphone, Wifi, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

interface QRCodeDisplayProps {
  qrCode: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  botName: string;
  onRetry?: () => void;
}

export function QRCodeDisplay({ 
  qrCode, 
  isConnecting, 
  isConnected, 
  botName,
  onRetry 
}: QRCodeDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Reset states when qrCode changes
  useEffect(() => {
    if (qrCode) {
      setImageLoaded(false);
      setImageError(false);
      setCountdown(120); // 2 minutes countdown
    }
  }, [qrCode]);

  // Countdown timer for QR code expiration
  useEffect(() => {
    if (countdown > 0 && qrCode && !isConnected) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, qrCode, isConnected]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isConnected) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-green-300 mb-2">
          WhatsApp Conectado!
        </h3>
        <p className="text-green-200 mb-4">
          O bot <strong>{botName}</strong> está ativo e pronto para receber mensagens
        </p>
        <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-300 font-medium">Online</span>
        </div>
      </Card>
    );
  }

  if (!qrCode && !isConnecting) {
    return (
      <Card className="p-8 text-center bg-gray-900/50 backdrop-blur-sm border-gray-800">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <QrCode className="w-10 h-10 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Preparando Conexão</h3>
        <p className="text-gray-400 mb-6">
          Inicializando o bot <strong>{botName}</strong>...
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
        </div>
        {onRetry && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={onRetry}
              icon={RotateCcw}
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              Tentar Novamente
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border-gray-800">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {isConnecting ? 'Aguardando Conexão...' : 'Conectar ao WhatsApp'}
        </h3>
        <p className="text-gray-400">
          Escaneie o QR Code abaixo com seu WhatsApp
        </p>
      </div>

      {/* QR Code Container */}
      <div className="relative mb-6">
        <div className="bg-white rounded-2xl p-6 mx-auto w-fit shadow-2xl">
          {qrCode ? (
            <div className="relative">
              {!imageLoaded && !imageError && (
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {imageError && (
                <div className="w-64 h-64 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-600">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <span className="text-sm">Erro ao carregar QR Code</span>
                  {onRetry && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      icon={RotateCcw}
                      className="mt-2 text-gray-600 border-gray-400"
                    >
                      Tentar Novamente
                    </Button>
                  )}
                </div>
              )}
              
              <img
                src={qrCode}
                alt="QR Code para conectar WhatsApp"
                className={`w-64 h-64 rounded-lg transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ display: imageError ? 'none' : 'block' }}
              />
              
              {/* QR Code Border Animation */}
              {imageLoaded && !imageError && (
                <div className="absolute inset-0 border-2 border-blue-500/30 rounded-lg animate-pulse"></div>
              )}
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-600">
                <QrCode className="w-12 h-12 mx-auto mb-2" />
                <span className="text-sm">Gerando QR Code...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Countdown Timer */}
        {countdown > 0 && imageLoaded && !imageError && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-xs text-white font-mono">
              {formatTime(countdown)}
            </span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-4">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
          <h4 className="font-medium text-blue-300 mb-3 flex items-center">
            <Smartphone className="w-4 h-4 mr-2" />
            Como conectar:
          </h4>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">1</span>
              <span>Abra o WhatsApp no seu celular</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">2</span>
              <span>Toque em "Mais opções" (⋮) e depois em "Aparelhos conectados"</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">3</span>
              <span>Toque em "Conectar um aparelho"</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0">4</span>
              <span>Aponte a câmera para o QR Code acima</span>
            </li>
          </ol>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${qrCode ? 'bg-green-400' : 'bg-gray-600'}`}></div>
            <span className={qrCode ? 'text-green-400' : 'text-gray-500'}>QR Code</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`}></div>
            <span className={isConnecting ? 'text-yellow-400' : 'text-gray-500'}>Aguardando</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-600'}`}></div>
            <span className={isConnected ? 'text-green-400' : 'text-gray-500'}>Conectado</span>
          </div>
        </div>

        {/* Retry Button */}
        {(countdown === 0 || imageError) && onRetry && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={onRetry}
              icon={RotateCcw}
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
            >
              Gerar Novo QR Code
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}