"use client";

import { useState, useCallback, useEffect } from "react";
import { DataTable, Column, Badge, Button, Card } from "@/components/ui";
import { Eye, Users, Calendar, Plane } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Manifest {
  id: string;
  code: string;
  name: string;
  departureDate: string;
  returnDate: string;
  status: string;
  leaderName: string | null;
  schedule: {
    package: { name: { id?: string }; type: string };
  };
  _count: { participants: number; rooming: number };
}

const statusColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary" | "default"
> = {
  DRAFT: "secondary",
  CONFIRMED: "success",
  DEPARTED: "default",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "destructive",
};

export default function OperationsPage() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("departureDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(0);
  };

  const fetchManifests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/manifests?page=${page}&pageSize=${pageSize}`,
      );
      const json = await res.json();
      if (json.success) {
        setManifests(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchManifests();
  }, [fetchManifests]);

  const columns: Column<Manifest>[] = [
    {
      key: "no",
      header: "No",
      width: "60px",
      render: (_, index) => (
        <span className="text-sm text-gray-500">{page * pageSize + index + 1}</span>
      ),
    },
    {
      key: "code",
      header: "Code",
      width: "100px",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-medium">{row.code}</span>
      ),
    },
    {
      key: "name",
      header: "Manifest",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">
            {row.schedule?.package?.name?.id || "Package"}
          </p>
        </div>
      ),
    },
    {
      key: "departureDate",
      header: "Departure",
      width: "120px",
      sortable: true,
      render: (row) =>
        formatDate(row.departureDate, {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "participants",
      header: "Pax",
      width: "80px",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{row._count.participants}</span>
        </div>
      ),
    },
    {
      key: "leader",
      header: "Leader",
      render: (row) =>
        row.leaderName || <span className="text-gray-400">-</span>,
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
      key: "actions",
      header: "",
      width: "80px",
      render: (row) => (
        <Link href={`/dashboard/operations/${row.id}`}>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Operations</h1>
        <p className="text-gray-500">Manage manifests, rooming, and flights</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-gray-500">Total Manifests</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {manifests.reduce((sum, m) => sum + m._count.participants, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Participants</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Plane className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {manifests.filter((m) => m.status === "DEPARTED").length}
              </p>
              <p className="text-sm text-gray-500">On Trip</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {manifests.filter((m) => m.status === "DRAFT").length}
              </p>
              <p className="text-sm text-gray-500">Draft</p>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={manifests}
        isLoading={isLoading}
        addLabel="Create Manifest"
        onAdd={() => {}}
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
        emptyMessage="No manifests found"
      />
    </div>
  );
}
