import React from 'react';
import { Handle, Position } from 'reactflow';
import { Settings, MessageSquare, Zap, Play, Trash2, Copy } from 'lucide-react';
import { FlowNode } from '../../types';

interface RuleBlockProps {
  data: FlowNode['data'] & {
    onDelete?: () => void;
    onDuplicate?: () => void;
    onEdit?: () => void;
  };
  type: FlowNode['type'];
  selected?: boolean;
}

export function RuleBlock({ data, type, selected }: RuleBlockProps) {
  const getIcon = () => {
    switch (type) {
      case 'trigger': return Play;
      case 'message': return MessageSquare;
      case 'condition': return Settings;
      case 'ai': return Zap;
      default: return MessageSquare;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'trigger': return 'green';
      case 'message': return 'blue';
      case 'condition': return 'yellow';
      case 'ai': return 'purple';
      default: return 'gray';
    }
  };

  const Icon = getIcon();
  const color = getColor();
  
  const colorClasses = {
    green: selected ? 'border-green-500 bg-green-500/10 shadow-green-500/20' : 'border-green-500/50 bg-green-500/5',
    blue: selected ? 'border-blue-500 bg-blue-500/10 shadow-blue-500/20' : 'border-blue-500/50 bg-blue-500/5',
    yellow: selected ? 'border-yellow-500 bg-yellow-500/10 shadow-yellow-500/20' : 'border-yellow-500/50 bg-yellow-500/5',
    purple: selected ? 'border-purple-500 bg-purple-500/10 shadow-purple-500/20' : 'border-purple-500/50 bg-purple-500/5',
    gray: selected ? 'border-gray-500 bg-gray-500/10 shadow-gray-500/20' : 'border-gray-500/50 bg-gray-500/5'
  };

  const iconColorClasses = {
    green: 'text-green-400',
    blue: 'text-blue-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400'
  };

  return (
    <div className={`
      bg-gray-800/90 backdrop-blur-sm border rounded-xl p-4 min-w-64 shadow-lg
      transition-all duration-200 hover:shadow-xl
      ${colorClasses[color]}
      ${selected ? 'scale-105 shadow-lg' : 'hover:scale-102'}
    `}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-800"
      />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className={`w-4 h-4 ${iconColorClasses[color]}`} />
          </div>
          <div>
            <span className="text-sm font-semibold text-white">{data.label}</span>
            <div className="text-xs text-gray-400 capitalize">{type}</div>
          </div>
        </div>
        
        {type !== 'trigger' && (
          <div className="flex space-x-1">
            <button
              onClick={data.onDuplicate}
              className="p-1 hover:bg-blue-500/20 rounded transition-colors"
            >
              <Copy className="w-3 h-3 text-gray-400 hover:text-blue-400" />
            </button>
            <button
              onClick={data.onDelete}
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
            </button>
          </div>
        )}
      </div>
      
      <div className="text-xs text-gray-400 line-clamp-3 bg-gray-900/50 rounded-lg p-2">
        {data.message || 
         (data.conditions?.length ? `${data.conditions.length} condições configuradas` : '') ||
         data.aiPrompt ||
         'Clique para configurar este bloco'}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-600 border-2 border-gray-800"
      />
    </div>
  );
}