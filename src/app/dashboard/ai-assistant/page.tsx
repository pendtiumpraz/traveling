"use client";

import { useState, useRef, useEffect } from "react";
import { Card, Button, Badge } from "@/components/ui";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Database,
  Table,
  BarChart3,
  Users,
  Package,
  Calendar,
  CreditCard,
  Ticket,
  HelpCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: unknown;
  queryType?: string;
  timestamp: Date;
}

const suggestedQueries = [
  { icon: Users, text: "Tampilkan 10 customer terbaru", category: "Customer" },
  {
    icon: CreditCard,
    text: "List booking yang belum dibayar",
    category: "Booking",
  },
  {
    icon: BarChart3,
    text: "Berapa total revenue bulan ini?",
    category: "Finance",
  },
  {
    icon: Calendar,
    text: "Jadwal keberangkatan minggu depan",
    category: "Schedule",
  },
  {
    icon: Package,
    text: "Paket yang paling banyak dipesan",
    category: "Package",
  },
  { icon: Ticket, text: "Tiket support yang masih open", category: "Support" },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (query?: string) => {
    const messageText = query || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const result = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.success
          ? result.data.message
          : result.error || "Terjadi kesalahan",
        data: result.success ? result.data.data : null,
        queryType: result.success ? result.data.queryType : null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI query error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderDataTable = (data: unknown, queryType?: string) => {
    if (!data) return null;

    // Handle array data
    if (Array.isArray(data) && data.length > 0) {
      const columns = Object.keys(data[0]).filter(
        (key) => !key.startsWith("_") && key !== "id",
      );

      return (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-medium text-gray-700 capitalize"
                  >
                    {col.replace(/([A-Z])/g, " $1").trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data
                .slice(0, 10)
                .map((row: Record<string, unknown>, idx: number) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2">
                        {renderCellValue(row[col], col)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <p className="mt-2 text-xs text-gray-500 text-center">
              Menampilkan 10 dari {data.length} hasil
            </p>
          )}
        </div>
      );
    }

    // Handle object/summary data
    if (typeof data === "object" && data !== null) {
      const entries = Object.entries(data as Record<string, unknown>);
      return (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {entries.map(([key, value]) => (
            <div key={key} className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {renderCellValue(value, key)}
              </p>
            </div>
          ))}
        </div>
      );
    }

    // Handle number
    if (typeof data === "number") {
      return (
        <div className="mt-3 rounded-lg bg-emerald-50 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-700">
            {data.toLocaleString("id-ID")}
          </p>
        </div>
      );
    }

    return null;
  };

  const renderCellValue = (value: unknown, column: string): React.ReactNode => {
    if (value === null || value === undefined) return "-";

    // Handle nested objects
    if (typeof value === "object" && value !== null) {
      if ("fullName" in value) return (value as { fullName: string }).fullName;
      if ("name" in value) {
        const name = (value as { name: unknown }).name;
        return typeof name === "string" ? name : JSON.stringify(name);
      }
      if ("_count" in value)
        return Object.values(value as Record<string, number>)[0];
      if ("quantity" in value) return (value as { quantity: number }).quantity;
      return JSON.stringify(value);
    }

    // Format based on column name
    if (
      column.toLowerCase().includes("price") ||
      column.toLowerCase().includes("salary") ||
      column.toLowerCase().includes("revenue") ||
      column.toLowerCase().includes("amount")
    ) {
      return formatCurrency(Number(value));
    }

    if (
      column.toLowerCase().includes("date") ||
      column.toLowerCase().includes("at")
    ) {
      return formatDate(String(value));
    }

    if (typeof value === "boolean") {
      return value ? "Ya" : "Tidak";
    }

    return String(value);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-2">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
            <p className="text-gray-500">
              Tanya apa saja tentang data Travel ERP Anda
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-purple-100 p-4 mb-4">
                <Bot className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Halo! Saya AI Assistant Anda
              </h2>
              <p className="text-gray-500 max-w-md mb-6">
                Saya bisa membantu Anda mencari dan menganalisis data seperti
                customer, booking, pembayaran, jadwal, dan lainnya. Coba tanya
                sesuatu!
              </p>

              {/* Suggested Queries */}
              <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
                {suggestedQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(query.text)}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-left text-sm hover:bg-gray-50 hover:border-purple-300 transition-colors"
                  >
                    <query.icon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700">{query.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="rounded-full bg-purple-100 p-2">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.role === "assistant" && message.data ? (
                      <>
                        {message.queryType && (
                          <Badge variant="secondary" className="mt-2">
                            <Database className="h-3 w-3 mr-1" />
                            {message.queryType}
                          </Badge>
                        )}
                        {renderDataTable(
                          message.data,
                          message.queryType || undefined,
                        )}
                      </>
                    ) : null}

                    <p
                      className={`text-xs mt-2 ${
                        message.role === "user"
                          ? "text-purple-200"
                          : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="rounded-full bg-gray-200 p-2">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-gray-100 p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-gray-600">Sedang memproses...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanya sesuatu... (contoh: 'List 5 booking terbaru')"
                rows={1}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <HelpCircle className="h-3 w-3" />
            <span>
              Tekan Enter untuk mengirim, Shift+Enter untuk baris baru
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
