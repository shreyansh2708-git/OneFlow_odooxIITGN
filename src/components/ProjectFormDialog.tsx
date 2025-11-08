import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/data/staticData";
import { useProjects } from "@/contexts/ProjectContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TeamMemberSelector } from "@/components/TeamMemberSelector";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["planned", "in_progress", "completed", "on_hold"]),
  manager: z.string().min(1, "Manager is required"),
  team: z.array(z.string()),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.number().min(0, "Budget must be positive").optional().default(0),
  spent: z.number().min(0).optional().default(0),
  progress: z.number().min(0).max(100, "Progress must be between 0 and 100").optional().default(0),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const { addProject, updateProject } = useProjects();
  const [teamMembers, setTeamMembers] = useState<string[]>(project?.team || []);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planned",
      manager: "",
      team: [],
      startDate: "",
      endDate: "",
      budget: 0,
      spent: 0,
      progress: 0,
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        status: project.status,
        manager: project.manager,
        team: project.team,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        spent: project.spent,
        progress: project.progress,
      });
      setTeamMembers(project.team);
    } else {
      form.reset({
        name: "",
        description: "",
        status: "planned",
        manager: "",
        team: [],
        startDate: "",
        endDate: "",
        budget: 0,
        spent: 0,
        progress: 0,
      });
      setTeamMembers([]);
    }
  }, [project, form]);

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (project) {
        // Update existing project
        await updateProject(project.id, data);
      } else {
        // Create new project
        await addProject(data);
      }
      onOpenChange(false);
      form.reset();
      setTeamMembers([]);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const addTeamMember = () => {
    const input = document.getElementById("team-member-input") as HTMLInputElement;
    if (input && input.value.trim()) {
      const newMember = input.value.trim();
      if (!teamMembers.includes(newMember)) {
        const updated = [...teamMembers, newMember];
        setTeamMembers(updated);
        form.setValue("team", updated);
        input.value = "";
      }
    }
  };

  const removeTeamMember = (member: string) => {
    const updated = teamMembers.filter((m) => m !== member);
    setTeamMembers(updated);
    form.setValue("team", updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Create New Project"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter project description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manager name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter budget"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseFloat(value) || 0);
                        }}
                        value={field.value === undefined || field.value === 0 ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Enter progress"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseFloat(value) || 0);
                        }}
                        value={field.value === undefined || field.value === 0 ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Members</FormLabel>
                  <FormControl>
                    <TeamMemberSelector
                      selectedMembers={field.value || []}
                      onSelectionChange={(members) => {
                        field.onChange(members);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{project ? "Save Changes" : "Create Project"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

