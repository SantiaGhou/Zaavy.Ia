# Backend

Backend completo para a plataforma Zaavy.ia de bots WhatsApp com IA.

**Repositório:** [SantiaGhou/Zaavy.Ia](https://github.com/SantiaGhou/Zaavy.Ia)
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
- **prisma**: ORM para banco de dados
- **pdf-parse**: Processamento de PDFs
- **multer**: Upload de arquivos
- **tiktoken**: Contagem de tokens

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
- `POST /api/bots/:id/stop`: Parar bot
- `POST /api/bots/:id/start`: Iniciar bot

### Mensagens
- `GET /api/messages/:botId`: Listar mensagens do bot

### Documentos
- `POST /api/documents/upload`: Upload de PDF
- `GET /api/documents`: Listar documentos
- `DELETE /api/documents/:id`: Deletar documento
- `GET /api/documents/search/:query`: Buscar documentos

### IA
- `GET /api/ai/models`: Modelos disponíveis
- `POST /api/ai/validate-key`: Validar chave OpenAI
- `POST /api/ai/test`: Testar configuração

### Conversas
- `GET /api/conversations/:botId`: Listar conversas
- `GET /api/conversations/:botId/stats`: Estatísticas

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

O backend usa:
- **Prisma + SQLite**: Dados persistentes (usuários, bots, mensagens, documentos)
- **Memória**: Sessões temporárias e clientes WhatsApp ativos
- **Sistema de arquivos**: PDFs enviados (pasta uploads/)

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
- Espaço em disco para uploads de PDFs

## 🔄 Desenvolvimento

O servidor reinicia automaticamente com `nodemon` quando arquivos são modificados.

Logs detalhados mostram:
- Conexões de clientes
- Geração de QR codes
- Status dos bots
- Mensagens processadas
- Uploads de documentos
- Operações de banco de dados

## 🗄️ Banco de Dados

O projeto usa Prisma com SQLite para desenvolvimento. Para produção, pode ser facilmente migrado para PostgreSQL ou MySQL.

### Comandos Úteis
```bash
# Visualizar banco
npx prisma studio

# Reset completo
npx prisma db push --force-reset

# Gerar cliente
npx prisma generate
```

## 📄 Processamento de PDFs

- Suporte a arquivos até 10MB
- Extração automática de texto
- Divisão em chunks para melhor processamento
- Busca semântica no conteúdo

## 🤖 Configurações de IA

- Múltiplos modelos OpenAI suportados
- Controle de temperature (criatividade)
- Configuração de tokens máximos
- Validação automática de chaves API

---

**Desenvolvido por [SantiaGhou](https://github.com/SantiaGhou)**  
**Repositório:** [Zaavy.Ia](https://github.com/SantiaGhou/Zaavy.Ia)