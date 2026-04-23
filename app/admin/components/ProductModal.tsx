"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, UploadCloud, Image as ImageIcon, Trash2 } from "lucide-react";

type Category = { id: string; name: string };
type Brand = { id: string; name: string };
type Variant = { name: string; sku: string; price: string; stock: string };

export default function ProductModal({ categories, initialBrands }: { categories: Category[], initialBrands: Brand[] }) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCatName, setNewCatName] = useState("");

  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [brandId, setBrandId] = useState("");
  const [newBrandName, setNewBrandName] = useState("");

  const [variants, setVariants] = useState<Variant[]>([
    { name: "", sku: "", price: "", stock: "" }
  ]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setProductName("");
    setProductDesc("");
    setCategoryId("");
    setNewCatName("");
    setBrandId("");
    setNewBrandName("");
    setVariants([{ name: "", sku: "", price: "", stock: "" }]);
    setImageFile(null);
    setErrorMsg(null);
  };

  const openForm = () => setIsOpen(true);
  const closeForm = () => {
    if (isSubmitting) return;
    setIsOpen(false);
    resetForm();
  };

  // Drag and Drop helpers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Variants helpers
  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    const newVars = [...variants];
    newVars[index][field] = value;
    setVariants(newVars);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", sku: "", price: "", stock: "" }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!imageFile) {
      return setErrorMsg("Debes adjuntar o arrastrar al menos una imagen (Portada).");
    }
    if (!categoryId) {
      return setErrorMsg("Selecciona una de las categorías.");
    }
    if (!brandId) {
      return setErrorMsg("Selecciona o crea una marca.");
    }

    setIsSubmitting(true);

    try {
      // 1. Resolver la creación de Categoría "al vuelo" si eligió "NEW_CAT"
      let finalCategoryId = categoryId;
      if (categoryId === "NEW_CAT") {
        const catRes = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCatName })
        });
        const catData = await catRes.json();
        if (!catRes.ok) throw new Error("Error al crear categoría: " + catData.error);
        finalCategoryId = catData.id;
      }

      // 2. Resolver la creación de Marca "al vuelo" si el usuario eligió "NEW"
      let finalBrandId = brandId;
      if (brandId === "NEW") {
        const brandRes = await fetch("/api/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newBrandName })
        });
        const brandData = await brandRes.json();
        if (!brandRes.ok) throw new Error("Error al crear marca: " + brandData.error);
        finalBrandId = brandData.id;
        // Agregamos a la lista local para no tener que recargar todo
        setBrands(prev => [...prev, brandData]);
      }

      // 2. Subir Imagen cruda a Cloudinary para transformarla localmente a webp
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData, // No lleva Application/JSON porque enviamos BLOB
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Error subiendo la imagen a la nube.");

      // 3. Crear el Producto Integral
      const formattedVariants = variants.map(v => ({
        name: v.name,
        sku: v.sku || null,
        price: parseFloat(v.price),
        stock: parseInt(v.stock, 10)
      }));

      const productPayload = {
        name: productName,
        description: productDesc,
        brandId: finalBrandId,
        categoryId: finalCategoryId,
        images: [{
          url: uploadData.url,
          publicId: uploadData.publicId,
          altText: productName,
          isMain: true
        }],
        variants: formattedVariants
      };

      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload)
      });

      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.error || "Error insertando el producto en base de datos.");

      // Éxito absoluto.
      closeForm();
      router.refresh();

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openForm}
        className="bg-primary text-on-primary flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 cursor-pointer"
      >
        <Plus className="w-5 h-5" strokeWidth={3} />
        Añadir Nuevo Producto
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={closeForm}></div>

          {/* Modal Modal (Large Form) - Bento Aesthetic */}
          <div className="relative bg-surface p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-4xl border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200 mt-auto sm:my-auto">

            <button onClick={closeForm} className="absolute top-6 right-6 p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors cursor-pointer z-10">
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Alta de Producto</h2>
            <p className="text-on-surface-variant text-sm mb-8 font-medium">Sube fotografías de buena luz y define al menos un nivel de presentación de stock (variante).</p>

            {errorMsg && (
              <div className="p-4 mb-6 bg-error-container text-on-error-container text-sm font-medium rounded-xl border border-error/20">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* === LEFT COLUMN: Image & Categorization === */}
              <div className="space-y-6">

                {/* Drag and Drop Zone */}
                <div>
                  <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-2">Imagen del Producto (Auto WebP)</h3>

                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-48 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer overflow-hidden ${dragActive ? "border-primary bg-primary/10" : "border-outline-variant/50 bg-surface-container-lowest hover:bg-surface-container-low"
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleChangeFile}
                      className="hidden"
                    />

                    {imageFile ? (
                      <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-primary opacity-50 mb-2" />
                        <span className="font-bold text-sm text-primary max-w-[80%] truncate">{imageFile.name}</span>
                        <span className="text-xs text-on-surface-variant mt-1">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        <p className="text-xs text-primary/70 mt-4 opacity-70">(Clic para reemplazar)</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? "text-primary animate-bounce" : "text-outline"}`} strokeWidth={1.5} />
                        <p className="font-semibold text-sm text-on-surface">Arrastra tu fotografía aquí</p>
                        <p className="text-xs text-on-surface-variant mt-1">o haz clic para explorar</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Categories & Brands */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Categoría</label>
                    <select
                      required disabled={isSubmitting} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary font-medium disabled:opacity-50 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Seleccione...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      <option value="NEW_CAT" className="font-bold text-primary">✚ Crear Categoría Nueva</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Marca</label>
                    <select
                      required disabled={isSubmitting} value={brandId} onChange={(e) => setBrandId(e.target.value)}
                      className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary font-medium disabled:opacity-50 appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Seleccione...</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      <option value="NEW" className="font-bold text-primary">✚ Crear Marca Nueva</option>
                    </select>
                  </div>
                </div>

                {/* Modal in Modal for New Brand / Category */}
                {categoryId === "NEW_CAT" && (
                  <div className="col-span-2 space-y-2 p-4 bg-tertiary-container text-on-tertiary-container rounded-xl animate-in slide-in-from-top-2">
                    <label className="text-xs font-bold uppercase tracking-wider">Nombre de Nueva Categoría</label>
                    <input
                      type="text" required disabled={isSubmitting} value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Ej: Semillas"
                      className="w-full bg-surface px-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-tertiary font-medium"
                    />
                  </div>
                )}
                {brandId === "NEW" && (
                  <div className="col-span-2 space-y-2 p-4 bg-tertiary-container text-on-tertiary-container rounded-xl animate-in slide-in-from-top-2">
                    <label className="text-xs font-bold uppercase tracking-wider">Nombre de Nueva Marca</label>
                    <input
                      type="text" required disabled={isSubmitting} value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="Ej: Royal Canin"
                      className="w-full bg-surface px-4 py-2.5 rounded-lg border-none focus:ring-2 focus:ring-tertiary font-medium"
                    />
                  </div>
                )}

              </div>


              {/* === RIGHT COLUMN: Details & Variants === */}
              <div className="space-y-6 flex flex-col h-full">

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Nombre del Producto</label>
                  <input
                    type="text" required disabled={isSubmitting} value={productName} onChange={e => setProductName(e.target.value)} placeholder="Ej: Bolsa Semillas de Girasol Rayado"
                    className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary font-medium disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Descripción Breve</label>
                  <textarea
                    rows={2} disabled={isSubmitting} value={productDesc} onChange={e => setProductDesc(e.target.value)} placeholder="Opcional. Semillas de alta pureza especial para aves exóticas..."
                    className="w-full bg-surface-container text-on-surface px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary font-medium disabled:opacity-50 resize-none"
                  />
                </div>

                <div className="mt-4 grow">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Presentaciones / Variantes</h3>
                    <button type="button" disabled={isSubmitting} onClick={addVariant} className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Añadir Otra
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                    {variants.map((v, i) => (
                      <div key={i} className="flex gap-2 items-center bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30">
                        <input
                          type="text" required placeholder="Suelto 1kg, Bolsa 15kg" value={v.name} onChange={e => updateVariant(i, "name", e.target.value)}
                          className="w-1/3 bg-surface text-xs px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="number" step="0.01" required placeholder="Precio ($)" value={v.price} onChange={e => updateVariant(i, "price", e.target.value)}
                          className="w-1/4 bg-surface text-xs px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="number" required placeholder="Stock" min="0" value={v.stock} onChange={e => updateVariant(i, "stock", e.target.value)}
                          className="w-1/4 bg-surface text-xs px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="button" onClick={() => removeVariant(i)} disabled={variants.length === 1} className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-30 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-outline-variant/30 mt-auto">
                  <button
                    type="button" onClick={closeForm} disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl font-bold text-white transition-all cursor-pointer shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 flex gap-2 items-center"
                  >
                    {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {isSubmitting ? "Subiendo a la nube..." : "Guardar Producto"}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
