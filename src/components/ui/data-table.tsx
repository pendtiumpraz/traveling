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
} from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  width?: string;
  sortable?: boolean;
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
  emptyMessage = "No data found",
  selectedRows = [],
  onSelectionChange,
  rowKey,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");

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
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
                  >
                    {column.header}
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
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  pagination.onPageSizeChange(Number(e.target.value))
                }
                className="rounded border-gray-300 text-sm focus:border-primary focus:ring-primary"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ml-4">
                {pagination.page * pagination.pageSize + 1}-
                {Math.min(
                  (pagination.page + 1) * pagination.pageSize,
                  pagination.total,
                )}{" "}
                of {pagination.total}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => pagination.onPageChange(0)}
                disabled={pagination.page === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="mx-2 text-sm text-gray-600">
                Page {pagination.page + 1} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => pagination.onPageChange(totalPages - 1)}
                disabled={pagination.page >= totalPages - 1}
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
