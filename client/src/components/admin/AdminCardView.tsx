import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Calendar,
  MapPin,
  Link,
  Star,
  Globe,
  Github,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Archive,
} from "lucide-react";
import { format } from "date-fns";

interface AdminCardViewProps<T> {
  item: T;
  type: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
}

export function AdminCardView<T extends Record<string, any>>({
  item,
  type,
  onEdit,
  onDelete,
  onView,
}: AdminCardViewProps<T>) {
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      onDelete?.(item);
    }
  };

  const renderCardContent = () => {
    switch (type) {
      case "projects":
        return (
          <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors h-full">
            <CardHeader className="pb-3 p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg text-white mb-2 line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                    {item.featured && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      #{item.displayOrder || 0}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <p className="text-gray-300 text-sm mb-3 sm:mb-4 line-clamp-3">
                {item.description}
              </p>
              
              {item.technologies && item.technologies.length > 0 && (
                <div className="mb-3 sm:mb-4">
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.slice(0, 3).map((tech: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {item.technologies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                {item.projectUrl && (
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400" />
                  </Button>
                )}
                {item.githubUrl && (
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    <Github className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "blog":
        return (
          <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors h-full">
            <CardHeader className="pb-3 p-3 sm:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg text-white mb-2 line-clamp-2">
                    {item.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                    <Badge 
                      variant={item.status === 'published' ? "default" : "secondary"}
                      className={`text-xs ${item.status === 'published' ? "bg-green-500/20 text-green-300" : ""}`}
                    >
                      {item.status === 'published' ? (
                        <>
                          <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          Published
                        </>
                      ) : item.status === 'draft' ? (
                        <>
                          <Clock className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          Draft
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                          Archived
                        </>
                      )}
                    </Badge>
                    <Badge 
                      variant={item.isActive ? "default" : "destructive"}
                      className={`text-xs ${item.isActive ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"}`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {item.isFeatured && (
                      <Badge 
                        variant="default"
                        className="text-xs bg-purple-500/20 text-purple-300"
                      >
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {item.summary && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {item.summary}
                </p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {item.publishedAt ? format(new Date(item.publishedAt), "MMM dd, yyyy") : "No date"}
                </div>
                <span className="text-gray-500">#{item.slug}</span>
              </div>
            </CardContent>
          </Card>
        );

      case "experience":
        return (
          <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white mb-1">
                    {item.position}
                  </CardTitle>
                  <p className="text-blue-400 font-medium mb-2">{item.company}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Calendar className="h-4 w-4" />
                    {item.duration}
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {item.description && (
                <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                  {item.description}
                </p>
              )}
              
              {item.responsibilities && item.responsibilities.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400 mb-2">Key Responsibilities:</p>
                  <ul className="text-xs text-gray-300 space-y-1">
                    {item.responsibilities.slice(0, 3).map((resp: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span className="line-clamp-2">{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white mb-2">
                    {item.title || item.name || item.subject || "Untitled"}
                  </CardTitle>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {item.description || item.message || item.content || "No description"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs text-gray-400">
                {item.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.createdAt), "MMM dd, yyyy")}
                  </div>
                )}
                {item.status && (
                  <Badge variant="outline" className="text-xs">
                    {item.status}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return renderCardContent();
}