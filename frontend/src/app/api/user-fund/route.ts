import { NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const funds = await prisma.userFund.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(funds, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao buscar fundos." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const papel = searchParams.get("papel");

        if (!papel) {
            return NextResponse.json({ error: "Papel não informado." }, { status: 400 });
        }

        const result = await prisma.userFund.deleteMany({
            where: { userId: session.user.id, papel: papel.toUpperCase() },
        });

        return NextResponse.json(
            { message: "Fundo deletado com sucesso.", deletedCount: result.count },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao deletar fundo." }, { status: 500 });
    }
}