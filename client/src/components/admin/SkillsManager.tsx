import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Code, Star, TrendingUp, ToggleLeft, ToggleRight, Eye, EyeOff } from "lucide-react";
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
  createdAt?: string;
  updatedAt?: string;
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

export default function SkillsManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<SkillFormData>({
    name: "",
    categoryId: "",
    proficiency: 70,
    experience: "",
    description: "",
    isActive: false, // Default to inactive
    displayOrder: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch skills
  const { data: skillsData, isLoading: skillsLoading, refetch: refetchSkills, error: skillsError } = useQuery({
    queryKey: ["/api/admin/skills"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/skills", {
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            // Try to refresh authentication
            window.location.reload();
            throw new Error("Authentication expired - refreshing page");
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        console.log('Skills API response:', result);
        return result.success ? result.data : [];
      } catch (error) {
        console.error("Skills fetch error:", error);
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry auth errors
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000, // 30 seconds
  });

  // Fetch skill categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["/api/admin/skill-categories"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/skill-categories", {
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            window.location.reload();
            throw new Error("Authentication expired - refreshing page");
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        console.log('Categories API response:', result);
        return result.success ? result.data : [];
      } catch (error) {
        console.error("Categories fetch error:", error);
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('401') || error?.message?.includes('Authentication')) {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 30000,
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
      refetchSkills();
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
      refetchSkills();
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
      refetchSkills();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill",
        variant: "destructive",
      });
    },
  });

  // Comprehensive skills organization mutation
  const organizeSkillsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        method: "POST",
        url: "/api/admin/organize-skills",
        data: {},
      });
    },
    onSuccess: (response: any) => {
      toast({ 
        title: "Skills Organized Successfully", 
        description: `Organized ${response.data?.updatedCount || 0} skills into ${response.data?.totalCategories || 0} categories. All skills are now INACTIVE - activate them as needed.`
      });
      refetchSkills();
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to organize skills",
        variant: "destructive",
      });
    },
  });

  // Toggle skill active status mutation
  const toggleSkillStatusMutation = useMutation({
    mutationFn: async ({ skillId, isActive }: { skillId: string; isActive: boolean }) => {
      return apiRequest({
        method: "PUT",
        url: `/api/admin/skills/${skillId}`,
        data: { isActive },
      });
    },
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Skill visibility updated successfully"
      });
      refetchSkills();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update skill visibility",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      proficiency: 70,
      experience: "",
      description: "",
      isActive: true,
      displayOrder: 0,
    });
    setEditingSkill(null);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      categoryId: skill.categoryId,
      proficiency: skill.proficiency,
      experience: skill.experience,
      description: skill.description || "",
      isActive: skill.isActive,
      displayOrder: skill.displayOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (skill: Skill) => {
    if (window.confirm(`Are you sure you want to delete "${skill.name}"?`)) {
      deleteSkillMutation.mutate(skill._id);
    }
  };

  const handleToggleStatus = (skill: Skill) => {
    toggleSkillStatusMutation.mutate({
      skillId: skill._id,
      isActive: !skill.isActive
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.categoryId) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (editingSkill) {
      updateSkillMutation.mutate({ id: editingSkill._id, data: formData });
    } else {
      createSkillMutation.mutate(formData);
    }
  };

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 90) return "text-green-400";
    if (proficiency >= 75) return "text-blue-400";
    if (proficiency >= 60) return "text-yellow-400";
    return "text-gray-400";
  };

  const getProficiencyLabel = (proficiency: number) => {
    if (proficiency >= 90) return "Expert";
    if (proficiency >= 75) return "Advanced";
    if (proficiency >= 60) return "Intermediate";
    return "Beginner";
  };

  const skills = skillsData || [];
  const categories = categoriesData || [];

  // Group skills by category and ensure all categories are shown
  const skillsByCategory: Record<string, { category: SkillCategory | null, skills: Skill[] }> = {};
  
  // Initialize all categories (including empty ones)
  categories.forEach((category: SkillCategory) => {
    skillsByCategory[category.name] = { category, skills: [] };
  });
  
  // Add skills to their respective categories
  skills.forEach((skill: Skill) => {
    const category = categories.find((cat: SkillCategory) => cat._id === skill.categoryId);
    const categoryName = category?.name || "Uncategorized";
    
    if (!skillsByCategory[categoryName]) {
      skillsByCategory[categoryName] = { category: null, skills: [] };
    }
    skillsByCategory[categoryName].skills.push(skill);
  });

  // Sort categories by their display order
  const sortedCategoryEntries = Object.entries(skillsByCategory).sort(([categoryNameA], [categoryNameB]) => {
    const categoryA = skillsByCategory[categoryNameA].category;
    const categoryB = skillsByCategory[categoryNameB].category;
    
    if (categoryNameA === "Uncategorized") return 1;
    if (categoryNameB === "Uncategorized") return -1;
    
    const orderA = categoryA?.displayOrder || 999;
    const orderB = categoryB?.displayOrder || 999;
    
    return orderA - orderB;
  });

  // Calculate stats
  const totalSkills = skills.length;
  const activeSkills = skills.filter((skill: any) => skill.isActive).length;
  const inactiveSkills = totalSkills - activeSkills;

  // Debug information
  console.log('SkillsManager rendering:', {
    skillsLoading,
    categoriesLoading,
    skillsError,
    categoriesError,
    skillsData: skills?.length,
    categoriesData: categories?.length,
    hasSkillsData: !!skillsData,
    hasCategoriesData: !!categoriesData
  });

  // Show loading state
  if (skillsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading skills and categories...</div>
          <div className="text-xs text-gray-500 mt-2">
            Skills: {skillsLoading ? 'Loading...' : 'Ready'} | 
            Categories: {categoriesLoading ? 'Loading...' : 'Ready'}
          </div>
        </div>
      </div>
    );
  }

  // Show error states
  if (skillsError || categoriesError) {
    const errorMessage = (skillsError as any)?.message || (categoriesError as any)?.message || "Unknown error";
    const isAuthError = errorMessage.includes('401') || errorMessage.includes('Authentication');
    
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-lg mb-2">
            {isAuthError ? "Authentication Required" : "Error Loading Skills"}
          </div>
          <div className="text-gray-400 text-sm mb-4">
            {isAuthError 
              ? "Your session has expired. Please refresh the page to log in again."
              : errorMessage
            }
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isAuthError ? "Refresh Page" : "Retry"}
            </Button>
            {!isAuthError && (
              <Button 
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"] });
                  queryClient.invalidateQueries({ queryKey: ["/api/admin/skill-categories"] });
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear Cache
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Skills Management</h2>
          <p className="text-gray-400">Manage your technical skills and proficiency levels</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {activeSkills} Active
            </Badge>
            <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
              {inactiveSkills} Inactive
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              {totalSkills} Total
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
              {categories.length} Categories
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => organizeSkillsMutation.mutate()}
            disabled={organizeSkillsMutation.isPending}
            className="bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30"
          >
            {organizeSkillsMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
                Organizing...
              </>
            ) : (
              <>
                <Code className="h-4 w-4 mr-2" />
                Organize & Set Inactive
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
                className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSkill ? "Edit Skill" : "Add New Skill"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Skill Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Python, React, AWS"
                      className="bg-gray-800 border-gray-700"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {categories.map((category: SkillCategory) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proficiency">Proficiency Level ({formData.proficiency}%)</Label>
                    <Input
                      id="proficiency"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.proficiency}
                      onChange={(e) => setFormData({ ...formData, proficiency: Number(e.target.value) })}
                      className="bg-gray-800 border-gray-700"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Beginner</span>
                      <span>Intermediate</span>
                      <span>Advanced</span>
                      <span>Expert</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g., 2+ years, 6 months"
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your experience with this skill..."
                    className="bg-gray-800 border-gray-700"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="isActive">Status</Label>
                    <Select
                      value={formData.isActive.toString()}
                      onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="true">✅ Active</SelectItem>
                        <SelectItem value="false">❌ Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {editingSkill ? "Update" : "Create"} Skill
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Skills by Category */}
      {sortedCategoryEntries.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Code className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Skills Found</h3>
            <p className="text-gray-500 text-center mb-4">
              Start building your skills portfolio by adding your first skill.
            </p>
            <Button
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sortedCategoryEntries.map(([categoryName, categoryData]) => {
            const categorySkills = (categoryData as any).skills;
            const activeSkills = categorySkills.filter((skill: any) => skill.isActive).length;
            const inactiveSkills = categorySkills.length - activeSkills;
            const category = categories.find((cat: SkillCategory) => cat.name === categoryName);
            
            return (
              <Card key={categoryName} className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-400" />
                      {categoryName}
                      {categoryName === "Uncategorized" && (
                        <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">
                          Needs Organization
                        </span>
                      )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        {activeSkills} active
                      </Badge>
                      {inactiveSkills > 0 && (
                        <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                          {inactiveSkills} hidden
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {categorySkills.length} total
                      </Badge>
                    </div>
                  </CardTitle>
                  {category && (
                    <CardDescription className="text-gray-400">
                      Order: {category.displayOrder} • {categorySkills.length} skills in this category
                    </CardDescription>
                  )}
                </CardHeader>
              <CardContent>
                {categorySkills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Code className="h-12 w-12 text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No Skills in {categoryName}</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      This category is empty. Add skills or use "Organize All Skills" to categorize existing skills.
                    </p>
                    <Button
                      onClick={() => {
                        setFormData({ 
                          ...formData, 
                          categoryId: category?._id || "",
                          name: "",
                          proficiency: 70,
                          experience: "",
                          description: "",
                          isActive: false,
                          displayOrder: 1
                        });
                        setIsDialogOpen(true);
                      }}
                      className="bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill to {categoryName}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorySkills
                      .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                      .map((skill: any) => (
                      <div
                        key={skill._id}
                        className={`relative border rounded-lg p-4 space-y-3 transition-all ${
                          skill.isActive 
                            ? "bg-gray-900/50 border-gray-700" 
                            : "bg-gray-900/20 border-gray-800 opacity-60"
                        }`}
                      >
                        {!skill.isActive && (
                          <div className="absolute top-2 right-2">
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-medium ${skill.isActive ? "text-white" : "text-gray-400"}`}>
                              {skill.name}
                            </h4>
                            {skill.experience && (
                              <p className="text-sm text-gray-400">{skill.experience}</p>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleStatus(skill)}
                              disabled={toggleSkillStatusMutation.isPending}
                              className={`h-8 w-8 p-0 ${
                                skill.isActive 
                                  ? "text-green-400 hover:text-green-300 hover:bg-green-500/20"
                                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-500/20"
                              }`}
                              title={skill.isActive ? "Hide from public view" : "Show in public view"}
                            >
                              {skill.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(skill)}
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
                            <span className={`font-medium ${getProficiencyColor(skill.proficiency)}`}>
                              {skill.proficiency}% ({getProficiencyLabel(skill.proficiency)})
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                skill.proficiency >= 90
                                  ? "bg-green-500"
                                  : skill.proficiency >= 75
                                  ? "bg-blue-500"
                                  : skill.proficiency >= 60
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                              }`}
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
                )}
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}