import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
 
import prisma from "@/src/lib/prisma";
import authConfig from "@/auth.config";
 
// Versão completa, com o adapter — usada pelas rotas de API e Server
// Components, nunca pelo middleware (ver auth.config.ts pro motivo).
export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    ...authConfig,
});