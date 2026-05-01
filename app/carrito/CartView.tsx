"use client";

import { useCart } from "@/app/context/CartContext";
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function CartView() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, isLoading, updateQuantity, removeItem, subtotal, totalItems, clearCartLocal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // Si retornamos exitosamente de Mercado Pago
    const mpStatus = searchParams.get('status');
    if (mpStatus === 'success' || mpStatus === 'approved') {
      setPaymentSuccess(true);
      clearCartLocal();
      // Opcional: limpiar la url sin recargar
      window.history.replaceState(null, '', '/carrito');
    }
  }, [searchParams, clearCartLocal]);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart?.items || [] })
      });

      const data = await response.json();

      if (response.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert(data.error || 'Error al iniciar el pago');
        setIsCheckingOut(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error de conexión al iniciar el pago');
      setIsCheckingOut(false);
    }
  };

  if (status !== "authenticated" || isLoading) {
    return (
      <main className="grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    );
  }

  const items = cart?.items || [];

  if (paymentSuccess) {
    return (
      <main className="grow max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-surface-container-low p-12 rounded-3xl border border-primary/20 shadow-xl flex flex-col items-center text-center max-w-lg">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface mb-4">¡Pago Exitoso!</h1>
          <p className="text-on-surface-variant text-lg mb-8">
            Tu pago ha sido procesado correctamente. En breve prepararemos tu pedido.
          </p>
          <Link 
            href="/"
            className="px-8 py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-primary/30 transition-all"
          >
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grow max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full">
      <h1 className="text-3xl font-bold text-primary tracking-tight mb-8">Tu Carrito</h1>

      {items.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-surface-container-low rounded-2xl border border-surface-container-high border-dashed">
          <ShoppingBag className="w-16 h-16 text-outline mb-4 opacity-30" />
          <h3 className="text-2xl font-bold text-primary mb-2">Tu carrito está vacío</h3>
          <p className="text-on-surface-variant max-w-sm mx-auto mb-6">
            Parece que aún no has agregado ningún producto.
          </p>
          <Link 
            href="/"
            className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Volver a la tienda
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Lista de productos */}
          <div className="grow w-full space-y-4">
            {items.map((item) => {
              const product = item.variant.product;
              const mainImage = product.images.find(img => img.isMain) || product.images[0];
              
              return (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-surface-container-low rounded-2xl relative">
                  {/* Imagen */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-surface-container shrink-0 relative">
                    {mainImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mainImage.url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-outline/30">Sin imagen</div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex flex-col grow py-1">
                    <div className="flex justify-between items-start gap-4 pr-8 sm:pr-0">
                      <div>
                        <Link href={`/producto/${product.id}`} className="text-lg font-bold text-on-surface hover:text-primary transition-colors">
                          {product.name}
                        </Link>
                        <p className="text-sm text-on-surface-variant mb-1">{item.variant.name}</p>
                        <p className="font-black text-primary">${item.variant.price.toString()}</p>
                      </div>
                      
                      {/* Botón eliminar móvil (absoluto) o desktop (relativo) */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute top-4 right-4 sm:static p-2 text-error/80 hover:bg-error/10 hover:text-error rounded-lg transition-colors"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-auto pt-4 flex justify-between items-center">
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-3 bg-surface-container rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded bg-surface hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded bg-surface hover:bg-surface-container-high transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Subtotal del item */}
                      <div className="font-bold text-on-surface">
                        ${(Number(item.variant.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="w-full lg:w-80 lg:sticky lg:top-24 bg-surface-container-low p-6 rounded-2xl flex flex-col gap-6 shrink-0">
            <h2 className="text-xl font-bold">Resumen de compra</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Productos ({totalItems})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Envío</span>
                <span>A calcular</span>
              </div>
            </div>
            
            <div className="border-t border-outline-variant/40 pt-4 flex justify-between items-end">
              <span className="text-base font-bold text-on-surface">Total</span>
              <span className="text-2xl font-black text-primary">${subtotal.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut || items.length === 0}
              className="w-full py-4 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-1 mt-2 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isCheckingOut ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div>
                  Procesando...
                </>
              ) : (
                'Iniciar Pago'
              )}
            </button>
          </div>
          
        </div>
      )}
    </main>
  );
}
