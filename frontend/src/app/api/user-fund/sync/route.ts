import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

const schema = z.object({
    funds: z.array(
        z.object({
            papel: z.string().trim().min(1).transform((v) => v.toUpperCase()),
            recomendacao: z.string(),
            notaFinal: z.number(),
        })
    ),
});

type StatusMudanca = "oportunidade" | "mudou";

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const body = await request.json();
        const { funds } = schema.parse(body);

        if (funds.length === 0) {
            return NextResponse.json({ mudancas: {} });
        }

        const salvos = await prisma.userFund.findMany({
            where: {
                userId: session.user.id,
                papel: { in: funds.map((f) => f.papel) },
            },
        });

        const salvosPorPapel = new Map(salvos.map((s) => [s.papel, s]));
        const mudancas: Record<string, StatusMudanca> = {};

        for (const fundo of funds) {
            const salvo = salvosPorPapel.get(fundo.papel);

            if (!salvo || salvo.ultimaRecomendacao == null) continue;

            if (salvo.ultimaRecomendacao === fundo.recomendacao) continue;

            mudancas[fundo.papel] =
                fundo.recomendacao === "Comprar" ? "oportunidade" : "mudou";
        }

        await prisma.userFund.updateMany({
            where: { userId: session.user.id, papel: { in: funds.map((f) => f.papel) } },
            data: { verificadoEm: new Date() },
        });

        return NextResponse.json({ mudancas });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos.", details: error.issues },
                { status: 400 }
            );
        }
        console.error(error);
        return NextResponse.json({ error: "Erro ao sincronizar." }, { status: 500 });
    }
}