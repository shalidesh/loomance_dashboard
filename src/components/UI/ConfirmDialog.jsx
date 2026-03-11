import React from 'react'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4 mb-6">
        <div className={`p-2 rounded-lg ${danger ? 'bg-red-500/10' : 'bg-gold/10'}`}>
          <AlertTriangle size={20} className={danger ? 'text-red-400' : 'text-gold'} />
        </div>
        <p className="text-cream-muted text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={danger ? 'btn-danger' : 'btn-primary'}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
