import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  children: React.ReactNode;
  maxWidth?: string;
}

export function FormModal({
  title,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  children,
  maxWidth = "max-w-2xl",
}: FormModalProps) {
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={`bg-gray-900 border-gray-700 text-white p-0 ${maxWidth}`}>
        <DialogHeader className="bg-gray-800 p-4 rounded-t-lg border-b border-gray-700">
          <DialogTitle className="text-lg font-bold text-white">{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4 mb-6 max-h-[70vh] overflow-y-auto pr-2">
            {children}
          </div>
          
          <DialogFooter className="border-t border-gray-700 pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
      </DialogContent>
    </Dialog>
  );
}