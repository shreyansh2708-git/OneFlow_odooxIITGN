import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "warning" | "destructive";
}

const KPICard = ({ title, value, icon: Icon, variant = "default" }: KPICardProps) => {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p
            className={cn(
              "text-3xl font-bold",
              variant === "warning" && "text-warning",
              variant === "destructive" && "text-destructive"
            )}
          >
            {value}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
};

export default KPICard;
