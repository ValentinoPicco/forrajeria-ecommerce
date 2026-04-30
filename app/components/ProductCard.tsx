"use client";

import { ShoppingCart, Tractor } from "lucide-react";
import FavoriteButton from "./FavoriteButton";

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
            <div className="pointer-events-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: agregar al carrito
                }}
                className="p-3 bg-primary text-on-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors cursor-pointer relative z-20"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
