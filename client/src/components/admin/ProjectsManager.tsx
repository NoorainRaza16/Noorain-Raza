import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  Star, 
  StarOff, 
  ExternalLink, 
  Github, 
  Code2, 
  Image as ImageIcon,
  Palette,
  FileText,
  Link,
  Grid3x3,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Settings,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { FileUpload } from "@/components/admin/FileUpload";

interface Technology {
  name: string;
  bgColor: string;
  textColor: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  image: string;
  technologies: (Technology | string)[];
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
}

interface ProjectFormData {
  title: string;
  description: string;
  image: string;
  technologies: Technology[];
  demoUrl: string;
  githubUrl: string;
  featured: boolean;
  isActive: boolean;
  displayOrder: number;
}

const initialFormData: ProjectFormData = {
  title: "",
  description: "",
  image: "",
  technologies: [],
  demoUrl: "",
  githubUrl: "",
  featured: false,
  isActive: true,
  displayOrder: 0,
};

const predefinedTechnologies = [
  { name: "React", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
  { name: "Next.js", bgColor: "bg-black dark:bg-gray-900", textColor: "text-white dark:text-gray-100" },
  { name: "Vue.js", bgColor: "bg-green-100 dark:bg-green-900", textColor: "text-green-800 dark:text-green-200" },
  { name: "Angular", bgColor: "bg-red-100 dark:bg-red-900", textColor: "text-red-800 dark:text-red-200" },
  { name: "TypeScript", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
  { name: "JavaScript", bgColor: "bg-yellow-100 dark:bg-yellow-900", textColor: "text-yellow-800 dark:text-yellow-200" },
  { name: "Python", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
  { name: "Node.js", bgColor: "bg-green-100 dark:bg-green-900", textColor: "text-green-800 dark:text-green-200" },
  { name: "Express", bgColor: "bg-gray-100 dark:bg-gray-700", textColor: "text-gray-800 dark:text-gray-300" },
  { name: "MongoDB", bgColor: "bg-green-100 dark:bg-green-900", textColor: "text-green-800 dark:text-green-200" },
  { name: "PostgreSQL", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
  { name: "MySQL", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
  { name: "Tailwind CSS", bgColor: "bg-cyan-100 dark:bg-cyan-900", textColor: "text-cyan-800 dark:text-cyan-200" },
  { name: "Bootstrap", bgColor: "bg-purple-100 dark:bg-purple-900", textColor: "text-purple-800 dark:text-purple-200" },
  { name: "Docker", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
  { name: "AWS", bgColor: "bg-orange-100 dark:bg-orange-900", textColor: "text-orange-800 dark:text-orange-200" },
  { name: "Google Cloud", bgColor: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-800 dark:text-blue-200" },
  { name: "Firebase", bgColor: "bg-yellow-100 dark:bg-yellow-900", textColor: "text-yellow-800 dark:text-yellow-200" },
  { name: "Vercel", bgColor: "bg-black dark:bg-gray-900", textColor: "text-white dark:text-gray-100" },
  { name: "Netlify", bgColor: "bg-teal-100 dark:bg-teal-900", textColor: "text-teal-800 dark:text-teal-200" },
];

export default function ProjectsManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "displayOrder" | "featured">("displayOrder");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "regular">("all");
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [newTech, setNewTech] = useState({ name: "", bgColor: "", textColor: "" });
  const [showTechForm, setShowTechForm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/projects"],
    queryFn: async () => {
      const response = await fetch("/api/admin/projects", {
        credentials: 'include',
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const result = await response.json();
      return result.data || [];
    },
  });

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create project");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Project created successfully" });
      setIsFormOpen(false);
      setFormData(initialFormData);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to create project",
        variant: "destructive" 
      });
    },
  });

  // Update project mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProjectFormData> }) => {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update project");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Project updated successfully" });
      setIsFormOpen(false);
      setEditingProject(null);
      setFormData(initialFormData);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to update project",
        variant: "destructive" 
      });
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete project");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Project deleted successfully" });
      setDeleteProjectId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to delete project",
        variant: "destructive" 
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate({ id: editingProject._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Open edit form
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    
    // Convert technologies to proper Technology objects for editing
    const formattedTechnologies: Technology[] = project.technologies.map(tech => {
      if (typeof tech === 'string') {
        // Find matching predefined technology or create a default one
        const predefined = predefinedTechnologies.find(p => p.name.toLowerCase() === tech.toLowerCase());
        return predefined || {
          name: tech,
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          textColor: 'text-gray-800 dark:text-gray-300'
        };
      }
      return tech as Technology;
    });
    
    setFormData({
      title: project.title,
      description: project.description,
      image: project.image,
      technologies: formattedTechnologies,
      demoUrl: project.demoUrl,
      githubUrl: project.githubUrl,
      featured: project.featured,
      isActive: project.isActive ?? true,
      displayOrder: project.displayOrder,
    });
    setIsFormOpen(true);
  };

  // Add technology to project
  const addTechnology = (tech: Technology) => {
    if (!formData.technologies.find(t => t.name === tech.name)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }));
    }
  };

  // Remove technology from project
  const removeTechnology = (techName: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t.name !== techName)
    }));
  };

  // Add custom technology
  const addCustomTechnology = () => {
    if (newTech.name && newTech.bgColor && newTech.textColor) {
      addTechnology(newTech);
      setNewTech({ name: "", bgColor: "", textColor: "" });
      setShowTechForm(false);
    }
  };

  // Toggle project status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update project status");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: "Success", 
        description: `Project ${variables.isActive ? 'activated' : 'deactivated'} successfully` 
      });
      
      // Aggressive cache invalidation for immediate synchronization
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects-content"] });
      
      // Force refetch to ensure immediate updates
      queryClient.refetchQueries({ queryKey: ["/api/admin/projects"] });
      queryClient.refetchQueries({ queryKey: ["/api/projects"] });
      
      // Clear all project-related cache
      queryClient.removeQueries({ queryKey: ["/api/projects"] });
      
      // Trigger a manual refetch after a short delay to ensure the latest data
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/projects"] });
      }, 500);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error?.message || "Failed to update project status",
        variant: "destructive" 
      });
    },
  });

  // Toggle project active status
  const toggleProjectStatus = (project: Project) => {
    toggleStatusMutation.mutate({ 
      id: project._id, 
      isActive: !project.isActive 
    });
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project: Project) => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFeatured = filterFeatured === "all" || 
                             (filterFeatured === "featured" && project.featured) ||
                             (filterFeatured === "regular" && !project.featured);
      return matchesSearch && matchesFeatured;
    })
    .sort((a: Project, b: Project) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "featured":
          return Number(b.featured) - Number(a.featured);
        case "displayOrder":
        default:
          return a.displayOrder - b.displayOrder;
      }
    });

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProject(null);
    setIsFormOpen(false);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6 p-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              Projects Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage portfolio projects, technologies, and showcase settings
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-4 lg:items-center">
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full"
                    />
                  </div>
                  
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-full">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="displayOrder">Display Order</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterFeatured} onValueChange={(value: any) => setFilterFeatured(value)}>
                    <SelectTrigger className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      <SelectItem value="featured">Featured Only</SelectItem>
                      <SelectItem value="regular">Regular Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-center lg:justify-end gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Display */}
        <div className="w-full">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="w-full">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Code2 className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">No projects found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterFeatured !== "all" 
                        ? "No projects match your current filters." 
                        : "Get started by adding your first project."}
                    </p>
                  </div>
                  {(!searchTerm && filterFeatured === "all") && (
                    <Button onClick={() => setIsFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Project
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence mode="wait">
              {viewMode === "grid" ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 w-full"
                >
                  {filteredProjects.map((project: Project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      onEdit={handleEdit}
                      onDelete={setDeleteProjectId}
                      onToggleStatus={toggleProjectStatus}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4 w-full"
                >
                  {filteredProjects.map((project: Project) => (
                    <ProjectListItem
                      key={project._id}
                      project={project}
                      onEdit={handleEdit}
                      onDelete={setDeleteProjectId}
                      onToggleStatus={toggleProjectStatus}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Project Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              {editingProject ? "Edit Project" : "Add New Project"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="technologies">Technologies</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="AI Mock Interview App"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Developed an AI-driven job interview simulator with real-time feedback..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <FileUpload
                      label="Project Image *"
                      accept="image/*"
                      onFileSelect={(file) => {
                        // File upload is handled by the FileUpload component
                        console.log('File selected:', file.name);
                      }}
                      onUrlChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                      currentUrl={formData.image}
                      placeholder="/images/ai-interview-app.jpg or upload image"
                      icon="image"
                      maxSize={5}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="demoUrl" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Demo URL
                    </Label>
                    <Input
                      id="demoUrl"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="githubUrl" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub URL
                    </Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="technologies" className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Project Technologies</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select technologies used in this project
                  </p>
                  
                  {/* Selected Technologies */}
                  {formData.technologies.length > 0 && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Selected Technologies:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.technologies.map((tech) => (
                          <Badge
                            key={tech.name}
                            className={`${tech.bgColor} ${tech.textColor} border-0 relative group`}
                          >
                            {tech.name}
                            <button
                              type="button"
                              onClick={() => removeTechnology(tech.name)}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Predefined Technologies */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Available Technologies:</Label>
                    <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded">
                      {predefinedTechnologies.map((tech) => (
                        <Badge
                          key={tech.name}
                          className={`${tech.bgColor} ${tech.textColor} border-0 cursor-pointer hover:opacity-80`}
                          onClick={() => addTechnology(tech)}
                        >
                          {tech.name}
                          <Plus className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Technology Form */}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTechForm(!showTechForm)}
                      className="mb-4"
                    >
                      <Palette className="h-4 w-4 mr-2" />
                      Add Custom Technology
                    </Button>
                    
                    {showTechForm && (
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label htmlFor="techName">Technology Name</Label>
                              <Input
                                id="techName"
                                value={newTech.name}
                                onChange={(e) => setNewTech(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="React Native"
                              />
                            </div>
                            <div>
                              <Label htmlFor="bgColor">Background Color</Label>
                              <Input
                                id="bgColor"
                                value={newTech.bgColor}
                                onChange={(e) => setNewTech(prev => ({ ...prev, bgColor: e.target.value }))}
                                placeholder="bg-blue-100 dark:bg-blue-900"
                              />
                            </div>
                            <div>
                              <Label htmlFor="textColor">Text Color</Label>
                              <Input
                                id="textColor"
                                value={newTech.textColor}
                                onChange={(e) => setNewTech(prev => ({ ...prev, textColor: e.target.value }))}
                                placeholder="text-blue-800 dark:text-blue-200"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" onClick={addCustomTechnology} size="sm">
                              Add Technology
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setShowTechForm(false);
                                setNewTech({ name: "", bgColor: "", textColor: "" });
                              }}
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Active Project</Label>
                      <p className="text-sm text-muted-foreground">
                        Show this project on the website
                      </p>
                    </div>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="text-base font-medium">Featured Project</Label>
                      <p className="text-sm text-muted-foreground">
                        Mark as featured to highlight this project
                      </p>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower numbers appear first
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProjectId && deleteMutation.mutate(deleteProjectId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Project Card Component
function ProjectCard({ 
  project, 
  onEdit, 
  onDelete,
  onToggleStatus,
  isToggling 
}: { 
  project: Project; 
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (project: Project) => void;
  isToggling?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge 
                  className={`${project.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                >
                  {project.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus(project)}
                disabled={isToggling}
                className={`${project.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                title={project.isActive ? 'Deactivate project' : 'Activate project'}
              >
                {isToggling ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : (
                  project.isActive ? <Eye className="h-4 w-4" /> : <X className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(project)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(project._id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Project Image */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2plY3QgSW1hZ2U8L3RleHQ+PC9zdmc+';
              }}
            />
          </div>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.description}
          </p>
          
          {/* Technologies */}
          <div className="flex flex-wrap gap-1">
            {project.technologies.slice(0, 3).map((tech, index) => {
              // Handle both string and object formats
              const techName = typeof tech === 'string' ? tech : tech.name || 'Unknown';
              const bgColor = typeof tech === 'object' && tech.bgColor ? tech.bgColor : 'bg-gray-100 dark:bg-gray-700';
              const textColor = typeof tech === 'object' && tech.textColor ? tech.textColor : 'text-gray-800 dark:text-gray-300';
              
              return (
                <Badge
                  key={`${techName}-${index}`}
                  className={`${bgColor} ${textColor} border-0 text-xs`}
                >
                  {techName}
                </Badge>
              );
            })}
            {project.technologies.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - 3}
              </Badge>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {project.demoUrl && project.demoUrl !== "#" && (
              <Button variant="outline" size="sm" asChild>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Demo
                </a>
              </Button>
            )}
            {project.githubUrl && project.githubUrl !== "#" && (
              <Button variant="outline" size="sm" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-3 w-3 mr-1" />
                  Code
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Project List Item Component
function ProjectListItem({ 
  project, 
  onEdit, 
  onDelete,
  onToggleStatus,
  isToggling 
}: { 
  project: Project; 
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (project: Project) => void;
  isToggling?: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="hover:shadow-md transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Project Image */}
            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5NGEzYjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWc8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
            
            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {project.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge 
                      className={`${project.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}
                    >
                      {project.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Order: {project.displayOrder}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus(project)}
                    disabled={isToggling}
                    className={`${project.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                    title={project.isActive ? 'Deactivate project' : 'Activate project'}
                  >
                    {isToggling ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      project.isActive ? <Eye className="h-4 w-4" /> : <X className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(project)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(project._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {project.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 4).map((tech, index) => {
                    // Handle both string and object formats
                    const techName = typeof tech === 'string' ? tech : tech.name || 'Unknown';
                    const bgColor = typeof tech === 'object' && tech.bgColor ? tech.bgColor : 'bg-gray-100 dark:bg-gray-700';
                    const textColor = typeof tech === 'object' && tech.textColor ? tech.textColor : 'text-gray-800 dark:text-gray-300';
                    
                    return (
                      <Badge
                        key={`${techName}-${index}`}
                        className={`${bgColor} ${textColor} border-0 text-xs`}
                      >
                        {techName}
                      </Badge>
                    );
                  })}
                  {project.technologies.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.technologies.length - 4}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {project.demoUrl && project.demoUrl !== "#" && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  {project.githubUrl && project.githubUrl !== "#" && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}