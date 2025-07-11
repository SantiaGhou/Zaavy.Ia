import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MessageSquare, Settings, Zap, Trash2, Save, Play, Copy, Eye, EyeOff, HelpCircle } from 'lucide-react';
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
  const [showPreview, setShowPreview] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

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
      position: { x: 300 + Math.random() * 100, y: 200 + nodes.length * 120 },
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

  const getNodeIcon = (type: FlowNode['type']) => {
    switch (type) {
      case 'trigger': return Play;
      case 'message': return MessageSquare;
      case 'condition': return Settings;
      case 'ai': return Zap;
      default: return MessageSquare;
    }
  };

  const getNodeColor = (type: FlowNode['type']) => {
    switch (type) {
      case 'trigger': return 'green';
      case 'message': return 'blue';
      case 'condition': return 'yellow';
      case 'ai': return 'purple';
      default: return 'gray';
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
    if (nodeId === 'welcome') return; // Can't delete welcome node
    setNodes(nodes.filter(node => node.id !== nodeId));
    setConnections(connections.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const duplicateNode = (nodeId: string) => {
    const nodeToDuplicate = nodes.find(n => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode: FlowNode = {
      ...nodeToDuplicate,
      id: `node_${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50
      },
      data: {
        ...nodeToDuplicate.data,
        label: `${nodeToDuplicate.data.label} (Cópia)`
      }
    };

    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
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

      // Show success feedback
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Error saving flow:', error);
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
      <header className="border-b border-gray-900 bg-gray-950/50 backdrop-blur-sm">
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
                <p className="text-sm text-gray-400">Construtor de Fluxo • {nodes.length} blocos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                icon={showPreview ? EyeOff : Eye}
              >
                {showPreview ? 'Ocultar' : 'Visualizar'}
              </Button>
              <Button
                onClick={saveFlow}
                disabled={saving}
                icon={Save}
                className={saving ? 'bg-green-600' : ''}
              >
                {saving ? 'Salvo!' : 'Salvar'}
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
        <div className="w-72 border-r border-gray-900 p-6 bg-gray-950/50 backdrop-blur-sm overflow-y-auto">
          <div className="mb-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Blocos
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-blue-500/10 hover:border-blue-500/50"
                onClick={() => addNode('message')}
                icon={MessageSquare}
              >
                <div className="text-left">
                  <div className="font-medium">Enviar Mensagem</div>
                  <div className="text-xs text-gray-400">Resposta fixa</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-yellow-500/10 hover:border-yellow-500/50"
                onClick={() => addNode('condition')}
                icon={Settings}
              >
                <div className="text-left">
                  <div className="font-medium">Condição/Regra</div>
                  <div className="text-xs text-gray-400">Verificar entrada</div>
                </div>
              </Button>
              {currentBot.type === 'hybrid' && (
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-purple-500/10 hover:border-purple-500/50"
                  onClick={() => addNode('ai')}
                  icon={Zap}
                >
                  <div className="text-left">
                    <div className="font-medium">Resposta com IA</div>
                    <div className="text-xs text-gray-400">ChatGPT</div>
                  </div>
                </Button>
              )}
            </div>
          </div>

          {/* Flow Statistics */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Estatísticas do Fluxo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total de blocos:</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mensagens:</span>
                <span className="font-medium">{nodes.filter(n => n.type === 'message').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Condições:</span>
                <span className="font-medium">{nodes.filter(n => n.type === 'condition').length}</span>
              </div>
              {currentBot.type === 'hybrid' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Blocos IA:</span>
                  <span className="font-medium">{nodes.filter(n => n.type === 'ai').length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2 flex items-center">
              <HelpCircle className="w-4 h-4 mr-2" />
              Dicas
            </h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Clique em um bloco para editá-lo</li>
              <li>• Use condições para criar regras</li>
              <li>• Blocos IA respondem perguntas abertas</li>
              <li>• Salve sempre após fazer alterações</li>
            </ul>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-gray-900/20 overflow-auto">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative p-8 min-h-full min-w-full">
            {nodes.map((node) => {
              const Icon = getNodeIcon(node.type);
              const color = getNodeColor(node.type);
              const colorClasses = {
                green: 'border-green-500/50 bg-green-500/5',
                blue: 'border-blue-500/50 bg-blue-500/5',
                yellow: 'border-yellow-500/50 bg-yellow-500/5',
                purple: 'border-purple-500/50 bg-purple-500/5',
                gray: 'border-gray-500/50 bg-gray-500/5'
              };

              return (
                <div
                  key={node.id}
                  className={`absolute bg-gray-800/90 backdrop-blur-sm border rounded-xl p-4 cursor-pointer transition-all duration-200 min-w-64 shadow-lg hover:shadow-xl ${
                    selectedNode === node.id 
                      ? `${colorClasses[color]} shadow-lg shadow-${color}-500/20 scale-105` 
                      : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                  }`}
                  style={{
                    left: node.position.x,
                    top: node.position.y
                  }}
                  onClick={() => setSelectedNode(node.id)}
                  onMouseDown={() => setDraggedNode(node.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                        <Icon className={`w-4 h-4 text-${color}-400`} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">{node.data.label}</span>
                        <div className="text-xs text-gray-400 capitalize">{node.type}</div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {node.id !== 'welcome' && (
                        <>
                          <Button
                            variant="ghost"
                            className="p-1 h-auto hover:bg-blue-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateNode(node.id);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="p-1 h-auto hover:bg-red-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNode(node.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 line-clamp-3 bg-gray-900/50 rounded-lg p-2">
                    {node.data.message || 
                     (node.data.conditions?.length ? `${node.data.conditions.length} condições configuradas` : '') ||
                     node.data.aiPrompt ||
                     'Clique para configurar este bloco'}
                  </div>

                  {/* Node connection points */}
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
                  <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Properties Panel */}
        {selectedNodeData && (
          <div className="w-96 border-l border-gray-900 p-6 bg-gray-950/50 backdrop-blur-sm overflow-y-auto">
            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Configurações do Bloco
              </h3>
              <p className="text-sm text-gray-400">
                Configure as propriedades do bloco selecionado
              </p>
            </div>
            
            <div className="space-y-6">
              <Input
                label="Nome do Bloco"
                value={selectedNodeData.data.label || ''}
                onChange={(value) => updateNode(selectedNode!, { label: value })}
                placeholder="Digite um nome descritivo"
              />

              {selectedNodeData.type === 'message' && (
                <div>
                  <Input
                    label="Mensagem"
                    type="textarea"
                    value={selectedNodeData.data.message || ''}
                    onChange={(value) => updateNode(selectedNode!, { message: value })}
                    placeholder="Digite a mensagem que será enviada..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Esta mensagem será enviada automaticamente quando o fluxo chegar neste bloco.
                  </p>
                </div>
              )}

              {selectedNodeData.type === 'ai' && (
                <div>
                  <Input
                    label="Prompt para IA"
                    type="textarea"
                    value={selectedNodeData.data.aiPrompt || ''}
                    onChange={(value) => updateNode(selectedNode!, { aiPrompt: value })}
                    placeholder="Como a IA deve responder neste contexto..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Defina como a IA deve se comportar quando chegar neste bloco.
                  </p>
                </div>
              )}

              {selectedNodeData.type === 'condition' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-300">Condições</label>
                    <Button
                      variant="outline"
                      onClick={() => addCondition(selectedNode!)}
                      icon={Plus}
                      className="text-xs px-3 py-1"
                    >
                      Nova Condição
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedNodeData.data.conditions?.map((condition, index) => (
                      <Card key={condition.id} className="p-4 bg-gray-800/50">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-300">
                              Condição {index + 1}
                            </span>
                            <Button
                              variant="ghost"
                              className="p-1 h-auto hover:bg-red-500/20"
                              onClick={() => deleteCondition(selectedNode!, condition.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Tipo de verificação</label>
                            <select
                              value={condition.type}
                              onChange={(e) => updateCondition(selectedNode!, condition.id, { type: e.target.value as any })}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                            >
                              <option value="contains">Contém a palavra</option>
                              <option value="equals">É exatamente igual</option>
                              <option value="starts_with">Começa com</option>
                              <option value="ends_with">Termina com</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Palavra ou frase</label>
                            <input
                              type="text"
                              placeholder="Ex: olá, preço, ajuda..."
                              value={condition.value}
                              onChange={(e) => updateCondition(selectedNode!, condition.id, { value: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Resposta</label>
                            <textarea
                              placeholder="O que o bot deve responder..."
                              value={condition.response}
                              onChange={(e) => updateCondition(selectedNode!, condition.id, { response: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {(!selectedNodeData.data.conditions || selectedNodeData.data.conditions.length === 0) && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                        <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-3">Nenhuma condição configurada</p>
                        <Button
                          variant="outline"
                          onClick={() => addCondition(selectedNode!)}
                          icon={Plus}
                          className="text-xs"
                        >
                          Adicionar Primeira Condição
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                    <p className="text-xs text-yellow-300">
                      💡 <strong>Dica:</strong> As condições são verificadas na ordem. 
                      A primeira que der match será executada.
                    </p>
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