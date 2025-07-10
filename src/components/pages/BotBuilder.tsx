import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MessageSquare, Settings, Zap, Trash2, Save, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Logo } from '../ui/Logo';
import { useApp } from '../../context/AppContext';
import { FlowNode, FlowConnection, Condition } from '../../types';
import { apiService } from '../../services/api';

export function BotBuilder() {
  const { state, dispatch } = useApp();
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [connections, setConnections] = useState<FlowConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentBot = state.bots.find(bot => bot.id === state.currentBotId);

  useEffect(() => {
    if (currentBot?.flowData) {
      setNodes(currentBot.flowData.nodes || []);
      setConnections(currentBot.flowData.connections || []);
    } else {
      // Initialize with a welcome trigger
      const welcomeNode: FlowNode = {
        id: 'welcome',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Início da Conversa',
          message: 'Quando alguém iniciar uma conversa'
        }
      };
      setNodes([welcomeNode]);
    }
  }, [currentBot]);

  const addNode = (type: FlowNode['type']) => {
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type,
      position: { x: 300, y: 200 + nodes.length * 100 },
      data: {
        label: getNodeLabel(type),
        message: type === 'message' ? 'Digite sua mensagem aqui...' : undefined,
        conditions: type === 'condition' ? [] : undefined,
        aiPrompt: type === 'ai' ? 'Responda de forma útil e amigável.' : undefined,
        responses: type === 'message' ? [''] : undefined
      }
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };

  const getNodeLabel = (type: FlowNode['type']) => {
    switch (type) {
      case 'message': return 'Enviar Mensagem';
      case 'condition': return 'Verificar Condição';
      case 'ai': return 'Resposta com IA';
      case 'action': return 'Ação';
      default: return 'Novo Bloco';
    }
  };

  const updateNode = (nodeId: string, updates: Partial<FlowNode['data']>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setConnections(connections.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const addCondition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.data.conditions) {
      const newCondition: Condition = {
        id: `condition_${Date.now()}`,
        type: 'contains',
        value: '',
        response: ''
      };
      updateNode(nodeId, {
        conditions: [...node.data.conditions, newCondition]
      });
    }
  };

  const updateCondition = (nodeId: string, conditionId: string, updates: Partial<Condition>) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.data.conditions) {
      const updatedConditions = node.data.conditions.map(cond =>
        cond.id === conditionId ? { ...cond, ...updates } : cond
      );
      updateNode(nodeId, { conditions: updatedConditions });
    }
  };

  const deleteCondition = (nodeId: string, conditionId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.data.conditions) {
      const updatedConditions = node.data.conditions.filter(cond => cond.id !== conditionId);
      updateNode(nodeId, { conditions: updatedConditions });
    }
  };

  const saveFlow = async () => {
    if (!currentBot) return;
    
    setSaving(true);
    try {
      const flowData = { nodes, connections };
      await apiService.updateBot(currentBot.id, { flowData });
      
      dispatch({
        type: 'UPDATE_BOT',
        payload: {
          id: currentBot.id,
          updates: { flowData }
        }
      });
    } catch (error) {
      console.error('Error saving flow:', error);
    } finally {
      setSaving(false);
    }
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  if (!currentBot) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Bot não encontrado</h2>
          <Button
            onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' })}
            icon={ArrowLeft}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-900">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: 'dashboard' })}
                icon={ArrowLeft}
              >
                Voltar
              </Button>
              <Logo size="md" />
              <div>
                <h1 className="text-xl font-semibold">{currentBot.name}</h1>
                <p className="text-sm text-gray-400">Construtor de Fluxo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={saveFlow}
                disabled={saving}
                icon={Save}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  dispatch({ type: 'SET_CURRENT_PAGE', payload: 'bot-session' });
                }}
                icon={Play}
              >
                Testar Bot
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Toolbar */}
        <div className="w-64 border-r border-gray-900 p-4 bg-gray-950">
          <h3 className="font-medium mb-4">Adicionar Blocos</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNode('message')}
              icon={MessageSquare}
            >
              Enviar Mensagem
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => addNode('condition')}
              icon={Settings}
            >
              Condição/Regra
            </Button>
            {currentBot.type === 'hybrid' && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => addNode('ai')}
                icon={Zap}
              >
                Resposta com IA
              </Button>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-900/20 overflow-auto">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative p-8 min-h-full">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute bg-gray-800 border rounded-lg p-4 cursor-pointer transition-all duration-200 min-w-48 ${
                  selectedNode === node.id 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                style={{
                  left: node.position.x,
                  top: node.position.y
                }}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {node.type === 'trigger' && <Play className="w-4 h-4 text-green-400" />}
                    {node.type === 'message' && <MessageSquare className="w-4 h-4 text-blue-400" />}
                    {node.type === 'condition' && <Settings className="w-4 h-4 text-yellow-400" />}
                    {node.type === 'ai' && <Zap className="w-4 h-4 text-purple-400" />}
                    <span className="text-sm font-medium">{node.data.label}</span>
                  </div>
                  {node.id !== 'welcome' && (
                    <Button
                      variant="ghost"
                      className="p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {node.data.message || 
                   (node.data.conditions?.length ? `${node.data.conditions.length} condições` : '') ||
                   node.data.aiPrompt ||
                   'Clique para configurar'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedNodeData && (
          <div className="w-80 border-l border-gray-900 p-4 bg-gray-950 overflow-y-auto">
            <h3 className="font-medium mb-4">Configurações</h3>
            
            <div className="space-y-4">
              <Input
                label="Nome do Bloco"
                value={selectedNodeData.data.label || ''}
                onChange={(value) => updateNode(selectedNode!, { label: value })}
              />

              {selectedNodeData.type === 'message' && (
                <Input
                  label="Mensagem"
                  type="textarea"
                  value={selectedNodeData.data.message || ''}
                  onChange={(value) => updateNode(selectedNode!, { message: value })}
                  placeholder="Digite a mensagem que será enviada..."
                />
              )}

              {selectedNodeData.type === 'ai' && (
                <Input
                  label="Prompt para IA"
                  type="textarea"
                  value={selectedNodeData.data.aiPrompt || ''}
                  onChange={(value) => updateNode(selectedNode!, { aiPrompt: value })}
                  placeholder="Como a IA deve responder neste contexto..."
                />
              )}

              {selectedNodeData.type === 'condition' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Condições</label>
                    <Button
                      variant="outline"
                      onClick={() => addCondition(selectedNode!)}
                      icon={Plus}
                      className="text-xs px-2 py-1"
                    >
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedNodeData.data.conditions?.map((condition) => (
                      <Card key={condition.id} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <select
                              value={condition.type}
                              onChange={(e) => updateCondition(selectedNode!, condition.id, { type: e.target.value as any })}
                              className="flex-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                            >
                              <option value="contains">Contém</option>
                              <option value="equals">Igual a</option>
                              <option value="starts_with">Começa com</option>
                              <option value="ends_with">Termina com</option>
                            </select>
                            <Button
                              variant="ghost"
                              className="p-1 h-auto"
                              onClick={() => deleteCondition(selectedNode!, condition.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <input
                            type="text"
                            placeholder="Palavra ou frase..."
                            value={condition.value}
                            onChange={(e) => updateCondition(selectedNode!, condition.id, { value: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                          />
                          <textarea
                            placeholder="Resposta para esta condição..."
                            value={condition.response}
                            onChange={(e) => updateCondition(selectedNode!, condition.id, { response: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm resize-none"
                            rows={2}
                          />
                        </div>
                      </Card>
                    ))}
                    
                    {(!selectedNodeData.data.conditions || selectedNodeData.data.conditions.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhuma condição configurada
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}