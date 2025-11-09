import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/contexts/ProjectContext";
import { 
  tasksAPI, salesOrdersAPI, purchaseOrdersAPI, 
  invoicesAPI, vendorBillsAPI, expensesAPI, projectsAPI
} from "@/lib/api";
import { 
  ArrowLeft, FileText, ShoppingCart, Receipt, 
  CreditCard, Wallet, TrendingUp, ListTodo, Edit, Menu
} from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateSalesOrderDialog } from "@/components/CreateSalesOrderDialog";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";
import { CreateInvoiceDialog } from "@/components/CreateInvoiceDialog";
import { CreateVendorBillDialog } from "@/components/CreateVendorBillDialog";
import { CreateExpenseDialog } from "@/components/CreateExpenseDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { toast } from "@/hooks/use-toast";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, refreshProjects } = useProjects();
  const [currentProject, setCurrentProject] = useState<any>(null);
  
  useEffect(() => {
    const proj = getProject(id || "");
    setCurrentProject(proj);
  }, [id, getProject]);
  
  const project = currentProject || getProject(id || "");
  
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [projectSO, setProjectSO] = useState<any[]>([]);
  const [projectPO, setProjectPO] = useState<any[]>([]);
  const [projectInvoices, setProjectInvoices] = useState<any[]>([]);
  const [projectBills, setProjectBills] = useState<any[]>([]);
  const [projectExpenses, setProjectExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSOOpen, setIsSOOpen] = useState(false);
  const [isPOOpen, setIsPOOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [editingSpent, setEditingSpent] = useState(false);
  const [budgetValue, setBudgetValue] = useState("0");
  const [spentValue, setSpentValue] = useState("0");
  const [activeView, setActiveView] = useState<"overview" | "so" | "po" | "invoices" | "bills" | "expenses" | "tasks">("overview");
  const [sheetOpen, setSheetOpen] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [tasks, so, po, invoices, bills, expenses] = await Promise.all([
        tasksAPI.getAll(id),
        salesOrdersAPI.getAll(id),
        purchaseOrdersAPI.getAll(id),
        invoicesAPI.getAll(id),
        vendorBillsAPI.getAll(id),
        expensesAPI.getAll(id),
      ]);
      setProjectTasks(tasks);
      setProjectSO(so);
      setProjectPO(po);
      setProjectInvoices(invoices);
      setProjectBills(bills);
      setProjectExpenses(expenses);
    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const proj = getProject(id || "");
    if (proj) {
      setCurrentProject(proj);
      setBudgetValue(proj.budget.toString());
      setSpentValue(proj.spent.toString());
    }
  }, [id, getProject]);

  useEffect(() => {
    if (project) {
      setBudgetValue(project.budget.toString());
      setSpentValue(project.spent.toString());
    }
  }, [project]);

  if (!project) {
    return <div>Project not found</div>;
  }

  const totalRevenue = projectInvoices.reduce((sum, i) => sum + i.amount, 0);
  const totalCost = projectBills.reduce((sum, b) => sum + b.amount, 0) + 
                    projectExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalRevenue - totalCost;

  const handleStatusChange = async (newStatus: string) => {
    try {
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
      await projectsAPI.update(project.id, updateData);
      toast({
        title: "Success",
        description: "Project status updated",
      });
      await refreshProjects();
      const updated = getProject(id || "");
      if (updated) {
        setCurrentProject(updated);
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

  const handleBudgetUpdate = async () => {
    try {
      await projectsAPI.update(project.id, { ...project, budget: parseFloat(budgetValue) });
      toast({
        title: "Success",
        description: "Budget updated",
      });
      await refreshProjects();
      setEditingBudget(false);
      // Refresh current project
      const updated = getProject(id || "");
      if (updated) {
        setCurrentProject(updated);
        setBudgetValue(updated.budget.toString());
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update budget",
        variant: "destructive",
      });
      setBudgetValue(project.budget.toString());
    }
  };

  const handleSpentUpdate = async () => {
    try {
      await projectsAPI.update(project.id, { ...project, spent: parseFloat(spentValue) });
      toast({
        title: "Success",
        description: "Spent amount updated",
      });
      await refreshProjects();
      setEditingSpent(false);
      // Refresh current project
      const updated = getProject(id || "");
      if (updated) {
        setCurrentProject(updated);
        setSpentValue(updated.spent.toString());
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update spent amount",
        variant: "destructive",
      });
      setSpentValue(project.spent.toString());
    }
  };

  const refreshAllData = async () => {
    await fetchData();
    await refreshProjects();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/projects")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>

              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <p className="text-muted-foreground mt-1">{project.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={project.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                      <SheetHeader>
                        <SheetTitle>Project Sections</SheetTitle>
                        <SheetDescription>
                          Navigate through different sections of this project
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-2">
                        <Button
                          variant={activeView === "overview" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveView("overview");
                            setSheetOpen(false);
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Overview
                        </Button>
                        <Button
                          variant={activeView === "so" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveView("so");
                            setSheetOpen(false);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Sales Orders
                        </Button>
                        <Button
                          variant={activeView === "po" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveView("po");
                            setSheetOpen(false);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Purchase Orders
                        </Button>
                        <Button
                          variant={activeView === "invoices" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveView("invoices");
                            setSheetOpen(false);
                          }}
                        >
                          <Receipt className="h-4 w-4 mr-2" />
                          Invoices
                        </Button>
                        <Button
                          variant={activeView === "bills" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveView("bills");
                            setSheetOpen(false);
                          }}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Vendor Bills
                        </Button>
                        <Button
                          variant={activeView === "expenses" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveView("expenses");
                            setSheetOpen(false);
                          }}
                        >
                          <Wallet className="h-4 w-4 mr-2" />
                          Expenses
                        </Button>
                        <Button
                          variant={activeView === "tasks" ? "default" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveView("tasks");
                            setSheetOpen(false);
                          }}
                        >
                          <ListTodo className="h-4 w-4 mr-2" />
                          Tasks
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ₹{(totalRevenue / 1000).toFixed(0)}k
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    ₹{(totalCost / 1000).toFixed(0)}k
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    ₹{(profit / 1000).toFixed(0)}k
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{project.progress}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Content based on active view */}
            {activeView === "overview" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Manager</p>
                        <p className="font-medium">{project.manager}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Team Size</p>
                        <p className="font-medium">{project.team?.length || 0} members</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Start Date</p>
                        <p className="font-medium">{project.startDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">End Date</p>
                        <p className="font-medium">{project.endDate}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Budget</p>
                      <div className="flex items-center gap-2 mb-2">
                        {editingBudget ? (
                          <>
                            <Input
                              type="number"
                              step="0.01"
                              value={budgetValue}
                              onChange={(e) => setBudgetValue(e.target.value)}
                              className="w-32"
                            />
                            <Button size="sm" onClick={handleBudgetUpdate}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingBudget(false);
                              setBudgetValue(project.budget.toString());
                            }}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">₹{project.budget.toLocaleString()}</p>
                            <Button variant="ghost" size="icon" onClick={() => setEditingBudget(true)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Spent</p>
                      <div className="flex items-center gap-2 mb-2">
                        {editingSpent ? (
                          <>
                            <Input
                              type="number"
                              step="0.01"
                              value={spentValue}
                              onChange={(e) => setSpentValue(e.target.value)}
                              className="w-32"
                            />
                            <Button size="sm" onClick={handleSpentUpdate}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingSpent(false);
                              setSpentValue(project.spent.toString());
                            }}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">₹{project.spent.toLocaleString()}</p>
                            <Button variant="ghost" size="icon" onClick={() => setEditingSpent(true)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Budget Usage</p>
                      <Progress value={project.budget > 0 ? (project.spent / project.budget) * 100 : 0} />
                      <div className="flex justify-between text-sm mt-2">
                        <span>₹{project.spent.toLocaleString()} spent</span>
                        <span>₹{project.budget.toLocaleString()} budget</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "so" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Sales Orders</CardTitle>
                    <Button size="sm" onClick={() => setIsSOOpen(true)}>Create SO</Button>
                  </CardHeader>
                  <CardContent>
                    {projectSO.length > 0 ? (
                      <div className="space-y-4">
                        {projectSO.map((so) => (
                          <div key={so.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{so.number}</p>
                                <p className="text-sm text-muted-foreground">{so.customer}</p>
                                <p className="text-xs text-muted-foreground mt-1">{so.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{(so.amount / 1000).toFixed(0)}k</p>
                                <Badge variant="outline" className="mt-1">{so.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No sales orders yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "po" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Purchase Orders</CardTitle>
                    <Button size="sm" onClick={() => setIsPOOpen(true)}>Create PO</Button>
                  </CardHeader>
                  <CardContent>
                    {projectPO.length > 0 ? (
                      <div className="space-y-4">
                        {projectPO.map((po) => (
                          <div key={po.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{po.number}</p>
                                <p className="text-sm text-muted-foreground">{po.vendor}</p>
                                <p className="text-xs text-muted-foreground mt-1">{po.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{(po.amount / 1000).toFixed(0)}k</p>
                                <Badge variant="outline" className="mt-1">{po.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No purchase orders yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "invoices" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Customer Invoices</CardTitle>
                    <Button size="sm" onClick={() => setIsInvoiceOpen(true)}>Create Invoice</Button>
                  </CardHeader>
                  <CardContent>
                    {projectInvoices.length > 0 ? (
                      <div className="space-y-4">
                        {projectInvoices.map((inv) => (
                          <div key={inv.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{inv.number}</p>
                                <p className="text-sm text-muted-foreground">{inv.customer}</p>
                                <p className="text-xs text-muted-foreground mt-1">{inv.description}</p>
                                <p className="text-xs text-muted-foreground">Due: {inv.dueDate}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-success">₹{(inv.amount / 1000).toFixed(0)}k</p>
                                <Badge variant="outline" className="mt-1">{inv.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No invoices yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "bills" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Vendor Bills</CardTitle>
                    <Button size="sm" onClick={() => setIsBillOpen(true)}>Create Bill</Button>
                  </CardHeader>
                  <CardContent>
                    {projectBills.length > 0 ? (
                      <div className="space-y-4">
                        {projectBills.map((bill) => (
                          <div key={bill.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{bill.number}</p>
                                <p className="text-sm text-muted-foreground">{bill.vendor}</p>
                                <p className="text-xs text-muted-foreground mt-1">{bill.description}</p>
                                <p className="text-xs text-muted-foreground">Due: {bill.dueDate}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-destructive">₹{(bill.amount / 1000).toFixed(0)}k</p>
                                <Badge variant="outline" className="mt-1">{bill.status}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No vendor bills yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "expenses" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Expenses</CardTitle>
                    <Button size="sm" onClick={() => setIsExpenseOpen(true)}>Submit Expense</Button>
                  </CardHeader>
                  <CardContent>
                    {projectExpenses.length > 0 ? (
                      <div className="space-y-4">
                        {projectExpenses.map((exp) => (
                          <div key={exp.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{exp.category}</p>
                                <p className="text-sm text-muted-foreground">{exp.employee}</p>
                                <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{exp.billable ? "Billable" : "Non-billable"}</Badge>
                                  <Badge variant="outline">{exp.status}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">₹{exp.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{exp.date}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No expenses yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeView === "tasks" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Tasks</CardTitle>
                    <Button size="sm" onClick={() => setIsTaskOpen(true)}>Create Task</Button>
                  </CardHeader>
                  <CardContent>
                    {projectTasks.length > 0 ? (
                      <div className="space-y-4">
                        {projectTasks.map((task) => (
                          <div key={task.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">Assigned to: {task.assignee}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline">{task.status}</Badge>
                                  <Badge variant="outline">{task.priority}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                                <p className="text-sm font-medium mt-1">{task.hoursLogged}h / {task.estimatedHours}h</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No tasks yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <ProjectFormDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        project={project}
      />
      <CreateSalesOrderDialog 
        open={isSOOpen} 
        onOpenChange={setIsSOOpen}
        projectId={id || ""}
        onSuccess={refreshAllData}
      />
      <CreatePurchaseOrderDialog 
        open={isPOOpen} 
        onOpenChange={setIsPOOpen}
        projectId={id || ""}
        onSuccess={refreshAllData}
      />
      <CreateInvoiceDialog 
        open={isInvoiceOpen} 
        onOpenChange={setIsInvoiceOpen}
        projectId={id || ""}
        onSuccess={refreshAllData}
      />
      <CreateVendorBillDialog 
        open={isBillOpen} 
        onOpenChange={setIsBillOpen}
        projectId={id || ""}
        onSuccess={refreshAllData}
      />
      <CreateExpenseDialog 
        open={isExpenseOpen} 
        onOpenChange={setIsExpenseOpen}
        projectId={id || ""}
        onSuccess={refreshAllData}
      />
      {id && (
        <CreateTaskDialog 
          open={isTaskOpen} 
          onOpenChange={setIsTaskOpen}
          projectId={id}
          onSuccess={refreshAllData}
        />
      )}
    </div>
  );
}
