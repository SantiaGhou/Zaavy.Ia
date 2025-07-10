# Zaavy.ia - Plataforma de Bots WhatsApp com IA

Uma plataforma completa para criar e gerenciar bots inteligentes no WhatsApp usando OpenAI GPT e whatsapp-web.js.

## 🚀 Funcionalidades

- **Integração OpenAI**: Bots inteligentes usando GPT-3.5-turbo
- **WhatsApp Web.js**: Conexão real com WhatsApp via QR Code
- **Interface Moderna**: Design escuro inspirado na Vercel
- **Tempo Real**: Socket.IO para comunicação em tempo real
- **Gerenciamento Completo**: Criar, conectar, pausar e deletar bots
- **Histórico de Mensagens**: Todas as conversas são salvas
- **Prompts Personalizados**: Configure o comportamento de cada bot

## 🛠️ Tecnologias

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Socket.IO Client
- Lucide React (ícones)

### Backend
- Node.js + Express
- Socket.IO
- WhatsApp Web.js
- OpenAI API
- QRCode

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente no arquivo `.env`:
```env
OPENAI_API_KEY=sua_chave_openai_aqui
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Execute o projeto completo:
```bash
npm run dev:full
```

Ou execute separadamente:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

## 🔧 Configuração

### OpenAI API Key
1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Crie uma conta e gere uma API Key
3. Adicione a chave no arquivo `.env`

### WhatsApp
- O sistema gera automaticamente QR Codes para conectar ao WhatsApp
- Cada bot tem sua própria sessão isolada
- As sessões são mantidas usando LocalAuth

## 📱 Como Usar

1. **Landing Page**: Acesse a página inicial
2. **Login**: Faça login ou crie uma conta
3. **Dashboard**: Visualize seus bots e estatísticas
4. **Criar Bot**: Configure nome e prompt personalizado
5. **Conectar**: Escaneie o QR Code com seu WhatsApp
6. **Automatizar**: Seu bot responderá automaticamente usando IA

## 🎨 Design

- **Tema**: Escuro com toques neon (azul/roxo)
- **Inspiração**: Vercel.com
- **Animações**: Suaves e fluidas
- **Responsivo**: Funciona em todos os dispositivos
- **Acessibilidade**: Contrastes adequados e navegação por teclado

## 🔒 Segurança

- Sessões isoladas por bot
- Dados criptografados
- API Keys protegidas
- Validação de entrada

## 📊 Monitoramento

- Status de conexão em tempo real
- Histórico completo de mensagens
- Estatísticas de uso
- Logs de erro

## 🚀 Deploy

Para produção, configure:
- Banco de dados (substituir armazenamento em memória)
- Redis para sessões
- PM2 para gerenciamento de processos
- HTTPS/SSL
- Variáveis de ambiente de produção

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.