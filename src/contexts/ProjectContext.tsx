import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Project } from "@/data/staticData";
import { projectsAPI } from "@/lib/api";

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  refreshProjects: () => Promise<void>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const addProject = async (project: Omit<Project, 'id'>) => {
    try {
      const response = await projectsAPI.create(project);
      // Refresh projects to get the latest data from server
      await refreshProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await projectsAPI.update(id, updates);
      await refreshProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsAPI.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        updateProject,
        deleteProject,
        getProject,
        refreshProjects,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

