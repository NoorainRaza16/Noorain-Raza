import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { Loader2, Save, X, Plus, Trash2, ExternalLink, Instagram } from "lucide-react";

const contactContentFormSchema = z.object({
  sectionType: z.enum(["header", "contact-info", "form-labels"]),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  formLabels: z.object({
    formTitle: z.string().optional(),
    nameLabel: z.string().optional(),
    emailLabel: z.string().optional(),
    subjectLabel: z.string().optional(),
    messageLabel: z.string().optional(),
    buttonText: z.string().optional(),
    successMessage: z.string().optional(),
    errorMessage: z.string().optional(),
    namePlaceholder: z.string().optional(),
    emailPlaceholder: z.string().optional(),
    subjectPlaceholder: z.string().optional(),
    messagePlaceholder: z.string().optional(),
  }).optional(),
  socialLinks: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    platform: z.string(),
  })).optional(),
  displayOrder: z.number().min(0),
  isActive: z.boolean(),
});

type ContactContentFormData = z.infer<typeof contactContentFormSchema>;

interface ContactContentFormProps {
  initialData?: any;
  onSubmit: (data: ContactContentFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContactContentForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: ContactContentFormProps) {
  const [sectionType, setSectionType] = useState<string>(initialData?.sectionType || "header");

  const form = useForm<ContactContentFormData>({
    resolver: zodResolver(contactContentFormSchema),
    defaultValues: {
      sectionType: initialData?.sectionType || "header",
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      description: initialData?.description || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      location: initialData?.location || "",
      formLabels: {
        formTitle: initialData?.formLabels?.formTitle || "",
        nameLabel: initialData?.formLabels?.nameLabel || "",
        emailLabel: initialData?.formLabels?.emailLabel || "",
        subjectLabel: initialData?.formLabels?.subjectLabel || "",
        messageLabel: initialData?.formLabels?.messageLabel || "",
        buttonText: initialData?.formLabels?.buttonText || "",
        successMessage: initialData?.formLabels?.successMessage || "",
        errorMessage: initialData?.formLabels?.errorMessage || "",
        namePlaceholder: initialData?.formLabels?.namePlaceholder || "",
        emailPlaceholder: initialData?.formLabels?.emailPlaceholder || "",
        subjectPlaceholder: initialData?.formLabels?.subjectPlaceholder || "",
        messagePlaceholder: initialData?.formLabels?.messagePlaceholder || "",
      },
      socialLinks: initialData?.socialLinks || [],
      displayOrder: initialData?.displayOrder || 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks"
  });

  const handleSubmit = async (data: ContactContentFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const getSectionTypeIcon = (type: string) => {
    switch (type) {
      case "header": return "📋";
      case "contact-info": return "📞";
      case "form-labels": return "📝";
      default: return "📄";
    }
  };

  const getSectionTypeDescription = (type: string) => {
    switch (type) {
      case "header": return "Main section title, subtitle, and description";
      case "contact-info": return "Contact information like email, phone, and location";
      case "form-labels": return "Form field labels, placeholders, and messages";
      default: return "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800/50 border border-gray-700 rounded-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">{getSectionTypeIcon(sectionType)}</span>
          {initialData ? "Edit Contact Content" : "Add Contact Content"}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {getSectionTypeDescription(sectionType)}
        </p>
      </div>
      
      <div className="p-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Section Type */}
          <div className="space-y-2">
            <Label htmlFor="sectionType">Section Type *</Label>
            <Select 
              value={form.watch("sectionType")} 
              onValueChange={(value) => {
                setSectionType(value);
                form.setValue("sectionType", value as any);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select section type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">📋 Section Header</SelectItem>
                <SelectItem value="contact-info">📞 Contact Information</SelectItem>
                <SelectItem value="form-labels">📝 Form Labels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                {...form.register("title")}
                placeholder="e.g., Get In Touch, Contact Information"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                {...form.register("subtitle")}
                placeholder="e.g., Let's Talk"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...form.register("description")}
              placeholder="e.g., Feel free to reach out for collaborations..."
              rows={3}
            />
          </div>

          {/* Contact Information Fields */}
          {sectionType === "contact-info" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      {...form.register("email")}
                      type="email"
                      placeholder="devops.portfolio@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      {...form.register("phone")}
                      placeholder="+1 555-123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      {...form.register("location")}
                      placeholder="San Francisco, CA, USA"
                    />
                  </div>
                </div>

                {/* Social Links Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-white">Social Links (Connect With Me)</h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => append({ name: "instagram", url: "https://instagram.com/", platform: "Instagram" })}
                        className="px-2 py-1 bg-pink-500/20 border border-pink-500/50 text-pink-400 hover:bg-pink-500/30 transition-colors flex items-center gap-1 text-xs"
                      >
                        <Instagram className="h-3 w-3" />
                        Instagram
                      </Button>
                      <Button
                        type="button"
                        onClick={() => append({ name: "", url: "", platform: "" })}
                        className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Plus className="h-3 w-3" />
                        Add Social Link
                      </Button>
                    </div>
                  </div>

                  {fields.length > 0 && (
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-3 bg-gray-800/30 border border-gray-700 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Platform Name</Label>
                              <Input
                                {...form.register(`socialLinks.${index}.name`)}
                                placeholder="e.g., github, linkedin, twitter, instagram"
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Display Name</Label>
                              <Input
                                {...form.register(`socialLinks.${index}.platform`)}
                                placeholder="e.g., GitHub, LinkedIn, Instagram"
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">URL</Label>
                              <Input
                                {...form.register(`socialLinks.${index}.url`)}
                                placeholder="https://..."
                                className="text-sm"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                type="button"
                                onClick={() => remove(index)}
                                className="w-full px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1 text-sm"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </Button>
                            </div>
                          </div>
                          {form.watch(`socialLinks.${index}.url`) && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                              <ExternalLink className="h-3 w-3" />
                              <span>Preview: {form.watch(`socialLinks.${index}.url`)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {fields.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-600 rounded-lg">
                      No social links added. Click "Add Social Link" to get started.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Form Labels Fields */}
          {sectionType === "form-labels" && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Form Labels & Messages</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Form Title</Label>
                    <Input
                      {...form.register("formLabels.formTitle")}
                      placeholder="Send Me a Message"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Submit Button Text</Label>
                    <Input
                      {...form.register("formLabels.buttonText")}
                      placeholder="Send Message"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Name Label</Label>
                    <Input
                      {...form.register("formLabels.nameLabel")}
                      placeholder="Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Label</Label>
                    <Input
                      {...form.register("formLabels.emailLabel")}
                      placeholder="Email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject Label</Label>
                    <Input
                      {...form.register("formLabels.subjectLabel")}
                      placeholder="Subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message Label</Label>
                    <Input
                      {...form.register("formLabels.messageLabel")}
                      placeholder="Message"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Name Placeholder</Label>
                    <Input
                      {...form.register("formLabels.namePlaceholder")}
                      placeholder="Your Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email Placeholder</Label>
                    <Input
                      {...form.register("formLabels.emailPlaceholder")}
                      placeholder="Your Email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subject Placeholder</Label>
                    <Input
                      {...form.register("formLabels.subjectPlaceholder")}
                      placeholder="Subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message Placeholder</Label>
                    <Input
                      {...form.register("formLabels.messagePlaceholder")}
                      placeholder="Your Message"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Success Message</Label>
                    <Textarea
                      {...form.register("formLabels.successMessage")}
                      placeholder="Thank you for your message. I'll get back to you soon."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Error Message</Label>
                    <Textarea
                      {...form.register("formLabels.errorMessage")}
                      placeholder="Please try again later."
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                {...form.register("displayOrder", { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={form.watch("isActive")}
                onCheckedChange={(checked) => form.setValue("isActive", checked)}
              />
              <Label>Active</Label>
              <Badge variant={form.watch("isActive") ? "default" : "secondary"}>
                {form.watch("isActive") ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {initialData ? "Update" : "Create"} Content
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}