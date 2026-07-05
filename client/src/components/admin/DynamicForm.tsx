import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, X, Plus } from "lucide-react";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "number" | "boolean" | "select" | "array" | "url" | "date" | "switch";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  apiOptions?: string; // API endpoint for dynamic options
  optionValue?: string; // Field to use as option value
  optionLabel?: string; // Field to use as option label
  validation?: z.ZodSchema<any>;
  description?: string;
  defaultValue?: any;
}

interface DynamicFormProps {
  title: string;
  fields: FormFieldConfig[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  initialData?: Record<string, any>;
  maxWidth?: string;
}

export function DynamicForm({
  title,
  fields,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = {},
  maxWidth = "max-w-2xl",
}: DynamicFormProps) {
  const [arrayFields, setArrayFields] = useState<Record<string, string[]>>({});
  const [apiOptions, setApiOptions] = useState<Record<string, any[]>>({});

  // Create dynamic schema based on field configurations
  const createSchema = () => {
    const schemaObject: Record<string, z.ZodSchema<any>> = {};
    
    fields.forEach((field) => {
      if (field.validation) {
        schemaObject[field.name] = field.validation;
      } else {
        switch (field.type) {
          case "text":
          case "email":
          case "password":
          case "textarea":
          case "url":
          case "date":
            schemaObject[field.name] = field.required
              ? z.string().min(1, `${field.label} is required`)
              : z.string().optional();
            break;
          case "number":
            schemaObject[field.name] = field.required
              ? z.number({ required_error: `${field.label} is required` })
              : z.number().optional();
            break;
          case "boolean":
          case "switch":
            schemaObject[field.name] = z.boolean().optional();
            break;
          case "select":
            schemaObject[field.name] = field.required
              ? z.string().min(1, `${field.label} is required`)
              : z.string().optional();
            break;
          case "array":
            schemaObject[field.name] = z.array(z.string()).optional();
            break;
        }
      }
    });
    
    return z.object(schemaObject);
  };

  // Create default values with field defaults
  const getDefaultValues = () => {
    const defaults: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      } else if (field.type === "boolean" || field.type === "switch") {
        defaults[field.name] = true; // Default to true for visibility
      } else if (field.type === "array") {
        defaults[field.name] = [];
      } else if (field.type === "number") {
        defaults[field.name] = 0;
      } else {
        defaults[field.name] = "";
      }
    });
    
    const values = { ...defaults, ...initialData };
    
    // Special handling for responsibilities field in experience forms
    if (initialData && initialData.responsibilities && Array.isArray(initialData.responsibilities)) {
      values.responsibilities = initialData.responsibilities.join('\n');
    }
    
    return values;
  };

  const form = useForm({
    resolver: zodResolver(createSchema()),
    defaultValues: getDefaultValues(),
  });

  // Initialize array fields from initial data
  useEffect(() => {
    const newArrayFields: Record<string, string[]> = {};
    fields.forEach((field) => {
      if (field.type === "array") {
        newArrayFields[field.name] = initialData[field.name] || [];
      }
    });
    setArrayFields(newArrayFields);
  }, [fields, initialData]);

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues());
    }
  }, [isOpen, initialData, form]);

  const handleSubmit = async (data: any) => {
    // Process array fields
    const processedData = { ...data };
    fields.forEach((field) => {
      if (field.type === "array") {
        processedData[field.name] = arrayFields[field.name] || [];
      }
    });
    
    try {
      await onSubmit(processedData);
      form.reset();
      setArrayFields({});
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const addArrayItem = (fieldName: string) => {
    setArrayFields((prev) => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), ""],
    }));
  };

  const removeArrayItem = (fieldName: string, index: number) => {
    setArrayFields((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName]?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateArrayItem = (fieldName: string, index: number, value: string) => {
    setArrayFields((prev) => {
      const newArray = [...(prev[fieldName] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [fieldName]: newArray,
      };
    });
  };

  const renderField = (field: FormFieldConfig) => {
    switch (field.type) {
      case "textarea":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...formField}
                    placeholder={field.placeholder}
                    className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                    rows={4}
                  />
                </FormControl>
                {field.description && (
                  <p className="text-xs text-gray-400">{field.description}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "number":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    type="number"
                    placeholder={field.placeholder}
                    className="bg-gray-800 border-gray-600 text-white"
                    onChange={(e) => formField.onChange(Number(e.target.value))}
                  />
                </FormControl>
                {field.description && (
                  <p className="text-xs text-gray-400">{field.description}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "boolean":
      case "switch":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-white">{field.label}</FormLabel>
                  {field.description && (
                    <p className="text-xs text-gray-400">{field.description}</p>
                  )}
                </div>
                <FormControl>
                  <Switch
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        );

      case "select":
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </FormLabel>
                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <p className="text-xs text-gray-400">{field.description}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "array":
        return (
          <div key={field.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel className="text-white">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem(field.name)}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {(arrayFields[field.name] || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateArrayItem(field.name, index, e.target.value)}
                    placeholder={field.placeholder}
                    className="bg-gray-800 border-gray-600 text-white flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem(field.name, index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {(arrayFields[field.name] || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {arrayFields[field.name].map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            )}
            
            {field.description && (
              <p className="text-xs text-gray-400">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="text-white">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...formField}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </FormControl>
                {field.description && (
                  <p className="text-xs text-gray-400">{field.description}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`bg-gray-900 border-gray-700 text-white w-[95vw] max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden`} aria-describedby="form-description">
        <DialogHeader className="pb-3 sm:pb-4 border-b border-gray-700">
          <DialogTitle className="text-lg sm:text-xl font-bold text-white pr-8">{title}</DialogTitle>
          <div id="form-description" className="sr-only">
            Form for managing {title.toLowerCase()}
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            <div className="max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4">
              {fields.map(renderField)}
            </div>

            <DialogFooter className="border-t border-gray-700 pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}