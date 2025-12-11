"use client";

import { useState } from "react";
import {
  Ticket,
  Download,
  Plane,
  Building2,
  QrCode,
  Calendar,
} from "lucide-react";

interface ETicket {
  id: string;
  type: "FLIGHT" | "HOTEL" | "VOUCHER";
  booking: { code: string; schedule: { package: { name: string } } };
  ticketNumber: string;
  passengerName: string;
  details: {
    airline?: string;
    flightNumber?: string;
    departure?: string;
    arrival?: string;
    departureTime?: string;
    hotelName?: string;
    checkIn?: string;
    checkOut?: string;
    roomType?: string;
  };
  status: string;
  qrCode?: string;
}

// Mock data - replace with API
const initialTickets: ETicket[] = [
  {
    id: "1",
    type: "FLIGHT",
    booking: {
      code: "BK-001",
      schedule: { package: { name: "Umroh Reguler 9 Hari" } },
    },
    ticketNumber: "GA-12345678",
    passengerName: "Ahmad Jamaah",
    details: {
      airline: "Garuda Indonesia",
      flightNumber: "GA 986",
      departure: "Jakarta (CGK)",
      arrival: "Jeddah (JED)",
      departureTime: "2025-02-15 22:00",
    },
    status: "ISSUED",
  },
  {
    id: "2",
    type: "HOTEL",
    booking: {
      code: "BK-001",
      schedule: { package: { name: "Umroh Reguler 9 Hari" } },
    },
    ticketNumber: "HV-87654321",
    passengerName: "Ahmad Jamaah",
    details: {
      hotelName: "Pullman Zamzam Makkah",
      checkIn: "2025-02-16",
      checkOut: "2025-02-20",
      roomType: "Quad Room",
    },
    status: "CONFIRMED",
  },
];

export default function PortalETicketsPage() {
  const [tickets] = useState<ETicket[]>(initialTickets);
  const [filter, setFilter] = useState("ALL");

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FLIGHT":
        return <Plane className="h-5 w-5" />;
      case "HOTEL":
        return <Building2 className="h-5 w-5" />;
      default:
        return <Ticket className="h-5 w-5" />;
    }
  };

  const filteredTickets =
    filter === "ALL" ? tickets : tickets.filter((t) => t.type === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">E-Ticket & Voucher</h1>
        <p className="text-gray-500">
          Download tiket dan voucher perjalanan Anda
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { value: "ALL", label: "Semua" },
          { value: "FLIGHT", label: "Tiket Pesawat" },
          { value: "HOTEL", label: "Voucher Hotel" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filter === f.value
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tickets */}
      {filteredTickets.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
          <Ticket className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">Belum ada tiket tersedia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              {/* Ticket Header */}
              <div className="flex items-center justify-between border-b border-dashed border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${ticket.type === "FLIGHT" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}
                  >
                    {getTypeIcon(ticket.type)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      #{ticket.ticketNumber}
                    </p>
                    <p className="font-semibold text-gray-900">
                      {ticket.type === "FLIGHT"
                        ? "Tiket Pesawat"
                        : "Voucher Hotel"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {ticket.status}
                </span>
              </div>

              {/* Ticket Body */}
              <div className="p-4">
                <p className="text-sm text-gray-500">
                  {ticket.booking.schedule.package.name}
                </p>
                <p className="font-medium text-gray-900">
                  {ticket.passengerName}
                </p>

                {ticket.type === "FLIGHT" && ticket.details && (
                  <div className="mt-4 flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {ticket.details.departure?.split(" ")[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.details.departure}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div className="h-0.5 flex-1 bg-gray-300"></div>
                        <Plane className="h-4 w-4 text-primary" />
                        <div className="h-0.5 flex-1 bg-gray-300"></div>
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                      </div>
                      <p className="mt-1 text-center text-xs text-gray-500">
                        {ticket.details.airline} • {ticket.details.flightNumber}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {ticket.details.arrival?.split(" ")[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ticket.details.arrival}
                      </p>
                    </div>
                  </div>
                )}

                {ticket.type === "HOTEL" && ticket.details && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {ticket.details.hotelName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Check-in:{" "}
                        {ticket.details.checkIn &&
                          formatDate(ticket.details.checkIn)}
                      </span>
                      <span>-</span>
                      <span>
                        Check-out:{" "}
                        {ticket.details.checkOut &&
                          formatDate(ticket.details.checkOut)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {ticket.details.roomType}
                    </p>
                  </div>
                )}
              </div>

              {/* Ticket Footer */}
              <div className="flex items-center justify-between border-t border-dashed border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs">Scan QR untuk verifikasi</span>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
