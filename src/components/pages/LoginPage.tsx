import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Logo } from '../ui/Logo';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export function LoginPage() {
  const { dispatch } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await apiService.login(email, password);
      } else {
        result = await apiService.register(name, email, password);
      }

      dispatch({ type: 'SET_USER', payload: result.user });
      dispatch({ type: 'SET_TOKEN', payload: result.token });
      dispatch({ type: 'SET_AUTHENTICATED', payload: true });
      
      // Check if user needs to configure OpenAI key
      if (!result.user.hasOpenAIKey) {
        dispatch({ type: 'SET_SHOW_API_KEY_MODAL', payload: true });
      }
      
      dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' });
    } catch (error) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'landing' })}
            icon={ArrowLeft}
          >
            Voltar
          </Button>
          <Logo size="sm" />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Acesse sua conta Zaavy.ia' : 'Crie sua conta e comece agora'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <Input
              label="Nome"
              placeholder="Seu nome completo"
              value={name}
              onChange={setName}
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={setEmail}
            required
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-500 hover:text-blue-400 transition-colors"
            >
              {isLogin ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}