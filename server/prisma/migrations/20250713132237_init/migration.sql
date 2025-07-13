-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "openaiKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "prompt" TEXT DEFAULT 'Você é um assistente útil e amigável.',
    "type" TEXT NOT NULL DEFAULT 'ai',
    "status" TEXT NOT NULL DEFAULT 'offline',
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "model" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    "maxTokens" INTEGER NOT NULL DEFAULT 500,
    "flowData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastActivity" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "bots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phoneNumber" TEXT NOT NULL,
    "userName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "context" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastMessage" DATETIME,
    "botId" TEXT NOT NULL,
    CONSTRAINT "conversations_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "userName" TEXT,
    "tokensUsed" INTEGER,
    "model" TEXT,
    "temperature" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "botId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    CONSTRAINT "messages_botId_fkey" FOREIGN KEY ("botId") REFERENCES "bots" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "chunks" TEXT NOT NULL,
    "embeddings" TEXT,
    "pageCount" INTEGER,
    "language" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_sessionId_key" ON "users"("sessionId");

-- CreateIndex
CREATE INDEX "bots_userId_idx" ON "bots"("userId");

-- CreateIndex
CREATE INDEX "conversations_botId_idx" ON "conversations"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_botId_phoneNumber_key" ON "conversations"("botId", "phoneNumber");

-- CreateIndex
CREATE INDEX "messages_botId_idx" ON "messages"("botId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "documents_userId_idx" ON "documents"("userId");
