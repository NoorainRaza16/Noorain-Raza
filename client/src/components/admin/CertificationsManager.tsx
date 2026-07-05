import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Award,
  BadgeCheck,
  Globe,
  Calendar,
  Building,
  Eye,
  EyeOff,
  ArrowUpDown,
  Save,
  X,
  Loader2,
  Settings,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Schema for certifications content
const certificationsContentSchema = z.object({
  badgeText: z.string().min(1, "Badge text is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  bottomText: z.string().min(1, "Bottom text is required"),
  linkedInText: z.string().min(1, "LinkedIn text is required"),
  linkedInUrl: z.string().url("Please enter a valid LinkedIn URL"),
  isActive: z.boolean().default(true),
});

type CertificationsContentFormData = z.infer<typeof certificationsContentSchema>;

interface CertificationsContent {
  _id: string;
  badgeText: string;
  title: string;
  description: string;
  bottomText: string;
  linkedInText: string;
  linkedInUrl: string;
  isActive: boolean;
  updatedAt: string;
}

// Types matching your MongoDB schema
interface Certification {
  _id: string;
  title: string;
  description: string;
  type: 'certificate' | 'award' | 'course' | 'other';
  date: string;
  issuer: string;
  url?: string;
  credentialId?: string;
  expiryDate?: string;
  isActive: boolean;
  displayOrder: number;
}

interface CertificationFormData {
  title: string;
  description: string;
  type: 'certificate' | 'award' | 'course' | 'other';
  date: string;
  issuer: string;
  url?: string;
  credentialId?: string;
  expiryDate?: string;
  isActive: boolean;
  displayOrder: number;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'award':
      return <Award className="w-4 h-4" />;
    case 'certificate':
      return <BadgeCheck className="w-4 h-4" />;
    case 'course':
      return <Globe className="w-4 h-4" />;
    default:
      return <BadgeCheck className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'award':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'certificate':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'course':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

export default function CertificationsManager() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isContentEditing, setIsContentEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch certifications
  const { data: certificationsData, isLoading } = useQuery({
    queryKey: ['/api/admin/certifications'],
    select: (data: any) => data?.data || [],
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const certifications = certificationsData || [];

  // Fetch certifications content
  const { data: content, isLoading: contentLoading } = useQuery({
    queryKey: ['/api/admin/certifications-content'],
    select: (data: any) => data?.data as CertificationsContent | null,
    staleTime: 0,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Content form
  const contentForm = useForm<CertificationsContentFormData>({
    resolver: zodResolver(certificationsContentSchema),
    defaultValues: {
      badgeText: "",
      title: "",
      description: "",
      bottomText: "",
      linkedInText: "",
      linkedInUrl: "",
      isActive: true,
    },
  });

  // Update content form when data loads
  useEffect(() => {
    if (content) {
      contentForm.reset({
        badgeText: content.badgeText || "",
        title: content.title || "",
        description: content.description || "",
        bottomText: content.bottomText || "",
        linkedInText: content.linkedInText || "",
        linkedInUrl: content.linkedInUrl || "",
        isActive: content.isActive ?? true,
      });
    }
  }, [content, contentForm]);

  // Content mutations
  const contentUpdateMutation = useMutation({
    mutationFn: async (data: CertificationsContentFormData) => {
      const method = content?._id ? "PUT" : "POST";
      const endpoint = content?._id 
        ? `/api/admin/certifications-content/${content._id}` 
        : "/api/admin/certifications-content";
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update content");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/certifications-content"] });
      toast({
        title: "Success",
        description: "Certifications content updated successfully!",
      });
      setIsContentEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      });
    },
  });

  // Form state
  const [formData, setFormData] = useState<CertificationFormData>({
    title: '',
    description: '',
    type: 'certificate',
    date: '',
    issuer: '',
    url: '',
    credentialId: '',
    expiryDate: '',
    isActive: true,
    displayOrder: certifications.length + 1
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'certificate',
      date: '',
      issuer: '',
      url: '',
      credentialId: '',
      expiryDate: '',
      isActive: true,
      displayOrder: certifications.length + 1
    });
    setEditingCertification(null);
  };

  // Mutations for certifications
  const createMutation = useMutation({
    mutationFn: async (data: CertificationFormData) => {
      const response = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create certification');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications'] });
      setIsFormOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Certification created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create certification",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CertificationFormData> }) => 
      fetch(`/api/admin/certifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications'] });
      setIsFormOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Certification updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update certification",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Frontend: Starting deletion for ID:', id);
      console.log('Frontend: Making DELETE request to:', `/api/admin/certifications/${id}`);
      
      const response = await fetch(`/api/admin/certifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('Frontend: Response status:', response.status);
      console.log('Frontend: Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('Frontend: Response body:', result);
      
      if (!response.ok) {
        console.error('Frontend: Delete request failed:', result);
        throw new Error(result.message || 'Failed to delete certification');
      }
      
      console.log('Frontend: Delete request successful');
      return result;
    },
    onSuccess: () => {
      console.log('Frontend: Delete mutation success callback triggered');
      // Clear all related caches and force refresh
      queryClient.removeQueries({ queryKey: ['/api/admin/certifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/certifications'] });
      toast({
        title: "Success",
        description: "Certification deleted successfully"
      });
    },
    onError: (error: any) => {
      console.error('Frontend: Delete mutation error callback triggered:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete certification",
        variant: "destructive"
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.description.length < 10) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 10 characters",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.issuer.trim()) {
      toast({
        title: "Validation Error",
        description: "Issuer is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.date) {
      toast({
        title: "Validation Error",
        description: "Date is required",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.url && formData.url.trim() && !isValidUrl(formData.url)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    if (editingCertification) {
      updateMutation.mutate({ id: editingCertification._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // URL validation helper
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle edit
  const handleEdit = (certification: Certification) => {
    setEditingCertification(certification);
    setFormData({
      title: certification.title,
      description: certification.description,
      type: certification.type,
      date: certification.date,
      issuer: certification.issuer,
      url: certification.url || '',
      credentialId: certification.credentialId || '',
      expiryDate: certification.expiryDate || '',
      isActive: certification.isActive,
      displayOrder: certification.displayOrder
    });
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      console.log('Deleting certification with ID:', id);
      deleteMutation.mutate(id);
    }
  };

  // Toggle active status
  const toggleActive = (certification: Certification) => {
    updateMutation.mutate({
      id: certification._id,
      data: { isActive: !certification.isActive }
    });
  };

  // Content form submit handler
  const handleContentSubmit = (data: CertificationsContentFormData) => {
    contentUpdateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Certifications Management</h2>
          <p className="text-muted-foreground">
            Manage your professional certifications, awards, and section content
          </p>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="certifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Section Content
          </TabsTrigger>
        </TabsList>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Certifications & Awards</h3>
              <p className="text-sm text-muted-foreground">
                Add and manage certifications, awards, courses, and other achievements
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {viewMode === "grid" ? "Table View" : "Grid View"}
              </Button>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification/Award
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCertification ? 'Edit Achievement' : 'Add New Achievement'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCertification 
                        ? 'Update the achievement details below'
                        : 'Add a certification, award, course, or other professional achievement'
                      }
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g., Excellence in Software Development Award"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Type *</Label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          <option value="certificate">🏆 Certificate</option>
                          <option value="award">🥇 Award</option>
                          <option value="course">📚 Course</option>
                          <option value="other">📋 Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description * (minimum 10 characters)</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Comprehensive description of the certification or award (at least 10 characters)"
                        rows={3}
                        required
                        className={formData.description.length > 0 && formData.description.length < 10 ? "border-red-500" : ""}
                      />
                      {formData.description.length > 0 && formData.description.length < 10 && (
                        <p className="text-sm text-red-500">
                          {10 - formData.description.length} more characters required
                        </p>
                      )}
                      {formData.description.length >= 10 && (
                        <p className="text-sm text-green-600">
                          ✓ Description length is valid
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="issuer">Issuer *</Label>
                        <Input
                          id="issuer"
                          value={formData.issuer}
                          onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                          placeholder="e.g., Google Cloud"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="url">Certificate URL</Label>
                        <Input
                          id="url"
                          type="url"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="credentialId">Credential ID</Label>
                        <Input
                          id="credentialId"
                          value={formData.credentialId}
                          onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                          placeholder="e.g., ABC123XYZ"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date (if applicable)</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="displayOrder">Display Order</Label>
                        <Input
                          id="displayOrder"
                          type="number"
                          min="1"
                          value={formData.displayOrder}
                          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active (visible on website)</Label>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsFormOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {(createMutation.isPending || updateMutation.isPending) && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {editingCertification ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : null}

          {/* Content */}
          {!isLoading && (
            <>
              {certifications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Award className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No certifications yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Start by adding your first certification or award
                    </p>
                    <Button onClick={() => setIsFormOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Certification
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {certifications
                    .sort((a: Certification, b: Certification) => a.displayOrder - b.displayOrder)
                    .map((certification: Certification) => (
                      <Card key={certification._id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${getTypeColor(certification.type).replace('text-', 'bg-').replace('dark:text-', 'dark:bg-').split(' ')[0]} bg-opacity-20`}>
                                {getTypeIcon(certification.type)}
                              </div>
                              <Badge variant="secondary" className={getTypeColor(certification.type)}>
                                {certification.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleActive(certification)}
                                disabled={updateMutation.isPending}
                              >
                                {certification.isActive ? (
                                  <Eye className="w-4 h-4 text-green-600" />
                                ) : (
                                  <EyeOff className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(certification)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(certification._id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          <CardTitle className="text-lg">{certification.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {certification.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building className="w-4 h-4" />
                              <span>{certification.issuer}</span>
                            </div>
                            {certification.date && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{certification.date}</span>
                              </div>
                            )}
                            {certification.credentialId && (
                              <div className="text-muted-foreground">
                                <span className="font-medium">ID:</span> {certification.credentialId}
                              </div>
                            )}
                          </div>
                        </CardContent>

                        <CardFooter className="pt-0">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Order: {certification.displayOrder}
                              </span>
                              {!certification.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Hidden
                                </Badge>
                              )}
                            </div>
                            {certification.url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a
                                  href={certification.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Section Content</h3>
              <p className="text-sm text-muted-foreground">
                Manage the certifications section header, description, and settings
              </p>
            </div>
            {!isContentEditing && (
              <Button onClick={() => setIsContentEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Content
              </Button>
            )}
          </div>

          {contentLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Certifications Section Content
                </CardTitle>
                <CardDescription>
                  Configure the header text, descriptions, and LinkedIn integration for the certifications section
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isContentEditing ? (
                  <form onSubmit={contentForm.handleSubmit(handleContentSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="badgeText">Badge Text</Label>
                        <Input
                          id="badgeText"
                          placeholder="My Achievements"
                          {...contentForm.register("badgeText")}
                        />
                        {contentForm.formState.errors.badgeText && (
                          <p className="text-sm text-red-500">
                            {contentForm.formState.errors.badgeText.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Section Title</Label>
                        <Input
                          id="title"
                          placeholder="Certifications & Awards"
                          {...contentForm.register("title")}
                        />
                        {contentForm.formState.errors.title && (
                          <p className="text-sm text-red-500">
                            {contentForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Professional certifications and notable achievements that validate my expertise and skills in technology."
                        rows={3}
                        {...contentForm.register("description")}
                      />
                      {contentForm.formState.errors.description && (
                        <p className="text-sm text-red-500">
                          {contentForm.formState.errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bottomText">Bottom Text</Label>
                      <Textarea
                        id="bottomText"
                        placeholder="Continuously improving my skills through relevant certifications and hands-on experience."
                        rows={2}
                        {...contentForm.register("bottomText")}
                      />
                      {contentForm.formState.errors.bottomText && (
                        <p className="text-sm text-red-500">
                          {contentForm.formState.errors.bottomText.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="linkedInText">LinkedIn Link Text</Label>
                        <Input
                          id="linkedInText"
                          placeholder="View LinkedIn Profile"
                          {...contentForm.register("linkedInText")}
                        />
                        {contentForm.formState.errors.linkedInText && (
                          <p className="text-sm text-red-500">
                            {contentForm.formState.errors.linkedInText.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                        <Input
                          id="linkedInUrl"
                          type="url"
                          placeholder="https://linkedin.com/in/your-profile"
                          {...contentForm.register("linkedInUrl")}
                        />
                        {contentForm.formState.errors.linkedInUrl && (
                          <p className="text-sm text-red-500">
                            {contentForm.formState.errors.linkedInUrl.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={contentForm.watch("isActive")}
                        onCheckedChange={(checked) => contentForm.setValue("isActive", checked)}
                      />
                      <Label htmlFor="isActive">Section is active (visible on website)</Label>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Button
                        type="submit"
                        disabled={contentUpdateMutation.isPending}
                      >
                        {contentUpdateMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsContentEditing(false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Badge Text</Label>
                        <p className="mt-1">{content?.badgeText || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Section Title</Label>
                        <p className="mt-1">{content?.title || "Not set"}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="mt-1">{content?.description || "Not set"}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bottom Text</Label>
                      <p className="mt-1">{content?.bottomText || "Not set"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">LinkedIn Text</Label>
                        <p className="mt-1">{content?.linkedInText || "Not set"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">LinkedIn URL</Label>
                        <p className="mt-1">
                          {content?.linkedInUrl ? (
                            <a
                              href={content.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {content.linkedInUrl}
                            </a>
                          ) : (
                            "Not set"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={content?.isActive ? "default" : "secondary"}>
                        {content?.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Section visibility status
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}