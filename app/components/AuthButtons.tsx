"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { LogOut, User as UserIcon, X } from "lucide-react";

export default function AuthButtons({ session }: { session: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (session) {
    return (
      <div className="flex items-center gap-3">
        {/* Info del usuario (oculto en móvil para no romper la navbar) */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-primary dark:text-[#c5d39c]">
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-primary/20"
            />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          <span>{session.user?.name?.split(" ")[0]}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-600/90 text-white px-4 md:px-5 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform hover:opacity-90 flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4 hidden sm:block" />
          <span>Salir</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform hover:opacity-90 cursor-pointer"
      >
        Iniciar Sesión
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all">
          <div className="bg-surface w-full max-w-sm rounded-[2rem] shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200 border border-outline-variant/30">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-outline hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-8 mt-4">
              <h2 className="text-3xl font-black text-primary mb-2 tracking-tight">¡Hola!</h2>
              <p className="text-sm text-on-surface-variant px-2">
                Ingresa a tu cuenta para gestionar pedidos y beneficios exclusivos.
              </p>
            </div>
            
            <button
              onClick={() => signIn("google")}
              className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant text-on-surface px-6 py-4 rounded-xl font-bold hover:bg-surface-container-low transition-colors active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
            <p className="text-center text-[10px] text-outline mt-6 px-4">
              Al continuar, aceptas nuestros <a href="#" className="underline">Términos</a> y <a href="#" className="underline">Política de Privacidad</a>.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
