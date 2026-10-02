import { Button } from "./ui/button";
import { signInWithGoogle } from "../lib/signIn";

export function GoogleLoginButton() {
    return (
        <form action={signInWithGoogle}>
            <Button
                type="submit"
                className="
                    h-11 w-full
                    gap-3
                    rounded-lg
                    border border-border
                    bg-white
                    text-sm font-medium
                    text-[#052b2b]
                    shadow-sm
                    transition-all
                    hover:bg-gray-50
                    hover:shadow-md
                    active:scale-[0.99]
                "
            >
                <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        fill="#4285F4"
                        d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.22a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.7 2.93-4.2 2.93-7.4Z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 21.8c2.63 0 4.84-.87 6.45-2.37l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.74 9.74 0 0 0 12 21.8Z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M6.53 13.89a5.86 5.86 0 0 1 0-3.78V7.59H3.28a9.74 9.74 0 0 0 0 8.82l3.25-2.52Z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 6.08c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.83 3.18 14.63 2.2 12 2.2a9.74 9.74 0 0 0-8.72 5.39l3.25 2.52C7.3 7.8 9.46 6.08 12 6.08Z"
                    />
                </svg>

                <span className="text-[#052B2B]">Entrar com Google</span>
            </Button>
        </form>
    );
}