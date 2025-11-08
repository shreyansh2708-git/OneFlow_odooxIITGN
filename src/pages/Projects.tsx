import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/contexts/ProjectContext";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { projectsAPI } from "@/lib/api";
import { Plus, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export default function Projects() {
  const navigate = useNavigate();
  const { projects, refreshProjects } = useProjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        await projectsAPI.update(projectId, { ...project, status: newStatus });
        toast({
          title: "Success",
          description: "Project status updated",
        });
        refreshProjects();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_progress": return "bg-primary text-primary-foreground";
      case "completed": return "bg-success text-success-foreground";
      case "planned": return "bg-secondary text-secondary-foreground";
      case "on_hold": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Projects</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and track all your projects
                </p>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle 
                        className="text-lg cursor-pointer"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingProject(project);
                              setIsDialogOpen(true);
                            }}>
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(project.id, "planned")}>
                              Set to Planned
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(project.id, "in_progress")}>
                              Set to In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(project.id, "completed")}>
                              Set to Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(project.id, "on_hold")}>
                              Set to On Hold
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {project.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4" onClick={() => navigate(`/projects/${project.id}`)}>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">₹{(project.budget / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Spent</p>
                        <p className="font-medium">₹{(project.spent / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Team</p>
                        <p className="font-medium">{project.team.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
      <ProjectFormDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingProject(null);
        }}
        project={editingProject}
      />
    </div>
  );
}
