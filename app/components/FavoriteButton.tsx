"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  variantId: string;
  // Tamaño: "sm" para las cards del catálogo, "md" para la página de detalle
  size?: "sm" | "md";
}

export default function FavoriteButton({ variantId, size = "sm" }: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Carga el estado inicial desde la API
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.favorites)) {
          setIsFavorite(data.favorites.includes(variantId));
        }
      })
      .catch((err) => console.error("Error loading favorites:", err));
  }, [variantId, status]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evita navegar si está dentro de un <a>
    e.stopPropagation();

    if (status !== "authenticated") {
      // Muestra tooltip de "Iniciá sesión" brevemente
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
      return;
    }

    setLoading(true);
    const prev = isFavorite;
    setIsFavorite(!prev); // Optimistic update

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      if (!res.ok) throw new Error();
      
      // Actualiza la página actual por si estamos en /favoritos
      router.refresh();
    } catch {
      setIsFavorite(prev); // Rollback si falla
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "md" ? "w-5 h-5" : "w-5 h-5";
  const btnBase =
    size === "md"
      ? "relative p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer"
      : "relative cursor-pointer transition-colors";

  const btnClass =
    size === "md"
      ? `${btnBase} z-20 ${
          isFavorite
            ? "border-red-400 bg-red-50 text-red-500 hover:bg-red-100"
            : "border-outline-variant text-outline hover:border-red-300 hover:text-red-400"
        }`
      : `${btnBase} z-20 ${isFavorite ? "text-red-500" : "text-outline hover:text-red-400"}`;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        className={btnClass}
      >
        <Heart
          className={`${iconSize} transition-all duration-200 ${
            isFavorite ? "fill-current scale-110" : ""
          } ${loading ? "opacity-50" : ""}`}
        />
      </button>

      {/* Tooltip "Iniciá sesión" */}
      {showTooltip && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-on-surface text-surface text-[10px] sm:text-xs font-bold px-3 py-2 rounded-xl shadow-xl z-[100] animate-in fade-in slide-in-from-bottom-1 duration-200">
          Iniciá sesión para guardar favoritos
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-on-surface" />
        </div>
      )}
    </div>
  );
}
