import { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
 
export default {
    session: { strategy: "database" },
    providers: [Google],
    secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth }) {
            return !!auth;
        },

        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }

            return session;
        },
    },
} satisfies NextAuthConfig;