import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormFieldProps {
  label: string;
  name: string;
  type: "text" | "textarea" | "date" | "select" | "switch" | "number" | "email" | "url" | "password";
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  rows?: number;
  className?: string;
  error?: string;
  min?: number;
  max?: number;
}

export function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder = "",
  required = false,
  options = [],
  disabled = false,
  rows = 4,
  className = "",
  error,
  min,
  max,
}: FormFieldProps) {
  
  // Function to handle value changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (type === "number") {
      onChange(e.target.value === "" ? "" : Number(e.target.value));
    } else {
      onChange(e.target.value);
    }
  };

  // Date picker change handler
  const handleDateChange = (date: Date | undefined) => {
    onChange(date);
  };

  // Switch change handler
  const handleSwitchChange = (checked: boolean) => {
    onChange(checked);
  };

  // Select change handler
  const handleSelectChange = (value: string) => {
    onChange(value);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className="text-gray-200 font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {/* Different input types */}
      {type === "text" || type === "email" || type === "url" || type === "password" ? (
        <Input
          id={name}
          name={name}
          type={type}
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="bg-gray-800 border-gray-700 text-white"
        />
      ) : type === "number" ? (
        <Input
          id={name}
          name={name}
          type="number"
          value={value === null || value === undefined ? "" : value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className="bg-gray-800 border-gray-700 text-white"
        />
      ) : type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className="bg-gray-800 border-gray-700 text-white min-h-24"
        />
      ) : type === "select" ? (
        <Select
          value={value || ""}
          onValueChange={handleSelectChange}
          disabled={disabled}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value} className="hover:bg-gray-700">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : type === "switch" ? (
        <div className="flex items-center gap-2">
          <Switch
            id={name}
            name={name}
            checked={Boolean(value)}
            onCheckedChange={handleSwitchChange}
            disabled={disabled}
            className="data-[state=checked]:bg-blue-600"
          />
          <span className="text-sm text-gray-400">
            {value ? "Enabled" : "Disabled"}
          </span>
        </div>
      ) : type === "date" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                !value && "text-gray-500"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PPP") : placeholder || "Select date..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateChange}
              initialFocus
              className="bg-gray-800 text-white"
            />
          </PopoverContent>
        </Popover>
      ) : null}

      {/* Display error message if any */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}