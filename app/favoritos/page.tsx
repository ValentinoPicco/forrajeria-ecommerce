import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import ProductCard from "@/app/components/ProductCard";
import { HeartCrack } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Mis Favoritos | Querida Pampa",
  description: "Tus productos favoritos de Querida Pampa",
};

export default async function FavoritosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/"); // Si no está logueado, lo mandamos al inicio
  }

  // Obtenemos los favoritos del usuario (variantes), y con ellas, el producto
  const wishlistedVariants = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      variant: {
        include: {
          product: {
            include: {
              category: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      <Header />

      <main className="grow max-w-7xl mx-auto px-8 py-12 md:py-16 w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Mis Favoritos</h1>
          <p className="text-sm font-medium text-on-surface-variant mt-2">
            Tienes {wishlistedVariants.length} {wishlistedVariants.length === 1 ? 'presentación guardada' : 'presentaciones guardadas'}.
          </p>
        </div>

        {wishlistedVariants.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-surface-container-high border-dashed">
            <HeartCrack className="w-16 h-16 text-outline mb-4 opacity-30" />
            <h3 className="text-2xl font-bold text-primary mb-2">Aún no hay favoritos</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto mb-6">
              Navega por nuestro catálogo y guarda las presentaciones que más te gusten.
            </p>
            <Link 
              href="/"
              className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {wishlistedVariants.map((item) => {
              const product = item.variant.product;
              const mainImage = product.images.find((i) => i.isMain) || product.images[0];
              const variantPrice = `$${item.variant.price.toString()}`;

              return (
                <ProductCard
                  key={item.id}
                  id={product.id}
                  name={`${product.name} - ${item.variant.name}`}
                  description={product.description}
                  categoryName={product.category?.name ?? null}
                  basePrice={variantPrice}
                  mainImageUrl={mainImage?.url ?? null}
                  mainImageAlt={mainImage?.altText ?? null}
                  defaultVariantId={item.variantId}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Footer minimalista para no repetir código extenso (lo ideal es extraerlo a un componente) */}
      <footer className="w-full mt-auto bg-[#f2f4d8] dark:bg-stone-900 border-t border-primary-container/10">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto">
          <div className="text-sm tracking-normal text-primary-container dark:text-stone-400">
            © {new Date().getFullYear()}. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
