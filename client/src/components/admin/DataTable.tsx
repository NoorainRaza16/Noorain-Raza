import { useState } from "react";
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
import { Edit, Trash2, Search, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | "actions";
    label: string;
    render?: (item: T) => React.ReactNode;
  }[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAdd?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  idField?: keyof T;
}

export function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  onRefresh,
  isLoading = false,
  idField = "id" as keyof T,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Ensure data is always an array to prevent filteredData.map is not a function error
  const safeData = Array.isArray(data) ? data : [];
  
  // Log data structure for debugging
  console.log("DataTable received data:", data);
  
  // Simple client-side search
  const filteredData = searchTerm
    ? safeData.filter((item) =>
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
      )
    : safeData;

  // Delete confirmation handler
  const handleDelete = (item: T) => {
    if (confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      onDelete && onDelete(item);
    }
  };

  const handleEdit = (item: T) => {
    onEdit && onEdit(item);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-gray-800 border-gray-700 text-white w-full"
          />
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isLoading}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
          {onAdd && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border border-gray-700 overflow-hidden">
        <div className="max-h-[600px] overflow-auto">
          <Table>
            <TableHeader className="bg-gray-800">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key.toString()} className="text-gray-300">
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-gray-400">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24 text-gray-400">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow key={item[idField]?.toString() || idx} className="border-t border-gray-700 hover:bg-gray-800/50">
                    {columns.map((column) => (
                      <TableCell key={`${item[idField]}-${column.key.toString()}`} className="text-gray-200">
                        {column.key === "actions" ? (
                          <div className="flex items-center gap-2">
                            {onEdit && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEdit(item)}
                                className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDelete(item)}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ) : column.render ? (
                          column.render(item)
                        ) : (
                          // Convert value to string safely
                          item[column.key] != null
                            ? String(item[column.key])
                            : "-"
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        Showing {filteredData.length} of {safeData.length} items
      </div>
    </div>
  );
}