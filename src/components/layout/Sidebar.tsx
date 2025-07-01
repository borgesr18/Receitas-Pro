'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  ShoppingCart, 
  Factory, 
  TrendingUp, 
  BarChart3, 
  Settings,
  Archive
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/fichas-tecnicas', label: 'Fichas Técnicas', icon: FileText },
  { href: '/insumos', label: 'Insumos', icon: Package },
  { href: '/produtos', label: 'Produtos', icon: ShoppingCart },
  { href: '/producao', label: 'Produção', icon: Factory },
  { href: '/vendas', label: 'Vendas', icon: TrendingUp },
  { href: '/estoque', label: 'Estoque', icon: Archive },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-40">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Receitas Pro
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Sistema de fichas para panificação
          </p>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
