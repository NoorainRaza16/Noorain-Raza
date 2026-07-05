import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ContactContentForm } from "./ContactContentForm";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  ArrowUp, 
  ArrowDown,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

interface ContactContent {
  _id: string;
  sectionType: "header" | "contact-info" | "form-labels";
  title: string;
  subtitle?: string;
  description?: string;
  email?: string;
  phone?: string;
  location?: string;
  formLabels?: {
    formTitle?: string;
    nameLabel?: string;
    emailLabel?: string;
    subjectLabel?: string;
    messageLabel?: string;
    buttonText?: string;
    successMessage?: string;
    errorMessage?: string;
    namePlaceholder?: string;
    emailPlaceholder?: string;
    subjectPlaceholder?: string;
    messagePlaceholder?: string;
  };
  socialLinks?: Array<{
    name: string;
    url: string;
    platform: string;
  }>;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface ContactContentManagerProps {
  contents: ContactContent[];
  onRefresh: () => void;
  onEdit: (item: ContactContent) => void;
  onDelete: (item: ContactContent) => void;
}

export function ContactContentManager({ 
  contents, 
  onRefresh, 
  onEdit, 
  onDelete 
}: ContactContentManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ContactContent | null>(null);
  const [selectedContent, setSelectedContent] = useState<ContactContent | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest({
        method: "POST",
        url: "/api/admin/contact-content",
        data,
      });
    },
    onSuccess: () => {
      setIsFormOpen(false);
      setCurrentItem(null);
      onRefresh();
      toast({ title: "Success", description: "Contact content created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contact content",
        variant: "destructive"
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest({
        method: "PUT",
        url: `/api/admin/contact-content/${id}`,
        data,
      });
    },
    onSuccess: () => {
      setIsFormOpen(false);
      setCurrentItem(null);
      onRefresh();
      toast({ title: "Success", description: "Contact content updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact content",
        variant: "destructive"
      });
    },
  });

  // Initialize contact content mutation
  const initializeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        method: "POST",
        url: "/api/admin/migrate-contact-content",
        data: {},
      });
    },
    onSuccess: () => {
      setIsInitializing(false);
      onRefresh();
      toast({ title: "Success", description: "Contact content initialized successfully" });
    },
    onError: (error: any) => {
      setIsInitializing(false);
      toast({
        title: "Error",
        description: error.message || "Failed to initialize contact content",
        variant: "destructive"
      });
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async (content: ContactContent) => {
      return apiRequest({
        method: "PUT",
        url: `/api/admin/contact-content/${content._id}`,
        data: { isActive: !content.isActive },
      });
    },
    onSuccess: () => {
      onRefresh();
      toast({ title: "Success", description: "Content status updated" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update content status",
        variant: "destructive"
      });
    },
  });

  const handleAdd = () => {
    setCurrentItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: ContactContent) => {
    setCurrentItem(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (currentItem) {
      await updateMutation.mutateAsync({ id: currentItem._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleView = (content: ContactContent) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const handleToggleActive = (content: ContactContent) => {
    toggleActiveMutation.mutate(content);
  };

  const getSectionTypeIcon = (type: string) => {
    switch (type) {
      case "header": return "📋";
      case "contact-info": return "📞";
      case "form-labels": return "📝";
      default: return "📄";
    }
  };

  const getSectionTypeName = (type: string) => {
    switch (type) {
      case "header": return "Section Header";
      case "contact-info": return "Contact Information";
      case "form-labels": return "Form Labels";
      default: return type;
    }
  };

  const renderContactInfo = (content: ContactContent) => {
    if (content.sectionType !== "contact-info") return null;

    return (
      <div className="space-y-3 text-sm">
        {/* Contact Details */}
        <div className="space-y-2">
          {content.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span>{content.email}</span>
            </div>
          )}
          {content.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              <span>{content.phone}</span>
            </div>
          )}
          {content.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              <span>{content.location}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {content.socialLinks && content.socialLinks.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-300 border-t border-gray-700 pt-2">
              Connect With Me ({content.socialLinks.length} links)
            </div>
            <div className="flex flex-wrap gap-1">
              {content.socialLinks.slice(0, 3).map((link, index) => (
                <div
                  key={index}
                  className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded text-xs flex items-center gap-1"
                >
                  <span>{link.platform || link.name}</span>
                </div>
              ))}
              {content.socialLinks.length > 3 && (
                <div className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded text-xs">
                  +{content.socialLinks.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormLabels = (content: ContactContent) => {
    if (content.sectionType !== "form-labels" || !content.formLabels) return null;

    return (
      <div className="space-y-1 text-sm">
        {content.formLabels.formTitle && (
          <div><strong>Form Title:</strong> {content.formLabels.formTitle}</div>
        )}
        {content.formLabels.buttonText && (
          <div><strong>Button:</strong> {content.formLabels.buttonText}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Content Management</h2>
          <p className="text-gray-400">
            Manage all contact section content including headers, contact information, and form labels
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Content
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contents.map((content) => (
          <div key={content._id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSectionTypeIcon(content.sectionType)}</span>
                  <div>
                    <h3 className="text-base font-semibold text-white">{content.title}</h3>
                    <p className="text-xs text-gray-400">
                      {getSectionTypeName(content.sectionType)}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  content.isActive 
                    ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                    : "bg-gray-600/20 text-gray-400 border border-gray-600/30"
                }`}>
                  {content.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {content.subtitle && (
                <p className="text-sm text-gray-300">
                  <strong>Subtitle:</strong> {content.subtitle}
                </p>
              )}

              {content.description && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {content.description}
                </p>
              )}

              {renderContactInfo(content)}
              {renderFormLabels(content)}

              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                <span className="text-xs text-gray-500">
                  Order: {content.displayOrder}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleView(content)}
                    className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleEdit(content)}
                    className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(content)}
                    className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors"
                  >
                    {content.isActive ? (
                      <ToggleRight className="h-3 w-3 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => onDelete(content)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contents.length === 0 && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl">📞</div>
            <h3 className="text-lg font-semibold text-white">No Contact Content Found</h3>
            <p className="text-gray-400">
              Initialize the contact content structure or create content manually
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setIsInitializing(true);
                  initializeMutation.mutate();
                }}
                disabled={isInitializing || initializeMutation.isPending}
                className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInitializing || initializeMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Initialize Contact Content
                  </>
                )}
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Manually
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentItem ? "Edit Contact Content" : "Add Contact Content"}
            </DialogTitle>
          </DialogHeader>
          <ContactContentForm
            initialData={currentItem}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">
                {selectedContent ? getSectionTypeIcon(selectedContent.sectionType) : ""}
              </span>
              {selectedContent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Type:</strong> {getSectionTypeName(selectedContent.sectionType)}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <Badge variant={selectedContent.isActive ? "default" : "secondary"}>
                    {selectedContent.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <strong>Display Order:</strong> {selectedContent.displayOrder}
                </div>
                <div>
                  <strong>Last Updated:</strong>{" "}
                  {new Date(selectedContent.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {selectedContent.subtitle && (
                <div>
                  <strong>Subtitle:</strong> {selectedContent.subtitle}
                </div>
              )}

              {selectedContent.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedContent.description}
                  </p>
                </div>
              )}

              {/* Contact Information Details */}
              {selectedContent.sectionType === "contact-info" && (
                <div className="space-y-4">
                  {/* Basic Contact Info */}
                  {(selectedContent.email || selectedContent.phone || selectedContent.location) && (
                    <div>
                      <strong className="text-sm">Contact Information:</strong>
                      <div className="mt-2 space-y-2">
                        {selectedContent.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span>{selectedContent.email}</span>
                          </div>
                        )}
                        {selectedContent.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-green-500" />
                            <span>{selectedContent.phone}</span>
                          </div>
                        )}
                        {selectedContent.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span>{selectedContent.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Social Links Details */}
                  {selectedContent.socialLinks && selectedContent.socialLinks.length > 0 && (
                    <div>
                      <strong className="text-sm">Social Links (Connect With Me):</strong>
                      <div className="mt-2 space-y-2">
                        {selectedContent.socialLinks.map((link, index) => (
                          <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{link.platform || link.name}</div>
                                <div className="text-xs text-gray-500">{link.name}</div>
                              </div>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-xs flex items-center gap-1"
                              >
                                <span>Visit</span>
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                            <div className="mt-2 text-xs text-gray-600 break-all">{link.url}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedContent.formLabels && selectedContent.sectionType === "form-labels" && (
                <div>
                  <strong>Form Configuration:</strong>
                  <div className="mt-2 space-y-2 text-sm">
                    {Object.entries(selectedContent.formLabels).map(([key, value]) => 
                      value ? (
                        <div key={key} className="grid grid-cols-3 gap-2">
                          <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                          <span className="col-span-2">{value}</span>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}