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
import { AgentForm } from "./agent-form";
import { Eye, Edit, Users, Award, TrendingUp } from "lucide-react";

interface Agent {
  id: string;
  code: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  tier: string;
  commissionRate: string;
  isActive: boolean;
  createdAt: string;
  _count: { bookings: number; commissions: number };
}

const tierColors: Record<
  string,
  "secondary" | "default" | "warning" | "success"
> = {
  REGULAR: "secondary",
  SILVER: "default",
  GOLD: "warning",
  PLATINUM: "success",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
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
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/agents?page=${page}&pageSize=${pageSize}&search=${search}`,
      );
      const json = await res.json();
      if (json.success) {
        setAgents(json.data);
        setTotal(json.meta?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const totalBookings = agents.reduce((sum, a) => sum + a._count.bookings, 0);

  const handleView = (agent: Agent) => {
    setSelectedAgent(agent);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedAgent(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = () => setModalMode("edit");

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedAgent(null);
    fetchAgents();
  };

  const columns: Column<Agent>[] = [
    {
      key: "code",
      header: "Code",
      width: "100px",
      render: (row) => <span className="font-mono text-xs">{row.code}</span>,
    },
    {
      key: "name",
      header: "Agent",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          {row.companyName && (
            <p className="text-xs text-gray-500">{row.companyName}</p>
          )}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <div>
          <p className="text-sm">{row.phone}</p>
          {row.city && <p className="text-xs text-gray-500">{row.city}</p>}
        </div>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      width: "100px",
      render: (row) => <Badge variant={tierColors[row.tier]}>{row.tier}</Badge>,
    },
    {
      key: "commission",
      header: "Commission",
      width: "100px",
      render: (row) => (
        <span className="font-medium">{row.commissionRate}%</span>
      ),
    },
    {
      key: "bookings",
      header: "Bookings",
      width: "100px",
      render: (row) => row._count.bookings,
    },
    {
      key: "status",
      header: "Status",
      width: "90px",
      render: (row) => (
        <Badge variant={row.isActive ? "success" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
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
              setSelectedAgent(row);
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
        <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
        <p className="text-gray-500">Manage travel agents and partners</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-gray-500">Total Agents</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {
                  agents.filter(
                    (a) => a.tier === "PLATINUM" || a.tier === "GOLD",
                  ).length
                }
              </p>
              <p className="text-sm text-gray-500">Premium Agents</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBookings}</p>
              <p className="text-sm text-gray-500">Total Bookings</p>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={agents}
        isLoading={isLoading}
        searchPlaceholder="Search agents..."
        onSearch={setSearch}
        addLabel="Add Agent"
        onAdd={handleCreate}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No agents found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Add Agent"
            : modalMode === "edit"
              ? "Edit Agent"
              : "Agent Details"
        }
        size="md"
      >
        <AgentForm
          mode={modalMode}
          agent={selectedAgent}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
          onEdit={modalMode === "view" ? handleEdit : undefined}
        />
      </SidebarModal>
    </div>
  );
}
