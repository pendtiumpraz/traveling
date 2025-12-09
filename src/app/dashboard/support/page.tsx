"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DataTable,
  Column,
  Badge,
  Button,
  Card,
  SidebarModal,
  Input,
} from "@/components/ui";
import {
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    fullName: string;
    email: string;
  };
  assignee: { name: string } | null;
  _count: { messages: number };
}

const priorityColors: Record<string, "secondary" | "warning" | "destructive"> =
  {
    LOW: "secondary",
    MEDIUM: "warning",
    HIGH: "destructive",
    URGENT: "destructive",
  };

const statusColors: Record<
  string,
  "secondary" | "warning" | "success" | "default"
> = {
  OPEN: "warning",
  IN_PROGRESS: "default",
  WAITING: "secondary",
  RESOLVED: "success",
  CLOSED: "secondary",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data
      await new Promise((r) => setTimeout(r, 500));
      setTickets([
        {
          id: "1",
          ticketNumber: "TKT-2024-001",
          subject: "Visa application status inquiry",
          category: "VISA",
          priority: "HIGH",
          status: "OPEN",
          createdAt: "2024-03-10T10:00:00",
          updatedAt: "2024-03-10T14:30:00",
          customer: { fullName: "Ahmad Fauzi", email: "ahmad@email.com" },
          assignee: { name: "Support Agent 1" },
          _count: { messages: 3 },
        },
        {
          id: "2",
          ticketNumber: "TKT-2024-002",
          subject: "Request for schedule change",
          category: "BOOKING",
          priority: "MEDIUM",
          status: "IN_PROGRESS",
          createdAt: "2024-03-09T08:00:00",
          updatedAt: "2024-03-10T09:00:00",
          customer: { fullName: "Budi Santoso", email: "budi@email.com" },
          assignee: { name: "Support Agent 2" },
          _count: { messages: 5 },
        },
        {
          id: "3",
          ticketNumber: "TKT-2024-003",
          subject: "Payment confirmation not received",
          category: "PAYMENT",
          priority: "URGENT",
          status: "OPEN",
          createdAt: "2024-03-10T15:00:00",
          updatedAt: "2024-03-10T15:00:00",
          customer: { fullName: "Siti Rahayu", email: "siti@email.com" },
          assignee: null,
          _count: { messages: 1 },
        },
      ]);
      setTotal(3);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;

  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const columns: Column<Ticket>[] = [
    {
      key: "ticketNumber",
      header: "Ticket",
      width: "130px",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-primary">
          {row.ticketNumber}
        </span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.subject}</p>
          <p className="text-xs text-gray-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.customer.fullName}</p>
          <p className="text-xs text-gray-500">{row.customer.email}</p>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      width: "100px",
      render: (row) => (
        <Badge variant={priorityColors[row.priority]}>{row.priority}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "120px",
      render: (row) => (
        <Badge variant={statusColors[row.status]}>
          {row.status.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      width: "140px",
      render: (row) =>
        row.assignee?.name || <span className="text-gray-400">Unassigned</span>,
    },
    {
      key: "updated",
      header: "Updated",
      width: "100px",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.updatedAt, { day: "numeric", month: "short" })}
        </span>
      ),
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
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-500">Manage customer support requests</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openTickets}</p>
              <p className="text-sm text-gray-500">Open Tickets</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "RESOLVED").length}
              </p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {tickets.reduce((s, t) => s + t._count.messages, 0)}
              </p>
              <p className="text-sm text-gray-500">Messages</p>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={tickets}
        isLoading={isLoading}
        searchPlaceholder="Search tickets..."
        onSearch={setSearch}
        addLabel="Create Ticket"
        onAdd={() => {}}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No tickets found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Ticket ${selectedTicket?.ticketNumber}`}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedTicket.subject}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedTicket.category}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={priorityColors[selectedTicket.priority]}>
                  {selectedTicket.priority}
                </Badge>
                <Badge variant={statusColors[selectedTicket.status]}>
                  {selectedTicket.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">
                  {selectedTicket.customer.fullName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTicket.customer.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assignee</p>
                <p className="font-medium">
                  {selectedTicket.assignee?.name || "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">
                  {formatDate(selectedTicket.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">
                  {formatDate(selectedTicket.updatedAt)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold">
                Messages ({selectedTicket._count.messages})
              </h4>
              <div className="space-y-3">
                <div className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedTicket.customer.fullName}
                      </p>
                      <p className="text-xs text-gray-500">Customer</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    Hello, I would like to inquire about the status of my visa
                    application. It has been 5 days since submission.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Reply</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="Type your reply..."
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button>Send Reply</Button>
              </div>
            </div>
          </div>
        )}
      </SidebarModal>
    </div>
  );
}
