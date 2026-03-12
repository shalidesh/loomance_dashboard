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
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  }[size] || 'sm:max-w-lg'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm animate-fade-in" />

      {/* Panel */}
      <div className={`relative w-full ${sizeClass} card p-5 sm:p-6 animate-fade-in shadow-2xl shadow-black/50
                       rounded-t-2xl sm:rounded-xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="font-serif text-lg sm:text-xl text-cream">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-cream-muted hover:text-cream hover:bg-cream/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="gold-divider !mt-0 !mb-4 sm:!mb-5" />

        {children}
      </div>
    </div>
  )
}
