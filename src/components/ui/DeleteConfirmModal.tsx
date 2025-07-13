import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  loading = false
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);

  const canDelete = understood && confirmText.toLowerCase() === 'deletar';

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setUnderstood(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-red-500/30 rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
          </div>
          <Button variant="ghost" onClick={handleClose} className="p-2" disabled={loading}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <p className="text-gray-300">{message}</p>
            
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <h4 className="font-medium text-red-300 mb-2">⚠️ Esta ação é irreversível</h4>
              <ul className="text-sm text-red-200 space-y-1">
                <li>• Todos os dados serão perdidos permanentemente</li>
                <li>• Conversas e mensagens serão deletadas</li>
                <li>• Conexões do WhatsApp serão encerradas</li>
                <li>• Não será possível recuperar as informações</li>
              </ul>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-300 mb-3">Nome do item a ser deletado:</h4>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <span className="font-mono text-red-400">{itemName}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Steps */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="understand"
                checked={understood}
                onChange={(e) => setUnderstood(e.target.checked)}
                className="mt-1 w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
                disabled={loading}
              />
              <label htmlFor="understand" className="text-sm text-gray-300">
                Eu entendo que esta ação é <strong>irreversível</strong> e todos os dados serão perdidos permanentemente.
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Digite <span className="font-mono bg-gray-800 px-2 py-1 rounded text-red-400">deletar</span> para confirmar:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="deletar"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleConfirm}
              disabled={!canDelete || loading}
              icon={Trash2}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Deletando...' : 'Deletar Permanentemente'}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-gray-600"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}