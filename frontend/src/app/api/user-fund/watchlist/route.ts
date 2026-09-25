import { NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { z } from "zod";

const schema = z.object({
    papel: z.string().trim().min(1).transform((value) => value.toUpperCase()),
});

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const funds = await prisma.userFund.findMany({
            where: { userId: session.user.id, list: "WATCHLIST" },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(funds, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao buscar fundos." }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const body = await request.json();
        const { papel } = schema.parse(body);

        const existing = await prisma.userFund.findUnique({
            where: { userId_papel: { userId: session.user.id, papel } },
        });

        // Já está na watchlist -> tira (toggle off)
        if (existing?.list === "WATCHLIST") {
            await prisma.userFund.delete({ where: { id: existing.id } });
            return NextResponse.json({ favorite: false });
        }

        // Está na carteira -> MOVE pra watchlist
        if (existing) {
            await prisma.userFund.update({
                where: { id: existing.id },
                data: { list: "WATCHLIST" },
            });
            return NextResponse.json({ favorite: true });
        }

        // Não existe em nenhuma lista -> cria direto na watchlist
        await prisma.userFund.create({
            data: { userId: session.user.id, papel, list: "WATCHLIST" },
        });

        return NextResponse.json({ favorite: true });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos.", details: error.issues },
                { status: 400 }
            );
        }

        console.error(error);

        return NextResponse.json(
            { error: "Erro ao adicionar fundo." },
            { status: 500 }
        );
    }
}
