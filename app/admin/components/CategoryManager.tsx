"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedCat = initialCategories.find(c => c.id === selectedCatId);

  const openAdd = () => {
    setInputValue("");
    setErrorMsg(null);
    setModalType("add");
  };

  const openEdit = () => {
    if (!selectedCat) return;
    setInputValue(selectedCat.name);
    setErrorMsg(null);
    setModalType("edit");
  };

  const openDelete = () => {
    if (!selectedCat) return;
    setErrorMsg(null);
    setModalType("delete");
  };

  const closeModal = () => {
    if (isLoading) return;
    setModalType(null);
    setInputValue("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (modalType === "add") {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: inputValue }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al añadir");
      } 
      else if (modalType === "edit") {
        const res = await fetch(`/api/categories/${selectedCatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: inputValue }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al editar");
      } 
      else if (modalType === "delete") {
        const res = await fetch(`/api/categories/${selectedCatId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al eliminar");
        setSelectedCatId(null); // Deseleccionar al borrar exitosamente
      }

      // Éxito:
      closeModal();
      router.refresh(); // Pide al server que refresque `initialCategories` nativamente sin recargar
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-low p-6 rounded-xl relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Filtros de Categoría</h3>
        
        {/* Actions Menu */}
        <div className="flex gap-1 border border-outline-variant p-1 rounded-xl bg-surface">
          <div className="relative group flex items-center justify-center">
            <button 
              onClick={openAdd}
              title="Añadir nueva categoría"
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
          <div className="relative group flex items-center justify-center">
            <button 
              onClick={openEdit}
              disabled={!selectedCatId}
              title={!selectedCatId ? "Selecciona una categoría primero" : "Editar categoría seleccionada"}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-6 my-auto bg-outline-variant mx-0.5"></div>
          <div className="relative group flex items-center justify-center">
            <button 
              onClick={openDelete}
              disabled={!selectedCatId}
              title={!selectedCatId ? "Selecciona una categoría primero" : "Eliminar categoría seleccionada"}
              className="p-1.5 text-red-500 hover:bg-surface-container-high rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Chips */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => {
            setSelectedCatId(null);
            router.push("?");
          }}
          className={`px-5 py-2 rounded-full cursor-pointer text-sm font-bold shadow-sm transition-all ${
            selectedCatId === null 
              ? "bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low" 
              : "bg-surface text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          }`}
        >
          Todos
        </button>
        
        {initialCategories.length === 0 ? (
          <span className="text-sm font-medium text-on-surface-variant my-auto italic">
            No hay categorías registradas.
          </span>
        ) : (
          initialCategories.map(cat => {
            const isSelected = cat.id === selectedCatId;
            return (
              <button 
                key={cat.id} 
                onClick={() => {
                  const isNowSelected = !isSelected;
                  setSelectedCatId(isNowSelected ? cat.id : null);
                  router.push(isNowSelected ? `?category=${cat.id}` : "?");
                }}
                className={`px-5 py-2 rounded-full cursor-pointer text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-primary text-on-primary ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low shadow-md transform scale-105"
                    : "bg-secondary-container text-on-secondary-container hover:bg-primary-container hover:text-on-primary-container"
                }`}
              >
                {cat.name}
              </button>
            );
          })
        )}
      </div>

      {/* === MODAL LAYER === */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-surface p-8 mx-4 rounded-3xl shadow-2xl w-full max-w-md border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-primary mb-6 tracking-tight">
              {modalType === "add" && "Añadir Categoría"}
              {modalType === "edit" && "Editar Categoría"}
              {modalType === "delete" && "Eliminar Categoría"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-4 bg-error-container text-on-error-container text-sm font-medium rounded-xl border border-error/20">
                  {errorMsg}
                </div>
              )}

              {modalType !== "delete" ? (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
                    Nombre de la Categoría
                  </label>
                  <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    required
                    disabled={isLoading}
                    autoFocus
                    placeholder="Ej: Accesorios, Nutrición..."
                    className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50 font-medium disabled:opacity-50"
                  />
                </div>
              ) : (
                <p className="text-on-surface text-lg">
                  ¿Estás seguro que deseas eliminar la categoría <strong className="text-primary">{selectedCat?.name}</strong>?
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={closeModal}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`px-6 py-2.5 rounded-xl font-bold text-white disabled:opacity-70 transition-all cursor-pointer shadow-md ${
                    modalType === "delete" 
                      ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                      : "bg-primary hover:bg-primary/90 shadow-primary/20"
                  }`}
                >
                  {isLoading ? "Procesando..." : (modalType === "delete" ? "Sí, eliminar" : "Guardar")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
