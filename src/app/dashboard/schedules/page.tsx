"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DataTable,
  Column,
  Badge,
  Button,
  SidebarModal,
} from "@/components/ui";
import { ScheduleForm } from "./schedule-form";
import {
  DataTableToolbar,
  useTableSelection,
  SelectCheckbox,
  FilterConfig,
  SortOption,
} from "@/components/ui/data-table-toolbar";
import { TrashModal } from "@/components/ui/trash-modal";
import { Eye, Edit, Trash2, Users, Calendar, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Schedule {
  id: string;
  departureDate: string;
  returnDate: string;
  quota: number;
  availableQuota: number;
  status: "OPEN" | "ALMOST_FULL" | "FULL" | "CLOSED" | "DEPARTED" | "COMPLETED";
  package: {
    code: string;
    name: { id?: string; en?: string };
    type: string;
    duration: number;
  };
  _count: { bookings: number; manifests: number };
}

const statusColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary" | "default"
> = {
  OPEN: "success",
  ALMOST_FULL: "warning",
  FULL: "destructive",
  CLOSED: "secondary",
  DEPARTED: "default",
  COMPLETED: "secondary",
};

const SCHEDULE_FILTERS: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Open", value: "OPEN" },
      { label: "Almost Full", value: "ALMOST_FULL" },
      { label: "Full", value: "FULL" },
      { label: "Closed", value: "CLOSED" },
      { label: "Departed", value: "DEPARTED" },
      { label: "Completed", value: "COMPLETED" },
    ],
  },
];

const SCHEDULE_SORT_OPTIONS: SortOption[] = [
  { label: "Departure Date", value: "departureDate" },
  { label: "Created Date", value: "createdAt" },
  { label: "Quota", value: "quota" },
];

const TRASH_COLUMNS = [
  { key: "departureDate", header: "Departure" },
  { key: "status", header: "Status" },
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("departureDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const {
    selectedIds,
    toggleItem,
    selectAll,
    clearSelection,
    toggleAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
  } = useTableSelection(schedules);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortBy,
        sortOrder,
      });

      Object.entries(filterValues).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/schedules?${params}`);
      const json = await res.json();
      if (json.success) {
        setSchedules(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, filterValues]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleAdd = () => {
    setSelectedSchedule(null);
    setModalMode("create");
    setIsModalOpen(true);
  };
  const handleView = (s: Schedule) => {
    setSelectedSchedule(s);
    setModalMode("view");
    setIsModalOpen(true);
  };
  const handleEdit = (s: Schedule) => {
    setSelectedSchedule(s);
    setModalMode("edit");
    setIsModalOpen(true);
  };
  const handleDelete = async (s: Schedule) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      const res = await fetch(`/api/schedules/${s.id}`, { method: "DELETE" });
      if (res.ok) fetchSchedules();
    } catch (error) {
      console.error(error);
    }
  };
  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchSchedules();
  };

  const columns: Column<Schedule>[] = [
    {
      key: "select",
      header: (
        <SelectCheckbox
          checked={isAllSelected}
          onChange={toggleAll}
          indeterminate={isSomeSelected}
        />
      ),
      width: "50px",
      render: (row) => (
        <SelectCheckbox
          checked={isSelected(row.id)}
          onChange={() => toggleItem(row.id)}
        />
      ),
    },
    {
      key: "package",
      header: "Package",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.package.name?.id || row.package.name?.en}
          </p>
          <p className="text-xs text-gray-500">
            {row.package.code} - {row.package.type}
          </p>
        </div>
      ),
    },
    {
      key: "departureDate",
      header: "Departure",
      width: "140px",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>
            {formatDate(row.departureDate, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      key: "returnDate",
      header: "Return",
      width: "140px",
      sortable: true,
      render: (row) =>
        formatDate(row.returnDate, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "quota",
      header: "Quota",
      width: "120px",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{row.availableQuota}</span>
          <span className="text-gray-400">/ {row.quota}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      sortable: true,
      render: (row) => (
        <Badge variant={statusColors[row.status]}>
          {row.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "bookings",
      header: "Bookings",
      width: "100px",
      render: (row) => (
        <span className="text-sm text-gray-600">{row._count.bookings}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "120px",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-500">Manage departure schedules</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <DataTableToolbar
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        totalItems={total}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search schedules..."
        filters={SCHEDULE_FILTERS}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        sortOptions={SCHEDULE_SORT_OPTIONS}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        modelName="schedule"
        onBulkDelete={fetchSchedules}
        onImportSuccess={fetchSchedules}
        onViewTrash={() => setIsTrashOpen(true)}
      />

      <DataTable
        columns={columns}
        data={schedules}
        isLoading={isLoading}
        onRowClick={handleView}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSortChange}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No schedules found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Create Schedule"
            : modalMode === "edit"
              ? "Edit Schedule"
              : "Schedule Details"
        }
        size="md"
      >
        <ScheduleForm
          mode={modalMode}
          schedule={selectedSchedule}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={() => setModalMode("edit")}
        />
      </SidebarModal>

      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        modelName="schedule"
        modelLabel="Schedules"
        onRestoreSuccess={fetchSchedules}
        columns={TRASH_COLUMNS}
      />
    </div>
  );
}
