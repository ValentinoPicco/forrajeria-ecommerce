/* eslint-disable @next/next/no-html-link-for-pages */
import {
  LayoutGrid,
  List,
  Heart,
  ChevronLeft,
  ChevronRight,
  Tractor,
  ShoppingCart
} from 'lucide-react';
import Header from "./components/Header";

import { prisma } from "@/lib/prisma";
import StoreFilter from "./components/StoreFilter";
import { Suspense } from "react";

export default async function Home(props: { searchParams: Promise<{ category?: string, inStock?: string, minPrice?: string, maxPrice?: string }> }) {
  const resolvedParams = await props.searchParams;
  const filterCat = resolvedParams.category;
  const inStock = resolvedParams.inStock === "true";
  
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;

  // Construir lógicas condicionales para precio
  let priceFilter: any = {};
  if (minPrice !== undefined && !isNaN(minPrice)) priceFilter.gte = minPrice;
  if (maxPrice !== undefined && !isNaN(maxPrice)) priceFilter.lte = maxPrice;
  const hasPriceFilter = Object.keys(priceFilter).length > 0;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(filterCat ? { categoryId: filterCat } : {}),
        ...(inStock || hasPriceFilter 
          ? { 
              variants: { 
                some: { 
                  ...(inStock ? { stock: { gt: 0 } } : {}),
                  ...(hasPriceFilter ? { price: priceFilter } : {})
                } 
              } 
            } 
          : {})
      },
      include: {
        category: true,
        variants: true,
        images: true,
      },
    }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      <Header />

      <main className="grow">
        {/* Catalog Section */}
        <section className="max-w-7xl mx-auto px-8 py-12 md:py-16">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Filter Sidebar */}
            <Suspense fallback={<div className="w-full lg:w-64 shrink-0 animate-pulse bg-surface-container/50 h-96 rounded-xl"></div>}>
              <StoreFilter categories={categories} />
            </Suspense>

            {/* Product Grid */}
            <div className="grow">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant mb-1">Mostrando {products.length} productos</p>
                  <h2 className="text-3xl font-bold text-primary tracking-tight">Catálogo de Temporada</h2>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg bg-surface-container-low text-primary cursor-pointer">
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg text-outline-variant cursor-pointer">
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.length === 0 ? (
                  <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-surface-container-high border-dashed">
                    <Tractor className="w-16 h-16 text-outline mb-4 opacity-30" />
                    <h3 className="text-2xl font-bold text-primary mb-2">Aún no hay productos</h3>
                    <p className="text-on-surface-variant max-w-sm mx-auto">Pronto contaremos con los mejores insumos para el campo en nuestro catálogo.</p>
                  </div>
                ) : (
                  <>
                    {products.map((product) => {
                      const mainImage = product.images.find(i => i.isMain) || product.images[0];
                      const basePrice = product.variants.length > 0 ? `$${product.variants[0].price.toString()}` : 'No def.';
                      
                      return (
                        <div key={product.id} className="group relative bg-surface-container-low rounded-2xl overflow-hidden hover:bg-surface-container-lowest transition-all duration-500 hover:-translate-y-1">
                          <div className="aspect-square overflow-hidden bg-surface-container relative flex items-center justify-center">
                            {mainImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 absolute inset-0"
                                alt={product.name}
                                src={mainImage.url}
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <Tractor className="w-12 h-12 text-outline/30" />
                            )}
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest rounded-full">
                                {product.category?.name || 'Varios'}
                              </span>
                              <Heart className="w-5 h-5 text-outline hover:text-primary cursor-pointer transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors cursor-pointer">
                              {product.name}
                            </h3>
                            <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">
                              {product.description || 'Sin descripción disponible para este producto.'}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-black text-primary">{basePrice}</span>
                              <button className="p-3 bg-primary text-on-primary rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors cursor-pointer">
                                <ShoppingCart className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Special CTA Card (Asymmetric Bento Element) */}
                <div className="relative bg-tertiary rounded-2xl overflow-hidden p-6 flex flex-col justify-between group h-fit self-start">
                  <div className="z-10">
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">¿Tienes dudas?</h3>
                    <p className="text-white/80 text-sm mb-6">Nuestro personal puede ayudarte</p>
                    <button className="px-6 py-3 bg-white text-tertiary rounded-xl font-bold text-sm tracking-tight hover:bg-white/90 transition-colors relative z-20 cursor-pointer">
                      Contactanos
                    </button>
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* Pagination */}
              <div className="mt-16 flex justify-center gap-2">
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-high text-primary cursor-pointer hover:bg-surface-container">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-on-primary font-bold cursor-pointer">1</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer">2</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer">3</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-high text-primary cursor-pointer hover:bg-surface-container">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[#f2f4d8] dark:bg-stone-900 border-t border-primary-container/10 transition-colors duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            {/* Logo o marca iría aquí */}
            <div className="text-sm tracking-normal text-primary-container dark:text-stone-400">© {new Date().getFullYear()}. Todos los derechos reservados.</div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary dark:hover:text-[#f9fbea] transition-colors" href="#">Facebook</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary dark:hover:text-[#f9fbea] transition-colors" href="#">Instagram</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary dark:hover:text-[#f9fbea] transition-colors" href="#">WhatsApp</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary dark:hover:text-[#f9fbea] transition-colors" href="#">Términos y Condiciones</a>
          </div>
        </div>
      </footer>
    </div>
  );
}