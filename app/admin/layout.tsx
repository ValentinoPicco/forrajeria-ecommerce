import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Header from "../components/Header";
import { prisma } from "@/lib/prisma";
import AdminSidebarNav from "./components/AdminSidebarNav";

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
    // Consultar pedidos pendientes de entrega
    const undeliveredOrdersCount = await prisma.order.count({
        where: {
            status: {
                in: ['PAID', 'SHIPPED']
            }
        }
    });

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col font-sans">
            <Header />

            <div className="flex flex-1 pt-0">
                {/* SideNavBar */}
                <aside className="min-h-[calc(100vh-80px)] w-64 sticky left-0 top-20 pt-1 flex flex-col border-r border-outline-variant bg-surface-container-low">
                    <div className="px-6 py-0 mb-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src="/querida-pampa-logo-sin-fondo.webp" 
                            alt="Logo Querida Pampa" 
                            className="w-52 h-auto object-contain drop-shadow-sm" 
                        />
                    </div>

                    <AdminSidebarNav undeliveredOrdersCount={undeliveredOrdersCount} />

                </aside>

                {/* Main Content Area */}
                {children}
            </div>

        </div>
    );
}