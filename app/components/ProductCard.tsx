"use client";

import { ShoppingCart, Tractor, Loader2 } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { useSession } from "next-auth/react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string | null;
  categoryName: string | null;
  basePrice: string;
  mainImageUrl: string | null;
  mainImageAlt: string | null;
  defaultVariantId?: string;
}

export default function ProductCard({
  id,
  name,
  description,
  categoryName,
  basePrice,
  mainImageUrl,
  mainImageAlt,
  defaultVariantId,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { status } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
      return;
    }

    if (!defaultVariantId) return;

    setIsAdding(true);
    await addToCart(defaultVariantId, 1);
    setIsAdding(false);
  };

  return (
    <div className="group relative bg-surface-container-low rounded-2xl transition-all duration-500 hover:-translate-y-1 block h-full shadow-sm hover:shadow-md">
      {/* Main Link Overlay */}
      <a
        href={`/producto/${id}`}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Ver detalle de ${name}`}
      />

      {/* Card Content */}
      <div className="relative z-10 pointer-events-none flex flex-col h-full">
        {/* Image Container */}
        <div className="aspect-square overflow-hidden bg-surface-container relative flex items-center justify-center rounded-t-2xl">
          {mainImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 absolute inset-0"
              alt={mainImageAlt ?? name}
              src={mainImageUrl}
              referrerPolicy="no-referrer"
            />
          ) : (
            <Tractor className="w-12 h-12 text-outline/30" />
          )}
        </div>

        {/* Info Container */}
        <div className="p-6 flex flex-col grow">
          <div className="flex justify-between items-start mb-2">
            <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest rounded-full">
              {categoryName || "Varios"}
            </span>
            {/* Favorite Button - pointer-events-auto to enable interaction */}
            <div className="pointer-events-auto">
              {defaultVariantId && <FavoriteButton variantId={defaultVariantId} size="sm" />}
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {name}
          </h3>
          <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">
            {description || "Sin descripción disponible para este producto."}
          </p>
          
          <div className="flex justify-between items-center mt-auto">
            <span className="text-2xl font-black text-primary">{basePrice}</span>
            {/* Cart Button - pointer-events-auto to enable interaction */}
            <div className="pointer-events-auto relative">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !defaultVariantId}
                className="p-3 bg-primary text-on-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors cursor-pointer relative z-20 disabled:opacity-50"
              >
                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              </button>
              
              {/* Tooltip "Iniciá sesión" */}
              {showTooltip && (
                <div className="absolute bottom-full mb-3 right-0 whitespace-nowrap bg-on-surface text-surface text-[10px] sm:text-xs font-bold px-3 py-2 rounded-xl shadow-xl z-[100] animate-in fade-in slide-in-from-bottom-1 duration-200">
                  Iniciá sesión para usar el carrito
                  <div className="absolute top-full right-4 border-[6px] border-transparent border-t-on-surface" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
