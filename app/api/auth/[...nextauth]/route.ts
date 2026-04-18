import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Definimos las opciones separadas para poder reutilizarlas si necesitamos
// leer la sesión desde los Server Components más adelante
export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
    ],
    // Opcional: Secret para firmar tokens si no se detecta NEXTAUTH_SECRET en .env
    secret: process.env.AUTH_SECRET,

    callbacks: {
        // Este callback se ejecuta cada vez que llamás a getServerSession
        async session({ session, user }) {
            if (session.user) {
                // Pasamos los datos del usuario de la DB al objeto de sesión
                session.user.id = user.id;
                session.user.role = user.role;
            }
            return session;
        }
    }
};

// Inicializamos NextAuth
const handler = NextAuth(authOptions);

// En el App Router, NextAuth requiere exportar el handler como GET y POST
export { handler as GET, handler as POST };