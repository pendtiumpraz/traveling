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
import {
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Plus,
  Loader2,
  Send,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Ticket {
  id: string;
  ticketNo: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
  };
  comments: Array<{
    id: string;
    comment: string;
    userId: string;
    isInternal: boolean;
    createdAt: string;
  }>;
}

interface TicketMessage {
  id: string;
  comment: string;
  userId: string;
  isInternal: boolean;
  createdAt: string;
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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(pageSize),
        ...(search && { search }),
      });

      const res = await fetch(`/api/tickets?${params}`);
      const data = await res.json();

      if (data.success) {
        setTickets(data.data || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
    fetchMessages(ticket.id);
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newMessage, isInternal: false }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });

      if (res.ok) {
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) =>
            prev ? { ...prev, status: newStatus } : null,
          );
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const openTickets = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;

  const columns: Column<Ticket>[] = [
    {
      key: "ticketNo",
      header: "Ticket",
      width: "130px",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-primary">
          {row.ticketNo}
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
          <p className="text-xs text-gray-500">{row.customer.phone}</p>
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
      key: "assignedTo",
      header: "Assignee",
      width: "140px",
      render: (row) =>
        row.assignedTo || <span className="text-gray-400">Unassigned</span>,
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
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-gray-500">Total Tickets</p>
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
        title={`Ticket ${selectedTicket?.ticketNo}`}
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

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                {selectedTicket.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">
                  {selectedTicket.customer.fullName}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTicket.customer.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Assignee</p>
                <p className="font-medium">
                  {selectedTicket.assignedTo || "Unassigned"}
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

            {/* Status Actions */}
            <div className="flex gap-2">
              <p className="text-sm text-gray-500 mr-2">Change Status:</p>
              {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(selectedTicket.id, status)}
                  disabled={selectedTicket.status === status}
                  className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTicket.status === status
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div>
              <h4 className="mb-3 font-semibold">Messages</h4>
              {loadingMessages ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg border p-3 ${
                        msg.isInternal ? "bg-amber-50 border-amber-200" : ""
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {msg.isInternal ? "Internal Note" : "Reply"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{msg.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No messages yet
                </p>
              )}
            </div>

            {/* Reply Form */}
            <div>
              <label className="mb-2 block text-sm font-medium">Reply</label>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                rows={3}
                placeholder="Type your reply..."
              />
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  {sendingMessage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidebarModal>
    </div>
  );
}
