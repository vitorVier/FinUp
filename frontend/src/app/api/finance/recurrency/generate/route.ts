import { NextResponse } from "next/server";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Não autenticado." },
                { status: 401 }
            );
        }

        const { year, month } = await request.json();

        const targetYear =
            Number.isInteger(year)
                ? year
                : new Date().getFullYear();

        const targetMonth =
            Number.isInteger(month)
                ? month
                : new Date().getMonth();

        const startDate = new Date(
            targetYear,
            targetMonth,
            1
        );

        const endDate = new Date(
            targetYear,
            targetMonth + 1,
            1
        );

        const recurrences =
            await prisma.recurrence.findMany({
                where: {
                    userId: session.user.id,
                    isActive: true,
                },
            });

        let created = 0;

        for (const recurrence of recurrences) {
            const lastDay = new Date(
                targetYear,
                targetMonth + 1,
                0
            ).getDate();

            const day = Math.min(
                Number(recurrence.day),
                lastDay
            );

            const date = new Date(
                targetYear,
                targetMonth,
                day
            );

            if (
                date < startDate ||
                date >= endDate
            ) {
                continue;
            }

            const existing =
                await prisma.transaction.findFirst({
                    where: {
                        userId: session.user.id,
                        recurrencyId: recurrence.id,
                        date,
                    },
                });

            if (existing) {
                continue;
            }

            await prisma.transaction.create({
                data: {
                    userId: session.user.id,
                    categoryId: recurrence.categoryId,
                    recurrencyId: recurrence.id,
                    value: recurrence.value,
                    type: recurrence.type,
                    status: "PENDING",
                    description: recurrence.name,
                    date,
                },
            });

            created++;
        }

        return NextResponse.json({
            ok: true,
            created,
            year: targetYear,
            month: targetMonth,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error:
                    "Erro ao gerar lançamentos recorrentes.",
            },
            { status: 500 }
        );
    }
}