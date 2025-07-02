'use client'

import React from 'react'
import { LogOut, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-accent">Receitas Pro</h1>
          <span className="text-sm text-text-secondary">Sistema de Fichas Técnicas</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <User size={20} />
            <span className="text-sm">Usuário</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text hover:bg-hover rounded-md transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}
