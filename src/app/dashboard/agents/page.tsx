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
import {
  DataTableToolbar,
  useTableSelection,
  SelectCheckbox,
  FilterConfig,
  SortOption,
} from "@/components/ui/data-table-toolbar";
import { TrashModal } from "@/components/ui/trash-modal";
import { Eye, Edit, Users, Award, TrendingUp, Plus } from "lucide-react";

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

const AGENT_FILTERS: FilterConfig[] = [
  {
    key: "tier",
    label: "Tier",
    options: [
      { label: "Regular", value: "REGULAR" },
      { label: "Silver", value: "SILVER" },
      { label: "Gold", value: "GOLD" },
      { label: "Platinum", value: "PLATINUM" },
    ],
  },
  {
    key: "isActive",
    label: "Status",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

const AGENT_SORT_OPTIONS: SortOption[] = [
  { label: "Created Date", value: "createdAt" },
  { label: "Name", value: "name" },
  { label: "Tier", value: "tier" },
  { label: "Commission", value: "commissionRate" },
];

const TRASH_COLUMNS = [
  { key: "code", header: "Code" },
  { key: "name", header: "Name" },
  { key: "tier", header: "Tier" },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const {
    selectedIds,
    toggleItem,
    selectAll,
    clearSelection,
    toggleAll,
    isSelected,
    isAllSelected,
    isSomeSelected,
  } = useTableSelection(agents);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit">(
    "create",
  );
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortBy,
        sortOrder,
      });

      Object.entries(filterValues).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/agents?${params}`);
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
  }, [page, pageSize, search, sortBy, sortOrder, filterValues]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-500">Manage travel agents and partners</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Agent
        </Button>
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

      <DataTableToolbar
        selectedIds={selectedIds}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        totalItems={total}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search agents..."
        filters={AGENT_FILTERS}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        sortOptions={AGENT_SORT_OPTIONS}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        modelName="agent"
        onBulkDelete={fetchAgents}
        onImportSuccess={fetchAgents}
        onViewTrash={() => setIsTrashOpen(true)}
      />

      <DataTable
        columns={columns}
        data={agents}
        isLoading={isLoading}
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

      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        modelName="agent"
        modelLabel="Agents"
        onRestoreSuccess={fetchAgents}
        columns={TRASH_COLUMNS}
      />
    </div>
  );
}
