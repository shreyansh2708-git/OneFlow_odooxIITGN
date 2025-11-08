import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/contexts/ProjectContext";
import { tasksAPI, analyticsAPI } from "@/lib/api";
import { FolderKanban, CheckSquare, Clock, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/data/staticData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();
  const [filter, setFilter] = useState<string>("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, analyticsData] = await Promise.all([
          tasksAPI.getAll(),
          analyticsAPI.getAnalytics(),
        ]);
        setTasks(tasksData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || projectsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const activeProjects = projects.filter((p) => p.status === "in_progress").length;
  const delayedTasks = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const totalHours = tasks.reduce((sum, t) => sum + t.hoursLogged, 0);
  const totalRevenue = analytics?.totalRevenue || projects.reduce((sum, p) => sum + p.spent, 0);

  const filteredProjects =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

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
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeProjects}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Delayed Tasks
                  </CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{delayedTasks}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Hours Logged
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHours}h</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenue Earned
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(0)}k</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "planned" ? "default" : "outline"}
                  onClick={() => setFilter("planned")}
                >
                  Planned
                </Button>
                <Button
                  variant={filter === "in_progress" ? "default" : "outline"}
                  onClick={() => setFilter("in_progress")}
                >
                  In Progress
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </Button>
                <Button
                  variant={filter === "on_hold" ? "default" : "outline"}
                  onClick={() => setFilter("on_hold")}
                >
                  On Hold
                </Button>
              </div>
              <Button onClick={() => navigate("/projects")}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusLabel(project.status)}
                      </Badge>
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
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
