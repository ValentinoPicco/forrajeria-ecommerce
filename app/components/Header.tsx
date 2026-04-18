import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Search, ShoppingCart, Shield } from "lucide-react";
import Link from "next/link";
import AuthButtons from "./AuthButtons";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="bg-background dark:bg-stone-950 docked full-width top-0 sticky z-50 shadow-[0px_12px_32px_rgba(26,29,19,0.06)]">
      <div className="flex justify-between items-center px-8 py-4 w-full max-w-7xl mx-auto gap-8">
        <div className="text-xl font-bold tracking-tighter text-primary dark:text-[#c5d39c] shrink-0">
          {/* Logo Placeholder */}
        </div>
        
        {/* Centered Search Bar */}
        <div className="hidden md:flex grow max-w-xl mx-auto items-center gap-2">
          <div className="relative grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
            <input
              className="w-full bg-surface-container-high border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-sans"
              placeholder="Buscar semillas, herramientas..."
              type="text"
            />
          </div>
          <button className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer">
            Buscar
          </button>
        </div>
        
        {/* Trailing Actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {session?.user?.role === "ADMIN" && (
            <Link 
              href="/admin" 
              className="p-2 text-primary dark:text-[#c5d39c] bg-primary/10 hover:bg-primary/20 rounded-full transition-colors active:scale-95 cursor-pointer flex items-center gap-2"
              title="Panel de Administración"
            >
              <Shield className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden md:block text-sm font-bold">Admin</span>
            </Link>
          )}

          <button className="p-2 text-primary dark:text-[#c5d39c] hover:bg-primary-container/10 rounded-full transition-colors active:scale-95 cursor-pointer">
            <ShoppingCart className="w-6 h-6" />
          </button>

          {/* Componente Client Modal con estado de Autenticación */}
          <AuthButtons session={session} />
        </div>
      </div>
    </header>
  );
}
