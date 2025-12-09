"use client";

import { useState, useCallback, useEffect } from "react";
import { DataTable, Column, Badge, Button, Card } from "@/components/ui";
import { Eye, Edit, Plane, Clock, Users, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Flight {
  id: string;
  flightNumber: string;
  airline: {
    name: string;
    code: string;
  };
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  manifest: {
    code: string;
    schedule: { package: { name: string } };
  };
  _count: { passengers: number };
}

const statusColors: Record<
  string,
  "secondary" | "warning" | "success" | "destructive"
> = {
  SCHEDULED: "secondary",
  BOARDING: "warning",
  DEPARTED: "success",
  ARRIVED: "success",
  DELAYED: "destructive",
  CANCELLED: "destructive",
};

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data for now
      await new Promise((r) => setTimeout(r, 500));
      setFlights([
        {
          id: "1",
          flightNumber: "SV-123",
          airline: { name: "Saudia", code: "SV" },
          origin: "CGK",
          destination: "JED",
          departureTime: "2024-03-15T08:00:00",
          arrivalTime: "2024-03-15T14:30:00",
          status: "SCHEDULED",
          manifest: {
            code: "MNF-2024-001",
            schedule: { package: { name: "Umrah Ramadhan 2024" } },
          },
          _count: { passengers: 45 },
        },
        {
          id: "2",
          flightNumber: "GA-988",
          airline: { name: "Garuda Indonesia", code: "GA" },
          origin: "JED",
          destination: "CGK",
          departureTime: "2024-03-25T22:00:00",
          arrivalTime: "2024-03-26T12:30:00",
          status: "SCHEDULED",
          manifest: {
            code: "MNF-2024-001",
            schedule: { package: { name: "Umrah Ramadhan 2024" } },
          },
          _count: { passengers: 45 },
        },
      ]);
      setTotal(2);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const columns: Column<Flight>[] = [
    {
      key: "flight",
      header: "Flight",
      render: (row) => (
        <div>
          <p className="font-mono text-lg font-bold text-primary">
            {row.flightNumber}
          </p>
          <p className="text-xs text-gray-500">{row.airline.name}</p>
        </div>
      ),
    },
    {
      key: "route",
      header: "Route",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-medium">{row.origin}</span>
          <Plane className="h-4 w-4 text-gray-400" />
          <span className="font-mono font-medium">{row.destination}</span>
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium">
            {formatDate(row.departureTime, {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <p className="text-gray-500">
            Arr:{" "}
            {formatDate(row.arrivalTime, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "manifest",
      header: "Manifest",
      render: (row) => (
        <div>
          <p className="font-mono text-xs">{row.manifest.code}</p>
          <p className="text-xs text-gray-500">
            {row.manifest.schedule.package.name}
          </p>
        </div>
      ),
    },
    {
      key: "passengers",
      header: "PAX",
      width: "80px",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{row._count.passengers}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "110px",
      render: (row) => (
        <Badge variant={statusColors[row.status]}>{row.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
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
          <h1 className="text-2xl font-bold text-gray-900">
            Flight Management
          </h1>
          <p className="text-gray-500">
            Manage flight schedules and passengers
          </p>
        </div>
        <Link href="/dashboard/operations">
          <Button variant="outline">Back to Operations</Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Plane className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{flights.length}</p>
              <p className="text-sm text-gray-500">Total Flights</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {flights.reduce((s, f) => s + f._count.passengers, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Passengers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {flights.filter((f) => f.status === "SCHEDULED").length}
              </p>
              <p className="text-sm text-gray-500">Upcoming</p>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={flights}
        isLoading={isLoading}
        addLabel="Add Flight"
        onAdd={() => {}}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No flights found"
      />
    </div>
  );
}
