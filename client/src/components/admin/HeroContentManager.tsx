import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getAutomaticPlatformIcon, detectPlatformFromUrl } from "@/lib/platformIcons";
import { Plus, X, Edit, Save, User, Image, FileText, Link, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileUpload } from "@/components/admin/FileUpload";

const heroContentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().min(1, "Title is required"),
  tagline: z.string().min(1, "Tagline is required"),
  heroImage: z.string().optional(),
  navImage: z.string().optional(),
  roles: z.array(z.string()).default([]),
  resumeUrl: z.string().optional(),
  resumeLabel: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    icon: z.string().optional(),
    isVisible: z.boolean().default(true)
  })).default([])
});

type HeroContentFormData = z.infer<typeof heroContentSchema>;

interface HeroContent extends HeroContentFormData {
  _id: string;
  updatedAt: string;
}

interface HeroContentResponse {
  data: HeroContent[];
}

export function HeroContentManager() {
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<HeroContentFormData>({
    resolver: zodResolver(heroContentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      title: "",
      tagline: "",
      heroImage: "",
      roles: [],
      resumeUrl: "",
      resumeLabel: "Download Resume",
      socialLinks: [],
    },
  });

  const { data: heroContentResponse, isLoading } = useQuery<HeroContentResponse>({
    queryKey: ["/api/admin/hero-content"],
    queryFn: async () => {
      const response = await fetch("/api/admin/hero-content", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch hero content");
      return response.json();
    },
  });

  const heroContent = heroContentResponse?.data || [];

  const updateMutation = useMutation({
    mutationFn: async (data: HeroContentFormData) => {
      if (heroContent.length > 0) {
        return apiRequest({
          method: "PUT",
          url: `/api/admin/hero-content/${heroContent[0]._id}`,
          data,
        });
      } else {
        return apiRequest({
          method: "POST",
          url: "/api/admin/hero-content",
          data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/hero-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hero"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Hero content updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update hero content",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HeroContentFormData) => {
    updateMutation.mutate(data);
  };

  const addRole = () => {
    if (newRole.trim()) {
      const currentRoles = form.getValues("roles");
      form.setValue("roles", [...currentRoles, newRole.trim()]);
      setNewRole("");
    }
  };

  const removeRole = (index: number) => {
    const currentRoles = form.getValues("roles");
    form.setValue("roles", currentRoles.filter((_, i) => i !== index));
  };

  const startEditing = () => {
    if (heroContent.length > 0) {
      const content = heroContent[0];
      console.log("Hero content data:", content);
      console.log("Social links data:", content.socialLinks);
      
      const socialLinksData = content.socialLinks && Array.isArray(content.socialLinks) && content.socialLinks.length > 0 
        ? content.socialLinks.map(link => ({
            ...link,
            isVisible: link.isVisible !== undefined ? link.isVisible : true
          }))
        : [
            { platform: "GitHub", url: "https://github.com/NoorainRaza23", icon: "github", isVisible: true },
            { platform: "Twitter", url: "https://x.com/NoorainRaza23", icon: "twitter", isVisible: true },
            { platform: "LinkedIn", url: "https://www.linkedin.com/in/noorainraza", icon: "linkedin", isVisible: true }
          ];
      
      console.log("Using social links:", socialLinksData);
      
      form.reset({
        firstName: content.firstName || "",
        lastName: content.lastName || "",
        title: content.title || "",
        tagline: content.tagline || "",
        heroImage: content.heroImage || "",
        navImage: content.navImage || "",
        roles: content.roles || [],
        resumeUrl: content.resumeUrl || "",
        resumeLabel: content.resumeLabel || "Download Resume",
        socialLinks: socialLinksData,
      });
    }
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentContent = heroContent[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hero Section</h2>
          <p className="text-muted-foreground">Manage your personal information and hero section content</p>
        </div>
        {!isEditing && (
          <Button onClick={startEditing} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Hero Content
          </Button>
        )}
      </div>

      {/* Current Content Preview */}
      {currentContent && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Hero Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentContent.heroImage} alt={`${currentContent.firstName} ${currentContent.lastName}`} />
                <AvatarFallback className="text-lg">
                  {currentContent.firstName?.[0]}{currentContent.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <h3 className="text-2xl font-bold">
                  Hi, I'm {currentContent.firstName} {currentContent.lastName}
                </h3>
                <p className="text-lg text-primary font-semibold">{currentContent.title}</p>
                <p className="text-muted-foreground">{currentContent.tagline}</p>
                {currentContent.roles && currentContent.roles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentContent.roles.map((role, index) => (
                      <Badge key={index} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {currentContent.resumeUrl && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Resume: <a href={currentContent.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{currentContent.resumeLabel || "Download Resume"}</a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Hero Content
            </CardTitle>
            <CardDescription>
              Update your personal information and hero section details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science Engineering Student" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline/Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description about yourself..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="heroImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUpload
                            label="Hero Section Image"
                            accept="image/*"
                            icon="image"
                            placeholder="Enter image URL or upload file"
                            currentUrl={field.value || ""}
                            onUrlChange={field.onChange}
                            onFileSelect={(file) => {
                              // File will be converted to data URL in FileUpload component
                            }}
                            maxSize={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="navImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileUpload
                            label="Navigation Header Image"
                            accept="image/*"
                            icon="image"
                            placeholder="Enter image URL or upload file"
                            currentUrl={field.value || ""}
                            onUrlChange={field.onChange}
                            onFileSelect={(file) => {
                              // File will be converted to data URL in FileUpload component
                            }}
                            maxSize={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <FormLabel className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Roles/Skills
                  </FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a role or skill"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addRole();
                        }
                      }}
                    />
                    <Button type="button" onClick={addRole} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("roles").map((role: string, index: number) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Resume Settings
                  </h4>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="resumeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FileUpload
                              label="Resume File"
                              accept=".pdf,.doc,.docx"
                              icon="file"
                              placeholder="Enter resume URL or upload PDF/DOC file"
                              currentUrl={field.value || ""}
                              onUrlChange={field.onChange}
                              onFileSelect={(file) => {
                                // File will be converted to data URL in FileUpload component
                              }}
                              maxSize={10}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="resumeLabel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resume Button Label</FormLabel>
                          <FormControl>
                            <Input placeholder="Download Resume" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Social Links Management */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Social Links ({form.watch("socialLinks")?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {form.watch("socialLinks")?.map((link, index) => (
                      <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                        <div className="flex gap-2 items-center">
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.platform`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Platform</FormLabel>
                                <FormControl>
                                  <Input placeholder="GitHub, Facebook, YouTube, Instagram" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.isVisible`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 mt-6">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">Visible</FormLabel>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentLinks = form.getValues("socialLinks");
                              form.setValue("socialLinks", currentLinks.filter((_, i) => i !== index));
                            }}
                            className="mt-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`socialLinks.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="https://github.com/username" 
                                  {...field}
                                  onChange={(e) => {
                                    const url = e.target.value;
                                    field.onChange(url);
                                    
                                    // Auto-detect platform when URL is entered
                                    if (url && url.includes('://')) {
                                      const detectedPlatform = detectPlatformFromUrl(url);
                                      if (detectedPlatform && detectedPlatform !== 'unknown') {
                                        const currentLinks = form.getValues("socialLinks");
                                        currentLinks[index].platform = detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1);
                                        form.setValue("socialLinks", currentLinks);
                                      }
                                    }
                                  }}
                                />
                              </FormControl>
                              {field.value && field.value.includes('://') && (
                                <div className="mt-2 p-2 bg-muted rounded-lg">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Auto-detected:</span>
                                    {(() => {
                                      const { icon, detectedPlatform } = getAutomaticPlatformIcon(field.value, form.watch(`socialLinks.${index}.platform`));
                                      return (
                                        <div className="flex items-center gap-1">
                                          {icon}
                                          <span className="capitalize">{detectedPlatform}</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`socialLinks.${index}.icon`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Icon (optional - auto-detected from URL)</FormLabel>
                              <FormControl>
                                <Input placeholder="Custom icon override (emoji or icon name)" {...field} />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                Leave empty to use automatic platform detection from URL
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentLinks = form.getValues("socialLinks");
                        form.setValue("socialLinks", [...currentLinks, { platform: "", url: "", icon: "", isVisible: true }]);
                      }}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Social Link
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}