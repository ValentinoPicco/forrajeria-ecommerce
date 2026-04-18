import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    // Extendemos la sesión para que TypeScript sepa que el usuario tiene un id y un rol
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }

    // Extendemos el modelo User que viene de la base de datos
    interface User extends DefaultUser {
        role: string;
    }
}