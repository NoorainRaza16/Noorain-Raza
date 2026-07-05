import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Column<T> {
  key: keyof T | "actions";
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface AdvancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  description?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  idField?: keyof T;
  itemsPerPage?: number;
  searchPlaceholder?: string;
  emptyMessage?: string;
  viewMode?: "table" | "grid";
  onViewModeChange?: (mode: "table" | "grid") => void;
  renderCard?: (item: T) => React.ReactNode;
}

export function AdvancedDataTable<T>({
  data,
  columns,
  title,
  description,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  onExport,
  isLoading = false,
  idField = "id" as keyof T,
  itemsPerPage = 10,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found",
  viewMode = "table",
  onViewModeChange,
  renderCard,
}: AdvancedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterBy, setFilterBy] = useState<keyof T | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const { toast } = useToast();

  const safeData = Array.isArray(data) ? data : [];

  const filteredAndSortedData = useMemo(() => {
    let result = [...safeData];

    // Apply search filter
    if (searchTerm) {
      result = result.filter((item) =>
        Object.keys(item as object).some((key) => {
          const value = (item as any)[key];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (typeof value === "number") {
            return value.toString().includes(searchTerm);
          }
          return false;
        })
      );
    }

    // Apply column filter
    if (filterBy && filterValue) {
      result = result.filter((item) => {
        const value = (item as any)[filterBy];
        if (typeof value === "string") {
          return value.toLowerCase().includes(filterValue.toLowerCase());
        }
        return false;
      });
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortBy];
        const bValue = (b as any)[sortBy];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortOrder === "asc" ? comparison : -comparison;
        }
        
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
    }

    return result;
  }, [safeData, searchTerm, sortBy, sortOrder, filterBy, filterValue]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: keyof T) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleDelete = (item: T) => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      onDelete?.(item);
    }
  };

  const filterableColumns = columns.filter(col => col.filterable && col.key !== "actions");

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
                <span className="truncate">{title}</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs sm:text-sm flex-shrink-0">
                  {filteredAndSortedData.length}
                </Badge>
              </CardTitle>
              {description && (
                <p className="text-gray-400 text-sm mt-1">{description}</p>
              )}
            </div>
            
            {onAdd && (
              <Button onClick={onAdd} size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {onViewModeChange && (
              <div className="flex border border-gray-600 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("table")}
                  className="rounded-none border-0 px-2 sm:px-3"
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="ml-1 hidden sm:inline text-xs">Table</span>
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className="rounded-none border-0 px-2 sm:px-3"
                >
                  <Grid3X3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="ml-1 hidden sm:inline text-xs">Grid</span>
                </Button>
              </div>
            )}
            
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="px-2 sm:px-3"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span className="ml-1 hidden sm:inline text-xs">Refresh</span>
              </Button>
            )}
            
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="px-2 sm:px-3">
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="ml-1 hidden sm:inline text-xs">Export</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-900 border-gray-600 text-white"
            />
          </div>
          
          {filterableColumns.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Select value={filterBy?.toString() || "all"} onValueChange={(value) => setFilterBy(value === "all" ? null : value as keyof T)}>
                <SelectTrigger className="w-full sm:w-40 bg-gray-900 border-gray-600">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {filterableColumns.map((col) => (
                    <SelectItem key={col.key.toString()} value={col.key.toString()}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {filterBy && (
                <Input
                  placeholder="Enter filter value..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="w-full sm:w-40 bg-gray-900 border-gray-600 text-white"
                />
              )}
            </div>
          )}
        </div>

        {/* Content based on view mode */}
        {viewMode === "grid" && renderCard ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <div key={`${(item as any)[idField]}-${index}`}>
                  {renderCard(item)}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400">{emptyMessage}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View (Hidden on Desktop) */}
            <div className="block lg:hidden space-y-3 mb-6">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <Card key={`mobile-${(item as any)[idField]}-${index}`} className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {columns.filter(col => col.key !== "actions").slice(0, 4).map((column) => {
                          const value = column.render ? column.render(item) : (item as any)[column.key];
                          return (
                            <div key={column.key.toString()} className="flex justify-between items-start">
                              <span className="text-sm font-medium text-gray-400 min-w-0 flex-1">
                                {column.label}:
                              </span>
                              <span className="text-sm text-white ml-2 text-right">
                                {value || "—"}
                              </span>
                            </div>
                          );
                        })}
                        
                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-600">
                          {onView && (
                            <Button size="sm" variant="ghost" onClick={() => onView(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(item)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">{emptyMessage}</p>
                </div>
              )}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden lg:block rounded-md border border-gray-600 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-700/50 hover:bg-gray-700/50">
                      {columns.map((column) => (
                        <TableHead
                          key={column.key.toString()}
                          className={`text-gray-300 font-semibold whitespace-nowrap ${column.width || ""} ${
                            column.sortable && column.key !== "actions" ? "cursor-pointer hover:text-white" : ""
                          }`}
                          onClick={() => column.sortable && column.key !== "actions" && handleSort(column.key as keyof T)}
                        >
                          <div className="flex items-center gap-2">
                            {column.label}
                            {column.sortable && sortBy === column.key && (
                              <span className="text-xs">
                                {sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => (
                        <TableRow
                          key={`${(item as any)[idField]}-${index}`}
                          className="border-gray-600 hover:bg-gray-700/30 transition-colors"
                        >
                          {columns.map((column) => (
                            <TableCell key={column.key.toString()} className="text-gray-300">
                              {column.key === "actions" ? (
                                <div className="flex items-center gap-2">
                                  {onView && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onView(item)}
                                      className="h-8 w-8 p-0 hover:bg-gray-600"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {onEdit && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onEdit(item)}
                                      className="h-8 w-8 p-0 hover:bg-blue-600"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {onDelete && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(item)}
                                      className="h-8 w-8 p-0 hover:bg-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ) : column.render ? (
                                column.render(item)
                              ) : (
                                String((item as any)[column.key] || "")
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="text-center py-12">
                          <p className="text-gray-400">{emptyMessage}</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left order-2 sm:order-1">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} of{" "}
              {filteredAndSortedData.length} entries
            </p>
            
            <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-gray-900 border-gray-600 h-8 w-8 p-0"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  const maxPages = 3;
                  
                  if (totalPages <= maxPages) {
                    pageNum = i + 1;
                  } else if (currentPage <= Math.ceil(maxPages / 2)) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                    pageNum = totalPages - maxPages + 1 + i;
                  } else {
                    pageNum = currentPage - Math.floor(maxPages / 2) + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 w-8 p-0 text-xs sm:text-sm ${
                        currentPage === pageNum
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-900 border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-gray-900 border-gray-600 h-8 w-8 p-0"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}