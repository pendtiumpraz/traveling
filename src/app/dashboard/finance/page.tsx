"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DataTable,
  Column,
  Badge,
  Button,
  Card,
  SidebarModal,
} from "@/components/ui";
import { PaymentForm } from "./payment-form";
import {
  Eye,
  CreditCard,
  FileText,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Payment {
  id: string;
  code: string;
  paymentCode: string;
  amount: string;
  method: string;
  status: string;
  reference: string | null;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
  booking: {
    id: string;
    code: string;
    bookingCode: string;
    customer: { fullName: string };
    totalPrice: string;
  };
  bank: { name: string } | null;
}

const statusColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  PENDING: "warning",
  PROCESSING: "secondary",
  SUCCESS: "success",
  FAILED: "destructive",
  EXPIRED: "secondary",
  REFUNDED: "destructive",
};

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(0);
  };

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/payments?page=${page}&pageSize=${pageSize}`,
      );
      const json = await res.json();
      if (json.success) {
        setPayments(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter((p) => p.status === "PENDING").length;

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPayment(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    setModalMode("edit");
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    fetchPayments();
  };

  const columns: Column<Payment>[] = [
    {
      key: "no",
      header: "No",
      width: "60px",
      render: (_, index) => (
        <span className="text-sm text-gray-500">{page * pageSize + index + 1}</span>
      ),
    },
    {
      key: "paymentCode",
      header: "Code",
      width: "120px",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-medium text-primary">
          {row.paymentCode}
        </span>
      ),
    },
    {
      key: "booking",
      header: "Booking",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.booking.customer.fullName}
          </p>
          <p className="text-xs text-gray-500">{row.booking.bookingCode}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: "140px",
      sortable: true,
      render: (row) => (
        <span className="font-medium">
          {formatCurrency(Number(row.amount))}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      width: "120px",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm">{row.method.replace("_", " ")}</p>
          {row.bank && <p className="text-xs text-gray-500">{row.bank.name}</p>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "100px",
      sortable: true,
      render: (row) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      width: "100px",
      sortable: true,
      render: (row) =>
        formatDate(row.createdAt, { day: "numeric", month: "short" }),
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      render: (row) => (
        <Button variant="ghost" size="icon" onClick={() => handleView(row)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <p className="text-gray-500">
          Manage payments, invoices, and commissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingPayments}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-gray-500">Transactions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">+12%</p>
              <p className="text-sm text-gray-500">Growth</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="flex gap-2">
        <Link href="/dashboard/finance/payments">
          <Button variant="outline">Payments</Button>
        </Link>
        <Link href="/dashboard/finance/invoices">
          <Button variant="outline">Invoices</Button>
        </Link>
        <Link href="/dashboard/finance/commissions">
          <Button variant="outline">Commissions</Button>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        isLoading={isLoading}
        addLabel="Record Payment"
        onAdd={handleCreate}
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
        emptyMessage="No payments found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Record Payment"
            : modalMode === "edit"
              ? "Edit Payment"
              : "Payment Details"
        }
        size="md"
      >
        <PaymentForm
          mode={modalMode}
          payment={selectedPayment}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={modalMode === "view" ? handleEdit : undefined}
        />
      </SidebarModal>
    </div>
  );
}
