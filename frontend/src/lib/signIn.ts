"use server";

import { signIn } from "@/src/lib/auth";

export async function signInWithGoogle() {
    await signIn("google", {
        redirectTo: "/",
    });
}