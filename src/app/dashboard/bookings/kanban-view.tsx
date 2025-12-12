"use client";

import { useState, useEffect, DragEvent } from "react";
import { Card, Badge, Button, SidebarModal } from "@/components/ui";
import { User, Calendar, DollarSign, Eye, Loader2, Phone, MapPin, CreditCard } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Booking {
  id: string;
  bookingCode: string;
  status: string;
  customer: { fullName: string; phone: string };
  package: { name: { id?: string; en?: string } | string; type: string };
  schedule: { departureDate: string; returnDate: string };
  totalPrice: string;
  pax: number;
  roomType: string;
  paymentStatus: string;
  createdAt: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  bgColor: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: "PENDING", title: "Pending", color: "text-amber-600", bgColor: "bg-amber-50" },
  { id: "CONFIRMED", title: "Confirmed", color: "text-blue-600", bgColor: "bg-blue-50" },
  { id: "PROCESSING", title: "Processing", color: "text-purple-600", bgColor: "bg-purple-50" },
  { id: "READY", title: "Ready", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { id: "DEPARTED", title: "Departed", color: "text-gray-600", bgColor: "bg-gray-50" },
  { id: "COMPLETED", title: "Completed", color: "text-green-600", bgColor: "bg-green-50" },
];

const paymentColors: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

function getPackageName(name: { id?: string; en?: string } | string | undefined): string {
  if (!name) return "Package";
  if (typeof name === "string") return name;
  return name.id || name.en || "Package";
}

export function BookingKanbanView() {
  const [bookings, setBookings] = useState<Record<string, Booking[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings?pageSize=100");
      const json = await res.json();
      if (json.success) {
        const grouped: Record<string, Booking[]> = {};
        COLUMNS.forEach((col) => (grouped[col.id] = []));
        
        json.data.forEach((booking: Booking) => {
          if (grouped[booking.status]) {
            grouped[booking.status].push(booking);
          }
        });
        
        setBookings(grouped);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDragStart = (e: DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedBooking || draggedBooking.status === newStatus) {
      setDraggedBooking(null);
      return;
    }

    const oldStatus = draggedBooking.status;
    
    // Optimistic update
    setBookings((prev) => {
      const updated = { ...prev };
      updated[oldStatus] = updated[oldStatus].filter((b) => b.id !== draggedBooking.id);
      updated[newStatus] = [...updated[newStatus], { ...draggedBooking, status: newStatus }];
      return updated;
    });

    try {
      const res = await fetch(`/api/bookings/${draggedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        // Revert on error
        fetchBookings();
      }
    } catch (error) {
      console.error(error);
      fetchBookings();
    }

    setDraggedBooking(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((column) => (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-72"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`rounded-t-lg px-3 py-2 ${column.bgColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {bookings[column.id]?.length || 0}
                </Badge>
              </div>
            </div>
            
            <div className={`rounded-b-lg p-2 min-h-[500px] space-y-2 transition-colors ${
              dragOverColumn === column.id ? "bg-blue-100" : "bg-gray-100"
            }`}>
              {bookings[column.id]?.map((booking) => (
                <Card 
                  key={booking.id} 
                  className={`p-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                    draggedBooking?.id === booking.id ? "opacity-50" : ""
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, booking)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs font-medium text-primary">
                      {booking.bookingCode}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${paymentColors[booking.paymentStatus] || "bg-gray-100"}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate">{booking.customer.fullName}</span>
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate pl-5">
                      {getPackageName(booking.package.name)}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(booking.schedule.departureDate)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatCurrency(parseFloat(booking.totalPrice))}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => handleViewBooking(booking)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {(!bookings[column.id] || bookings[column.id].length === 0) && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No bookings
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Booking Details"
        size="md"
      >
        {selectedBooking && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-lg font-bold text-primary">{selectedBooking.bookingCode}</p>
                <p className="text-sm text-gray-500">Created {formatDate(selectedBooking.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={selectedBooking.status === "COMPLETED" ? "success" : "secondary"}>
                  {selectedBooking.status}
                </Badge>
                <Badge variant={selectedBooking.paymentStatus === "PAID" ? "success" : "warning"}>
                  {selectedBooking.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Customer */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Customer</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{selectedBooking.customer.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{selectedBooking.customer.phone}</span>
                </div>
              </div>
            </div>

            {/* Package */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Package</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{getPackageName(selectedBooking.package.name)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {formatDate(selectedBooking.schedule.departureDate)} - {formatDate(selectedBooking.schedule.returnDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Info */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Booking Info</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Room Type</p>
                  <p className="font-medium">{selectedBooking.roomType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pax</p>
                  <p className="font-medium">{selectedBooking.pax} person(s)</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Payment</h4>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-400" />
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(parseFloat(selectedBooking.totalPrice))}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button 
                className="flex-1"
                onClick={() => window.open(`/dashboard/bookings?id=${selectedBooking.id}`, "_self")}
              >
                Edit Booking
              </Button>
            </div>
          </div>
        )}
      </SidebarModal>
    </>
  );
}
