import Header from "@/app/components/Header";
import CartView from "./CartView";

export const metadata = {
  title: "Tu Carrito | Querida Pampa",
  description: "Tu carrito de compras",
};

export default function CartPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans">
      <Header />
      <CartView />
    </div>
  );
}
