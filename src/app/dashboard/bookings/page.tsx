"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DataTable,
  Column,
  Badge,
  Button,
  SidebarModal,
} from "@/components/ui";
import { BookingForm } from "./booking-form";
import {
  DataTableToolbar,
  useTableSelection,
  SelectCheckbox,
  FilterConfig,
  SortOption,
} from "@/components/ui/data-table-toolbar";
import { TrashModal } from "@/components/ui/trash-modal";
import { Eye, Edit, Trash2, Plus } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Booking {
  id: string;
  bookingCode: string;
  customer: { id: string; fullName: string; phone: string };
  package: { id: string; name: { id?: string; en?: string }; type: string };
  schedule: { departureDate: string; returnDate: string };
  roomType: string;
  pax: number;
  totalPrice: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "READY"
    | "DEPARTED"
    | "COMPLETED"
    | "CANCELLED";
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID" | "REFUNDED";
  createdAt: string;
}

const statusColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary" | "default"
> = {
  PENDING: "warning",
  CONFIRMED: "success",
  PROCESSING: "default",
  READY: "success",
  DEPARTED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};

const paymentColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  UNPAID: "destructive",
  PARTIAL: "warning",
  PAID: "success",
  REFUNDED: "secondary",
};

// Filter configurations
const BOOKING_FILTERS: FilterConfig[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Pending", value: "PENDING" },
      { label: "Confirmed", value: "CONFIRMED" },
      { label: "Processing", value: "PROCESSING" },
      { label: "Ready", value: "READY" },
      { label: "Departed", value: "DEPARTED" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
  {
    key: "paymentStatus",
    label: "Payment",
    options: [
      { label: "Unpaid", value: "UNPAID" },
      { label: "Partial", value: "PARTIAL" },
      { label: "Paid", value: "PAID" },
      { label: "Refunded", value: "REFUNDED" },
    ],
  },
  {
    key: "roomType",
    label: "Room",
    options: [
      { label: "Quad", value: "QUAD" },
      { label: "Triple", value: "TRIPLE" },
      { label: "Double", value: "DOUBLE" },
      { label: "Twin", value: "TWIN" },
      { label: "Single", value: "SINGLE" },
    ],
  },
];

const BOOKING_SORT_OPTIONS: SortOption[] = [
  { label: "Created Date", value: "createdAt" },
  { label: "Departure Date", value: "schedule.departureDate" },
  { label: "Total Price", value: "totalPrice" },
  { label: "Status", value: "status" },
];

const TRASH_COLUMNS = [
  { key: "bookingCode", header: "Code" },
  { key: "totalPrice", header: "Total" },
  { key: "status", header: "Status" },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Filter & Sort state
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Trash modal
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Selection state
  const {
    selectedIds,
    toggleItem,
    selectAll,
    clearSelection,
    toggleAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
  } = useTableSelection(bookings);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortBy,
        sortOrder,
      });

      // Add filter values to params
      Object.entries(filterValues).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/bookings?${params}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortOrder, filterValues]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleAdd = () => {
    setSelectedBooking(null);
    setModalMode("create");
    setIsModalOpen(true);
  };
  const handleView = (b: Booking) => {
    setSelectedBooking(b);
    setModalMode("view");
    setIsModalOpen(true);
  };
  const handleEdit = (b: Booking) => {
    setSelectedBooking(b);
    setModalMode("edit");
    setIsModalOpen(true);
  };
  const handleDelete = async (b: Booking) => {
    if (!confirm("Delete this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${b.id}`, { method: "DELETE" });
      if (res.ok) fetchBookings();
    } catch (error) {
      console.error(error);
    }
  };
  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchBookings();
  };

  const columns: Column<Booking>[] = [
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
      key: "no",
      header: "No",
      width: "60px",
      render: (_, index) => (
        <span className="text-sm text-gray-500">{page * pageSize + index + 1}</span>
      ),
    },
    {
      key: "bookingCode",
      header: "Booking",
      width: "120px",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-medium text-primary">
          {row.bookingCode}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.customer.fullName}</p>
          <p className="text-xs text-gray-500">{row.customer.phone}</p>
        </div>
      ),
    },
    {
      key: "package",
      header: "Package",
      render: (row) => (
        <div>
          <p className="text-sm text-gray-900">
            {row.package.name?.id || row.package.name?.en}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(row.schedule.departureDate, {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "roomType",
      header: "Room",
      width: "80px",
      sortable: true,
      render: (row) => (
        <span className="text-sm">
          {row.roomType} ({row.pax})
        </span>
      ),
    },
    {
      key: "totalPrice",
      header: "Total",
      width: "140px",
      sortable: true,
      render: (row) => (
        <span className="font-medium">
          {formatCurrency(Number(row.totalPrice))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      sortable: true,
      render: (row) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      width: "100px",
      sortable: true,
      render: (row) => (
        <Badge variant={paymentColors[row.paymentStatus]}>
          {row.paymentStatus}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
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
          {row.status === "PENDING" && (
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
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500">Manage customer bookings</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Toolbar with filters */}
      <DataTableToolbar
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        totalItems={total}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search booking code, customer..."
        filters={BOOKING_FILTERS}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        sortOptions={BOOKING_SORT_OPTIONS}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        modelName="booking"
        onBulkDelete={fetchBookings}
        onImportSuccess={fetchBookings}
        onViewTrash={() => setIsTrashOpen(true)}
      />

      <DataTable
        columns={columns}
        data={bookings}
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
        emptyMessage="No bookings found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "New Booking"
            : modalMode === "edit"
              ? "Edit Booking"
              : "Booking Details"
        }
        size="lg"
      >
        <BookingForm
          mode={modalMode}
          booking={selectedBooking}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={() => setModalMode("edit")}
        />
      </SidebarModal>

      {/* Trash Modal */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        modelName="booking"
        modelLabel="Bookings"
        onRestoreSuccess={fetchBookings}
        columns={TRASH_COLUMNS}
      />
    </div>
  );
}
