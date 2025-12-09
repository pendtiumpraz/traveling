"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DataTable,
  Column,
  Badge,
  Button,
  SidebarModal,
} from "@/components/ui";
import { CustomerForm } from "./customer-form";
import { Eye, Edit, Trash2, Phone, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  code: string;
  fullName: string;
  phone: string;
  email: string | null;
  customerType: "PROSPECT" | "CLIENT" | "VIP" | "INACTIVE";
  city: string | null;
  createdAt: string;
  _count: {
    bookings: number;
  };
}

const customerTypeColors = {
  PROSPECT: "warning",
  CLIENT: "success",
  VIP: "default",
  INACTIVE: "secondary",
} as const;

const customerTypeLabels = {
  PROSPECT: "Prospect",
  CLIENT: "Client",
  VIP: "VIP",
  INACTIVE: "Inactive",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
      });

      const res = await fetch(`/api/customers?${params}`);
      const json = await res.json();

      if (json.success) {
        setCustomers(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAdd = () => {
    setSelectedCustomer(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.fullName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchCustomers();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchCustomers();
  };

  const columns: Column<Customer>[] = [
    {
      key: "code",
      header: "Code",
      width: "120px",
      render: (row) => (
        <span className="font-mono text-xs text-gray-500">{row.code}</span>
      ),
    },
    {
      key: "fullName",
      header: "Name",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.fullName}</p>
          {row.city && <p className="text-xs text-gray-500">{row.city}</p>}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Phone className="h-3 w-3" />
            {row.phone}
          </div>
          {row.email && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Mail className="h-3 w-3" />
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "customerType",
      header: "Type",
      width: "100px",
      render: (row) => (
        <Badge variant={customerTypeColors[row.customerType]}>
          {customerTypeLabels[row.customerType]}
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
      key: "createdAt",
      header: "Created",
      width: "120px",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.createdAt, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
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
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500">Manage your customers and prospects</p>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        searchPlaceholder="Search by name, phone, email..."
        onSearch={setSearch}
        onAdd={handleAdd}
        addLabel="Add Customer"
        onRowClick={handleView}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No customers found. Add your first customer!"
      />

      {/* Sidebar Modal */}
      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Add New Customer"
            : modalMode === "edit"
              ? "Edit Customer"
              : "Customer Details"
        }
        description={
          modalMode === "create"
            ? "Fill in the details to add a new customer"
            : modalMode === "edit"
              ? "Update customer information"
              : undefined
        }
        size="lg"
      >
        <CustomerForm
          mode={modalMode}
          customer={selectedCustomer}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={() => setModalMode("edit")}
        />
      </SidebarModal>
    </div>
  );
}
