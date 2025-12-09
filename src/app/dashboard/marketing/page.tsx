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
import { VoucherForm } from "./voucher-form";
import { Eye, Edit, Tag, Ticket, Megaphone, TrendingUp } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Voucher {
  id: string;
  code: string;
  name: string;
  type: string;
  value: string;
  minPurchase: string | null;
  maxDiscount: string | null;
  quota: number | null;
  used: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string | null;
  _count: { bookings: number };
}

export default function MarketingPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const fetchVouchers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/vouchers?page=${page}&pageSize=${pageSize}`,
      );
      const json = await res.json();
      if (json.success) {
        setVouchers(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const activeVouchers = vouchers.filter((v) => v.isActive).length;
  const totalUsed = vouchers.reduce((sum, v) => sum + v.used, 0);

  const handleView = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedVoucher(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = () => setModalMode("edit");

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedVoucher(null);
    fetchVouchers();
  };

  const columns: Column<Voucher>[] = [
    {
      key: "code",
      header: "Code",
      width: "120px",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-primary">
          {row.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Voucher",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">
            {row.type === "PERCENTAGE"
              ? `${row.value}%`
              : formatCurrency(Number(row.value))}{" "}
            off
          </p>
        </div>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      width: "100px",
      render: (row) => (
        <span>
          {row.used} / {row.quota || "∞"}
        </span>
      ),
    },
    {
      key: "period",
      header: "Valid Period",
      render: (row) => (
        <span className="text-sm">
          {formatDate(row.startDate, { day: "numeric", month: "short" })} -{" "}
          {formatDate(row.endDate, { day: "numeric", month: "short" })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "90px",
      render: (row) => {
        const now = new Date();
        const end = new Date(row.endDate);
        const isExpired = end < now;
        return (
          <Badge
            variant={
              isExpired ? "destructive" : row.isActive ? "success" : "secondary"
            }
          >
            {isExpired ? "Expired" : row.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleView(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedVoucher(row);
              setModalMode("edit");
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-500">
          Manage campaigns, vouchers, and promotions
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Tag className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-gray-500">Total Vouchers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Ticket className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeVouchers}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalUsed}</p>
              <p className="text-sm text-gray-500">Total Used</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Megaphone className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-500">Campaigns</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="outline">Campaigns</Button>
        <Button variant="outline">Landing Pages</Button>
        <Button variant="outline">Leads</Button>
      </div>

      <DataTable
        columns={columns}
        data={vouchers}
        isLoading={isLoading}
        addLabel="Create Voucher"
        onAdd={handleCreate}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No vouchers found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Create Voucher"
            : modalMode === "edit"
              ? "Edit Voucher"
              : "Voucher Details"
        }
        size="md"
      >
        <VoucherForm
          mode={modalMode}
          voucher={selectedVoucher}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={modalMode === "view" ? handleEdit : undefined}
        />
      </SidebarModal>
    </div>
  );
}
