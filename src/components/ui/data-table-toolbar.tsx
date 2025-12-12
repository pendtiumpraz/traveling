"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  Trash2,
  Download,
  Upload,
  Search,
  X,
  FileSpreadsheet,
  Loader2,
  CheckSquare,
  Square,
  Filter,
  SortAsc,
  SortDesc,
  RotateCcw,
  Trash,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface SortOption {
  label: string;
  value: string;
}

interface DataTableToolbarProps {
  // Selection
  selectedIds: string[];
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  totalItems?: number;

  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;

  // Sorting
  sortOptions?: SortOption[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void;

  // Bulk operations
  modelName: string;
  onBulkDelete?: () => void;

  // Import
  onImportSuccess?: () => void;

  // Trash view
  showTrashButton?: boolean;
  onViewTrash?: () => void;

  // Custom actions
  customActions?: React.ReactNode;
}

export function DataTableToolbar({
  selectedIds,
  onSelectAll,
  onClearSelection,
  totalItems = 0,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filters,
  filterValues = {},
  onFilterChange,
  sortOptions,
  sortBy,
  sortOrder = "desc",
  onSortChange,
  modelName,
  onBulkDelete,
  onImportSuccess,
  showTrashButton = true,
  onViewTrash,
  customActions,
}: DataTableToolbarProps) {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = Object.values(filterValues).filter(
    (v) => v && v !== "",
  ).length;

  const clearAllFilters = () => {
    if (onFilterChange) {
      filters?.forEach((f) => onFilterChange(f.key, ""));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("No items selected", "Please select items to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} ${modelName}(s)?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          ids: selectedIds,
          action: "delete",
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted successfully", data.message);
        onBulkDelete?.();
        onClearSelection?.();
      } else {
        toast.error("Delete failed", data.error);
      }
    } catch (error) {
      toast.error("Error", "Failed to delete items");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", modelName);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          "Import completed",
          `Imported: ${data.data.importedCount}, Failed: ${data.data.failedCount}`,
        );
        if (data.data.errors?.length > 0) {
          console.log("Import errors:", data.data.errors);
        }
        onImportSuccess?.();
      } else {
        toast.error("Import failed", data.error);
      }
    } catch (error) {
      toast.error("Error", "Failed to import file");
      console.error(error);
    } finally {
      setIsImporting(false);
      // Reset input
      e.target.value = "";
    }
  };

  const downloadTemplate = () => {
    window.open(
      `/api/import/template?model=${modelName}&format=xlsx`,
      "_blank",
    );
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Top row: Search, filters and actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10 pr-10"
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Filter Toggle Button */}
          {filters && filters.length > 0 && (
            <Button
              variant={showFilters || activeFiltersCount > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-white text-blue-600 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          )}

          {/* Sort Dropdown */}
          {sortOptions && sortOptions.length > 0 && onSortChange && (
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value, sortOrder)}
                className="h-9 px-3 pr-8 rounded-md border border-gray-200 text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Sort Order Toggle */}
          {onSortChange && sortBy && (
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")
              }
              title={sortOrder === "asc" ? "Ascending" : "Descending"}
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Trash View */}
          {showTrashButton && onViewTrash && (
            <Button variant="outline" size="sm" onClick={onViewTrash}>
              <Trash className="h-4 w-4 mr-2" />
              Trash
            </Button>
          )}

          {/* Import */}
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button variant="outline" size="sm" disabled={isImporting}>
              {isImporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import
            </Button>
          </div>

          {/* Download Template */}
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Template
          </Button>

          {customActions}
        </div>
      </div>

      {/* Filter Row */}
      {showFilters && filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <label className="text-sm text-gray-600">{filter.label}:</label>
              <select
                value={filterValues[filter.key] || ""}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className="h-8 px-2 pr-7 rounded border border-gray-200 text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Selection bar - only show when items are selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-700 font-medium">
              {selectedIds.length} of {totalItems} selected
            </span>
            {onSelectAll && selectedIds.length < totalItems && (
              <button
                onClick={onSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Select all {totalItems}
              </button>
            )}
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Checkbox component for table rows
interface SelectCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}

export function SelectCheckbox({
  checked,
  onChange,
  indeterminate,
}: SelectCheckboxProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-center w-5 h-5 rounded border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
    >
      {indeterminate ? (
        <div className="w-3 h-0.5 bg-blue-600 rounded" />
      ) : checked ? (
        <CheckSquare className="h-5 w-5 text-blue-600" />
      ) : (
        <Square className="h-5 w-5 text-gray-300" />
      )}
    </button>
  );
}

// Hook for managing selection state
export function useTableSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedIds(items.map((item) => item.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      clearSelection();
    } else {
      selectAll();
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);
  const isAllSelected = items.length > 0 && selectedIds.length === items.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < items.length;

  return {
    selectedIds,
    setSelectedIds,
    toggleItem,
    selectAll,
    clearSelection,
    toggleAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
  };
}
