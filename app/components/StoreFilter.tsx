"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; name: string };

export default function StoreFilter({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCatId, setSelectedCatId] = useState<string | null>(searchParams.get("category"));
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get("inStock") === "true");

  const [minPrice, setMinPrice] = useState<string>(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "");

  const buildQuery = (catId: string | null, stock: boolean, minP?: string, maxP?: string) => {
    const params = new URLSearchParams();
    if (catId) params.set("category", catId);
    if (stock) params.set("inStock", "true");
    
    const finalMin = minP !== undefined ? minP : minPrice;
    const finalMax = maxP !== undefined ? maxP : maxPrice;
    
    if (finalMin) params.set("minPrice", finalMin);
    if (finalMax) params.set("maxPrice", finalMax);
    
    return params.toString();
  };

  const handleCategoryClick = (catId: string | null) => {
    setSelectedCatId(catId);
    router.push(`?${buildQuery(catId, inStockOnly)}`);
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setInStockOnly(checked);
    router.push(`?${buildQuery(selectedCatId, checked)}`);
  };

  const applyPriceFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push(`?${buildQuery(selectedCatId, inStockOnly, minPrice, maxPrice)}`);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-28 space-y-10">
        
        {/* Categories */}
        <div>
          <h3 className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-6">Categorías</h3>
          <ul className="space-y-4">
            <li>
              <button 
                onClick={() => handleCategoryClick(null)}
                className={`flex items-center gap-3 font-semibold group cursor-pointer transition-colors ${selectedCatId === null ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full transition-transform ${selectedCatId === null ? "bg-primary scale-150" : "bg-outline-variant group-hover:bg-primary group-hover:scale-150"}`}></span>
                Ver Todo
              </button>
            </li>
            
            {categories.length === 0 ? (
              <li className="text-sm italic text-on-surface-variant">No hay categorías.</li>
            ) : (
              categories.map(cat => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <li key={cat.id}>
                    <button 
                      onClick={() => handleCategoryClick(isSelected ? null : cat.id)}
                      className={`flex items-center gap-3 font-semibold group cursor-pointer transition-colors ${isSelected ? "text-primary text-base" : "text-on-surface-variant hover:text-primary"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-all ${isSelected ? "bg-primary scale-150" : "bg-outline-variant group-hover:bg-primary group-hover:scale-150"}`}></span>
                      {cat.name}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Price Range */}
        <div className="pt-6 border-t border-outline-variant/20">
          <h3 className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4">Rango de Precio</h3>
          <form onSubmit={applyPriceFilter} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-on-surface-variant text-sm font-bold">$</span>
                <input 
                  type="number" min="0" 
                  value={minPrice} onChange={e => setMinPrice(e.target.value)}
                  placeholder="Mínimo" 
                  className="w-full bg-surface text-on-surface pl-7 pr-3 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-sm"
                />
              </div>
              <span className="text-on-surface-variant font-bold">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-on-surface-variant text-sm font-bold">$</span>
                <input 
                  type="number" min="0" 
                  value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Máximo" 
                  className="w-full bg-surface text-on-surface pl-7 pr-3 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-transparent font-medium text-sm"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-2 bg-secondary-container text-on-secondary-container font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-colors cursor-pointer text-sm"
            >
              Aplicar Precio
            </button>
          </form>
        </div>

        {/* Availability */}
        <div className="pt-6 border-t border-outline-variant/20">
          <h3 className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4">Disponibilidad</h3>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input 
              checked={inStockOnly}
              onChange={handleStockChange}
              className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5 cursor-pointer accent-primary" 
              type="checkbox" 
            />
            <span className={`transition-colors font-medium ${inStockOnly ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"}`}>
              En Stock Fisico únicamente
            </span>
          </label>
        </div>
        
      </div>
    </aside>
  );
}
