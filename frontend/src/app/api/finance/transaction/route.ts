import { NextResponse } from "next/server";

import prisma from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");
        const month = searchParams.get("month");

        if (!type) {
            return NextResponse.json(
                { error: "Tipo não informado." },
                { status: 400 }
            );
        }

        if (type !== "INFLOW" && type !== "OUTFLOW") {
            return NextResponse.json(
                { error: "Tipo inválido." },
                { status: 400 }
            );
        }

        const dateFilter = month ? (() => {
            if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
                return null;
            }

            const [year, monthNumber] = month.split("-").map(Number);
            return {
                gte: new Date(year, monthNumber - 1, 1),
                lt: new Date(year, monthNumber, 1),
            };
        })() : undefined;

        if (month && !dateFilter) {
            return NextResponse.json(
                { error: "Mês inválido." },
                { status: 400 }
            );
        }

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                type: type.toUpperCase() as "INFLOW" | "OUTFLOW",
                ...(dateFilter && { date: dateFilter }),
            },
            include: {
                category: true,
            },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(transactions, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { error: "Erro ao buscar lançamentos." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        if (type !== "INFLOW" && type !== "OUTFLOW") {
            return NextResponse.json(
                { error: "Tipo inválido." },
                { status: 400 }
            );
        }

        const body = await request.json();

        const {
            categoryId,
            value,
            description,
            date,
            status,
        } = body;

        const category = await prisma.transactionCategory.findFirst({
            where: {
                id: categoryId,
                userId: session.user.id,
                type,
                isActive: true,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Categoria inválida." },
                { status: 400 }
            );
        }

        if (!categoryId || !value || !date || !status) {
            return NextResponse.json(
                { error: "Dados obrigatórios não informados." },
                { status: 400 }
            );
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: session.user.id,
                categoryId,
                type,
                value: String(value),
                description: description || null,
                date: new Date(`${date}T00:00:00`),
                status,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(transaction, { status: 201 });

    } catch (error) {
        console.error("ERRO AO CRIAR LANÇAMENTO:", error);

        return NextResponse.json(
            { error: "Erro ao criar lançamento." },
            { status: 500 }
        );
    }
}