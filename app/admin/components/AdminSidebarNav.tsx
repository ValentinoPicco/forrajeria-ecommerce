"use client";

import { Package, Receipt, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebarNav({ undeliveredOrdersCount }: { undeliveredOrdersCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1">
      <Link 
        href="/admin"
        className={`flex items-center gap-3 rounded-r-full py-3 px-6 my-1 transition-all duration-200 ${
          pathname === '/admin' 
            ? "bg-primary-container text-on-primary-container" 
            : "bg-transparent text-on-surface-variant hover:bg-primary-container/10 hover:translate-x-1"
        }`}
      >
        <Package className="w-5 h-5" />
        <span className="text-sm font-medium">Inventario</span>
      </Link>

      <Link 
        href="/admin/pedidos"
        className={`flex items-center justify-between rounded-r-full py-3 px-6 my-1 transition-all duration-200 ${
          pathname === '/admin/pedidos' 
            ? "bg-primary-container text-on-primary-container" 
            : "bg-transparent text-on-surface-variant hover:bg-primary-container/10 hover:translate-x-1"
        }`}
      >
        <div className="flex items-center gap-3">
          <Receipt className="w-5 h-5" />
          <span className="text-sm font-medium">Pedidos</span>
        </div>
        {undeliveredOrdersCount > 0 && (
          <span className="bg-error text-on-error text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
            {undeliveredOrdersCount}
          </span>
        )}
      </Link>

      <Link 
        href="#"
        className="flex items-center gap-3 text-on-surface-variant rounded-r-full py-3 px-6 my-1 transition-all duration-200 hover:bg-primary-container/10 hover:translate-x-1"
      >
        <Settings className="w-5 h-5" />
        <span className="text-sm font-medium">Configuración</span>
      </Link>
    </nav>
  );
}
