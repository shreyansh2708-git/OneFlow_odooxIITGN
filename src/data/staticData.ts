export interface Project {
  id: string;
  name: string;
  status: "planned" | "in_progress" | "completed" | "on_hold";
  manager: string;
  team: string[];
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  description: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignee: string;
  status: "new" | "in_progress" | "blocked" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  hoursLogged: number;
  estimatedHours: number;
}

export interface SalesOrder {
  id: string;
  projectId: string;
  number: string;
  customer: string;
  amount: number;
  date: string;
  status: "draft" | "confirmed" | "invoiced";
  description: string;
}

export interface PurchaseOrder {
  id: string;
  projectId: string;
  number: string;
  vendor: string;
  amount: number;
  date: string;
  status: "draft" | "confirmed" | "billed";
  description: string;
}

export interface CustomerInvoice {
  id: string;
  projectId: string;
  salesOrderId?: string;
  number: string;
  customer: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "draft" | "sent" | "paid";
  description: string;
}

export interface VendorBill {
  id: string;
  projectId: string;
  purchaseOrderId?: string;
  number: string;
  vendor: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "draft" | "confirmed" | "paid";
  description: string;
}

export interface Expense {
  id: string;
  projectId: string;
  employee: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  billable: boolean;
  status: "pending" | "approved" | "rejected";
  receipt?: string;
}

export interface Timesheet {
  id: string;
  projectId: string;
  taskId: string;
  employee: string;
  date: string;
  hours: number;
  billable: boolean;
  description: string;
}

export const projects: Project[] = [
  {
    id: "1",
    name: "Brand Website",
    status: "in_progress",
    manager: "Project Manager",
    team: ["Team Member", "Designer", "Developer"],
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    budget: 100000,
    spent: 45000,
    progress: 45,
    description: "Complete website redesign for brand identity",
  },
  {
    id: "2",
    name: "Mobile App Development",
    status: "in_progress",
    manager: "Project Manager",
    team: ["Developer 1", "Developer 2", "QA Engineer"],
    startDate: "2025-02-01",
    endDate: "2025-05-31",
    budget: 250000,
    spent: 80000,
    progress: 32,
    description: "Native mobile application for iOS and Android",
  },
  {
    id: "3",
    name: "Marketing Campaign",
    status: "planned",
    manager: "Sales User",
    team: ["Marketing Lead", "Content Writer"],
    startDate: "2025-03-15",
    endDate: "2025-06-15",
    budget: 50000,
    spent: 0,
    progress: 0,
    description: "Q2 marketing campaign across all channels",
  },
  {
    id: "4",
    name: "Database Migration",
    status: "completed",
    manager: "Admin User",
    team: ["DBA", "Backend Developer"],
    startDate: "2024-11-01",
    endDate: "2024-12-31",
    budget: 75000,
    spent: 72000,
    progress: 100,
    description: "Migrate legacy database to new cloud infrastructure",
  },
];

export const tasks: Task[] = [
  {
    id: "1",
    projectId: "1",
    title: "Design Homepage Mockup",
    description: "Create high-fidelity mockup for homepage",
    assignee: "Designer",
    status: "done",
    priority: "high",
    dueDate: "2025-01-15",
    hoursLogged: 16,
    estimatedHours: 16,
  },
  {
    id: "2",
    projectId: "1",
    title: "Develop Frontend Components",
    description: "Build reusable React components for website",
    assignee: "Developer",
    status: "in_progress",
    priority: "high",
    dueDate: "2025-02-28",
    hoursLogged: 48,
    estimatedHours: 80,
  },
  {
    id: "3",
    projectId: "1",
    title: "Photography Session",
    description: "Professional photography for brand images",
    assignee: "Team Member",
    status: "done",
    priority: "medium",
    dueDate: "2025-01-20",
    hoursLogged: 8,
    estimatedHours: 8,
  },
  {
    id: "4",
    projectId: "2",
    title: "API Integration",
    description: "Integrate backend APIs with mobile app",
    assignee: "Developer 1",
    status: "in_progress",
    priority: "high",
    dueDate: "2025-03-15",
    hoursLogged: 32,
    estimatedHours: 60,
  },
];

export const salesOrders: SalesOrder[] = [
  {
    id: "1",
    projectId: "1",
    number: "SO-2025-001",
    customer: "Acme Corporation",
    amount: 100000,
    date: "2025-01-01",
    status: "confirmed",
    description: "Brand Website - Complete redesign",
  },
  {
    id: "2",
    projectId: "2",
    number: "SO-2025-002",
    customer: "Tech Startup Inc",
    amount: 250000,
    date: "2025-02-01",
    status: "confirmed",
    description: "Mobile App Development - iOS & Android",
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    projectId: "1",
    number: "PO-2025-001",
    vendor: "Professional Photography Studio",
    amount: 12000,
    date: "2025-01-10",
    status: "billed",
    description: "Photography services for brand website",
  },
];

export const customerInvoices: CustomerInvoice[] = [
  {
    id: "1",
    projectId: "1",
    salesOrderId: "1",
    number: "INV-2025-001",
    customer: "Acme Corporation",
    amount: 40000,
    date: "2025-01-31",
    dueDate: "2025-02-28",
    status: "paid",
    description: "Design Phase Milestone - Brand Website",
  },
  {
    id: "2",
    projectId: "1",
    salesOrderId: "1",
    number: "INV-2025-002",
    customer: "Acme Corporation",
    amount: 60000,
    date: "2025-02-28",
    dueDate: "2025-03-30",
    status: "sent",
    description: "Build Phase Milestone - Brand Website",
  },
];

export const vendorBills: VendorBill[] = [
  {
    id: "1",
    projectId: "1",
    purchaseOrderId: "1",
    number: "BILL-2025-001",
    vendor: "Professional Photography Studio",
    amount: 12000,
    date: "2025-01-25",
    dueDate: "2025-02-25",
    status: "paid",
    description: "Photography services invoice",
  },
];

export const expenses: Expense[] = [
  {
    id: "1",
    projectId: "1",
    employee: "Developer",
    amount: 1500,
    date: "2025-02-10",
    category: "Travel",
    description: "Client meeting travel expenses",
    billable: true,
    status: "approved",
    receipt: "receipt-001.pdf",
  },
  {
    id: "2",
    projectId: "2",
    employee: "Developer 1",
    amount: 800,
    date: "2025-02-15",
    category: "Software",
    description: "Development tools subscription",
    billable: false,
    status: "approved",
  },
];

export const timesheets: Timesheet[] = [
  {
    id: "1",
    projectId: "1",
    taskId: "1",
    employee: "Designer",
    date: "2025-01-10",
    hours: 8,
    billable: true,
    description: "Homepage mockup design work",
  },
  {
    id: "2",
    projectId: "1",
    taskId: "2",
    employee: "Developer",
    date: "2025-02-01",
    hours: 8,
    billable: true,
    description: "Frontend component development",
  },
  {
    id: "3",
    projectId: "1",
    taskId: "2",
    employee: "Developer",
    date: "2025-02-02",
    hours: 8,
    billable: true,
    description: "Frontend component development",
  },
];
