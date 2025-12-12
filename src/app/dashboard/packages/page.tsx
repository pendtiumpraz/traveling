"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DataTable,
  Column,
  Badge,
  Button,
  SidebarModal,
} from "@/components/ui";
import { PackageForm } from "./package-form";
import {
  DataTableToolbar,
  useTableSelection,
  SelectCheckbox,
  FilterConfig,
  SortOption,
} from "@/components/ui/data-table-toolbar";
import { TrashModal } from "@/components/ui/trash-modal";
import { Eye, Edit, Trash2, Calendar, Users, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Package {
  id: string;
  code: string;
  name: { id?: string; en?: string };
  type: string;
  duration: number;
  nights: number;
  priceDouble: string;
  isActive: boolean;
  isFeatured: boolean;
  _count: {
    schedules: number;
    bookings: number;
  };
}

const typeColors: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  UMROH: "success",
  HAJI: "success",
  OUTBOUND: "default",
  INBOUND: "secondary",
  DOMESTIC: "warning",
  MICE: "destructive",
  CRUISE: "default",
};

const PACKAGE_FILTERS: FilterConfig[] = [
  {
    key: "type",
    label: "Type",
    options: [
      { label: "Umroh", value: "UMROH" },
      { label: "Haji", value: "HAJI" },
      { label: "Outbound", value: "OUTBOUND" },
      { label: "Inbound", value: "INBOUND" },
      { label: "Domestic", value: "DOMESTIC" },
      { label: "MICE", value: "MICE" },
      { label: "Cruise", value: "CRUISE" },
    ],
  },
  {
    key: "isActive",
    label: "Status",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

const PACKAGE_SORT_OPTIONS: SortOption[] = [
  { label: "Created Date", value: "createdAt" },
  { label: "Name", value: "name" },
  { label: "Price", value: "priceDouble" },
  { label: "Duration", value: "duration" },
];

const TRASH_COLUMNS = [
  { key: "code", header: "Code" },
  { key: "type", header: "Type" },
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
  } = useTableSelection(packages);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const fetchPackages = useCallback(async () => {
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

      const res = await fetch(`/api/packages?${params}`);
      const json = await res.json();

      if (json.success) {
        setPackages(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, filterValues]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleAdd = () => {
    setSelectedPackage(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleView = (pkg: Package) => {
    setSelectedPackage(pkg);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = async (pkg: Package) => {
    if (
      !confirm(
        `Are you sure you want to delete ${pkg.name?.id || pkg.name?.en}?`,
      )
    )
      return;

    try {
      const res = await fetch(`/api/packages/${pkg.id}`, { method: "DELETE" });
      if (res.ok) fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchPackages();
  };

  const columns: Column<Package>[] = [
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
      key: "code",
      header: "Code",
      width: "100px",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-gray-500">{row.code}</span>
      ),
    },
    {
      key: "name",
      header: "Package Name",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.name?.id || row.name?.en}
          </p>
          <p className="text-xs text-gray-500">
            {row.duration}D/{row.nights}N
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "100px",
      sortable: true,
      render: (row) => (
        <Badge variant={typeColors[row.type] || "secondary"}>{row.type}</Badge>
      ),
    },
    {
      key: "priceDouble",
      header: "Price (Double)",
      width: "140px",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">
          {formatCurrency(Number(row.priceDouble))}
        </span>
      ),
    },
    {
      key: "schedules",
      header: "Schedules",
      width: "100px",
      render: (row) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-3.5 w-3.5" />
          {row._count.schedules}
        </div>
      ),
    },
    {
      key: "bookings",
      header: "Bookings",
      width: "100px",
      render: (row) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Users className="h-3.5 w-3.5" />
          {row._count.bookings}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "100px",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
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
          <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
          <p className="text-gray-500">Manage travel packages and tours</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      <DataTableToolbar
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        totalItems={total}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search packages..."
        filters={PACKAGE_FILTERS}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        sortOptions={PACKAGE_SORT_OPTIONS}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        modelName="package"
        onBulkDelete={fetchPackages}
        onImportSuccess={fetchPackages}
        onViewTrash={() => setIsTrashOpen(true)}
      />

      <DataTable
        columns={columns}
        data={packages}
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
        emptyMessage="No packages found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Create Package"
            : modalMode === "edit"
              ? "Edit Package"
              : "Package Details"
        }
        size="lg"
      >
        <PackageForm
          mode={modalMode}
          package={selectedPackage}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={() => setModalMode("edit")}
        />
      </SidebarModal>

      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        modelName="package"
        modelLabel="Packages"
        onRestoreSuccess={fetchPackages}
        columns={TRASH_COLUMNS}
      />
    </div>
  );
}
