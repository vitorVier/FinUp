import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

const schema = z.object({
    recomendacao: z.string(),
    notaFinal: z.number(),
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ papel: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const { papel } = await params;
        const body = await request.json();
        const { recomendacao, notaFinal } = schema.parse(body);

        await prisma.userFund.updateMany({
            where: { userId: session.user.id, papel: decodeURIComponent(papel).toUpperCase() },
            data: {
                ultimaRecomendacao: recomendacao,
                ultimaNotaFinal: notaFinal,
                verificadoEm: new Date(),
            },
        });

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Dados inválidos.", details: error.issues },
                { status: 400 }
            );
        }
        console.error(error);
        return NextResponse.json({ error: "Erro ao confirmar." }, { status: 500 });
    }
}