import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import {
  ChevronLeft,
  Tractor,
  CheckCircle,
  AlertCircle,
  Tag,
} from "lucide-react";
import VariantSelector from "@/app/components/VariantSelector";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true },
  });
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | Querida Pampa`,
    description: product.description ?? `${product.name} de ${product.brand.name}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      variants: { orderBy: { price: "asc" } },
      images: true,
    },
  });

  if (!product) notFound();

  const mainImage = product.images.find((i) => i.isMain) || product.images[0];
  const otherImages = product.images.filter((i) => i.id !== mainImage?.id);
  const allImages = mainImage ? [mainImage, ...otherImages] : product.images;
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      <Header />

      <main className="grow">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-10">
            <a href="/" className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
              <ChevronLeft className="w-4 h-4" />
              Volver al catálogo
            </a>
            <span className="text-outline-variant">/</span>
            <span className="text-outline">{product.category.name}</span>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-semibold line-clamp-1">{product.name}</span>
          </nav>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

            {/* ── LEFT: Image Gallery ── */}
            <div className="flex flex-col gap-4">
              {/* Main Image */}
              <div className="aspect-square rounded-3xl overflow-hidden bg-surface-container relative flex items-center justify-center group">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainImage.url}
                    alt={mainImage.altText ?? product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Tractor className="w-24 h-24 text-outline/20" />
                )}
                {/* Stock badge */}
                <div className="absolute top-4 left-4">
                  {inStock ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest/90 backdrop-blur-sm text-primary text-xs font-bold rounded-full border border-primary/20">
                      <CheckCircle className="w-3.5 h-3.5" />
                      En stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest/90 backdrop-blur-sm text-outline text-xs font-bold rounded-full border border-outline/20">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Sin stock
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {allImages.map((img) => (
                    <div
                      key={img.id}
                      className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-surface-container border-2 border-surface-container-high hover:border-primary transition-colors cursor-pointer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.altText ?? product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product Info ── */}
            <div className="flex flex-col gap-6">

              {/* Category + Brand */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-widest rounded-full">
                  {product.category.name}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-on-surface-variant font-medium">
                  <Tag className="w-3.5 h-3.5" />
                  {product.brand.name}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-4xl font-extrabold text-on-surface leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Description */}
              {product.description && (
                <p className="text-on-surface-variant leading-relaxed text-base">
                  {product.description}
                </p>
              )}

              {/* Divider */}
              <div className="border-t border-outline-variant/40" />

              {/* Variant selector interactivo (Client Component) */}
              <VariantSelector
                variants={product.variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  price: v.price.toString(),
                  stock: v.stock,
                  sku: v.sku,
                }))}
              />

              {/* Divider */}
              <div className="border-t border-outline-variant/40" />

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-surface-container-low rounded-xl px-4 py-3">
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">Categoría</p>
                  <p className="font-bold text-on-surface">{product.category.name}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl px-4 py-3">
                  <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">Marca</p>
                  <p className="font-bold text-on-surface">{product.brand.name}</p>
                </div>
                {product.variants.length > 0 && (
                  <div className="bg-surface-container-low rounded-xl px-4 py-3">
                    <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">Presentaciones</p>
                    <p className="font-bold text-on-surface">{product.variants.length} opciones</p>
                  </div>
                )}
                {product.variants[0]?.sku && (
                  <div className="bg-surface-container-low rounded-xl px-4 py-3">
                    <p className="text-on-surface-variant text-xs uppercase tracking-widest font-semibold mb-1">SKU</p>
                    <p className="font-bold text-on-surface font-mono">{product.variants[0].sku}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[#f2f4d8] dark:bg-stone-900 border-t border-primary-container/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-sm tracking-normal text-primary-container dark:text-stone-400">
              © {new Date().getFullYear()}. Todos los derechos reservados.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary transition-colors" href="#">Facebook</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary transition-colors" href="#">Instagram</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary transition-colors" href="#">WhatsApp</a>
            <a className="text-sm tracking-normal text-primary-container dark:text-stone-400 opacity-80 hover:text-primary transition-colors" href="#">Términos y Condiciones</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
