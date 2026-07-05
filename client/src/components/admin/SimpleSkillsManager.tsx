import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Skill {
  _id: string;
  name: string;
  categoryId: string;
  category?: {
    _id: string;
    name: string;
    icon: string;
  };
  proficiency: number;
  experience: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

interface SkillCategory {
  _id: string;
  name: string;
  icon: string;
  displayOrder: number;
}

interface SkillFormData {
  name: string;
  categoryId: string;
  proficiency: number;
  experience: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export default function SimpleSkillsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<SkillFormData>({
    name: "",
    categoryId: "",
    proficiency: 70,
    experience: "",
    description: "",
    isActive: true,
    displayOrder: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch skills
  const { data: skillsData, isLoading: skillsLoading, error: skillsError } = useQuery({
    queryKey: ["/api/admin/skills"],
    queryFn: async () => {
      const response = await fetch("/api/admin/skills", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch skills: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Fetch skill categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["/api/admin/skill-categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/skill-categories", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      const result = await response.json();
      return result.success ? result.data : [];
    },
  });

  // Create skill mutation
  const createSkillMutation = useMutation({
    mutationFn: async (data: SkillFormData) => {
      return apiRequest({
        method: "POST",
        url: "/api/admin/skills",
        data,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Skill created successfully" });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create skill",
        variant: "destructive",
      });
    },
  });

  // Update skill mutation
  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SkillFormData }) => {
      return apiRequest({
        method: "PUT",
        url: `/api/admin/skills/${id}`,
        data,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Skill updated successfully" });
      setIsDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update skill",
        variant: "destructive",
      });
    },
  });

  // Delete skill mutation
  const deleteSkillMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest({
        method: "DELETE",
        url: `/api/admin/skills/${id}`,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Skill deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (skill: Skill) => {
    if (window.confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      deleteSkillMutation.mutate(skill._id);
    }
  };

  if (skillsError || categoriesError) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <h3 className="text-red-400 text-lg font-medium mb-2">Error Loading Skills</h3>
          <p className="text-red-300 text-sm mb-4">
            {skillsError?.message || categoriesError?.message || "Unknown error occurred"}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  if (skillsLoading || categoriesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading skills data...</p>
          </div>
        </div>
      </div>
    );
  }

  const skills = skillsData || [];
  const categories = categoriesData || [];

  console.log("Skills data:", skills);
  console.log("Categories data:", categories);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Skills Management</h2>
          <p className="text-gray-400">Manage your technical skills and proficiency levels</p>
        </div>
        <Button className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30">
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Debug Information */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-blue-400 font-medium mb-2">Debug Information</h3>
        <div className="text-sm text-blue-300 space-y-1">
          <p>Skills found: {skills.length}</p>
          <p>Categories found: {categories.length}</p>
          <p>Loading states: Skills={skillsLoading.toString()}, Categories={categoriesLoading.toString()}</p>
        </div>
      </div>

      {/* Skills List */}
      {skills.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Code className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Skills Found</h3>
            <p className="text-gray-500 text-center mb-4">
              Start building your skills portfolio by adding your first skill.
            </p>
            <Button className="bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-400" />
              All Skills
              <Badge variant="secondary" className="ml-auto">
                {skills.length} skills
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills
                .sort((a: Skill, b: Skill) => a.displayOrder - b.displayOrder)
                .map((skill: Skill) => (
                  <div
                    key={skill._id}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white">{skill.name}</h4>
                        {skill.experience && (
                          <p className="text-sm text-gray-400">{skill.experience}</p>
                        )}
                        {skill.category && (
                          <p className="text-xs text-blue-400">{skill.category.name}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(skill)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Proficiency</span>
                        <span className="text-blue-400 font-medium">
                          {skill.proficiency}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>

                    {skill.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {skill.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={skill.isActive ? "default" : "secondary"}
                        className={
                          skill.isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }
                      >
                        {skill.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Order: {skill.displayOrder}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}