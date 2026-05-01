import Header from "@/app/components/Header";
import CartView from "./CartView";
import { Suspense } from "react";

export const metadata = {
  title: "Tu Carrito | Querida Pampa",
  description: "Tu carrito de compras",
};

export default function CartPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
        <CartView />
      </Suspense>
    </div>
  );
}
