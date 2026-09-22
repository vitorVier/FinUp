import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "FII Fuzzy Ranking",
    description: "Análise de FIIs com modelo fuzzy Mamdani"
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body>
                {children}
            </body>
        </html>
    );
}
