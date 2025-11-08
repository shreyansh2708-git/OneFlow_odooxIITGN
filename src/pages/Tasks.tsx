import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { tasksAPI, timesheetsAPI } from "@/lib/api";
import { Task } from "@/data/staticData";
import { Plus, Clock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();
  const { getProject, projects } = useProjects();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [hoursLog, setHoursLog] = useState<{ [key: string]: string }>({});
  const [billableLog, setBillableLog] = useState<{ [key: string]: boolean }>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll(projectId || undefined);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  // Filter tasks by project if projectId is in URL
  let filteredTasks = tasks;
  
  if (projectId) {
    filteredTasks = tasks.filter((t) => t.projectId === projectId);
  }

  // Apply additional filters
  if (filter !== "all") {
    filteredTasks = filter === "my_tasks"
      ? filteredTasks.filter((t) => t.assignee === user?.name)
      : filteredTasks.filter((t) => t.status === filter);
  }

  const getProjectName = (projectId: string) => {
    return getProject(projectId)?.name || "Unknown Project";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-secondary text-secondary-foreground";
      case "in_progress": return "bg-primary text-primary-foreground";
      case "blocked": return "bg-destructive text-destructive-foreground";
      case "done": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleLogHours = async (taskId: string) => {
    const hours = hoursLog[taskId];
    if (hours && user) {
      try {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          await timesheetsAPI.create({
            projectId: task.projectId,
            taskId: taskId,
            employee: user.name,
            date: new Date().toISOString().split('T')[0],
            hours: parseFloat(hours),
            billable: billableLog[taskId] !== false, // default to true
            description: `Hours logged for task: ${task.title}`,
          });
          toast({
            title: "Success",
            description: `Logged ${hours} ${billableLog[taskId] === false ? 'non-billable' : 'billable'} hours for task`,
          });
          setHoursLog((prev) => ({ ...prev, [taskId]: "" }));
          setBillableLog((prev) => ({ ...prev, [taskId]: true }));
          // Refresh tasks to update hours
          const data = await tasksAPI.getAll(projectId || undefined);
          setTasks(data);
        }
      } catch (error) {
        console.error('Error logging hours:', error);
        toast({
          title: "Error",
          description: "Failed to log hours",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        await tasksAPI.update(taskId, { ...task, status: newStatus });
        const data = await tasksAPI.getAll(projectId || undefined);
        setTasks(data);
        toast({
          title: "Success",
          description: "Task status updated",
        });
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
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
                <div className="flex items-center gap-4">
                  {projectId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/projects/${projectId}`)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Project
                    </Button>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground mt-1">
                      {projectId 
                        ? `Tasks for ${getProjectName(projectId)}`
                        : "Track and manage all project tasks"}
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setIsTaskDialogOpen(true)}
                disabled={!projectId && projects.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All Tasks
              </Button>
              <Button
                variant={filter === "my_tasks" ? "default" : "outline"}
                onClick={() => setFilter("my_tasks")}
              >
                My Tasks
              </Button>
              <Button
                variant={filter === "new" ? "default" : "outline"}
                onClick={() => setFilter("new")}
              >
                New
              </Button>
              <Button
                variant={filter === "in_progress" ? "default" : "outline"}
                onClick={() => setFilter("in_progress")}
              >
                In Progress
              </Button>
              <Button
                variant={filter === "blocked" ? "default" : "outline"}
                onClick={() => setFilter("blocked")}
              >
                Blocked
              </Button>
              <Button
                variant={filter === "done" ? "default" : "outline"}
                onClick={() => setFilter("done")}
              >
                Done
              </Button>
            </div>

            {/* Task Board */}
            {loading ? (
              <div className="text-center py-8">Loading tasks...</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No tasks found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getProjectName(task.projectId)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assignee:</span>
                        <span className="font-medium">{task.assignee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium">{task.dueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hours:</span>
                        <span className="font-medium">
                          {task.hoursLogged}h / {task.estimatedHours}h
                        </span>
                      </div>
                    </div>

                    {/* Log Hours */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="Log hours"
                          value={hoursLog[task.id] || ""}
                          onChange={(e) =>
                            setHoursLog((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleLogHours(task.id)}
                          disabled={!hoursLog[task.id]}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`billable-${task.id}`}
                          checked={billableLog[task.id] !== false}
                          onCheckedChange={(checked) =>
                            setBillableLog((prev) => ({ ...prev, [task.id]: checked === true }))
                          }
                        />
                        <label
                          htmlFor={`billable-${task.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Billable
                        </label>
                      </div>
                    </div>

                    {/* Status Change Buttons */}
                    <div className="flex gap-2">
                      {task.status === "new" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                        >
                          Start
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleStatusChange(task.id, "blocked")}
                          >
                            Block
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleStatusChange(task.id, "done")}
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      {task.status === "blocked" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                        >
                          Unblock
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <CreateTaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        projectId={projectId || undefined}
        onSuccess={() => {
          fetchTasks();
        }}
      />
    </div>
  );
}
