"use client";

import { useState, useCallback, useEffect } from "react";
import { DataTable, Column, Badge, Button, Card } from "@/components/ui";
import { Eye, Download, Filter, CreditCard } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Payment {
  id: string;
  paymentCode: string;
  amount: string;
  method: string;
  status: string;
  reference: string | null;
  paidAt: string | null;
  createdAt: string;
  booking: {
    bookingCode: string;
    customer: { fullName: string };
  };
  bank: { name: string } | null;
}

const statusColors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  PROCESSING: "secondary",
  SUCCESS: "success",
  FAILED: "destructive",
  EXPIRED: "secondary",
  REFUNDED: "destructive",
};

const methodLabels: Record<string, string> = {
  BANK_TRANSFER: "Transfer Bank",
  VIRTUAL_ACCOUNT: "Virtual Account",
  CREDIT_CARD: "Kartu Kredit",
  CASH: "Tunai",
  QRIS: "QRIS",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/payments?${params}`);
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
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const columns: Column<Payment>[] = [
    {
      key: "paymentCode",
      header: "Kode Payment",
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{row.paymentCode}</span>,
    },
    {
      key: "booking",
      header: "Booking / Customer",
      render: (row) => (
        <div>
          <p className="font-medium">{row.booking.bookingCode}</p>
          <p className="text-sm text-gray-500">{row.booking.customer.fullName}</p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Jumlah",
      sortable: true,
      render: (row) => <span className="font-semibold">{formatCurrency(parseFloat(row.amount))}</span>,
    },
    {
      key: "method",
      header: "Metode",
      render: (row) => (
        <div>
          <p>{methodLabels[row.method] || row.method}</p>
          {row.bank && <p className="text-xs text-gray-500">{row.bank.name}</p>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge variant={statusColors[row.status]}>{row.status}</Badge>,
    },
    {
      key: "paidAt",
      header: "Tanggal Bayar",
      render: (row) => row.paidAt ? formatDate(row.paidAt) : "-",
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Link href={`/dashboard/finance?payment=${row.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  // Stats
  const stats = {
    total: payments.length,
    success: payments.filter((p) => p.status === "SUCCESS").length,
    pending: payments.filter((p) => p.status === "PENDING").length,
    totalAmount: payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">Kelola semua pembayaran</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Transaksi</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sukses</p>
              <p className="text-xl font-bold text-green-600">{stats.success}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Diterima</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <DataTable
        data={payments}
        columns={columns}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
}
