"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Input, Badge } from "@/components/ui";
import {
  X,
  Search,
  RotateCcw,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

interface TrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  modelLabel: string;
  onRestoreSuccess?: () => void;
  columns: {
    key: string;
    header: string;
    render?: (item: Record<string, unknown>) => React.ReactNode;
  }[];
}

export function TrashModal({
  isOpen,
  onClose,
  modelName,
  modelLabel,
  onRestoreSuccess,
  columns,
}: TrashModalProps) {
  const toast = useToast();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;

  const fetchTrash = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        model: modelName,
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
      });

      const res = await fetch(`/api/restore?${params}`);
      const json = await res.json();

      if (json.success) {
        setItems(json.data.data || []);
        setTotal(json.data.meta?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching trash:", error);
    } finally {
      setIsLoading(false);
    }
  }, [modelName, page, search]);

  useEffect(() => {
    if (isOpen) {
      fetchTrash();
    }
  }, [isOpen, fetchTrash]);

  const handleRestore = async () => {
    if (selectedIds.length === 0) {
      toast.warning("No items selected", "Please select items to restore");
      return;
    }

    setIsRestoring(true);
    try {
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName, ids: selectedIds }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Restored successfully", data.message);
        setSelectedIds([]);
        fetchTrash();
        onRestoreSuccess?.();
      } else {
        toast.error("Restore failed", data.error);
      }
    } catch (error) {
      toast.error("Error", "Failed to restore items");
      console.error(error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("No items selected", "Please select items to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to PERMANENTLY delete ${selectedIds.length} item(s)? This action cannot be undone!`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/restore", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName, ids: selectedIds }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Deleted permanently", data.message);
        setSelectedIds([]);
        fetchTrash();
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

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id as string));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-gray-500" />
            <div>
              <h2 className="text-lg font-semibold">Trash - {modelLabel}</h2>
              <p className="text-sm text-gray-500">
                {total} deleted item(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search deleted items..."
              className="pl-10"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={selectedIds.length === 0 || isRestoring}
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-2" />
              )}
              Restore ({selectedIds.length})
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handlePermanentDelete}
              disabled={selectedIds.length === 0 || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Forever
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Trash2 className="h-12 w-12 mb-4 text-gray-300" />
              <p>Trash is empty</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === items.length && items.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="py-3 px-2 text-left text-sm font-medium text-gray-500"
                    >
                      {col.header}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-left text-sm font-medium text-gray-500">
                    Deleted At
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id as string}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id as string)}
                        onChange={() => toggleSelect(item.id as string)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 px-2 text-sm">
                        {col.render
                          ? col.render(item)
                          : (item[col.key] as string) || "-"}
                      </td>
                    ))}
                    <td className="py-3 px-2 text-sm text-gray-500">
                      {item.deletedAt
                        ? formatDate(item.deletedAt as string, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {total > pageSize && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">
              Showing {page * pageSize + 1} to{" "}
              {Math.min((page + 1) * pageSize, total)} of {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * pageSize >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="flex items-center gap-2 px-6 py-3 bg-amber-50 border-t border-amber-200 text-amber-700 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Items in trash will be permanently deleted after 30 days.
          </span>
        </div>
      </div>
    </div>
  );
}
