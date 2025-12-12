"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
  Plus,
  Download,
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  width?: string;
  sortable?: boolean;
  sortKey?: string; // Optional different key for sorting (e.g., for nested fields)
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onAdd?: () => void;
  addLabel?: string;
  onRowClick?: (row: T) => void;
  onExport?: () => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  emptyMessage?: string;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  rowKey?: keyof T | ((row: T) => string);
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Search...",
  onSearch,
  onAdd,
  addLabel = "Add New",
  onRowClick,
  onExport,
  pagination,
  sortBy,
  sortOrder,
  onSort,
  emptyMessage = "No data found",
  selectedRows = [],
  onSelectionChange,
  rowKey,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleColumnSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    const key = column.sortKey || column.key;
    if (sortBy === key) {
      onSort(key, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSort(key, "asc");
    }
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    const key = column.sortKey || column.key;
    if (sortBy === key) {
      return sortOrder === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 ml-1" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 ml-1" />
      );
    }
    return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-30" />;
  };

  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(row);
    }
    if (rowKey) {
      return String(row[rowKey]);
    }
    return row.id ? String(row.id) : `row-${index}`;
  };

  const isRowSelected = (row: T, index: number): boolean => {
    const key = getRowKey(row, index);
    return selectedRows.some((r, i) => getRowKey(r, i) === key);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...data]);
    }
  };

  const handleSelectRow = (row: T, index: number) => {
    if (!onSelectionChange) return;
    if (isRowSelected(row, index)) {
      onSelectionChange(
        selectedRows.filter(
          (r, i) => getRowKey(r, i) !== getRowKey(row, index),
        ),
      );
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {onSearch && (
            <div className="w-full sm:w-80">
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearch}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          )}
          <Button variant="outline" size="icon" className="shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              variant="outline"
              onClick={onExport}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} leftIcon={<Plus className="h-4 w-4" />}>
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                {onSelectionChange && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        data.length > 0 && selectedRows.length === data.length
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    style={{ width: column.width }}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600",
                      column.sortable && onSort && "cursor-pointer hover:bg-gray-100 select-none"
                    )}
                    onClick={() => handleColumnSort(column)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {getSortIcon(column)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                    className="px-4 py-12 text-center"
                  >
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-gray-500">Loading...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                    className="px-4 py-12 text-center"
                  >
                    <p className="text-sm text-gray-500">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={getRowKey(row, index)}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-gray-50",
                      isRowSelected(row, index) && "bg-primary/5",
                    )}
                  >
                    {onSelectionChange && (
                      <td
                        className="w-12 px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isRowSelected(row, index)}
                          onChange={() => handleSelectRow(row, index)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm text-gray-700"
                      >
                        {column.render
                          ? column.render(row, index)
                          : String(
                              (row as Record<string, unknown>)[column.key] ??
                                "",
                            )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3 gap-3">
            {/* Left: Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">
                Showing{" "}
                <span className="text-gray-900">
                  {pagination.total === 0 ? 0 : pagination.page * pagination.pageSize + 1}
                </span>
                {" - "}
                <span className="text-gray-900">
                  {Math.min(
                    (pagination.page + 1) * pagination.pageSize,
                    pagination.total,
                  )}
                </span>
                {" of "}
                <span className="text-gray-900">{pagination.total}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">per page:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    pagination.onPageSizeChange(Number(e.target.value))
                  }
                  className="h-8 rounded border-gray-300 text-sm focus:border-primary focus:ring-primary"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Right: Page Numbers */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onPageChange(0)}
                disabled={pagination.page === 0}
                className="h-8 w-8"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {(() => {
                  const pages = [];
                  const currentPage = pagination.page;
                  let startPage = Math.max(0, currentPage - 2);
                  let endPage = Math.min(totalPages - 1, currentPage + 2);

                  // Adjust if at the start
                  if (currentPage < 2) {
                    endPage = Math.min(totalPages - 1, 4);
                  }
                  // Adjust if at the end
                  if (currentPage > totalPages - 3) {
                    startPage = Math.max(0, totalPages - 5);
                  }

                  // First page
                  if (startPage > 0) {
                    pages.push(
                      <Button
                        key={0}
                        variant="outline"
                        size="sm"
                        onClick={() => pagination.onPageChange(0)}
                        className="h-8 w-8 p-0"
                      >
                        1
                      </Button>
                    );
                    if (startPage > 1) {
                      pages.push(
                        <span key="dots-start" className="px-1 text-gray-400">
                          ...
                        </span>
                      );
                    }
                  }

                  // Page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={i === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => pagination.onPageChange(i)}
                        className="h-8 w-8 p-0"
                      >
                        {i + 1}
                      </Button>
                    );
                  }

                  // Last page
                  if (endPage < totalPages - 1) {
                    if (endPage < totalPages - 2) {
                      pages.push(
                        <span key="dots-end" className="px-1 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <Button
                        key={totalPages - 1}
                        variant="outline"
                        size="sm"
                        onClick={() => pagination.onPageChange(totalPages - 1)}
                        className="h-8 w-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    );
                  }

                  return pages;
                })()}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages - 1}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => pagination.onPageChange(totalPages - 1)}
                disabled={pagination.page >= totalPages - 1}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
