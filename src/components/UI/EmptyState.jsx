import React from 'react'
import { InboxIcon } from 'lucide-react'

export default function EmptyState({ icon: Icon = InboxIcon, title = 'No data yet', description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-gold/5 border border-gold/15 rounded-full mb-4">
        <Icon size={28} className="text-gold/60" />
      </div>
      <p className="text-cream font-serif text-lg mb-1">{title}</p>
      {description && <p className="text-cream-muted text-sm max-w-xs">{description}</p>}
    </div>
  )
}
