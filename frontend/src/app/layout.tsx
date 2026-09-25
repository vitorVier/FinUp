import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/src/components/providers";
import { Sidebar } from "@/src/components/sidebar";

export const metadata: Metadata = {
    title: "FII Fuzzy Ranking",
    description: "Análise de FIIs com modelo fuzzy Mamdani",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body>
                <Providers>
                    <div className="flex min-h-screen bg-slate-50/50">
                        <Sidebar />
                        <div className="flex-1 flex flex-col min-w-0">
                            {children}
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}