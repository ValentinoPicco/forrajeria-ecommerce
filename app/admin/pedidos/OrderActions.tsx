"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, CheckCircle } from "lucide-react";

export default function OrderActions({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error("Error al actualizar");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("No se pudo actualizar el estado.");
      setIsLoading(false);
    }
  };

  if (currentStatus === "PAID") {
    return (
      <button 
        onClick={() => updateStatus("SHIPPED")}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <Truck className="w-4 h-4" />
        )}
        Marcar como Enviado
      </button>
    );
  }

  if (currentStatus === "SHIPPED") {
    return (
      <button 
        onClick={() => updateStatus("DELIVERED")}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
        Marcar como Entregado
      </button>
    );
  }

  return null;
}
