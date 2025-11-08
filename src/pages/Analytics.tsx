import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/contexts/ProjectContext";
import { analyticsAPI } from "@/lib/api";
import { TrendingUp, Users, Clock, DollarSign } from "lucide-react";

export default function Analytics() {
  const { projects } = useProjects();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsAPI.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const totalProjects = analytics?.totalProjects || projects.length;
  const completedTasks = analytics?.completedTasks || 0;
  const totalTasks = analytics?.totalTasks || 0;
  const totalHours = analytics?.totalHours || 0;
  const billableHours = analytics?.billableHours || 0;
  const nonBillableHours = analytics?.nonBillableHours || 0;

  const totalRevenue = analytics?.totalRevenue || 0;
  const totalCost = analytics?.totalCost || 0;
  const profit = analytics?.profit || 0;

  const projectProgress = analytics?.projectProgress || projects.map((p) => ({
    name: p.name,
    progress: p.progress,
  }));

  const resourceUtilization = analytics?.resourceUtilization || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Track performance and insights
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProjects}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {projects.filter((p) => p.status === "in_progress").length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tasks Completed
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completedTasks}/{totalTasks}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(0) : 0}% completion rate
                  </p>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {billableHours}h billable
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Net Profit
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ₹{(profit / 1000).toFixed(0)}k
                  </div>
                    <p className="text-xs text-muted-foreground mt-1">
                    {totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(0) : 0}% margin
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {projectProgress.map((p) => (
                    <div key={p.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-muted-foreground">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Resource Utilization */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {resourceUtilization.map((r) => (
                    <div key={r.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-muted-foreground">{r.utilization}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`rounded-full h-2 transition-all ${
                            r.utilization > 85
                              ? "bg-destructive"
                              : r.utilization > 70
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${r.utilization}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Financial Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-bold text-success">
                        ₹{(totalRevenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost</span>
                      <span className="font-bold text-destructive">
                        ₹{(totalCost / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-medium">Net Profit</span>
                      <span className="font-bold text-primary">
                        ₹{(profit / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Profit Margin</p>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-success rounded-full h-3 transition-all"
                        style={{ width: `${totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Billable vs Non-billable */}
              <Card>
                <CardHeader>
                  <CardTitle>Billable vs Non-billable Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <div className="text-4xl font-bold">{totalHours}h</div>
                      <p className="text-muted-foreground mt-2">Total Hours Logged</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-3 h-3 rounded-full bg-success" />
                          <span className="text-sm">Billable: {billableHours}h</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-3 h-3 rounded-full bg-muted" />
                          <span className="text-sm">Non-billable: {nonBillableHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
