import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Award, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";

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

export default function CertificationsContentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: content, isLoading } = useQuery({
    queryKey: ['/api/admin/certifications-content'],
    select: (data: any) => data?.data as CertificationsContent | null
  });

  const form = useForm<CertificationsContentFormData>({
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

  // Set form values when content is loaded
  useEffect(() => {
    if (content) {
      form.reset({
        badgeText: content.badgeText,
        title: content.title,
        description: content.description,
        bottomText: content.bottomText,
        linkedInText: content.linkedInText,
        linkedInUrl: content.linkedInUrl,
        isActive: content.isActive,
      });
    }
  }, [content, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: CertificationsContentFormData) => {
      const response = await fetch(
        content?._id 
          ? `/api/admin/certifications-content/${content._id}`
          : '/api/admin/certifications-content',
        {
          method: content?._id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/certifications-content'] });
      queryClient.invalidateQueries({ queryKey: ['/api/certifications-content'] });
      toast({
        title: "Success",
        description: "Certifications content updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update certifications content",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CertificationsContentFormData) => {
    updateMutation.mutate(data);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (content) {
      form.reset({
        badgeText: content.badgeText,
        title: content.title,
        description: content.description,
        bottomText: content.bottomText,
        linkedInText: content.linkedInText,
        linkedInUrl: content.linkedInUrl,
        isActive: content.isActive,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading certifications content...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Certifications Content</h2>
          <p className="text-muted-foreground">
            Manage the header text, descriptions, and links for the certifications section
          </p>
        </div>
        <div className="flex items-center gap-2">
          {content?.isActive !== undefined && (
            <div className="flex items-center gap-2">
              {content.isActive ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm text-muted-foreground">
                {content.isActive ? "Visible" : "Hidden"}
              </span>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <div>
                <CardTitle>Section Content</CardTitle>
                <CardDescription>
                  Edit the text content displayed in the certifications section
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline">
                Edit Content
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditing && content ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Badge Text</Label>
                <p className="mt-1">{content.badgeText}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Section Title</Label>
                <p className="mt-1 text-lg font-semibold">{content.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{content.description}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Bottom Text</Label>
                <p className="mt-1 text-gray-600 dark:text-gray-300">{content.bottomText}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">LinkedIn Link</Label>
                <p className="mt-1">
                  <a 
                    href={content.linkedInUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {content.linkedInText}
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="badgeText">Badge Text</Label>
                <Input
                  id="badgeText"
                  placeholder="My Achievements"
                  {...form.register("badgeText")}
                />
                {form.formState.errors.badgeText && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.badgeText.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Section Title</Label>
                <Input
                  id="title"
                  placeholder="Certifications & Awards"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Professional certifications and notable achievements..."
                  rows={3}
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bottomText">Bottom Text</Label>
                <Textarea
                  id="bottomText"
                  placeholder="Continuously improving my skills..."
                  rows={2}
                  {...form.register("bottomText")}
                />
                {form.formState.errors.bottomText && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.bottomText.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="linkedInText">LinkedIn Link Text</Label>
                <Input
                  id="linkedInText"
                  placeholder="View all certifications on LinkedIn"
                  {...form.register("linkedInText")}
                />
                {form.formState.errors.linkedInText && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.linkedInText.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                <Input
                  id="linkedInUrl"
                  placeholder="https://www.linkedin.com/in/your-profile"
                  {...form.register("linkedInUrl")}
                />
                {form.formState.errors.linkedInUrl && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.linkedInUrl.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
                <Label htmlFor="isActive">Section Visible</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}