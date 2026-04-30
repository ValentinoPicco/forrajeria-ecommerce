"use client";

import { useState } from "react";
import { ShoppingCart, Package, Loader2 } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { useCart } from "../context/CartContext";
import { useSession } from "next-auth/react";

interface Variant {
  id: string;
  name: string;
  price: string; // Decimal serializado como string
  stock: number;
  sku: string | null;
}

interface VariantSelectorProps {
  variants: Variant[];
}

export default function VariantSelector({ variants }: VariantSelectorProps) {
  const { addToCart } = useCart();
  const { status } = useSession();
  
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? null
  );
  const [isAdding, setIsAdding] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const inStock = selected ? selected.stock > 0 : false;
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

  const handleAddToCart = async () => {
    if (status !== "authenticated") {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
      return;
    }

    if (!selectedId || !inStock) return;

    setIsAdding(true);
    await addToCart(selectedId, 1);
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Precio dinámico */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-black text-primary transition-all duration-200">
          {selected ? `$${selected.price}` : "—"}
        </span>
        {selected && variants.length > 1 && (
          <span className="text-sm text-on-surface-variant font-medium">
            {selected.name}
          </span>
        )}
      </div>

      {/* Selector de variantes */}
      {variants.length > 0 && (
        <div>
          <p className="text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">
            Seleccioná una presentación
          </p>
          <div className="flex flex-wrap gap-3">
            {variants.map((variant) => {
              const hasStock = variant.stock > 0;
              const isSelected = variant.id === selectedId;

              return (
                <button
                  key={variant.id}
                  disabled={!hasStock}
                  onClick={() => setSelectedId(variant.id)}
                  className={`flex flex-col px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[110px] text-left
                    ${!hasStock
                      ? "border-surface-container-high bg-surface-container-highest opacity-50 cursor-not-allowed"
                      : isSelected
                        ? "border-primary bg-primary/10 shadow-sm shadow-primary/20 scale-[1.02]"
                        : "border-outline-variant bg-surface-container-low hover:border-primary hover:bg-surface-container cursor-pointer"
                    }`}
                >
                  <span className={`font-bold text-sm ${isSelected ? "text-primary" : "text-on-surface"}`}>
                    {variant.name}
                  </span>
                  <span className={`font-extrabold text-base mt-0.5 ${isSelected ? "text-primary" : "text-primary"}`}>
                    ${variant.price}
                  </span>
                  <span className={`text-xs mt-1 font-medium ${hasStock ? "text-on-surface-variant" : "text-outline"}`}>
                    {hasStock ? `${variant.stock} en stock` : "Sin stock"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex gap-3 pt-2 relative">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 bg-primary text-on-primary rounded-2xl font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
        >
          {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
          {inStock ? "Agregar al carrito" : "Sin stock"}
        </button>
        {selectedId && (
          <div className="flex justify-end shrink-0">
            <FavoriteButton variantId={selectedId} size="md" />
          </div>
        )}
        
        {/* Tooltip "Iniciá sesión" */}
        {showTooltip && (
          <div className="absolute bottom-full mb-3 left-1/4 whitespace-nowrap bg-on-surface text-surface text-xs font-bold px-3 py-2 rounded-xl shadow-xl z-[100] animate-in fade-in slide-in-from-bottom-1 duration-200">
            Iniciá sesión para usar el carrito
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-on-surface" />
          </div>
        )}
      </div>

      {/* Stock summary */}
      {totalStock > 0 && (
        <p className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Package className="w-4 h-4 text-primary" />
          <span>{totalStock} unidades disponibles en total</span>
        </p>
      )}
    </div>
  );
}
