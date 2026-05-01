import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import { Calendar, PackageOpen, Truck, CheckCircle, Package } from "lucide-react";
import Link from "next/link";

const statusMap: Record<string, { label: string; icon: any; colorClass: string }> = {
  PENDING: { label: "Pago Pendiente", icon: Package, colorClass: "bg-surface-container text-on-surface-variant" },
  PAID: { label: "Preparando paquete", icon: PackageOpen, colorClass: "bg-primary/10 text-primary border border-primary/20" },
  SHIPPED: { label: "En camino", icon: Truck, colorClass: "bg-blue-100 text-blue-800 border border-blue-200" },
  DELIVERED: { label: "Entregado", icon: CheckCircle, colorClass: "bg-green-100 text-green-800 border border-green-200" },
  CANCELLED: { label: "Cancelado", icon: Package, colorClass: "bg-error-container text-on-error-container" },
};

export const metadata = {
  title: "Mis Pedidos | Querida Pampa",
  description: "Historial de tus compras",
};

export default async function MisPedidosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: true
                }
              }
            }
          }
        }
      }
    }
  });

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="grow max-w-5xl mx-auto w-full px-4 sm:px-8 py-12">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Mis Pedidos</h1>
        <p className="text-on-surface-variant mb-8">Revisa el historial y estado de tus compras.</p>

        {orders.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-surface-container-high border-dashed">
            <Package className="w-16 h-16 text-outline mb-4 opacity-30" />
            <h3 className="text-2xl font-bold text-primary mb-2">Aún no tienes pedidos</h3>
            <p className="text-on-surface-variant max-w-sm mx-auto mb-6">
              Cuando realices una compra, aparecerá aquí para que puedas hacerle seguimiento.
            </p>
            <Link 
              href="/"
              className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const statusConfig = statusMap[order.status] || statusMap.PENDING;
              const StatusIcon = statusConfig.icon;

              return (
                <div key={order.id} className="bg-surface-container-low rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30">
                  {/* Cabecera del pedido */}
                  <div className="bg-surface-container px-6 py-4 flex flex-wrap gap-4 items-center justify-between border-b border-outline-variant/30">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Orden</p>
                        <p className="font-mono text-sm font-semibold text-on-surface">#{order.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Fecha
                        </p>
                        <p className="text-sm font-semibold text-on-surface">
                          {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-1">Total Pagado</p>
                        <p className="text-sm font-black text-primary">${Number(order.total).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${statusConfig.colorClass}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div className="p-6">
                    <h3 className="text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-widest">Productos del paquete</h3>
                    <div className="space-y-4">
                      {order.items.map((item) => {
                        const product = item.variant.product;
                        const mainImage = product.images.find((img: any) => img.isMain) || product.images[0];
                        
                        return (
                          <div key={item.id} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-surface-container transition-colors">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-surface rounded-xl overflow-hidden relative border border-outline-variant/20">
                              {mainImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={mainImage.url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-outline/30 text-xs">Sin img</div>
                              )}
                            </div>
                            
                            <div className="grow">
                              <Link href={`/producto/${product.id}`} className="font-bold text-on-surface hover:text-primary transition-colors line-clamp-1">
                                {product.name}
                              </Link>
                              <p className="text-sm text-on-surface-variant mt-0.5">{item.variant.name}</p>
                              <p className="text-xs text-on-surface-variant mt-1 font-medium">Cantidad: {item.quantity}</p>
                            </div>
                            
                            <div className="text-right shrink-0 pr-2">
                              <p className="font-bold text-primary">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
