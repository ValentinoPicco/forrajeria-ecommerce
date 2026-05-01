import { prisma } from "@/lib/prisma";
import { Package, Search, Calendar, User, ShoppingBag } from "lucide-react";
import OrderActions from "./OrderActions";

const statusMap: Record<string, { label: string; colorClass: string }> = {
  PENDING: { label: "Pendiente", colorClass: "bg-surface-container-high text-on-surface-variant" },
  PAID: { label: "Pagado (Preparar)", colorClass: "bg-green-100 text-green-800 border border-green-200" },
  SHIPPED: { label: "Enviado", colorClass: "bg-blue-100 text-blue-800 border border-blue-200" },
  DELIVERED: { label: "Entregado", colorClass: "bg-primary-container text-on-primary-container border border-primary/20" },
  CANCELLED: { label: "Cancelado", colorClass: "bg-error-container text-on-error-container" },
};

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      items: {
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });

  return (
    <main className="flex-1 p-8 bg-surface overflow-y-auto">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-on-background tracking-tighter leading-none mb-2">Gestión de Pedidos</h1>
          <p className="text-on-surface-variant font-medium">Administra las compras, envíos y entregas a tus clientes.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container p-16 text-center text-on-surface-variant flex flex-col items-center">
          <ShoppingBag className="w-16 h-16 mb-6 opacity-30" />
          <p className="text-2xl font-bold text-primary tracking-tight mb-2">Aún no hay pedidos</p>
          <p className="text-sm max-w-sm mx-auto">Cuando los clientes realicen compras a través de Mercado Pago, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusConfig = statusMap[order.status] || statusMap.PENDING;
            
            return (
              <div key={order.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container overflow-hidden">
                {/* Cabecera de la Orden */}
                <div className="bg-surface-container-low px-6 py-4 border-b border-surface-container flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Orden ID</p>
                      <p className="font-mono text-sm font-semibold">{order.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha</p>
                      <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Cliente</p>
                      <p className="text-sm font-semibold">{order.user.name || 'Cliente'} <span className="text-xs font-normal text-on-surface-variant opacity-80">({order.user.email})</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.colorClass}`}>
                      {statusConfig.label}
                    </span>
                    <OrderActions orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>

                {/* Detalles de Ítems */}
                <div className="p-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface-container-high">
                        <th className="pb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Producto</th>
                        <th className="pb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Cant.</th>
                        <th className="pb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Precio Unit.</th>
                        <th className="pb-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3">
                            <p className="font-bold text-on-surface text-sm">{item.variant.product.name}</p>
                            <p className="text-xs text-primary">{item.variant.name}</p>
                          </td>
                          <td className="py-3 text-center text-sm font-medium">{item.quantity}</td>
                          <td className="py-3 text-right text-sm font-medium">${Number(item.price).toFixed(2)}</td>
                          <td className="py-3 text-right text-sm font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-4 pt-4 border-t border-surface-container flex justify-end">
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Pagado</p>
                      <p className="text-2xl font-black text-primary">${Number(order.total).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
