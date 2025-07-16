import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MessageSquare, Settings, Zap, Trash2, Save, Play, Copy, Eye, EyeOff, HelpCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Logo } from '../ui/Logo';
import { useApp } from '../../context/AppContext';
import { FlowNode, FlowEdge, Condition } from '../../types';
import { apiService } from '../../services/api';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeTypes,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RuleBlock } from './RuleBlock';
import { ConnectionLine } from './ConnectionLine';

const nodeTypes: NodeTypes = {
  trigger: RuleBlock,
  condition: RuleBlock,
  message: RuleBlock,
  ai: RuleBlock,
  action: RuleBlock,
};

const edgeTypes: EdgeTypes = {
  custom: ConnectionLine,
};

function FlowCanvas({ 
  initialNodes, 
  initialEdges, 
  onNodesChange, 
  onEdgesChange, 
  onNodeSelect,
  selectedNodeId,
  onNodeDelete,
  onNodeDuplicate
}: {
  initialNodes: FlowNode[];
  initialEdges: FlowEdge[];
  onNodesChange: (nodes: FlowNode[]) => void;
  onEdgesChange: (edges: FlowEdge[]) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
  onNodeDelete: (nodeId: string) => void;
  onNodeDuplicate: (nodeId: string) => void;
}) {
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(
    initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onDelete: () => onNodeDelete(node.id),
        onDuplicate: () => onNodeDuplicate(node.id),
        selected: selectedNodeId === node.id
      }
    })) as Node[]
  );
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges as Edge[]);

  React.useEffect(() => {
    const updatedNodes = initialNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onDelete: () => onNodeDelete(node.id),
        onDuplicate: () => onNodeDuplicate(node.id),
        selected: selectedNodeId === node.id
      }
    })) as Node[];
    setNodes(updatedNodes);
  }, [initialNodes, selectedNodeId, onNodeDelete, onNodeDuplicate, setNodes]);

  React.useEffect(() => {
    setEdges(initialEdges as Edge[]);
  }, [initialEdges, setEdges]);

  const onConnect = React.useCallback(
    (params: Connection) => {
      const newEdge: FlowEdge = {
        id: `edge_${Date.now()}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        type: 'custom',
        animated: true,
      };

      setEdges((eds) => addEdge(newEdge as Edge, eds));
      onEdgesChange([...edges as FlowEdge[], newEdge]);
    },
    [edges, onEdgesChange, setEdges]
  );

  const onDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowInstance || !reactFlowBounds) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: FlowNode = {
        id: `${type}_${Date.now()}`,
        type: type as FlowNode['type'],
        position,
        data: {
          label: getDefaultLabel(type as FlowNode['type']),
          validation: { isValid: false, errors: ['Bloco não configurado'] }
        },
      };

      const updatedNodes = [...nodes as FlowNode[], newNode];
      onNodesChange(updatedNodes);
    },
    [reactFlowInstance, nodes, onNodesChange]
  );

  const getDefaultLabel = (type: FlowNode['type']): string => {
    switch (type) {
      case 'trigger': return 'Novo Gatilho';
      case 'condition': return 'Nova Condição';
      case 'message': return 'Nova Mensagem';
      case 'ai': return 'Resposta IA';
      case 'action': return 'Nova Ação';
      default: return 'Novo Bloco';
    }
  };

  const onNodeClick = React.useCallback(
    (event: React.MouseEvent, node: Node) => {
      onNodeSelect(node.id);
    },
    [onNodeSelect]
  );

  const onPaneClick = React.useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  const handleNodesChange = React.useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      const updatedNodes = nodes.map(node => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change && change.type === 'position' && change.position) {
          return { ...node, position: change.position };
        }
        return node;
      });
      onNodesChange(updatedNodes as FlowNode[]);
    },
    [onNodesChangeInternal, nodes, onNodesChange]
  );

  const handleEdgesChange = React.useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      const updatedEdges = edges.filter(edge => {
        const removeChange = changes.find((c: any) => c.id === edge.id && c.type === 'remove');
        return !removeChange;
      });
      onEdgesChange(updatedEdges as FlowEdge[]);
    },
    [onEdgesChangeInternal, edges, onEdgesChange]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-gray-900"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Controls 
          className="bg-gray-800 border-gray-700"
          showInteractive={false}
        />
        <MiniMap 
          className="bg-gray-800 border-gray-700"
          nodeColor={(node) => {
            switch (node.type) {
              case 'trigger': return '#10b981';
              case 'condition': return '#f59e0b';
              case 'message': return '#3b82f6';
              case 'ai': return '#8b5cf6';
              case 'action': return '#ef4444';
              default: return '#6b7280';
            }
          }}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          className="bg-gray-900"
          color="#374151"
        />
      </ReactFlow>
    </div>
  );
}

function FlowCanvasWrapper(props: any) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}

export function BotBuilder() {
  const { state, dispatch } = useApp();
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const currentBot = state.bots.find(bot => bot.id === state.currentBotId);

  useEffect(() => {
    if (currentBot?.flowData) {
      setNodes(currentBot.flowData.nodes || []);
      setEdges(currentBot.flowData.edges || []);
    } else {
      const welcomeNode: FlowNode = {
        id: 'welcome',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Início da Conversa',
          triggerType: 'message',
          validation: { isValid: true, errors: [] }
        }
      };
      setNodes([welcomeNode]);
      setEdges([]);
    }
  }, [currentBot]);

  const handleAddNode = (type: FlowNode['type']) => {
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type,
      position: { x: 300 + Math.random() * 100, y: 200 + nodes.length * 150 },
      data: {
        label: getNodeLabel(type),
        validation: { isValid: false, errors: ['Bloco não configurado'] },
        ...(type === 'message' && { message: '' }),
        ...(type === 'condition' && { conditions: [] }),
        ...(type === 'ai' && { aiPrompt: '' }),
        ...(type === 'trigger' && { triggerType: 'message' as const }),
        ...(type === 'action' && { actionType: 'forward' as const })
      }
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };

  const getNodeLabel = (type: FlowNode['type']) => {
    switch (type) {
      case 'trigger': return 'Novo Gatilho';
      case 'message': return 'Enviar Mensagem';
      case 'condition': return 'Verificar Condição';
      case 'ai': return 'Resposta com IA';
      case 'action': return 'Ação';
      default: return 'Novo Bloco';
    }
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<FlowNode['data']>) => {
    setNodes(nodes.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'welcome') return;
    setNodes(nodes.filter(node => node.id !== nodeId));
    setEdges(edges.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleDuplicateNode = (nodeId: string) => {
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

  const saveFlow = async () => {
    if (!currentBot) return;
    
    setSaving(true);
    try {
      const flowData = { nodes, edges };
      await apiService.updateBot(currentBot.id, { flowData });
      
      dispatch({
        type: 'UPDATE_BOT',
        payload: {
          id: currentBot.id,
          updates: { flowData }
        }
      });

      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Error saving flow:', error);
      setSaving(false);
    }
  };

  const getFlowStats = () => {
    return {
      totalNodes: nodes.length,
      triggers: nodes.filter(n => n.type === 'trigger').length,
      conditions: nodes.filter(n => n.type === 'condition').length,
      messages: nodes.filter(n => n.type === 'message').length,
      aiNodes: nodes.filter(n => n.type === 'ai').length,
      actions: nodes.filter(n => n.type === 'action').length
    };
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  if (!currentBot) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeTypes = [
    {
      type: 'trigger' as const,
      icon: Play,
      label: 'Gatilho',
      description: 'Inicia o fluxo',
      color: 'hover:bg-green-500/10 hover:border-green-500/50',
      available: true
    },
    {
      type: 'message' as const,
      icon: MessageSquare,
      label: 'Mensagem',
      description: 'Resposta fixa',
      color: 'hover:bg-blue-500/10 hover:border-blue-500/50',
      available: true
    },
    {
      type: 'condition' as const,
      icon: Settings,
      label: 'Condição',
      description: 'Verificar regras',
      color: 'hover:bg-yellow-500/10 hover:border-yellow-500/50',
      available: true
    },
    {
      type: 'ai' as const,
      icon: Zap,
      label: 'Resposta IA',
      description: 'ChatGPT',
      color: 'hover:bg-purple-500/10 hover:border-purple-500/50',
      available: currentBot.type === 'hybrid' || currentBot.type === 'ai'
    },
    {
      type: 'action' as const,
      icon: Settings,
      label: 'Ação',
      description: 'Executar tarefa',
      color: 'hover:bg-red-500/10 hover:border-red-500/50',
      available: true
    }
  ];

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
                onClick={() => setShowValidation(!showValidation)}
                icon={AlertTriangle}
                className={showValidation ? 'bg-yellow-500/10 border-yellow-500/50' : ''}
              >
                Validar
              </Button>
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
        {/* Flow Toolbar */}
        <div className="w-80 border-r border-gray-800 bg-gray-950/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4 text-white flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Blocos Disponíveis
              </h3>
              <div className="space-y-3">
                {nodeTypes.map((nodeType) => {
                  const Icon = nodeType.icon;
                  return (
                    <div
                      key={nodeType.type}
                      draggable={nodeType.available}
                      onDragStart={(event) => onDragStart(event, nodeType.type)}
                      className={`
                        cursor-pointer transition-all duration-200
                        ${nodeType.available ? nodeType.color : 'opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <Button
                        variant="outline"
                        className={`w-full justify-start ${nodeType.color} ${!nodeType.available ? 'opacity-50' : ''}`}
                        onClick={() => nodeType.available && handleAddNode(nodeType.type)}
                        disabled={!nodeType.available}
                      >
                        <Icon className="w-4 h-4 mr-3" />
                        <div className="text-left flex-1">
                          <div className="font-medium">{nodeType.label}</div>
                          <div className="text-xs text-gray-400">{nodeType.description}</div>
                        </div>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Flow Statistics */}
            <Card className="p-4 bg-gray-800/50">
              <h3 className="font-semibold mb-3 text-white">Estatísticas do Fluxo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total de blocos:</span>
                  <span className="font-medium text-white">{getFlowStats().totalNodes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gatilhos:</span>
                  <span className="font-medium text-green-400">{getFlowStats().triggers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mensagens:</span>
                  <span className="font-medium text-blue-400">{getFlowStats().messages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Condições:</span>
                  <span className="font-medium text-yellow-400">{getFlowStats().conditions}</span>
                </div>
                {currentBot.type !== 'rule-based' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Blocos IA:</span>
                    <span className="font-medium text-purple-400">{getFlowStats().aiNodes}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Ações:</span>
                  <span className="font-medium text-red-400">{getFlowStats().actions}</span>
                </div>
              </div>
            </Card>

            {/* Help Section */}
            <Card className="p-4 bg-blue-500/5 border-blue-500/20">
              <h4 className="font-medium text-blue-300 mb-2 flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                Como usar
              </h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Arraste blocos para o canvas</li>
                <li>• Conecte blocos pelas bolinhas</li>
                <li>• Clique em um bloco para editá-lo</li>
                <li>• Use Ctrl+Z para desfazer</li>
                <li>• Salve sempre após alterações</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1 relative">
          <FlowCanvasWrapper
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode}
            onNodeDelete={handleDeleteNode}
            onNodeDuplicate={handleDuplicateNode}
          />
        </div>

        {/* Node Properties Panel */}
        {selectedNodeData && (
          <div className="w-96 border-l border-gray-800 bg-gray-950/50 backdrop-blur-sm overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-white flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Propriedades
                  </h3>
                  <p className="text-sm text-gray-400 capitalize">{selectedNodeData.type}</p>
                </div>
                <div className="flex space-x-2">
                  {selectedNodeData.id !== 'welcome' && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handleDuplicateNode(selectedNodeData.id)}
                        className="p-2"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteNode(selectedNodeData.id)}
                        className="p-2 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedNode(null)}
                    className="p-2"
                  >
                    ×
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Nome do Bloco"
                  value={selectedNodeData.data.label || ''}
                  onChange={(value) => handleUpdateNode(selectedNode!, { label: value })}
                  placeholder="Digite um nome descritivo"
                />

                {selectedNodeData.type === 'message' && (
                  <div className="space-y-4">
                    <Input
                      label="Mensagem"
                      type="textarea"
                      value={selectedNodeData.data.message || ''}
                      onChange={(value) => handleUpdateNode(selectedNode!, { message: value })}
                      placeholder="Digite a mensagem que será enviada..."
                      rows={4}
                    />
                    <div className="text-xs text-gray-500">
                      Esta mensagem será enviada automaticamente quando o fluxo chegar neste bloco.
                    </div>
                  </div>
                )}

                {selectedNodeData.type === 'ai' && (
                  <div className="space-y-4">
                    <Input
                      label="Prompt para IA"
                      type="textarea"
                      value={selectedNodeData.data.aiPrompt || ''}
                      onChange={(value) => handleUpdateNode(selectedNode!, { aiPrompt: value })}
                      placeholder="Como a IA deve responder neste contexto..."
                      rows={4}
                    />
                    <div className="text-xs text-gray-500">
                      Defina como a IA deve se comportar quando chegar neste bloco.
                    </div>
                  </div>
                )}

                {selectedNodeData.type === 'condition' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-300">Condições</label>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newCondition: Condition = {
                            id: `condition_${Date.now()}`,
                            type: 'contains',
                            value: '',
                            response: ''
                          };
                          const conditions = selectedNodeData.data.conditions || [];
                          handleUpdateNode(selectedNode!, { conditions: [...conditions, newCondition] });
                        }}
                        icon={Plus}
                        className="text-xs px-3 py-1"
                      >
                        Nova Condição
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {(selectedNodeData.data.conditions || []).map((condition, index) => (
                        <Card key={condition.id} className="p-4 bg-gray-800/50">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-300">
                                Condição {index + 1}
                              </span>
                              <Button
                                variant="ghost"
                                className="p-1 h-auto hover:bg-red-500/20"
                                onClick={() => {
                                  const conditions = selectedNodeData.data.conditions || [];
                                  const updatedConditions = conditions.filter(cond => cond.id !== condition.id);
                                  handleUpdateNode(selectedNode!, { conditions: updatedConditions });
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Tipo de verificação</label>
                              <select
                                value={condition.type}
                                onChange={(e) => {
                                  const conditions = selectedNodeData.data.conditions || [];
                                  const updatedConditions = conditions.map(cond =>
                                    cond.id === condition.id ? { ...cond, type: e.target.value as any } : cond
                                  );
                                  handleUpdateNode(selectedNode!, { conditions: updatedConditions });
                                }}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                              >
                                <option value="contains">Contém a palavra</option>
                                <option value="equals">É exatamente igual</option>
                                <option value="starts_with">Começa com</option>
                                <option value="ends_with">Termina com</option>
                                <option value="regex">Expressão regular</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Palavra ou frase</label>
                              <input
                                type="text"
                                placeholder="Ex: olá, preço, ajuda..."
                                value={condition.value}
                                onChange={(e) => {
                                  const conditions = selectedNodeData.data.conditions || [];
                                  const updatedConditions = conditions.map(cond =>
                                    cond.id === condition.id ? { ...cond, value: e.target.value } : cond
                                  );
                                  handleUpdateNode(selectedNode!, { conditions: updatedConditions });
                                }}
                                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Resposta</label>
                              <textarea
                                placeholder="O que o bot deve responder..."
                                value={condition.response}
                                onChange={(e) => {
                                  const conditions = selectedNodeData.data.conditions || [];
                                  const updatedConditions = conditions.map(cond =>
                                    cond.id === condition.id ? { ...cond, response: e.target.value } : cond
                                  );
                                  handleUpdateNode(selectedNode!, { conditions: updatedConditions });
                                }}
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
                            onClick={() => {
                              const newCondition: Condition = {
                                id: `condition_${Date.now()}`,
                                type: 'contains',
                                value: '',
                                response: ''
                              };
                              handleUpdateNode(selectedNode!, { conditions: [newCondition] });
                            }}
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
          </div>
        )}
      </div>
    </div>
  );
}