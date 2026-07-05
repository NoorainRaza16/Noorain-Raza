import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Briefcase, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Calendar, 
  MapPin, 
  Building2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Power,
  PowerOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { IExperienceItem } from "@shared/schema";

const experienceSchema = z.object({
  position: z.string().min(2, "Position is required"),
  company: z.string().min(2, "Company name is required"),
  duration: z.string().min(4, "Duration is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  responsibilities: z.string().optional(),
  displayOrder: z.number().optional(),
  isActive: z.boolean().default(true),
});

type ExperienceFormData = z.infer<typeof experienceSchema>;

export default function ExperienceManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IExperienceItem | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      position: "",
      company: "",
      duration: "",
      location: "",
      description: "",
      responsibilities: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  // Fetch experience data
  const {
    data: experienceResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/admin/experience"],
    queryFn: async () => {
      const response = await fetch("/api/admin/experience", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch experience data");
      }
      
      return response.json();
    },
  });

  const experienceItems = experienceResponse?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ExperienceFormData) => {
      return apiRequest({
        method: "POST",
        url: "/api/admin/experience",
        data: {
          ...data,
          displayOrder: data.displayOrder || experienceItems.length + 1,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      toast({ title: "Success", description: "Experience item created successfully" });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create experience item",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ExperienceFormData }) => {
      return apiRequest({
        method: "PUT",
        url: `/api/admin/experience/${id}`,
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      toast({ title: "Success", description: "Experience item updated successfully" });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update experience item",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest({
        method: "DELETE",
        url: `/api/admin/experience/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      toast({ title: "Success", description: "Experience item deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete experience item",
        variant: "destructive",
      });
    },
  });

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      return apiRequest({
        method: "PUT",
        url: `/api/admin/experience/${id}`,
        data: { displayOrder: newOrder },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/experience"] });
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
    },
  });

  const resetForm = () => {
    form.reset({
      position: "",
      company: "",
      duration: "",
      location: "",
      description: "",
      responsibilities: "",
      displayOrder: 0,
      isActive: true,
    });
    setEditingItem(null);
  };

  const handleEdit = (item: IExperienceItem) => {
    setEditingItem(item);
    form.reset({
      position: item.position,
      company: item.company,
      duration: item.duration,
      location: item.location || "",
      description: item.description || "",
      responsibilities: Array.isArray(item.responsibilities) 
        ? item.responsibilities.join('\n') 
        : item.responsibilities || "",
      displayOrder: item.displayOrder,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (item: IExperienceItem) => {
    if (window.confirm("Are you sure you want to delete this experience item?")) {
      deleteMutation.mutate(item._id!.toString());
    }
  };

  const handleReorder = (item: IExperienceItem, direction: "up" | "down") => {
    const currentOrder = item.displayOrder || 0;
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    reorderMutation.mutate({ id: item._id!.toString(), newOrder });
  };

  const handleToggleActive = (item: IExperienceItem) => {
    updateMutation.mutate({
      id: item._id!.toString(),
      data: {
        position: item.position,
        company: item.company,
        duration: item.duration,
        location: item.location,
        description: item.description,
        responsibilities: Array.isArray(item.responsibilities) 
          ? item.responsibilities.join('\n') 
          : "",
        displayOrder: item.displayOrder,
        isActive: !item.isActive
      }
    });
  };

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ 
          id: editingItem._id!.toString(), 
          data 
        });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Briefcase className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Experience Management</h1>
            <p className="text-gray-400">Manage professional work experience and career history</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            <Eye className="h-4 w-4 mr-1" />
            {isPreviewMode ? "Edit Mode" : "Preview"}
          </Button>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={resetForm}
                className="bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-600">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingItem ? "Edit Experience Item" : "Add New Experience Item"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 py-4">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Position *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Software Developer, DevOps Engineer" 
                              {...field}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Company *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Company Name" 
                              {...field}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Duration *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Dec 2023 - Jan 2024" 
                                {...field}
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              How the duration appears on the timeline
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Location</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Remote, City Name" 
                                {...field}
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Job Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief overview of the role and key achievements..."
                              rows={3}
                              {...field}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Optional summary description of the role
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="responsibilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Responsibilities</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="• Key responsibility 1&#10;• Key responsibility 2&#10;• Key responsibility 3"
                              rows={4}
                              {...field}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Enter each responsibility on a new line. Bullet points will be added automatically.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="displayOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Display Order</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Lower numbers appear first in the timeline
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-gray-300">Status</FormLabel>
                            <div className="flex items-center space-x-2 mt-2">
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-500"
                              />
                              <span className={`text-sm ${field.value ? 'text-green-400' : 'text-gray-400'}`}>
                                {field.value ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <FormDescription className="text-gray-400">
                              Only active items appear on the website
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Experience Items */}
      <div className="space-y-4">
        {experienceItems.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-8">
              <Briefcase className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No Experience Items</h3>
              <p className="text-gray-500 mb-4">Start by adding your first work experience.</p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-500/20 border border-orange-500/50 text-orange-400 hover:bg-orange-500/30"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Experience
              </Button>
            </CardContent>
          </Card>
        ) : (
          experienceItems
            .sort((a: IExperienceItem, b: IExperienceItem) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((item: IExperienceItem) => (
              <Card key={item._id?.toString()} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-orange-500" />
                        {item.position}
                        <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                          {item.company}
                        </Badge>
                        <Badge 
                          variant={item.isActive ? "default" : "secondary"}
                          className={item.isActive 
                            ? "bg-green-500/20 border-green-500/50 text-green-400" 
                            : "bg-gray-500/20 border-gray-500/50 text-gray-400"
                          }
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {item.duration}
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Order: {item.displayOrder || 0}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(item, "up")}
                        disabled={reorderMutation.isPending}
                        className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(item, "down")}
                        disabled={reorderMutation.isPending}
                        className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(item)}
                        disabled={updateMutation.isPending}
                        className={item.isActive 
                          ? "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30" 
                          : "bg-gray-500/20 border-gray-500/50 text-gray-400 hover:bg-gray-500/30"
                        }
                        title={item.isActive ? "Deactivate (hide from website)" : "Activate (show on website)"}
                      >
                        {item.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item)}
                        disabled={deleteMutation.isPending}
                        className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {(item.description || item.responsibilities) && (
                  <CardContent className="pt-0">
                    {item.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                    )}
                    
                    {item.responsibilities && Array.isArray(item.responsibilities) && item.responsibilities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Key Responsibilities</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm">
                          {item.responsibilities.map((responsibility, index) => (
                            <li key={index}>{responsibility}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
        )}
      </div>
    </div>
  );
}