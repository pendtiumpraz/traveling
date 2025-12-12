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
  Users,
  Package,
  Calendar,
  CreditCard,
  Ticket,
  HelpCircle,
  DollarSign,
  TrendingUp,
  Plane,
  Building2,
  UserCog,
  Boxes,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: unknown;
  queryType?: string;
  timestamp: Date;
  error?: boolean;
}

// Comprehensive template categories
const TEMPLATE_CATEGORIES = [
  {
    id: "customer",
    title: "Customer",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    templates: [
      { text: "Tampilkan 10 customer terbaru", description: "Customer baru" },
      { text: "List customer dengan tipe VIP", description: "Customer VIP" },
      { text: "Berapa total customer yang terdaftar?", description: "Total customer" },
      { text: "Customer yang paling banyak booking", description: "Top customer" },
      { text: "List customer dari sumber AGENT", description: "Dari agent" },
      { text: "Customer yang belum pernah booking", description: "Belum booking" },
    ],
  },
  {
    id: "booking",
    title: "Booking",
    icon: CreditCard,
    color: "text-green-500",
    bgColor: "bg-green-50",
    templates: [
      { text: "List booking yang belum dibayar", description: "Belum bayar" },
      { text: "Tampilkan 10 booking terbaru", description: "Booking terbaru" },
      { text: "Berapa total booking bulan ini?", description: "Total bulan ini" },
      { text: "Booking dengan status CONFIRMED", description: "Sudah konfirm" },
      { text: "Booking yang sudah lunas", description: "Sudah lunas" },
      { text: "List booking yang pending", description: "Masih pending" },
      { text: "Statistik booking berdasarkan status", description: "Statistik status" },
      { text: "Booking dengan total harga tertinggi", description: "Harga tertinggi" },
    ],
  },
  {
    id: "finance",
    title: "Keuangan",
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    templates: [
      { text: "Berapa total revenue bulan ini?", description: "Revenue bulan ini" },
      { text: "Tampilkan ringkasan keuangan", description: "Summary" },
      { text: "Total pembayaran yang sudah sukses", description: "Payment sukses" },
      { text: "List pembayaran yang pending", description: "Payment pending" },
      { text: "Total revenue tahun ini", description: "Revenue tahunan" },
    ],
  },
  {
    id: "schedule",
    title: "Jadwal",
    icon: Calendar,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    templates: [
      { text: "Jadwal keberangkatan minggu depan", description: "Minggu depan" },
      { text: "Tampilkan jadwal yang masih tersedia", description: "Masih tersedia" },
      { text: "Jadwal yang kuota hampir penuh", description: "Hampir penuh" },
      { text: "List semua jadwal bulan ini", description: "Bulan ini" },
      { text: "Jadwal dengan kuota terbanyak", description: "Kuota banyak" },
    ],
  },
  {
    id: "package",
    title: "Paket",
    icon: Package,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    templates: [
      { text: "Paket yang paling banyak dipesan", description: "Paling populer" },
      { text: "Tampilkan semua paket aktif", description: "Paket aktif" },
      { text: "Paket umroh yang tersedia", description: "Paket umroh" },
      { text: "Paket dengan harga tertinggi", description: "Harga tertinggi" },
      { text: "Paket featured/unggulan", description: "Featured" },
    ],
  },
  {
    id: "support",
    title: "Support",
    icon: Ticket,
    color: "text-red-500",
    bgColor: "bg-red-50",
    templates: [
      { text: "Tiket support yang masih open", description: "Masih open" },
      { text: "Tiket dengan prioritas tinggi", description: "Prioritas tinggi" },
      { text: "Berapa total tiket yang belum selesai?", description: "Belum selesai" },
      { text: "List tiket terbaru", description: "Tiket terbaru" },
    ],
  },
  {
    id: "agent",
    title: "Agent",
    icon: Building2,
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    templates: [
      { text: "List agent dengan tier GOLD", description: "Agent Gold" },
      { text: "Agent dengan booking terbanyak", description: "Top agent" },
      { text: "Tampilkan semua agent aktif", description: "Agent aktif" },
      { text: "Berapa total agent yang terdaftar?", description: "Total agent" },
    ],
  },
  {
    id: "employee",
    title: "Karyawan",
    icon: UserCog,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50",
    templates: [
      { text: "List karyawan yang aktif", description: "Karyawan aktif" },
      { text: "Karyawan yang jadi tour leader", description: "Tour leader" },
      { text: "Berapa total karyawan?", description: "Total karyawan" },
      { text: "Karyawan di departemen operasional", description: "Dept operasional" },
    ],
  },
  {
    id: "product",
    title: "Produk",
    icon: Boxes,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    templates: [
      { text: "List produk yang stoknya rendah", description: "Stok rendah" },
      { text: "Tampilkan semua produk aktif", description: "Produk aktif" },
      { text: "Produk dengan harga tertinggi", description: "Harga tertinggi" },
    ],
  },
  {
    id: "summary",
    title: "Ringkasan",
    icon: TrendingUp,
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    templates: [
      { text: "Tampilkan ringkasan dashboard", description: "Dashboard summary" },
      { text: "Statistik booking berdasarkan status pembayaran", description: "Statistik payment" },
      { text: "Overview performa bisnis bulan ini", description: "Overview bulanan" },
    ],
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("customer");
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Terjadi kesalahan dari server");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.data?.message || "Data berhasil diambil",
        data: result.data?.data || null,
        queryType: result.data?.queryType || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI query error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error 
          ? `Maaf, terjadi kesalahan: ${error.message}. Silakan coba pertanyaan lain atau refresh halaman.`
          : "Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.",
        timestamp: new Date(),
        error: true,
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  // Safe data table rendering with error handling
  const renderDataTable = (data: unknown, queryType?: string) => {
    try {
      if (!data) return null;

      // Handle array data
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
              Tidak ada data ditemukan
            </div>
          );
        }

        const firstItem = data[0];
        if (typeof firstItem !== 'object' || firstItem === null) {
          return (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <pre className="text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>
            </div>
          );
        }

        const columns = Object.keys(firstItem).filter(
          (key) => !key.startsWith("_") && key !== "id"
        );

        if (columns.length === 0) {
          return (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
              {data.length} item ditemukan
            </div>
          );
        }

        return (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-700">No</th>
                  {columns.slice(0, 6).map((col) => (
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
                {data.slice(0, 10).map((row: Record<string, unknown>, idx: number) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    {columns.slice(0, 6).map((col) => (
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
        if (entries.length === 0) {
          return null;
        }
        return (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {entries.slice(0, 8).map(([key, value]) => (
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

      // Handle string
      if (typeof data === "string") {
        return (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{data}</p>
          </div>
        );
      }

      return null;
    } catch (error) {
      console.error("Error rendering data:", error);
      return (
        <div className="mt-3 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
          Error menampilkan data. Silakan coba pertanyaan lain.
        </div>
      );
    }
  };

  const renderCellValue = (value: unknown, column: string): React.ReactNode => {
    try {
      if (value === null || value === undefined) return "-";

      // Handle nested objects
      if (typeof value === "object" && value !== null) {
        if ("fullName" in value) return String((value as { fullName: unknown }).fullName);
        if ("name" in value) {
          const name = (value as { name: unknown }).name;
          if (typeof name === "object" && name !== null) {
            // Handle multilingual name
            const nameObj = name as Record<string, unknown>;
            return String(nameObj.id || nameObj.en || Object.values(nameObj)[0] || "-");
          }
          return String(name);
        }
        if ("_count" in value) {
          const counts = value as Record<string, unknown>;
          const countValue = Object.values(counts._count as Record<string, unknown>)[0];
          return String(countValue ?? 0);
        }
        if ("quantity" in value) return String((value as { quantity: unknown }).quantity);
        if (Array.isArray(value)) return `${value.length} items`;
        
        // For other objects, show first meaningful value
        const vals = Object.values(value);
        if (vals.length > 0 && typeof vals[0] !== 'object') {
          return String(vals[0]);
        }
        return "[Object]";
      }

      // Format based on column name
      const colLower = column.toLowerCase();
      if (
        colLower.includes("price") ||
        colLower.includes("salary") ||
        colLower.includes("revenue") ||
        colLower.includes("amount") ||
        colLower.includes("total") ||
        colLower.includes("balance")
      ) {
        const num = Number(value);
        if (!isNaN(num)) {
          return formatCurrency(num);
        }
      }

      if (colLower.includes("date") || colLower.includes("at")) {
        try {
          return formatDate(String(value));
        } catch {
          return String(value);
        }
      }

      if (typeof value === "boolean") {
        return value ? "Ya" : "Tidak";
      }

      return String(value);
    } catch (error) {
      console.error("Error rendering cell:", error);
      return "-";
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Template Prompts */}
      <Card className="w-72 flex-shrink-0 flex flex-col overflow-hidden">
        <div className="p-3 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Template Pertanyaan
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Klik untuk langsung bertanya
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {TEMPLATE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isExpanded = expandedCategory === category.id;
            
            return (
              <div key={category.id} className="mb-0.5">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    isExpanded ? "bg-purple-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded-md flex-shrink-0 ${category.bgColor}`}>
                      <Icon className={`h-3.5 w-3.5 ${category.color}`} />
                    </div>
                    <span className="font-medium text-sm text-gray-700 truncate">
                      {category.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 flex-shrink-0">
                      {category.templates.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="mt-1 mb-2 ml-3 pl-3 border-l-2 border-purple-200 space-y-0.5">
                    {category.templates.map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmit(template.text)}
                        disabled={isLoading}
                        className="w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-purple-50 transition-colors disabled:opacity-50 group"
                      >
                        <span className="text-gray-600 group-hover:text-purple-700 line-clamp-2 leading-relaxed">
                          {template.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-500 text-sm">
                Tanya apa saja tentang data Travel ERP
              </p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          )}
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
                <p className="text-gray-500 max-w-md mb-4">
                  Pilih template pertanyaan di sidebar kiri, atau ketik pertanyaan Anda sendiri di bawah.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Customer", "Booking", "Keuangan", "Jadwal"].map((cat) => (
                    <button 
                      key={cat} 
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                      onClick={() => setExpandedCategory(cat.toLowerCase() === "keuangan" ? "finance" : cat.toLowerCase())}>
                      {cat}
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
                        <div className={`rounded-full p-2 ${message.error ? "bg-red-100" : "bg-purple-100"}`}>
                          {message.error ? (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <Bot className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : message.error
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.role === "assistant" && !message.error && message.data ? (
                        <>
                          {message.queryType ? (
                            <Badge variant="secondary" className="mt-2">
                              <Database className="h-3 w-3 mr-1" />
                              {message.queryType}
                            </Badge>
                          ) : null}
                          {renderDataTable(message.data, message.queryType || undefined)}
                        </>
                      ) : null}

                      <div className={`flex items-center justify-between mt-2 ${
                        message.role === "user" ? "text-purple-200" : "text-gray-400"
                      }`}>
                        <span className="text-xs">
                          {message.timestamp.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        
                        {message.role === "user" && (
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="p-1 hover:bg-white/10 rounded"
                            title="Copy pertanyaan"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}
                      </div>
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
                  placeholder="Ketik pertanyaan atau pilih template di sidebar..."
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
                Enter untuk kirim • Shift+Enter untuk baris baru • Pilih template di kiri untuk pertanyaan cepat
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
