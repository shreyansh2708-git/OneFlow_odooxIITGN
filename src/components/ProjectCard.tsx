import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
  title: string;
  description: string;
  status: "In Progress" | "Planned" | "Completed" | "On Hold";
  progress: number;
}

const ProjectCard = ({ title, description, status, progress }: ProjectCardProps) => {
  const statusColors = {
    "In Progress": "bg-primary text-primary-foreground",
    Planned: "bg-secondary text-secondary-foreground",
    Completed: "bg-success text-success-foreground",
    "On Hold": "bg-muted text-muted-foreground",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    </Card>
  );
};

export default ProjectCard;
