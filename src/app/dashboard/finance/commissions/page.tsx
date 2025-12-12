"use client";

import { useState, useCallback, useEffect } from "react";
import { DataTable, Column, Badge, Button, Card } from "@/components/ui";
import { Eye, Download, Users, DollarSign, TrendingUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Commission {
  id: string;
  code: string;
  amount: string;
  status: string;
  type: string;
  createdAt: string;
  paidAt: string | null;
  agent?: { name: string; code: string } | null;
  employee?: { name: string; nip: string } | null;
  booking?: { bookingCode: string } | null;
}

const statusColors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  PENDING: "warning",
  APPROVED: "secondary",
  PAID: "success",
  CANCELLED: "destructive",
};

const typeLabels: Record<string, string> = {
  AGENT: "Komisi Agent",
  SALES: "Komisi Sales",
  TOUR_LEADER: "Komisi Tour Leader",
  REFERRAL: "Bonus Referral",
};

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchCommissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/commissions?page=${page}&pageSize=${pageSize}`);
      const json = await res.json();
      if (json.success) {
        setCommissions(json.data || []);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const columns: Column<Commission>[] = [
    {
      key: "code",
      header: "Kode",
      sortable: true,
      render: (row) => <span className="font-mono text-sm">{row.code}</span>,
    },
    {
      key: "type",
      header: "Tipe",
      render: (row) => (
        <Badge variant="secondary">{typeLabels[row.type] || row.type}</Badge>
      ),
    },
    {
      key: "recipient",
      header: "Penerima",
      render: (row) => (
        <div>
          {row.agent && (
            <>
              <p className="font-medium">{row.agent.name}</p>
              <p className="text-xs text-gray-500">Agent: {row.agent.code}</p>
            </>
          )}
          {row.employee && (
            <>
              <p className="font-medium">{row.employee.name}</p>
              <p className="text-xs text-gray-500">NIP: {row.employee.nip}</p>
            </>
          )}
          {!row.agent && !row.employee && "-"}
        </div>
      ),
    },
    {
      key: "booking",
      header: "Booking",
      render: (row) => row.booking?.bookingCode || "-",
    },
    {
      key: "amount",
      header: "Jumlah",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(parseFloat(row.amount))}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge variant={statusColors[row.status]}>{row.status}</Badge>,
    },
    {
      key: "createdAt",
      header: "Tanggal",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Stats
  const stats = {
    total: commissions.length,
    pending: commissions.filter((c) => c.status === "PENDING").length,
    paid: commissions.filter((c) => c.status === "PAID").length,
    totalAmount: commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0),
    pendingAmount: commissions
      .filter((c) => c.status === "PENDING")
      .reduce((sum, c) => sum + parseFloat(c.amount || "0"), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
          <p className="text-gray-500">Kelola komisi agent dan sales</p>
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
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Komisi</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.pendingAmount)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sudah Dibayar</p>
              <p className="text-xl font-bold text-green-600">{stats.paid}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Dibayarkan</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        data={commissions}
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
