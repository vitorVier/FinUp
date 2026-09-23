import { signIn } from "@/src/lib/auth";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-sm rounded-xl border bg-white p-8 text-center shadow-sm">
                <h1 className="text-xl font-bold tracking-tight">Ranking Fuzzy de FIIs</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Entre com sua conta Google pra continuar.
                </p>

                {/* Server Action: não precisa de JS no cliente pra funcionar */}
                <form
                    action={async () => {
                        "use server";
                        await signIn("google", { redirectTo: "/" });
                    }}
                    className="mt-6"
                >
                    <button
                        type="submit"
                        className="w-full rounded-lg border bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-black/90"
                    >
                        Entrar com Google
                    </button>
                </form>
            </div>
        </div>
    );
}