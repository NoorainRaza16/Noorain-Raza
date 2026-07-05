import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  MessageSquare,
  Eye,
  EyeOff,
  Reply,
  Archive,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Building,
  Phone,
  Tag,
  Calendar,
  Globe,
} from "lucide-react";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  readAt?: string;
  repliedAt?: string;
  adminNotes?: string;
  tags: string[];
  phoneNumber?: string;
  company?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageManagerProps {
  messages: Message[];
  onRefresh: () => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'unread':
      return <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">🔵 Unread</Badge>;
    case 'read':
      return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">👁️ Read</Badge>;
    case 'replied':
      return <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">✅ Replied</Badge>;
    case 'archived':
      return <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/50">📁 Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'low':
      return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">🟢 Low</Badge>;
    case 'medium':
      return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">🟡 Medium</Badge>;
    case 'high':
      return <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50">🟠 High</Badge>;
    case 'urgent':
      return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">🔴 Urgent</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export function MessageManager({ messages, onRefresh, onEdit, onDelete }: MessageManagerProps) {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Quick action mutations
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest({
        method: "PATCH",
        url: `/api/admin/contact/${id}/mark-read`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact"] });
      toast({ title: "Success", description: "Message marked as read" });
      onRefresh();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark message as read",
        variant: "destructive"
      });
    },
  });

  const markAsRepliedMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest({
        method: "PATCH",
        url: `/api/admin/contact/${id}/mark-replied`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact"] });
      toast({ title: "Success", description: "Message marked as replied" });
      onRefresh();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark message as replied",
        variant: "destructive"
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest({
        method: "PATCH",
        url: `/api/admin/contact/${id}/archive`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact"] });
      toast({ title: "Success", description: "Message archived" });
      onRefresh();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to archive message",
        variant: "destructive"
      });
    },
  });

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    
    // Auto-mark as read if unread
    if (!message.isRead) {
      markAsReadMutation.mutate(message._id);
    }
  };

  const handleQuickAction = (action: string, message: Message) => {
    switch (action) {
      case 'markRead':
        markAsReadMutation.mutate(message._id);
        break;
      case 'markReplied':
        markAsRepliedMutation.mutate(message._id);
        break;
      case 'archive':
        archiveMutation.mutate(message._id);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Message Cards */}
      <div className="grid gap-4">
        {messages.map((message) => (
          <Card 
            key={message._id} 
            className={`bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200 ${
              !message.isRead ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg text-white">{message.subject}</CardTitle>
                    {!message.isRead && (
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                        NEW
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {message.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {message.email}
                    </div>
                    {message.company && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {message.company}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(message.status)}
                  {getPriorityBadge(message.priority)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <p className="text-gray-300 text-sm line-clamp-2">
                  {message.message}
                </p>
                
                {message.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {message.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-gray-700/50 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-700" />
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewMessage(message)}
                    className="bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {!message.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('markRead', message)}
                        disabled={markAsReadMutation.isPending}
                        className="bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    
                    {message.status !== 'replied' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('markReplied', message)}
                        disabled={markAsRepliedMutation.isPending}
                        className="bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Mark Replied
                      </Button>
                    )}
                    
                    {message.status !== 'archived' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction('archive', message)}
                        disabled={archiveMutation.isPending}
                        className="bg-gray-500/20 border-gray-500/50 text-gray-400 hover:bg-gray-500/30"
                      >
                        <Archive className="h-3 w-3 mr-1" />
                        Archive
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(message)}
                      className="bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30"
                    >
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(message)}
                      className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-400">From</Label>
                      <p className="text-white font-medium">{selectedMessage.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-400">Email</Label>
                      <p className="text-white">{selectedMessage.email}</p>
                    </div>
                    {selectedMessage.phoneNumber && (
                      <div>
                        <Label className="text-gray-400">Phone</Label>
                        <p className="text-white">{selectedMessage.phoneNumber}</p>
                      </div>
                    )}
                    {selectedMessage.company && (
                      <div>
                        <Label className="text-gray-400">Company</Label>
                        <p className="text-white">{selectedMessage.company}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-gray-400">Subject</Label>
                      <p className="text-white font-medium">{selectedMessage.subject}</p>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(selectedMessage.status)}
                      {getPriorityBadge(selectedMessage.priority)}
                    </div>
                    <div>
                      <Label className="text-gray-400">Received</Label>
                      <p className="text-white">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedMessage.readAt && (
                      <div>
                        <Label className="text-gray-400">Read At</Label>
                        <p className="text-white">{new Date(selectedMessage.readAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Message Content */}
                <div>
                  <Label className="text-gray-400">Message</Label>
                  <div className="mt-2 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                {selectedMessage.adminNotes && (
                  <div>
                    <Label className="text-gray-400">Admin Notes</Label>
                    <div className="mt-2 p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
                      <p className="text-blue-200 whitespace-pre-wrap">{selectedMessage.adminNotes}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedMessage.tags.length > 0 && (
                  <div>
                    <Label className="text-gray-400">Tags</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedMessage.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-700/50 text-gray-300">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  {selectedMessage.ipAddress && (
                    <div>
                      <Label className="text-gray-400">IP Address</Label>
                      <p className="text-gray-300 text-sm font-mono">{selectedMessage.ipAddress}</p>
                    </div>
                  )}
                  {selectedMessage.userAgent && (
                    <div>
                      <Label className="text-gray-400">User Agent</Label>
                      <p className="text-gray-300 text-sm font-mono truncate">{selectedMessage.userAgent}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}