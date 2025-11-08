import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3, Settings } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
