"use client";

import { useState } from "react";
import { ShoppingCart, Package } from "lucide-react";
import FavoriteButton from "./FavoriteButton";

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
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? null
  );

  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const inStock = selected ? selected.stock > 0 : false;
  const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

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
      <div className="flex gap-3 pt-2">
        <button
          disabled={!inStock}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 bg-primary text-on-primary rounded-2xl font-bold text-base shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          {inStock ? "Agregar al carrito" : "Sin stock"}
        </button>
        {selectedId && (
          <div className="flex justify-end shrink-0">
            <FavoriteButton variantId={selectedId} size="md" />
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
