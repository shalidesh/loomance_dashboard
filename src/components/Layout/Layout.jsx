import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { isFirebaseConfigured } from '../../firebase/config'
import { AlertTriangle } from 'lucide-react'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        {!isFirebaseConfigured && <FirebaseBanner />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function FirebaseBanner() {
  return (
    <div className="flex items-center gap-3 px-6 py-3 bg-yellow-500/10 border-b border-yellow-500/20">
      <AlertTriangle size={15} className="text-yellow-400 flex-shrink-0" />
      <p className="text-yellow-200 text-xs">
        Firebase is not configured. Copy <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300">.env.example</code> to{' '}
        <code className="bg-black/30 px-1 py-0.5 rounded text-yellow-300">.env</code> and add your Firebase credentials to enable data storage.
      </p>
    </div>
  )
}
