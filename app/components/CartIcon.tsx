"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useSession } from "next-auth/react";

export default function CartIcon() {
  const { status } = useSession();
  const { totalItems, isLoading } = useCart();

  // Si no está logueado, no mostramos el icono del carrito
  if (status !== "authenticated") {
    return null;
  }

  return (
    <Link
      href="/carrito"
      className="relative p-2 text-primary dark:text-[#c5d39c] hover:bg-primary-container/10 rounded-full transition-colors active:scale-95 cursor-pointer"
      title="Ir al carrito"
    >
      <ShoppingCart className="w-6 h-6" />
      {!isLoading && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background animate-in zoom-in duration-200">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}
    </Link>
  );
}
