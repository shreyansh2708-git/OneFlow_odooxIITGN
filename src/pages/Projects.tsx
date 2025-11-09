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
import { Plus, MoreVertical, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ViewMode = "grid" | "list";

export default function Projects() {
  const navigate = useNavigate();
  const { projects, refreshProjects, loading } = useProjects();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const updateData = {
          name: project.name,
          description: project.description || "",
          status: newStatus,
          manager: project.manager,
          team: project.team || [],
          startDate: project.startDate,
          endDate: project.endDate,
          budget: project.budget,
          spent: project.spent,
          progress: project.progress,
        };
        await projectsAPI.update(projectId, updateData);
        toast({
          title: "Success",
          description: "Project status updated",
        });
        refreshProjects();
      }
    } catch (error: any) {
      console.error("Status update error:", error);
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
            <Breadcrumbs />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Projects</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and track all your projects
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={() => {
                  setEditingProject(null);
                  setIsDialogOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.length === 0 && !loading ? (
                  // Skeleton loading for empty state
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow border-gray-200 dark:border-gray-800">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-gray-800" />
                          <Skeleton className="h-5 w-20 bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <Skeleton className="h-4 w-full mt-2 bg-gray-200 dark:bg-gray-800" />
                        <Skeleton className="h-4 w-3/4 mt-1 bg-gray-200 dark:bg-gray-800" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Skeleton className="h-2 w-full bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-800" />
                          <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-800" />
                          <Skeleton className="h-4 w-16 bg-gray-200 dark:bg-gray-800" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : projects.length === 0 && loading ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading projects...
                  </div>
                ) : (
                  projects.map((project) => (
                    <Card
                      key={project.id}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
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
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/projects/${project.id}`);
                                }}>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProject(project);
                                  setIsDialogOpen(true);
                                }}>
                                  Edit Project
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(project.id, "planned");
                                }}>
                                  Set to Planned
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(project.id, "in_progress");
                                }}>
                                  Set to In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(project.id, "completed");
                                }}>
                                  Set to Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(project.id, "on_hold");
                                }}>
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
                      <CardContent className="space-y-4">
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
                  ))
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Manager</TableHead>
                        <TableHead>Team Size</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Spent</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.length === 0 && !loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No projects found
                          </TableCell>
                        </TableRow>
                      ) : projects.length === 0 && loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Loading projects...
                          </TableCell>
                        </TableRow>
                      ) : (
                        projects.map((project) => (
                          <TableRow
                            key={project.id}
                            className="cursor-pointer"
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <TableCell className="font-medium">{project.name}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(project.status)}>
                                {getStatusLabel(project.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>{project.manager}</TableCell>
                            <TableCell>{project.team.length}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={project.progress} className="w-20" />
                                <span className="text-sm">{project.progress}%</span>
                              </div>
                            </TableCell>
                            <TableCell>₹{(project.budget / 1000).toFixed(0)}k</TableCell>
                            <TableCell>₹{(project.spent / 1000).toFixed(0)}k</TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
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
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
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
