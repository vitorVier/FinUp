import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/src/components/providers";
import { NavigationHeader } from "@/src/components/header";

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
                    <NavigationHeader />
                    {children}
                </Providers>
            </body>
        </html>
    );
}