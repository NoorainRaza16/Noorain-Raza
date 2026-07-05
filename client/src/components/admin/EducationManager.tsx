import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GraduationCap, 
  Calendar,
  MapPin,
  Award,
  FileText,
  Search,
  SortAsc,
  SortDesc,
  Eye,
  Save,
  Settings,
  Link2,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EducationItem {
  _id: string;
  degree: string;
  institution: string;
  year: string;
  result?: string;
  location?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

interface EducationFormData {
  degree: string;
  institution: string;
  year: string;
  result?: string;
  location?: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

interface EducationContentData {
  _id?: string;
  sectionTitle: string;
  sectionSubtitle: string;
  sectionDescription: string;
  bottomDescription: string;
  certificationsLinkText: string;
  certificationsLinkUrl: string;
}

const EducationManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("displayOrder");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"items" | "content">("items");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EducationFormData>({
    degree: "",
    institution: "",
    year: "",
    result: "",
    location: "",
    description: "",
    displayOrder: 0,
    isActive: true
  });

  const [contentData, setContentData] = useState<EducationContentData>({
    sectionTitle: "Education",
    sectionSubtitle: "Academic Background",
    sectionDescription: "My academic journey and qualifications that have shaped my professional development.",
    bottomDescription: "My education has provided me with a strong foundation in computer science, engineering principles, and problem-solving methodologies that I apply to my work every day.",
    certificationsLinkText: "View My Professional Certifications",
    certificationsLinkUrl: "#certifications"
  });

  // Fetch education data
  const { data: educationData = [], isLoading } = useQuery({
    queryKey: ["/api/admin/education"],
    select: (response: any) => Array.isArray(response?.data) ? response.data : [],
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Fetch education content
  const { data: sectionContent, isLoading: isContentLoading } = useQuery({
    queryKey: ["/api/admin/education-content"],
    select: (response: any) => response?.data,
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: EducationFormData) => {
      return await apiRequest({
        method: "POST",
        url: "/api/admin/education",
        data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/education"] });
      toast({
        title: "Success",
        description: "Education item created successfully",
      });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create education item",
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EducationFormData> }) => {
      return await apiRequest({
        method: "PUT",
        url: `/api/admin/education/${id}`,
        data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/education"] });
      toast({
        title: "Success",
        description: "Education item updated successfully",
      });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update education item",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest({
        method: "DELETE",
        url: `/api/admin/education/${id}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/education"] });
      toast({
        title: "Success",
        description: "Education item deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete education item",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      degree: "",
      institution: "",
      year: "",
      result: "",
      location: "",
      description: "",
      displayOrder: 0,
      isActive: true
    });
    setEditingItem(null);
  };

  const handleEdit = (item: EducationItem) => {
    setEditingItem(item);
    setFormData({
      degree: item.degree,
      institution: item.institution,
      year: item.year,
      result: item.result || "",
      location: item.location || "",
      description: item.description || "",
      displayOrder: item.displayOrder,
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.degree || !formData.institution || !formData.year) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this education item?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter and sort data
  const filteredAndSortedData = (educationData as EducationItem[])
    .filter((item: EducationItem) => {
      const matchesSearch = 
        item.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    })
    .sort((a: EducationItem, b: EducationItem) => {
      let aValue: string | number = "";
      let bValue: string | number = "";
      
      if (sortField === "displayOrder") {
        aValue = a.displayOrder;
        bValue = b.displayOrder;
      } else {
        aValue = (a[sortField as keyof EducationItem] as string) || "";
        bValue = (b[sortField as keyof EducationItem] as string) || "";
      }
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Education Management</h1>
            <p className="text-muted-foreground">Manage educational background and qualifications</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {isPreviewMode ? "Edit Mode" : "Preview"}
          </Button>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-1" />
                Add Education
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Education Item" : "Add New Education Item"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="degree">Degree *</Label>
                    <Input
                      id="degree"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="e.g., B.Tech in Computer Science"
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution *</Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="e.g., Asansol Engineering College"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year/Duration *</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g., August 2021 - June 2025"
                    />
                  </div>
                  <div>
                    <Label htmlFor="result">Result/Grade</Label>
                    <Input
                      id="result"
                      value={formData.result}
                      onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                      placeholder="e.g., CGPA: 7.58/10"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Asansol"
                    />
                  </div>
                  <div>
                    <Label htmlFor="displayOrder">Display Order</Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details about the education..."
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Show on Website</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle to show or hide this education item on the website
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {editingItem ? "Update" : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search education items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("year")}
              className="flex items-center space-x-1"
            >
              <Calendar className="h-4 w-4" />
              <span>Year</span>
              {sortField === "year" && (
                sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("institution")}
              className="flex items-center space-x-1"
            >
              <span>Institution</span>
              {sortField === "institution" && (
                sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Education Items */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredAndSortedData.map((item: EducationItem, index: number) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary">
                            {item.degree}
                          </h3>
                          
                          <div className="space-y-2 mt-2">
                            <div className="flex items-center text-muted-foreground">
                              <Award className="h-4 w-4 mr-2" />
                              <span>{item.institution}</span>
                            </div>
                            
                            <div className="flex items-center text-muted-foreground">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{item.year}</span>
                            </div>
                            
                            {item.location && (
                              <div className="flex items-center text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{item.location}</span>
                              </div>
                            )}
                            
                            {item.result && (
                              <div className="flex items-center text-muted-foreground">
                                <Award className="h-4 w-4 mr-2" />
                                <span>{item.result}</span>
                              </div>
                            )}
                          </div>
                          
                          {item.description && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-start">
                                <FileText className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!isPreviewMode && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          Order: {item.displayOrder}
                        </Badge>
                        <Badge 
                          variant={item.isActive ? "default" : "destructive"} 
                          className="text-xs"
                        >
                          {item.isActive ? "Visible" : "Hidden"}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAndSortedData.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No education items found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first education item"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Education Item
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EducationManager;