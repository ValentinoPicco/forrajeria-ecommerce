import { Package, Pencil, Trash2 } from 'lucide-react';
import { prisma } from "@/lib/prisma";
import CategoryManager from "./components/CategoryManager";
import ProductModal from "./components/ProductModal";

export default async function AdminDashboard(props: { searchParams: Promise<{ category?: string }> }) {
  const resolvedParams = await props.searchParams;
  const filterCat = resolvedParams.category;

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: filterCat ? { categoryId: filterCat } : undefined,
      include: {
        category: true,
        variants: true,
        images: true,
        brand: true,
      },
    }),
    prisma.category.findMany(),
    prisma.brand.findMany()
  ]);

  const allVariants = products.flatMap(p => p.variants);
  const lowStockCount = allVariants.filter(v => v.stock < 10).length;

  return (
    <main className="flex-1 p-8 bg-surface">
      {/* Page Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-on-background tracking-tighter leading-none mb-2">Gestión de Productos</h1>
          <p className="text-on-surface-variant font-medium">Administre el inventario central de su forrajería con precisión editorial.</p>
        </div>
        <ProductModal categories={categories} initialBrands={brands} />
      </div>

      {/* Dashboard Stats / Filters (Asymmetric Layout) */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Filters Column */}
        {/* Category Interactor Component */}
        <CategoryManager initialCategories={categories} />

        {/* Summary Card */}
        <div className="col-span-12 lg:col-span-4 bg-primary-container text-on-primary-container p-6 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Estado de Stock</p>
            <p className="text-3xl font-extrabold tracking-tighter">{allVariants.length} Variantes</p>
            <p className="text-sm mt-2 font-medium">{lowStockCount} variantes en stock crítico</p>
          </div>
          <Package className="absolute -right-6 -bottom-6 w-40 h-40 opacity-10 rotate-12" strokeWidth={1} />
        </div>
      </div>

      {/* Inventory Table (Bento Style/Clean Editorial) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant flex flex-col items-center">
            <Package className="w-16 h-16 mb-6 opacity-30" />
            <p className="text-2xl font-bold text-primary tracking-tight mb-2">No tienes productos en tu inventario</p>
            <p className="text-sm max-w-sm mx-auto mb-6">Empieza a gestionar tu tienda agregando tu primer producto usando el botón en la parte superior derecha.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-container">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Imagen</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Nombre</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Categoría</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Marca</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Precio</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {products.flatMap((product) => {
                  const mainImage = product.images.find(i => i.isMain) || product.images[0];
                  
                  return product.variants.map((variant) => (
                    <tr key={variant.id} className="hover:bg-surface-container-low transition-colors group/row">
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden bg-surface-container shrink-0 border border-surface-container-high flex items-center justify-center">
                          {mainImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={mainImage.url} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover/row:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-outline/50" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold text-on-surface tracking-tight">{product.name}</p>
                        <p className="text-sm text-primary font-semibold">{variant.name}</p>
                        <p className="text-xs text-on-surface-variant mt-1">SKU: {variant.sku || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
                          {product.category?.name || 'Varios'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold">
                          {product.brand?.name || 'Sin marca'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-bold ${variant.stock < 10 ? 'text-error' : 'text-on-surface'}`}>{variant.stock} un.</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold text-primary">${variant.price.toString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <div className="relative group flex items-center justify-center">
                            <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer">
                              <Pencil className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-full right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              <span className="bg-on-surface text-surface text-xs font-bold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap relative after:absolute after:top-full after:right-3 after:border-4 after:border-transparent after:border-t-on-surface">
                                Editar Producto
                              </span>
                            </div>
                          </div>
                          <div className="relative group flex items-center justify-center">
                            <button className="p-2 text-red-500 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer">
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-full right-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              <span className="bg-on-surface text-surface text-xs font-bold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap relative after:absolute after:top-full after:right-3 after:border-4 after:border-transparent after:border-t-on-surface">
                                Eliminar Producto
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 flex justify-between items-center bg-surface-container-low border-t border-surface-container">
              <p className="text-xs text-on-surface-variant font-medium">Mostrando {products.length} de {products.length} productos</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors text-sm cursor-pointer disabled:opacity-50" disabled>Anterior</button>
                <button className="px-3 py-1 rounded bg-primary text-on-primary font-bold text-sm">1</button>
                <button className="px-3 py-1 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors text-sm cursor-pointer disabled:opacity-50" disabled>Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}