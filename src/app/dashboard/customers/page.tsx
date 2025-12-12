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
import {
  DataTableToolbar,
  useTableSelection,
  SelectCheckbox,
  FilterConfig,
  SortOption,
} from "@/components/ui/data-table-toolbar";
import { TrashModal } from "@/components/ui/trash-modal";
import { Eye, Edit, Trash2, Phone, Mail, Plus } from "lucide-react";
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

// Filter configurations
const CUSTOMER_FILTERS: FilterConfig[] = [
  {
    key: "customerType",
    label: "Type",
    options: [
      { label: "Prospect", value: "PROSPECT" },
      { label: "Client", value: "CLIENT" },
      { label: "VIP", value: "VIP" },
      { label: "Inactive", value: "INACTIVE" },
    ],
  },
  {
    key: "source",
    label: "Source",
    options: [
      { label: "Website", value: "WEBSITE" },
      { label: "Referral", value: "REFERRAL" },
      { label: "Agent", value: "AGENT" },
      { label: "Social Media", value: "SOCIAL_MEDIA" },
      { label: "Walk In", value: "WALK_IN" },
      { label: "Phone", value: "PHONE" },
      { label: "Event", value: "EVENT" },
      { label: "Corporate", value: "CORPORATE" },
    ],
  },
];

const CUSTOMER_SORT_OPTIONS: SortOption[] = [
  { label: "Created Date", value: "createdAt" },
  { label: "Name", value: "fullName" },
  { label: "Type", value: "customerType" },
  { label: "City", value: "city" },
];

const TRASH_COLUMNS = [
  { key: "code", header: "Code" },
  { key: "fullName", header: "Name" },
  { key: "phone", header: "Phone" },
  { key: "email", header: "Email" },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
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
  } = useTableSelection(customers);

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
        sortBy,
        sortOrder,
      });
      
      // Add filter values to params
      Object.entries(filterValues).forEach(([key, value]) => {
        if (value) params.append(key, value);
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
  }, [page, pageSize, search, sortBy, sortOrder, filterValues]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  
  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filtering
  };

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

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
      width: "120px",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-gray-500">{row.code}</span>
      ),
    },
    {
      key: "fullName",
      header: "Name",
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Manage your customers and prospects</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Toolbar with bulk actions, filters & import */}
      <DataTableToolbar
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        totalItems={total}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, phone, email..."
        filters={CUSTOMER_FILTERS}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        sortOptions={CUSTOMER_SORT_OPTIONS}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        modelName="customer"
        onBulkDelete={fetchCustomers}
        onImportSuccess={fetchCustomers}
        onViewTrash={() => setIsTrashOpen(true)}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={customers}
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

      {/* Trash Modal */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        modelName="customer"
        modelLabel="Customers"
        onRestoreSuccess={fetchCustomers}
        columns={TRASH_COLUMNS}
      />
    </div>
  );
}
