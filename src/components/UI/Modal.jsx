import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size] || 'max-w-lg'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div className={`relative w-full ${sizeClass} card p-6 animate-fade-in shadow-2xl shadow-black/50`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-cream">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cream-muted hover:text-cream hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="gold-divider !mt-0 !mb-5" />

        {children}
      </div>
    </div>
  )
}
