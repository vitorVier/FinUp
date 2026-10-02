import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { buildCashFlowEvolution, buildCategoryEvolution, buildPlannedVsActual } from "@/src/app/(panel)/finance/utils/finance-analytics";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Não autenticado." },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);

        const monthsParam = Number(
            searchParams.get("months") || 12
        );

        const months = Math.min(
            Math.max(monthsParam, 6),
            12
        );

        const startDate = new Date();
        startDate.setMonth(
            startDate.getMonth() - (months - 1)
        );
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);

        const transactions = await prisma.transaction.findMany({
            where: {
                userId: session.user.id,
                date: {
                    gte: startDate,
                },
            },
            include: {
                category: true,
            },
            orderBy: {
                date: "asc",
            },
        });

        const evolution = buildCashFlowEvolution(
            transactions.map((transaction) => ({
                ...transaction,
                value: transaction.value.toString(),
            })),
            months
        );

        const categoryEvolution = buildCategoryEvolution(
            transactions.map((transaction) => ({
                ...transaction,
                value: transaction.value.toString(),
            })),
            months
        );

        const plannedVsActual = buildPlannedVsActual(
            transactions.map((transaction) => ({
                ...transaction,
                value: transaction.value.toString(),
            }))
        );

        const recurrences = await prisma.recurrence.findMany({
            where: {
                userId: session.user.id,
                isActive: true,
            },
            include: { category: true },
            orderBy: { day: "asc" },
        });

        const recurringExpenses = recurrences
            .filter((r) => r.type === "OUTFLOW")
            .map((r) => ({
                id: r.id,
                name: r.name,
                value: Number(r.value),
                dayOfMonth: r.day ?? 1,
                categoryName: r.category.name,
                categoryColor: r.category.color ?? null,
            }));

        return NextResponse.json({
            evolution,
            categoryEvolution,
            plannedVsActual,
            recurringExpenses,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Erro ao gerar análise financeira.",
            },
            {
                status: 500,
            }
        );
    }
}