import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // 1. Si no está logueado, lo mandamos al inicio
    if (!session) {
        redirect("/");
    }

    // 2. Si está logueado pero es un CUSTOMER, lo bloqueamos
    if (session.user.role !== "ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50">
                <h1 className="text-2xl font-bold text-red-600">
                    Acceso Denegado. Área exclusiva para administradores.
                </h1>
            </div>
        );
    }

    // 3. Si es ADMIN, le mostramos el contenido (children)
    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-slate-800 text-white p-6">
                <h2 className="text-xl font-bold mb-4">Menú Forrajería</h2>
                <ul>
                    <li className="mb-2">📦 Productos</li>
                    <li className="mb-2">🏷️ Categorías</li>
                    <li className="mb-2">💰 Ventas</li>
                </ul>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}