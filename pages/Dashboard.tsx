import { FolderKanban, CheckSquare, Clock, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/KPICard";
import ProjectCard from "@/components/ProjectCard";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = ["All", "Planned", "In Progress", "Completed", "On Hold"];

  const projects = [
    {
      title: "Brand Website",
      description: "Complete website redesign for brand identity",
      status: "In Progress" as const,
      progress: 45,
    },
    {
      title: "Mobile App Development",
      description: "Native mobile application for iOS and Android",
      status: "In Progress" as const,
      progress: 32,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Active Projects" value="2" icon={FolderKanban} />
          <KPICard title="Delayed Tasks" value="2" icon={CheckSquare} variant="destructive" />
          <KPICard title="Hours Logged" value="104h" icon={Clock} />
          <KPICard title="Revenue Earned" value="₹197k" icon={TrendingUp} />
        </div>

        {/* Filters and New Project Button */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((filter) => {
              const filterId = filter.toLowerCase().replace(" ", "-");
              const isActive = activeFilter === filterId;

              return (
                <Button
                  key={filterId}
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveFilter(filterId)}
                  className={cn(
                    "transition-all",
                    !isActive && "bg-card hover:bg-muted"
                  )}
                >
                  {filter}
                </Button>
              );
            })}
          </div>

          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
