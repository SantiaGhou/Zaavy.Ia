# 🤖 Zaavy.ia - Plataforma de Bots WhatsApp com IA

<div align="center">

![Zaavy.ia Logo](https://img.shields.io/badge/Zaavy.ia-Bot%20Platform-blue?style=for-the-badge&logo=whatsapp&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-purple?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-orange?style=flat-square&logo=openai)](https://openai.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Web.js-green?style=flat-square&logo=whatsapp)](https://wwebjs.dev/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/zaavy-ia?style=flat-square)](https://github.com/yourusername/zaavy-ia/stargazers)

**Uma plataforma completa para criar e gerenciar bots inteligentes no WhatsApp usando OpenAI GPT e whatsapp-web.js**

[🚀 Demo](https://zaavy-ia.vercel.app) • [📖 Documentação](#-documentação) • [🐛 Reportar Bug](https://github.com/yourusername/zaavy-ia/issues) • [💡 Solicitar Feature](https://github.com/yourusername/zaavy-ia/issues)

</div>

---

## ✨ Funcionalidades

### 🤖 **Tipos de Bots Inteligentes**
- **Bot com IA**: Respostas inteligentes usando GPT-3.5-turbo
- **Bot com Regras**: Fluxo fixo de perguntas e respostas
- **Bot Híbrido**: Combina regras fixas com inteligência artificial

### 🎨 **Interface Moderna**
- **Design Dark**: Interface elegante com tema escuro
- **Construtor Visual**: Drag-and-drop para criar fluxos
- **Dashboard Completo**: Estatísticas e métricas em tempo real
- **Responsivo**: Funciona perfeitamente em todos os dispositivos

### ⚡ **Funcionalidades Avançadas**
- **Conexão Real WhatsApp**: Via QR Code e whatsapp-web.js
- **Tempo Real**: Socket.IO para comunicação instantânea
- **Sessões Isoladas**: Cada bot tem sua própria sessão
- **Histórico Completo**: Todas as conversas são salvas
- **Prompts Personalizados**: Configure o comportamento de cada bot

---

## 🛠️ Stack Tecnológica

### **Frontend**
- ⚛️ **React 18** + TypeScript
- 🎨 **Tailwind CSS** para estilização
- 📡 **Socket.IO Client** para tempo real
- 🎯 **Lucide React** para ícones
- 🔄 **Context API** para gerenciamento de estado

### **Backend**
- 🚀 **Node.js** + Express
- 📡 **Socket.IO** para comunicação em tempo real
- 📱 **WhatsApp Web.js** para integração WhatsApp
- 🤖 **OpenAI API** para inteligência artificial
- 🗄️ **Prisma ORM** + SQLite para banco de dados

### **DevOps & Ferramentas**
- 📦 **ES Modules** (ESM) em todo o projeto
- 🔧 **Concurrently** para desenvolvimento
- 🔄 **Nodemon** para hot reload
- 📊 **QRCode** para geração de códigos

---

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ instalado
- Conta OpenAI com API Key
- WhatsApp instalado no celular

### **1. Clone o Repositório**
```bash
git clone https://github.com/yourusername/zaavy-ia.git
cd zaavy-ia
```

### **2. Instale as Dependências**
```bash
npm install
```

### **3. Configure as Variáveis de Ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
# OpenAI Configuration
OPENAI_API_KEY=sua_chave_openai_aqui

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="file:./dev.db"
```

### **4. Configure o Banco de Dados**
```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar schema ao banco
npm run db:push
```

### **5. Execute o Projeto**
```bash
# Executar frontend e backend simultaneamente
npm run dev

# Ou executar separadamente:
npm run dev:frontend  # Frontend (porta 5173)
npm run server        # Backend (porta 3001)
```

---

## 📖 Como Usar

### **1. 🎯 Acesso Rápido**
- Acesse `http://localhost:5173`
- Clique em "Começar Agora" - sem necessidade de cadastro!
- Uma sessão única é criada automaticamente

### **2. ⚙️ Configuração OpenAI**
- Configure sua chave da OpenAI no modal que aparece
- Obtenha sua chave em: [OpenAI Platform](https://platform.openai.com/account/api-keys)

### **3. 🤖 Criando Bots**

#### **Bot com IA**
1. Dashboard → "Criar Novo Bot"
2. Escolha "Bot com IA"
3. Configure nome e prompt personalizado
4. Escaneie o QR Code com seu WhatsApp
5. Pronto! Seu bot responde automaticamente

#### **Bot com Regras**
1. Dashboard → "Criar Novo Bot"
2. Escolha "Bot com Regras"
3. Use o construtor visual para criar o fluxo
4. Adicione condições e respostas
5. Teste e ative seu bot

#### **Bot Híbrido**
1. Combine regras fixas com blocos de IA
2. Configure prompts específicos para cada contexto
3. Máxima flexibilidade e controle

---

## 🎨 Screenshots

<div align="center">

### 🏠 Landing Page
![Landing Page](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Landing+Page+Screenshot)

### 📊 Dashboard
![Dashboard](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Dashboard+Screenshot)

### 🛠️ Construtor de Fluxo
![Bot Builder](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Bot+Builder+Screenshot)

### 💬 Chat Interface
![Chat Interface](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Chat+Interface+Screenshot)

</div>

---

## 🏗️ Arquitetura do Projeto

```
zaavy-ia/
├── 📁 src/                          # Frontend React
│   ├── 📁 components/               # Componentes React
│   │   ├── 📁 pages/               # Páginas da aplicação
│   │   └── 📁 ui/                  # Componentes de UI
│   ├── 📁 context/                 # Context API
│   ├── 📁 services/                # Serviços e APIs
│   └── 📁 types/                   # Tipos TypeScript
├── 📁 server/                      # Backend Node.js
│   ├── 📁 config/                  # Configurações
│   ├── 📁 controllers/             # Controladores
│   ├── 📁 middleware/              # Middlewares
│   ├── 📁 routes/                  # Rotas da API
│   ├── 📁 services/                # Serviços do backend
│   └── 📁 sockets/                 # Handlers Socket.IO
├── 📁 prisma/                      # Schema do banco
└── 📄 package.json                 # Dependências
```

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Frontend + Backend
npm run dev:frontend     # Apenas frontend
npm run server          # Apenas backend

# Banco de Dados
npm run db:generate     # Gerar cliente Prisma
npm run db:push         # Aplicar schema
npm run db:studio       # Interface visual do banco
npm run db:reset        # Resetar banco

# Produção
npm run build           # Build para produção
npm run preview         # Preview do build
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Veja como você pode ajudar:

### **1. 🍴 Fork o Projeto**
```bash
git clone https://github.com/yourusername/zaavy-ia.git
```

### **2. 🌿 Crie uma Branch**
```bash
git checkout -b feature/nova-funcionalidade
```

### **3. 💾 Commit suas Mudanças**
```bash
git commit -m "feat: adiciona nova funcionalidade incrível"
```

### **4. 📤 Push para a Branch**
```bash
git push origin feature/nova-funcionalidade
```

### **5. 🔄 Abra um Pull Request**

---

## 📋 Roadmap

### **🎯 Próximas Funcionalidades**
- [ ] 📊 Analytics avançados
- [ ] 🔄 Integração com outras plataformas
- [ ] 🎨 Temas personalizáveis
- [ ] 📱 App mobile
- [ ] 🌐 Suporte multi-idioma
- [ ] 🔐 Autenticação avançada
- [ ] 💾 Backup automático
- [ ] 📈 Métricas de performance

### **🐛 Melhorias Planejadas**
- [ ] Otimização de performance
- [ ] Testes automatizados
- [ ] Documentação expandida
- [ ] Docker support
- [ ] CI/CD pipeline

---

## 🔒 Segurança

- 🔐 **Sessões isoladas** por usuário
- 🛡️ **API Keys protegidas** e criptografadas
- ✅ **Validação de entrada** em todas as rotas
- 🔒 **Dados locais** não compartilhados
- 🚫 **Sem coleta** de dados pessoais

---

## 📊 Status do Projeto

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/zaavy-ia?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/yourusername/zaavy-ia?style=flat-square)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/zaavy-ia?style=flat-square)

---

## 👨‍💻 Autor

<div align="center">

**Desenvolvido com ❤️ por [Seu Nome](https://github.com/yourusername)**

[![GitHub](https://img.shields.io/badge/GitHub-yourusername-black?style=flat-square&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Seu%20Nome-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/yourprofile)
[![Twitter](https://img.shields.io/badge/Twitter-@yourusername-blue?style=flat-square&logo=twitter)](https://twitter.com/yourusername)

</div>

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- 🤖 **OpenAI** pela API GPT incrível
- 📱 **WhatsApp Web.js** pela integração perfeita
- ⚛️ **React Team** pelo framework fantástico
- 🎨 **Tailwind CSS** pelo design system
- 🗄️ **Prisma** pelo ORM moderno

---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/zaavy-ia?style=social)](https://github.com/yourusername/zaavy-ia/stargazers)

</div>