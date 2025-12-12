"use client";

import { useState, useCallback, useEffect } from "react";
import { DataTable, Column, Badge, Button, Card } from "@/components/ui";
import { Eye, Download, FileText, Plus, Printer } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
  booking: {
    bookingCode: string;
    customer: { fullName: string };
  };
}

const statusColors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "secondary",
  SENT: "warning",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices?page=${page}&pageSize=${pageSize}`);
      const json = await res.json();
      if (json.success) {
        setInvoices(json.data || []);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      header: "No. Invoice",
      sortable: true,
      render: (row) => <span className="font-mono text-sm font-medium">{row.invoiceNumber}</span>,
    },
    {
      key: "booking",
      header: "Booking / Customer",
      render: (row) => (
        <div>
          <p className="font-medium">{row.booking?.bookingCode || "-"}</p>
          <p className="text-sm text-gray-500">{row.booking?.customer?.fullName || "-"}</p>
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
      key: "status",
      header: "Status",
      render: (row) => <Badge variant={statusColors[row.status]}>{row.status}</Badge>,
    },
    {
      key: "dueDate",
      header: "Jatuh Tempo",
      render: (row) => {
        const isOverdue = new Date(row.dueDate) < new Date() && row.status !== "PAID";
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {formatDate(row.dueDate)}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Dibuat",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" title="Lihat">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Print">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Stats
  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "PAID").length,
    unpaid: invoices.filter((i) => ["SENT", "OVERDUE"].includes(i.status)).length,
    totalAmount: invoices.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">Kelola tagihan dan invoice</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoice</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lunas</p>
              <p className="text-xl font-bold text-green-600">{stats.paid}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Belum Lunas</p>
              <p className="text-xl font-bold text-yellow-600">{stats.unpaid}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Nilai</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        data={invoices}
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
