import React from 'react'

export default function Spinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div
        className="border-2 border-gold/20 border-t-gold rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  )
}
