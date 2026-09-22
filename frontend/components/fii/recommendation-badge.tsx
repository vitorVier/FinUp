import { CheckCircle2, CircleAlert, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { recommendationTone } from "@/lib/utils";

export function RecommendationBadge({ value }: { value: string }) {
  const tone = recommendationTone(value);

  const config = {
    success: {
      icon: CheckCircle2,
      className: "border-success/25 bg-success/10 text-success",
    },
    warning: {
      icon: CircleAlert,
      className: "border-warning/25 bg-warning/10 text-warning",
    },
    danger: {
      icon: ShieldAlert,
      className: "border-destructive/25 bg-destructive/10 text-destructive",
    },
  }[tone];

  const Icon = config.icon;

  return (
    <Badge className={`gap-1.5 px-2.5 py-1 text-[11px] font-bold ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {value}
    </Badge>
  );
}
