# Zaavy.ia Backend

Backend isolado para a plataforma Zaavy.ia de bots WhatsApp com IA.

## 🚀 Instalação Rápida

```bash
# Entre na pasta do backend
cd server

# Instale as dependências
npm install

# Configure as variáveis de ambiente (opcional)
cp .env.example .env

# Execute o servidor
npm run dev
```

## 📦 Dependências

- **express**: Servidor web
- **cors**: Configuração de CORS
- **socket.io**: Comunicação em tempo real
- **whatsapp-web.js**: Integração com WhatsApp
- **qrcode**: Geração de QR codes
- **openai**: Integração com ChatGPT
- **dotenv**: Variáveis de ambiente

## 🔧 Scripts Disponíveis

- `npm start`: Executa o servidor em produção
- `npm run dev`: Executa com nodemon (desenvolvimento)
- `npm test`: Placeholder para testes

## 🌐 Endpoints da API

### Sessões
- `POST /api/session/initialize`: Inicializar sessão
- `POST /api/session/openai-key`: Salvar chave OpenAI

### Bots
- `GET /api/bots`: Listar bots
- `POST /api/bots`: Criar bot
- `PUT /api/bots/:id`: Atualizar bot
- `DELETE /api/bots/:id`: Deletar bot

### Mensagens
- `GET /api/messages/:botId`: Listar mensagens do bot

### Saúde
- `GET /api/health`: Status do servidor

## 🔌 Socket.IO Events

### Cliente → Servidor
- `authenticate`: Autenticar sessão
- `create-bot`: Criar bot WhatsApp
- `disconnect-bot`: Desconectar bot

### Servidor → Cliente
- `authenticated`: Confirmação de autenticação
- `qr-code`: QR code para conexão
- `bot-ready`: Bot conectado
- `bot-disconnected`: Bot desconectado
- `new-message`: Nova mensagem recebida
- `bot-error`: Erro no bot

## 💾 Armazenamento

O backend usa armazenamento em memória para:
- Sessões de usuário
- Dados dos bots
- Mensagens
- Clientes WhatsApp ativos

## 🔒 Variáveis de Ambiente

```env
PORT=3001                           # Porta do servidor
NODE_ENV=development               # Ambiente
FRONTEND_URL=http://localhost:5173 # URL do frontend
```

## 🐛 Troubleshooting

### Erro de dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro de WhatsApp
- Verifique se o Chromium está instalado
- Tente limpar o cache: `rm -rf .wwebjs_auth`

### Erro de Socket.IO
- Verifique se o CORS está configurado corretamente
- Confirme se o frontend está na URL correta

## 📋 Requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Chromium/Chrome (para WhatsApp Web)

## 🔄 Desenvolvimento

O servidor reinicia automaticamente com `nodemon` quando arquivos são modificados.

Logs detalhados mostram:
- Conexões de clientes
- Geração de QR codes
- Status dos bots
- Mensagens processadas