import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Settings, MessageSquare, Zap, Play, Trash2, Copy, GitBranch, Forward, CheckCircle, AlertTriangle } from 'lucide-react';
import { FlowNode } from '../../types';

interface RuleBlockProps extends NodeProps {
  data: FlowNode['data'] & {
    onDelete?: () => void;
    onDuplicate?: () => void;
    onEdit?: () => void;
    selected?: boolean;
  };
  type?: FlowNode['type'];
}

export function RuleBlock({ data, type, selected }: RuleBlockProps) {
  const getIcon = () => {
    switch (type) {
      case 'trigger': return Play;
      case 'message': return MessageSquare;
      case 'condition': return GitBranch;
      case 'ai': return Zap;
      case 'action': return Forward;
      default: return MessageSquare;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'trigger': return 'green';
      case 'message': return 'blue';
      case 'condition': return 'yellow';
      case 'ai': return 'purple';
      case 'action': return 'red';
      default: return 'gray';
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'trigger': return 'Gatilho';
      case 'message': return 'Mensagem';
      case 'condition': return 'Condição';
      case 'ai': return 'IA';
      case 'action': return 'Ação';
      default: return 'Bloco';
    }
  };

  const getContent = () => {
    if (data.message) {
      return data.message.length > 50 ? `${data.message.substring(0, 50)}...` : data.message;
    }
    if (data.conditions?.length) {
      return `${data.conditions.length} condição${data.conditions.length > 1 ? 'ões' : ''} configurada${data.conditions.length > 1 ? 's' : ''}`;
    }
    if (data.aiPrompt) {
      return data.aiPrompt.length > 50 ? `${data.aiPrompt.substring(0, 50)}...` : data.aiPrompt;
    }
    if (data.triggerType) {
      switch (data.triggerType) {
        case 'message': return 'Qualquer mensagem';
        case 'keyword': return data.keywords?.length ? `Palavras: ${data.keywords.join(', ')}` : 'Palavras-chave';
        case 'time': return 'Horário específico';
        case 'event': return 'Evento personalizado';
        default: return 'Início da conversa';
      }
    }
    if (data.actionType) {
      switch (data.actionType) {
        case 'forward': return 'Encaminhar para atendente';
        case 'webhook': return 'Chamar webhook externo';
        case 'delay': return 'Aguardar tempo específico';
        case 'tag': return 'Adicionar tag ao contato';
        default: return 'Ação não configurada';
      }
    }
    return 'Clique para configurar este bloco';
  };

  const Icon = getIcon();
  const color = getColor();
  const isValid = data.validation?.isValid !== false;
  
  const colorClasses = {
    green: {
      border: selected ? 'border-green-500 shadow-green-500/20' : 'border-green-500/50',
      bg: selected ? 'bg-green-500/10' : 'bg-green-500/5',
      icon: 'text-green-400',
      iconBg: 'bg-green-500/20'
    },
    blue: {
      border: selected ? 'border-blue-500 shadow-blue-500/20' : 'border-blue-500/50',
      bg: selected ? 'bg-blue-500/10' : 'bg-blue-500/5',
      icon: 'text-blue-400',
      iconBg: 'bg-blue-500/20'
    },
    yellow: {
      border: selected ? 'border-yellow-500 shadow-yellow-500/20' : 'border-yellow-500/50',
      bg: selected ? 'bg-yellow-500/10' : 'bg-yellow-500/5',
      icon: 'text-yellow-400',
      iconBg: 'bg-yellow-500/20'
    },
    purple: {
      border: selected ? 'border-purple-500 shadow-purple-500/20' : 'border-purple-500/50',
      bg: selected ? 'bg-purple-500/10' : 'bg-purple-500/5',
      icon: 'text-purple-400',
      iconBg: 'bg-purple-500/20'
    },
    red: {
      border: selected ? 'border-red-500 shadow-red-500/20' : 'border-red-500/50',
      bg: selected ? 'bg-red-500/10' : 'bg-red-500/5',
      icon: 'text-red-400',
      iconBg: 'bg-red-500/20'
    },
    gray: {
      border: selected ? 'border-gray-500 shadow-gray-500/20' : 'border-gray-500/50',
      bg: selected ? 'bg-gray-500/10' : 'bg-gray-500/5',
      icon: 'text-gray-400',
      iconBg: 'bg-gray-500/20'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`
      relative bg-gray-800/90 backdrop-blur-sm border rounded-xl p-4 min-w-64 shadow-lg
      transition-all duration-200 hover:shadow-xl
      ${classes.border} ${classes.bg}
      ${selected ? 'scale-105 shadow-lg' : 'hover:scale-102'}
      ${!isValid ? 'ring-2 ring-red-500/50' : ''}
    `}>
      {/* Target Handle */}
      {type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-600 border-2 border-gray-800 hover:bg-gray-500"
        />
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${classes.iconBg}`}>
            <Icon className={`w-4 h-4 ${classes.icon}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white">{data.label}</span>
              {!isValid && (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
              {isValid && (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
            </div>
            <div className="text-xs text-gray-400">{getTypeLabel()}</div>
          </div>
        </div>
        
        {type !== 'trigger' && (
          <div className="flex space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDuplicate?.();
              }}
              className="p-1 hover:bg-blue-500/20 rounded transition-colors"
            >
              <Copy className="w-3 h-3 text-gray-400 hover:text-blue-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete?.();
              }}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
            </button>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-400 line-clamp-3 bg-gray-900/50 rounded-lg p-2">
        {getContent()}
      </div>

      {/* Validation Errors */}
      {!isValid && data.validation?.errors && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-xs text-red-300">
            {data.validation.errors.map((error, index) => (
              <div key={index}>• {error}</div>
            ))}
          </div>
        </div>
      )}

      {/* Condition-specific handles */}
      {type === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="w-3 h-3 bg-green-600 border-2 border-gray-800 hover:bg-green-500"
            style={{ top: '40%' }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            className="w-3 h-3 bg-red-600 border-2 border-gray-800 hover:bg-red-500"
            style={{ left: '50%' }}
          />
        </>
      )}

      {/* Default source handle for other types */}
      {type !== 'condition' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-gray-600 border-2 border-gray-800 hover:bg-gray-500"
        />
      )}

      {/* Condition labels */}
      {type === 'condition' && (
        <div className="absolute -right-12 top-1/3 text-xs text-green-400 font-medium">
          Sim
        </div>
      )}
      {type === 'condition' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-red-400 font-medium">
          Não
        </div>
      )}
    </div>
  );
}