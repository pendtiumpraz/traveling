"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DataTable,
  Column,
  Badge,
  Button,
  Card,
  SidebarModal,
  Input,
  Select,
} from "@/components/ui";
import { Plane, Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface Flight {
  id: string;
  flightNumber: string;
  originCity: string;
  originAirport: string;
  destCity: string;
  destAirport: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  airline: {
    id: string;
    code: string;
    name: string;
    logo: string | null;
  };
  _count: {
    outboundManifests: number;
    returnManifests: number;
  };
}

interface Airline {
  id: string;
  code: string;
  name: string;
}

const initialFormData = {
  airlineId: "",
  flightNumber: "",
  originCity: "",
  originAirport: "",
  destCity: "",
  destAirport: "",
  date: "",
  departureTime: "",
  arrivalTime: "",
};

export default function FlightsPage() {
  const toast = useToast();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(0);
  };

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);

  const fetchFlights = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search && { search }),
      });

      const res = await fetch(`/api/flights?${params}`);
      const data = await res.json();

      if (data.success) {
        setFlights(data.data || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch flights:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search]);

  const fetchAirlines = async () => {
    try {
      const res = await fetch("/api/airlines");
      const data = await res.json();
      if (data.success) {
        setAirlines(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch airlines:", error);
    }
  };

  useEffect(() => {
    fetchFlights();
    fetchAirlines();
  }, [fetchFlights]);

  const handleAdd = () => {
    setEditingFlight(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFormData({
      airlineId: flight.airline.id,
      flightNumber: flight.flightNumber,
      originCity: flight.originCity,
      originAirport: flight.originAirport,
      destCity: flight.destCity,
      destAirport: flight.destAirport,
      date: flight.date.split("T")[0],
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (flight: Flight) => {
    if (!confirm(`Delete flight ${flight.flightNumber}?`)) return;

    try {
      const res = await fetch(`/api/flights?id=${flight.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Flight deleted successfully");
        fetchFlights();
      }
    } catch (error) {
      console.error("Failed to delete flight:", error);
      toast.error("Failed to delete flight");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingFlight ? "PUT" : "POST";
      const body = editingFlight
        ? { id: editingFlight.id, ...formData }
        : formData;

      const res = await fetch("/api/flights", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingFlight ? "Flight updated" : "Flight created");
        setIsModalOpen(false);
        fetchFlights();
      } else {
        toast.error(data.error || "Failed to save flight");
      }
    } catch (error) {
      console.error("Failed to save flight:", error);
      toast.error("Failed to save flight");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Flight>[] = [
    {
      key: "no",
      header: "No",
      width: "60px",
      render: (_, index) => (
        <span className="text-sm text-gray-500">{page * pageSize + index + 1}</span>
      ),
    },
    {
      key: "flightNumber",
      header: "Flight",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.airline.logo ? (
            <img
              src={row.airline.logo}
              alt={row.airline.name}
              className="h-6 w-6 object-contain"
            />
          ) : (
            <Plane className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <p className="font-medium">{row.flightNumber}</p>
            <p className="text-xs text-gray-500">{row.airline.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "route",
      header: "Route",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-medium">{row.originAirport}</p>
            <p className="text-xs text-gray-500">{row.originCity}</p>
          </div>
          <span className="text-gray-400">→</span>
          <div>
            <p className="font-medium">{row.destAirport}</p>
            <p className="text-xs text-gray-500">{row.destCity}</p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium">
            {formatDate(row.date, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (row) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{row.departureTime}</span>
          <span className="text-gray-400">-</span>
          <span>{row.arrivalTime}</span>
        </div>
      ),
    },
    {
      key: "manifests",
      header: "Manifests",
      render: (row) => {
        const total = row._count.outboundManifests + row._count.returnManifests;
        return (
          <Badge variant={total > 0 ? "default" : "secondary"}>
            {total} manifest
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Flight Management</h1>
        <p className="text-gray-500">Manage flight schedules for manifests</p>
      </div>

      <DataTable
        columns={columns}
        data={flights}
        isLoading={isLoading}
        searchPlaceholder="Search flights..."
        onSearch={setSearch}
        addLabel="Add Flight"
        onAdd={handleAdd}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSortChange}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        emptyMessage="No flights found"
      />

      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFlight ? "Edit Flight" : "Add Flight"}
      >
        <div className="space-y-4">
          <Select
            label="Airline *"
            value={formData.airlineId}
            onChange={(e) =>
              setFormData({ ...formData, airlineId: e.target.value })
            }
            options={[
              { value: "", label: "Select airline" },
              ...airlines.map((a) => ({
                value: a.id,
                label: `${a.code} - ${a.name}`,
              })),
            ]}
          />

          <Input
            label="Flight Number *"
            value={formData.flightNumber}
            onChange={(e) =>
              setFormData({ ...formData, flightNumber: e.target.value })
            }
            placeholder="GA 123"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Origin City *"
              value={formData.originCity}
              onChange={(e) =>
                setFormData({ ...formData, originCity: e.target.value })
              }
              placeholder="Jakarta"
            />
            <Input
              label="Origin Airport *"
              value={formData.originAirport}
              onChange={(e) =>
                setFormData({ ...formData, originAirport: e.target.value })
              }
              placeholder="CGK"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Destination City *"
              value={formData.destCity}
              onChange={(e) =>
                setFormData({ ...formData, destCity: e.target.value })
              }
              placeholder="Jeddah"
            />
            <Input
              label="Destination Airport *"
              value={formData.destAirport}
              onChange={(e) =>
                setFormData({ ...formData, destAirport: e.target.value })
              }
              placeholder="JED"
            />
          </div>

          <Input
            label="Date *"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Departure Time *"
              type="time"
              value={formData.departureTime}
              onChange={(e) =>
                setFormData({ ...formData, departureTime: e.target.value })
              }
            />
            <Input
              label="Arrival Time *"
              type="time"
              value={formData.arrivalTime}
              onChange={(e) =>
                setFormData({ ...formData, arrivalTime: e.target.value })
              }
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </SidebarModal>
    </div>
  );
}
