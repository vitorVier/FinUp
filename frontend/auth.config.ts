import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
 
export default {
    session: { strategy: "jwt" },
    providers: [Google],
    secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth }) {
            return !!auth;
        },
        async jwt({ token, user }) {
            if (user) token.sub = user.id;
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;