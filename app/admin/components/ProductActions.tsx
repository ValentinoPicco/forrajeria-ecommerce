"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import ProductModal from "./ProductModal";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };

export default function ProductActions({ 
  product, 
  variantId,
  variantName,
  categories, 
  initialBrands 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any;
  variantId: string;
  variantName: string;
  categories: Category[];
  initialBrands: Brand[];
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/variants/${variantId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al eliminar");
      }

      setShowDeleteModal(false);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "No se pudo eliminar el producto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex justify-center gap-2">
        <ProductModal 
          categories={categories} 
          initialBrands={initialBrands} 
          productToEdit={product}
          triggerType="edit-icon" 
        />
        
        <div className="relative group flex items-center justify-center">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-red-500 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="absolute bottom-full right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <span className="bg-on-surface text-surface text-xs font-bold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap relative after:absolute after:top-full after:right-3 after:border-4 after:border-transparent after:border-t-on-surface">
              Eliminar Variante
            </span>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          ></div>
          
          <div className="relative bg-surface p-8 mx-4 rounded-3xl shadow-2xl w-full max-w-md border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-primary mb-6 tracking-tight">
              Eliminar Variante
            </h2>

            <form onSubmit={handleDelete} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-error-container text-on-error-container text-sm font-medium rounded-xl border border-error/20">
                  {errorMsg}
                </div>
              )}

              <p className="text-on-surface text-lg">
                ¿Estás seguro que deseas eliminar la presentación <strong className="text-primary">{variantName}</strong> del producto <strong className="text-primary">{product.name}</strong>?
              </p>
              <p className="text-on-surface-variant text-sm">
                Esta acción es definitiva y borrará esta variante. No eliminará todo el producto.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl font-bold text-white disabled:opacity-70 transition-all cursor-pointer shadow-md bg-red-500 hover:bg-red-600 shadow-red-500/20"
                >
                  {isDeleting ? "Procesando..." : "Sí, eliminar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
