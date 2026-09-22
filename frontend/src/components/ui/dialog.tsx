"use client";

import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({
    className,
    children,
    ...p
}: React.ComponentProps<typeof D.Content>) {
    return (
        <D.Portal>
            <D.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm" />
            <D.Content
                className={cn(
                    "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(920px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-white shadow-2xl",
                    className
                )}
                {...p}
            >
                {children}
                <D.Close className="absolute right-4 top-4 rounded-md p-2 hover:bg-muted">
                    <X className="h-4 w-4" />
                </D.Close>
            </D.Content>
        </D.Portal>
    );
}

export const DialogHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-6 pb-3", className)} {...p} />;
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;
