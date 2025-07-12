# 🤖 Zaavy.ia - Plataforma de Bots WhatsApp com IA



**Uma plataforma completa para criar e gerenciar bots inteligentes no WhatsApp usando OpenAI GPT e whatsapp-web.js**


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
git clone https://github.com/SantiaGhou/zaavy.ia.git
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

```


### **4. Execute o Projeto**
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
│   ├── idex.js                     # Servidor
└── 📄 package.json                 # Dependências
```

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Frontend + Backend
npm run dev:frontend     # Apenas frontend
npm run server          # Apenas backend
"
# Produção
npm run build           # Build para produção
npm run preview         # Preview do build
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Veja como você pode ajudar:

### **1. 🍴 Fork o Projeto**
```bash
git clone https://github.com/SantiaGhou/zaavy.ia.git
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

![GitHub last commit](https://img.shields.io/github/last-commit/SantiaGhou/zaavy.ia?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/SantiaGhou/zaavy.ia?style=flat-square)
---

## 👨‍💻 Autor

<div align="center">

**Desenvolvido com ❤️ por [SantiaGhou](https://github.com/SantiaGhou)**

[![GitHub](https://img.shields.io/badge/GitHub-SantiaGhou-black?style=flat-square&logo=github)](https://github.com/SantiaGhou)


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

[![GitHub stars](https://img.shields.io/github/stars/SantiaGhou/zaavy.ia?style=social)](https://github.com/SantiaGhou/zaavy.ia/stargazers)

</div>