"use client";

import { useState, useCallback, useEffect } from "react";
import { DataTable, Column, Badge, Button, Card } from "@/components/ui";
import { Eye, Edit, Users, Building, Bed, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface RoomingList {
  id: string;
  manifestId: string;
  manifest: {
    code: string;
    schedule: {
      package: { name: string };
      departureDate: string;
    };
  };
  hotel: {
    name: string;
    city: string;
    starRating: number;
  };
  checkIn: string;
  checkOut: string;
  totalRooms: number;
  _count: { assignments: number };
}

export default function RoomingPage() {
  const [roomingLists, setRoomingLists] = useState<RoomingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchRoomingLists = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data for now - will be replaced with actual API
      await new Promise((r) => setTimeout(r, 500));
      setRoomingLists([
        {
          id: "1",
          manifestId: "m1",
          manifest: {
            code: "MNF-2024-001",
            schedule: {
              package: { name: "Umrah Ramadhan 2024" },
              departureDate: "2024-03-15",
            },
          },
          hotel: { name: "Hilton Makkah", city: "Makkah", starRating: 5 },
          checkIn: "2024-03-16",
          checkOut: "2024-03-20",
          totalRooms: 25,
          _count: { assignments: 48 },
        },
        {
          id: "2",
          manifestId: "m1",
          manifest: {
            code: "MNF-2024-001",
            schedule: {
              package: { name: "Umrah Ramadhan 2024" },
              departureDate: "2024-03-15",
            },
          },
          hotel: { name: "Movenpick Madinah", city: "Madinah", starRating: 5 },
          checkIn: "2024-03-20",
          checkOut: "2024-03-24",
          totalRooms: 25,
          _count: { assignments: 48 },
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
    fetchRoomingLists();
  }, [fetchRoomingLists]);

  const columns: Column<RoomingList>[] = [
    {
      key: "manifest",
      header: "Manifest",
      render: (row) => (
        <div>
          <p className="font-mono text-xs text-primary">{row.manifest.code}</p>
          <p className="text-sm font-medium">
            {row.manifest.schedule.package.name}
          </p>
        </div>
      ),
    },
    {
      key: "hotel",
      header: "Hotel",
      render: (row) => (
        <div>
          <p className="font-medium">{row.hotel.name}</p>
          <p className="text-xs text-gray-500">
            {row.hotel.city} - {"⭐".repeat(row.hotel.starRating)}
          </p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Period",
      render: (row) => (
        <div className="text-sm">
          <p>{formatDate(row.checkIn, { day: "numeric", month: "short" })}</p>
          <p className="text-gray-500">
            to {formatDate(row.checkOut, { day: "numeric", month: "short" })}
          </p>
        </div>
      ),
    },
    {
      key: "rooms",
      header: "Rooms",
      width: "100px",
      render: (row) => (
        <div className="text-center">
          <p className="text-lg font-bold">{row.totalRooms}</p>
          <p className="text-xs text-gray-500">rooms</p>
        </div>
      ),
    },
    {
      key: "guests",
      header: "Guests",
      width: "100px",
      render: (row) => (
        <div className="text-center">
          <p className="text-lg font-bold">{row._count.assignments}</p>
          <p className="text-xs text-gray-500">assigned</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (row) => (
        <div className="flex gap-1">
          <Link href={`/dashboard/operations/rooming/${row.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
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
          <h1 className="text-2xl font-bold text-gray-900">Rooming List</h1>
          <p className="text-gray-500">Manage hotel room assignments</p>
        </div>
        <Link href="/dashboard/operations">
          <Button variant="outline">Back to Operations</Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roomingLists.length}</p>
              <p className="text-sm text-gray-500">Hotels</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Bed className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {roomingLists.reduce((s, r) => s + r.totalRooms, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Rooms</p>
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
                {roomingLists.reduce((s, r) => s + r._count.assignments, 0)}
              </p>
              <p className="text-sm text-gray-500">Guests Assigned</p>
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={roomingLists}
        isLoading={isLoading}
        addLabel="Create Rooming"
        onAdd={() => {}}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No rooming lists found"
      />
    </div>
  );
}
