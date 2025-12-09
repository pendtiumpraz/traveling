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
import { Eye, Edit, Trash2 } from "lucide-react";
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

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
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

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
      key: "bookingCode",
      header: "Booking",
      width: "120px",
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
      key: "room",
      header: "Room",
      width: "80px",
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
      render: (row) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      width: "100px",
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500">Manage customer bookings</p>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        searchPlaceholder="Search booking code, customer..."
        onSearch={setSearch}
        onAdd={handleAdd}
        addLabel="New Booking"
        onRowClick={handleView}
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
    </div>
  );
}
