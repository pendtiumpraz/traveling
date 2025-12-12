"use client";

import { useState, useEffect } from "react";
import { Card, Badge, Button } from "@/components/ui";
import { User, Calendar, DollarSign, Eye, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Booking {
  id: string;
  bookingCode: string;
  customer: { fullName: string; phone: string };
  package: { name: { id?: string }; type: string };
  schedule: { departureDate: string };
  totalPrice: string;
  pax: number;
  paymentStatus: string;
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
};

export function BookingKanbanView() {
  const [bookings, setBookings] = useState<Record<string, Booking[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings?pageSize=100");
      const json = await res.json();
      if (json.success) {
        // Group by status
        const grouped: Record<string, Booking[]> = {};
        COLUMNS.forEach((col) => (grouped[col.id] = []));
        
        json.data.forEach((booking: Booking & { status: string }) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-72">
          <div className={`rounded-t-lg px-3 py-2 ${column.bgColor}`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {bookings[column.id]?.length || 0}
              </Badge>
            </div>
          </div>
          
          <div className="bg-gray-100 rounded-b-lg p-2 min-h-[500px] space-y-2">
            {bookings[column.id]?.map((booking) => (
              <Card key={booking.id} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs font-medium text-primary">
                    {booking.bookingCode}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${paymentColors[booking.paymentStatus]}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate">{booking.customer.fullName}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 truncate pl-5">
                    {booking.package.name?.id || "Package"}
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
                    <Link href={`/dashboard/bookings/${booking.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
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
  );
}
