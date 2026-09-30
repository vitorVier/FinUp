import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";

const goalSchema = z.object({
    name: z.string().trim().min(3).optional(),
    description: z.string().trim().optional(),
    targetValue: z.number().positive().optional(),
    currentValue: z.number().min(0).optional(),
    status: z
        .enum(["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"])
        .optional(),
    type: z
        .enum([
            "SAVING",
            "INVESTMENT",
            "PURCHASE",
            "TRAVEL",
            "EMERGENCY",
            "DEBT",
            "OTHER",
        ])
        .optional(),
    targetDate: z.coerce.date().nullable().optional(),
    monthlyTarget: z.number().min(0).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(
    request: Request,
    { params }: RouteContext
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Não autorizado." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const existingGoal = await prisma.goal.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!existingGoal) {
            return NextResponse.json(
                { error: "Meta não encontrada." },
                { status: 404 }
            );
        }

        const body = await request.json();

        const validation = goalSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: "Dados inválidos.",
                    details: validation.error.flatten(),
                },
                { status: 400 }
            );
        }

        const data = validation.data;

        if (data.name && data.name !== existingGoal.name) {
            const duplicate = await prisma.goal.findFirst({
                where: {
                    userId: session.user.id,
                    name: data.name,
                    NOT: {
                        id,
                    },
                },
            });

            if (duplicate) {
                return NextResponse.json(
                    { error: "Você já possui uma meta com esse nome." },
                    { status: 409 }
                );
            }
        }

        const goal = await prisma.goal.update({
            where: {
                id,
            },
            data: {
                ...(data.name !== undefined && {
                    name: data.name,
                }),

                ...(data.description !== undefined && {
                    description: data.description || null,
                }),

                ...(data.targetValue !== undefined && {
                    targetValue: data.targetValue,
                }),

                ...(data.currentValue !== undefined && {
                    currentValue: data.currentValue,
                }),

                ...(data.status !== undefined && {
                    status: data.status,
                }),

                ...(data.type !== undefined && {
                    type: data.type,
                }),

                ...(data.targetDate !== undefined && {
                    targetDate: data.targetDate,
                }),

                ...(data.monthlyTarget !== undefined && {
                    monthlyTarget: data.monthlyTarget,
                }),

                ...(data.priority !== undefined && {
                    priority: data.priority,
                }),
            },
        });

        return NextResponse.json(goal);
    } catch (error) {
        console.error("[goals][PATCH]", error);

        return NextResponse.json(
            { error: "Erro ao atualizar meta." },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: Request,
    { params }: RouteContext
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Não autorizado." },
                { status: 401 }
            );
        }

        const { id } = await params;

        const existingGoal = await prisma.goal.findFirst({
            where: {
                id,
                userId: session.user.id,
            },
        });

        if (!existingGoal) {
            return NextResponse.json(
                { error: "Meta não encontrada." },
                { status: 404 }
            );
        }

        await prisma.goal.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("[goals][DELETE]", error);

        return NextResponse.json(
            { error: "Erro ao excluir meta." },
            { status: 500 }
        );
    }
}