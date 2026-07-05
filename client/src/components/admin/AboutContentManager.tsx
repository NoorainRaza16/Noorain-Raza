import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface AboutContent {
  _id: string;
  sectionType: 'main' | 'biography' | 'problem-solver' | 'continuous-learner' | 'devops-specialist' | 'aspirations';
  title: string;
  subtitle?: string;
  content: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface AboutContentManagerProps {
  contents: AboutContent[];
  onRefresh: () => void;
  onEdit: (content: AboutContent) => void;
  onDelete: (content: AboutContent) => void;
}

const getSectionTypeBadge = (type: string) => {
  switch (type) {
    case 'main':
      return <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">🏠 Main</Badge>;
    case 'biography':
      return <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/50">📖 Biography</Badge>;
    case 'problem-solver':
      return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">🔧 Problem Solver</Badge>;
    case 'continuous-learner':
      return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">📚 Continuous Learner</Badge>;
    case 'devops-specialist':
      return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">⚙️ DevOps Specialist</Badge>;
    case 'aspirations':
      return <Badge variant="outline" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/50">🚀 Aspirations</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export function AboutContentManager({ contents, onRefresh, onEdit, onDelete }: AboutContentManagerProps) {
  const [selectedContent, setSelectedContent] = useState<AboutContent | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("displayOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleViewContent = (content: AboutContent) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const handleToggleActive = async (content: AboutContent) => {
    setIsUpdating(content._id);
    console.log(`🔄 Toggling active status for: ${content.title}`, {
      id: content._id,
      currentStatus: content.isActive,
      newStatus: !content.isActive
    });

    try {
      const response = await fetch(`/api/admin/about/${content._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !content.isActive }),
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Toggle failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to update content status`);
      }

      const result = await response.json();
      console.log('✅ Toggle successful:', result);

      toast({
        title: "Success",
        description: `Content ${!content.isActive ? 'activated' : 'deactivated'} successfully`,
      });
      
      // Force immediate cache refresh
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/about'] });
      await queryClient.refetchQueries({ queryKey: ['/api/admin/about'] });
      
      // Also invalidate public about content
      queryClient.invalidateQueries({ queryKey: ['/api/about'] });
      queryClient.removeQueries({ queryKey: ['/api/about'] });
      
      // Trigger immediate update on main page
      window.dispatchEvent(new CustomEvent('about-content-updated'));
      localStorage.setItem('about-content-updated', Date.now().toString());
      
      // Wait a moment before refreshing to ensure backend update is complete
      setTimeout(() => {
        onRefresh();
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Toggle error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update content status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredAndSortedContents = contents
    .filter(content => {
      const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.sectionType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || content.sectionType === filterType;
      const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "active" && content.isActive) ||
                           (filterStatus === "inactive" && !content.isActive);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "sectionType":
          aValue = a.sectionType;
          bValue = b.sectionType;
          break;
        case "displayOrder":
          aValue = a.displayOrder;
          bValue = b.displayOrder;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.displayOrder;
          bValue = b.displayOrder;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">About Section Cards</h2>
          <p className="text-gray-400">Manage individual about section cards</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, content, or section type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
          />
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48 bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="main">Main</SelectItem>
            <SelectItem value="biography">Biography</SelectItem>
            <SelectItem value="problem-solver">Problem Solver</SelectItem>
            <SelectItem value="continuous-learner">Continuous Learner</SelectItem>
            <SelectItem value="devops-specialist">DevOps Specialist</SelectItem>
            <SelectItem value="aspirations">Aspirations</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="displayOrder">Display Order</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="sectionType">Section Type</SelectItem>
            <SelectItem value="createdAt">Created Date</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>

      {/* Content Cards */}
      <div className="grid gap-4">
        {filteredAndSortedContents.map((content) => (
          <Card 
            key={content._id} 
            className={`bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200 ${
              !content.isActive ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className="text-2xl">
                    {content.icon || '📄'}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg text-white">{content.title}</CardTitle>
                      {content.subtitle && (
                        <span className="text-sm text-gray-400">• {content.subtitle}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      {getSectionTypeBadge(content.sectionType)}
                      <span className="flex items-center gap-1">
                        Order: {content.displayOrder}
                      </span>
                      <span className={`flex items-center gap-1 ${content.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {content.isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {content.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {content.content}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    checked={content.isActive}
                    onCheckedChange={() => handleToggleActive(content)}
                    disabled={isUpdating === content._id}
                    className="data-[state=checked]:bg-green-600"
                  />
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewContent(content)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(content)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(content)}
                    className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredAndSortedContents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No about content found matching your criteria.</p>
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{selectedContent?.icon}</span>
              {selectedContent?.title}
              {selectedContent && getSectionTypeBadge(selectedContent.sectionType)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedContent && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {selectedContent.subtitle && (
                  <div>
                    <Label className="text-gray-400">Subtitle</Label>
                    <p className="text-white">{selectedContent.subtitle}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-gray-400">Content</Label>
                  <p className="text-white whitespace-pre-wrap">{selectedContent.content}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Display Order</Label>
                    <p className="text-white">{selectedContent.displayOrder}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Status</Label>
                    <p className={selectedContent.isActive ? 'text-green-400' : 'text-red-400'}>
                      {selectedContent.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                {selectedContent.imageUrl && (
                  <div>
                    <Label className="text-gray-400">Image URL</Label>
                    <p className="text-white break-all">{selectedContent.imageUrl}</p>
                  </div>
                )}
                
                <Separator className="bg-gray-700" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-gray-400">Created</Label>
                    <p className="text-white">{new Date(selectedContent.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Updated</Label>
                    <p className="text-white">{new Date(selectedContent.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}