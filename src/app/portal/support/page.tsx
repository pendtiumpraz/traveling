"use client";

import { useState } from "react";
import {
  Headphones,
  MessageSquare,
  Phone,
  Mail,
  Send,
  Plus,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
  lastReply?: string;
  messages: {
    id: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
  }[];
}

// Mock data
const initialTickets: Ticket[] = [
  {
    id: "1",
    subject: "Pertanyaan tentang jadwal manasik",
    category: "GENERAL",
    status: "OPEN",
    createdAt: "2025-01-10T10:00:00",
    lastReply: "2025-01-10T14:30:00",
    messages: [
      {
        id: "1",
        message: "Kapan jadwal manasik untuk keberangkatan Februari?",
        isAdmin: false,
        createdAt: "2025-01-10T10:00:00",
      },
      {
        id: "2",
        message:
          "Jadwal manasik akan dilaksanakan pada tanggal 8 Februari 2025 di Hotel XYZ. Undangan akan dikirimkan via WhatsApp.",
        isAdmin: true,
        createdAt: "2025-01-10T14:30:00",
      },
    ],
  },
  {
    id: "2",
    subject: "Update data paspor",
    category: "DOCUMENT",
    status: "RESOLVED",
    createdAt: "2025-01-05T09:00:00",
    messages: [
      {
        id: "1",
        message:
          "Saya ingin mengupdate nomor paspor karena sudah diperpanjang.",
        isAdmin: false,
        createdAt: "2025-01-05T09:00:00",
      },
      {
        id: "2",
        message: "Silakan upload paspor baru di menu Dokumen. Terima kasih.",
        isAdmin: true,
        createdAt: "2025-01-05T10:00:00",
      },
    ],
  },
];

export default function PortalSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newTicketData, setNewTicketData] = useState({
    subject: "",
    category: "",
    message: "",
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      OPEN: { bg: "bg-blue-100", text: "text-blue-700" },
      IN_PROGRESS: { bg: "bg-yellow-100", text: "text-yellow-700" },
      RESOLVED: { bg: "bg-green-100", text: "text-green-700" },
      CLOSED: { bg: "bg-gray-100", text: "text-gray-700" },
    };
    const style = styles[status] || styles.OPEN;
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
      >
        {status === "OPEN"
          ? "Menunggu"
          : status === "IN_PROGRESS"
            ? "Diproses"
            : status === "RESOLVED"
              ? "Selesai"
              : status}
      </span>
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const updatedTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          id: Date.now().toString(),
          message: newMessage,
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setTickets(
      tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)),
    );
    setSelectedTicket(updatedTicket);
    setNewMessage("");
  };

  const handleCreateTicket = () => {
    if (!newTicketData.subject || !newTicketData.message) return;

    const newTicket: Ticket = {
      id: Date.now().toString(),
      subject: newTicketData.subject,
      category: newTicketData.category || "GENERAL",
      status: "OPEN",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: "1",
          message: newTicketData.message,
          isAdmin: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setTickets([newTicket, ...tickets]);
    setShowNewTicket(false);
    setNewTicketData({ subject: "", category: "", message: "" });
    setSelectedTicket(newTicket);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bantuan</h1>
          <p className="text-gray-500">Hubungi kami jika ada pertanyaan</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Buat Tiket Baru
        </button>
      </div>

      {/* Contact Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-green-300 hover:bg-green-50"
        >
          <div className="rounded-lg bg-green-100 p-2">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">WhatsApp</p>
            <p className="text-sm text-gray-500">+62 812 3456 7890</p>
          </div>
        </a>

        <a
          href="mailto:support@travel.com"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:bg-blue-50"
        >
          <div className="rounded-lg bg-blue-100 p-2">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Email</p>
            <p className="text-sm text-gray-500">support@travel.com</p>
          </div>
        </a>

        <a
          href="tel:02112345678"
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-purple-300 hover:bg-purple-50"
        >
          <div className="rounded-lg bg-purple-100 p-2">
            <Headphones className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Call Center</p>
            <p className="text-sm text-gray-500">(021) 1234-5678</p>
          </div>
        </a>
      </div>

      {/* Tickets & Chat */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ticket List */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">Tiket Saya</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Belum ada tiket</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-4 text-left hover:bg-gray-50 ${
                      selectedTicket?.id === ticket.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {ticket.subject}
                      </p>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(ticket.createdAt)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="rounded-xl border border-gray-200 bg-white lg:col-span-2">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedTicket.category}
                    </p>
                  </div>
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto p-4">
                <div className="space-y-4">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.isAdmin
                            ? "bg-gray-100 text-gray-900"
                            : "bg-primary text-white"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`mt-1 text-xs ${msg.isAdmin ? "text-gray-500" : "text-white/70"}`}
                        >
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input */}
              {selectedTicket.status !== "CLOSED" && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ketik pesan..."
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <button
                      onClick={handleSendMessage}
                      className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center py-16">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">
                  Pilih tiket untuk melihat percakapan
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Buat Tiket Baru
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  value={newTicketData.category}
                  onChange={(e) =>
                    setNewTicketData({
                      ...newTicketData,
                      category: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                >
                  <option value="GENERAL">Umum</option>
                  <option value="BOOKING">Booking</option>
                  <option value="PAYMENT">Pembayaran</option>
                  <option value="DOCUMENT">Dokumen</option>
                  <option value="TECHNICAL">Teknis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Subjek
                </label>
                <input
                  type="text"
                  value={newTicketData.subject}
                  onChange={(e) =>
                    setNewTicketData({
                      ...newTicketData,
                      subject: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                  placeholder="Judul pertanyaan Anda"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pesan
                </label>
                <textarea
                  value={newTicketData.message}
                  onChange={(e) =>
                    setNewTicketData({
                      ...newTicketData,
                      message: e.target.value,
                    })
                  }
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                  placeholder="Jelaskan pertanyaan atau masalah Anda..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowNewTicket(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleCreateTicket}
                className="flex-1 rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary/90"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
