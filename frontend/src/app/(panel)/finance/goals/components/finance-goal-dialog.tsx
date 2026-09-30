"use client";

import { useEffect, useState } from "react";
import { CalendarDays, CircleDollarSign, Flag, Pencil, Plus, Target } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import type { Goal, GoalFormData, GoalPriority, GoalStatus, GoalType } from "@/src/app/(panel)/finance/types";
import { GOAL_PRIORITY_LABEL, GOAL_STATUS_LABEL, GOAL_TYPE_LABEL } from "@/src/app/(panel)/finance/lib/goals";
import { formatInputCurrency } from "../../utils";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    goal: Goal | null;
    onSave: (data: GoalFormData) => Promise<void>;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function toNumber(value: string) {
    const normalized = value.replace(/\./g, "").replace(",", ".");
    return Number(normalized);
}

export function FinanceGoalDialog({ open, onOpenChange, goal, onSave }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [targetValue, setTargetValue] = useState("");
    const [currentValue, setCurrentValue] = useState("");
    const [monthlyTarget, setMonthlyTarget] = useState("");
    const [type, setType] = useState<GoalType>("SAVING");
    const [status, setStatus] = useState<GoalStatus>("ACTIVE");
    const [priority, setPriority] = useState<GoalPriority>("MEDIUM");
    const [targetDate, setTargetDate] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (goal) {
            setName(goal.name);
            setDescription(goal.description ?? "");
            setTargetValue(String(goal.targetValue));
            setCurrentValue(String(goal.currentValue ?? ""));
            setMonthlyTarget(String(goal.monthlyTarget ?? ""));
            setType(goal.type);
            setStatus(goal.status);
            setPriority(goal.priority);
            setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : "");
        } else {
            setName("");
            setDescription("");
            setTargetValue("");
            setCurrentValue("");
            setMonthlyTarget("");
            setType("SAVING");
            setStatus("ACTIVE");
            setPriority("MEDIUM");
            setTargetDate("");
        }
    }, [goal, open]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const target = toNumber(targetValue);
        const current = currentValue.trim() ? toNumber(currentValue) : 0;
        const monthly = monthlyTarget.trim() ? toNumber(monthlyTarget) : 0;

        if (!name.trim()) {
            toast.error("Informe o nome da meta.");
            return;
        }
        if (!target || target <= 0) {
            toast.error("Informe um valor alvo válido.");
            return;
        }
        if (current < 0 || monthly < 0) {
            toast.error("Os valores não podem ser negativos.");
            return;
        }

        try {
            setSaving(true);

            const data: GoalFormData = {
                name: name.trim(),
                description: description.trim() || undefined,
                targetValue: target,
                ...(current >= 0 ? { currentValue: current } : {}),
                status,
                type,
                ...(targetDate ? { targetDate } : {}),
                ...(monthly >= 0 ? { monthlyTarget: monthly } : {}),
                priority,
            };

            await onSave(data);
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erro ao salvar a meta.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-2xl p-0">
                <div className="h-1.5 w-full" />

                <div className="p-6">
                    <DialogHeader className="text-left -mx-5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#053032]/10">
                            {goal ? (
                                <Pencil className="h-5 w-5 text-[#053032]" />
                            ) : (
                                <Plus className="h-5 w-5 text-[#053032]" />
                            )}
                        </div>
                        <DialogTitle className="text-xl">
                            {goal ? "Editar meta" : "Nova meta"}
                        </DialogTitle>
                        <DialogDescription>
                            {goal
                                ? "Atualize os dados e acompanhe a evolução do seu objetivo."
                                : "Crie um objetivo financeiro e defina como pretende alcançá-lo."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium">Nome da meta</label>
                            <Input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Ex.: Reserva para mudança"
                                maxLength={80}
                                disabled={saving}
                                className="h-10 rounded-lg"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium">Descrição</label>
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Descreva brevemente o objetivo..."
                                maxLength={240}
                                disabled={saving}
                                className="min-h-[76px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-[#0b6b68] focus:ring-1 focus:ring-[#0b6b68]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-xs font-medium">
                                    <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                    Valor alvo
                                </label>
                                <Input
                                    value={targetValue}
                                    onChange={(event) => setTargetValue(formatInputCurrency(event.target.value))}
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    disabled={saving}
                                    className="h-10 rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-xs font-medium">
                                    <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                    Já acumulado
                                </label>
                                <Input
                                    value={currentValue}
                                    onChange={(event) => setCurrentValue(formatInputCurrency(event.target.value))}
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    disabled={saving}
                                    className="h-10 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-xs font-medium">
                                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                                    Tipo
                                </label>
                                <Select value={type} onValueChange={(value) => setType(value as GoalType)} disabled={saving}>
                                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(GOAL_TYPE_LABEL).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-xs font-medium">
                                    <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                                    Prioridade
                                </label>
                                <Select value={priority} onValueChange={(value) => setPriority(value as GoalPriority)} disabled={saving}>
                                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(GOAL_PRIORITY_LABEL).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 items-end">
                            <div className="space-y-2">
                                <label className="flex items-center gap-1.5 text-xs font-medium">
                                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                                    Prazo
                                </label>
                                <Input
                                    type="date"
                                    value={targetDate}
                                    min={today()}
                                    onChange={(event) => setTargetDate(event.target.value)}
                                    disabled={saving}
                                    className="h-10 rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Meta mensal</label>
                                <Input
                                    value={monthlyTarget}
                                    onChange={(event) => setMonthlyTarget(formatInputCurrency(event.target.value))}
                                    placeholder="0,00"
                                    inputMode="decimal"
                                    disabled={saving}
                                    className="h-10 rounded-lg"
                                />
                            </div>
                        </div>

                        {goal && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Status</label>
                                <Select value={status} onValueChange={(value) => setStatus(value as GoalStatus)} disabled={saving}>
                                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(GOAL_STATUS_LABEL).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-5">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-9 text-xs text-muted-foreground"
                                onClick={() => onOpenChange(false)}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving || !name.trim() || !targetValue}
                                className="h-9 bg-[#053032] px-4 text-xs hover:bg-[#053032]/90"
                            >
                                {saving ? "Salvando..." : goal ? "Salvar alterações" : "Criar meta"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
