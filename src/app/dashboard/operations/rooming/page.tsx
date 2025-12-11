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
import { Hotel, Plus, Edit, Trash2, Users, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface RoomingData {
  id: string;
  roomNumber: string;
  roomType: string;
  checkIn: string | null;
  checkOut: string | null;
  manifest: {
    id: string;
    code: string;
    name: string;
  };
  hotel: {
    id: string;
    name: string;
    stars: number;
    city: { name: string } | null;
  };
  customer: {
    id: string;
    code: string;
    fullName: string;
    phone: string;
    gender: string | null;
  };
}

interface GroupedRoom {
  hotelId: string;
  hotelName: string;
  hotelStars: number;
  roomNumber: string;
  roomType: string;
  checkIn: string | null;
  checkOut: string | null;
  guests: Array<{
    id: string;
    customerId: string;
    customerCode: string;
    customerName: string;
    phone: string;
    gender: string | null;
  }>;
}

interface Manifest {
  id: string;
  code: string;
  name: string;
}

interface Hotel {
  id: string;
  name: string;
  stars: number;
}

const roomTypeOptions = [
  { value: "QUAD", label: "Quad (4 pax)" },
  { value: "TRIPLE", label: "Triple (3 pax)" },
  { value: "DOUBLE", label: "Double (2 pax)" },
  { value: "TWIN", label: "Twin (2 pax)" },
  { value: "SINGLE", label: "Single (1 pax)" },
];

export default function RoomingPage() {
  const toast = useToast();
  const [rooming, setRooming] = useState<RoomingData[]>([]);
  const [groupedRooms, setGroupedRooms] = useState<GroupedRoom[]>([]);
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedManifest, setSelectedManifest] = useState("");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    manifestId: "",
    hotelId: "",
    customerId: "",
    roomNumber: "",
    roomType: "DOUBLE",
    checkIn: "",
    checkOut: "",
  });

  // Participants for assignment
  const [participants, setParticipants] = useState<
    Array<{
      id: string;
      customerId: string;
      customer: { fullName: string };
    }>
  >([]);

  const fetchManifests = async () => {
    try {
      const res = await fetch(
        "/api/manifests?status=CONFIRMED,DEPARTED,IN_PROGRESS",
      );
      const data = await res.json();
      if (data.success) {
        setManifests(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch manifests:", error);
    }
  };

  const fetchHotels = async () => {
    try {
      const res = await fetch("/api/hotels");
      const data = await res.json();
      if (data.success) {
        setHotels(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    }
  };

  const fetchRooming = useCallback(async () => {
    if (!selectedManifest) {
      setRooming([]);
      setGroupedRooms([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/rooming?manifestId=${selectedManifest}`);
      const data = await res.json();

      if (data.success) {
        setRooming(data.data?.list || []);
        setGroupedRooms(data.data?.grouped || []);
      }
    } catch (error) {
      console.error("Failed to fetch rooming:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedManifest]);

  const fetchParticipants = async (manifestId: string) => {
    try {
      const res = await fetch(`/api/manifests/${manifestId}/participants`);
      const data = await res.json();
      if (data.success) {
        setParticipants(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    }
  };

  useEffect(() => {
    fetchManifests();
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchRooming();
    if (selectedManifest) {
      fetchParticipants(selectedManifest);
    }
  }, [fetchRooming, selectedManifest]);

  const handleAdd = () => {
    setFormData({
      manifestId: selectedManifest,
      hotelId: "",
      customerId: "",
      roomNumber: "",
      roomType: "DOUBLE",
      checkIn: "",
      checkOut: "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (roomingId: string) => {
    if (!confirm("Remove this room assignment?")) return;

    try {
      const res = await fetch(`/api/rooming?id=${roomingId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Room assignment removed");
        fetchRooming();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to remove assignment");
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedManifest || hotels.length === 0) {
      toast.error("Please select a manifest and ensure hotels are available");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/rooming", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manifestId: selectedManifest,
          hotelId: hotels[0].id,
          startRoomNumber: 101,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchRooming();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Auto-assign error:", error);
      toast.error("Failed to auto-assign rooms");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.hotelId || !formData.customerId || !formData.roomNumber) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/rooming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Room assigned successfully");
        setIsModalOpen(false);
        fetchRooming();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to assign room");
    } finally {
      setSaving(false);
    }
  };

  // Get unassigned participants
  const assignedCustomerIds = rooming.map((r) => r.customer.id);
  const unassignedParticipants = participants.filter(
    (p) => !assignedCustomerIds.includes(p.customerId),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooming List</h1>
          <p className="text-gray-500">Manage room assignments for trips</p>
        </div>
      </div>

      {/* Manifest Selection */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select
              label="Select Manifest"
              value={selectedManifest}
              onChange={(e) => setSelectedManifest(e.target.value)}
              options={[
                { value: "", label: "-- Select Manifest --" },
                ...manifests.map((m) => ({
                  value: m.id,
                  label: `${m.code} - ${m.name}`,
                })),
              ]}
            />
          </div>
          {selectedManifest && (
            <>
              <Button
                variant="outline"
                onClick={handleAutoAssign}
                disabled={saving}
              >
                Auto-Assign Rooms
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Assign Room
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Stats */}
      {selectedManifest && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{participants.length}</p>
                <p className="text-sm text-gray-500">Total Participants</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Hotel className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rooming.length}</p>
                <p className="text-sm text-gray-500">Assigned</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {unassignedParticipants.length}
                </p>
                <p className="text-sm text-gray-500">Unassigned</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Hotel className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{groupedRooms.length}</p>
                <p className="text-sm text-gray-500">Rooms Used</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Room List */}
      {selectedManifest ? (
        isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : groupedRooms.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {groupedRooms.map((room, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge variant="default">Room {room.roomNumber}</Badge>
                    <p className="mt-1 font-medium text-gray-900">
                      {room.hotelName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {"★".repeat(room.hotelStars)} · {room.roomType}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {room.guests.map((guest) => (
                    <div
                      key={guest.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {guest.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {guest.gender === "M"
                            ? "Male"
                            : guest.gender === "F"
                              ? "Female"
                              : "-"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => handleDelete(guest.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Hotel className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No Room Assignments
            </h3>
            <p className="mt-2 text-gray-500">
              Start by assigning rooms or use auto-assign feature.
            </p>
          </Card>
        )
      ) : (
        <Card className="p-12 text-center">
          <Hotel className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Select a Manifest
          </h3>
          <p className="mt-2 text-gray-500">
            Please select a manifest to view and manage room assignments.
          </p>
        </Card>
      )}

      {/* Assign Room Modal */}
      <SidebarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Room"
      >
        <div className="space-y-4">
          <Select
            label="Hotel *"
            value={formData.hotelId}
            onChange={(e) =>
              setFormData({ ...formData, hotelId: e.target.value })
            }
            options={[
              { value: "", label: "Select hotel" },
              ...hotels.map((h) => ({
                value: h.id,
                label: `${h.name} (${"★".repeat(h.stars)})`,
              })),
            ]}
          />

          <Select
            label="Participant *"
            value={formData.customerId}
            onChange={(e) =>
              setFormData({ ...formData, customerId: e.target.value })
            }
            options={[
              { value: "", label: "Select participant" },
              ...unassignedParticipants.map((p) => ({
                value: p.customerId,
                label: p.customer.fullName,
              })),
            ]}
          />

          <Input
            label="Room Number *"
            value={formData.roomNumber}
            onChange={(e) =>
              setFormData({ ...formData, roomNumber: e.target.value })
            }
            placeholder="101"
          />

          <Select
            label="Room Type"
            value={formData.roomType}
            onChange={(e) =>
              setFormData({ ...formData, roomType: e.target.value })
            }
            options={roomTypeOptions}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Check In"
              type="date"
              value={formData.checkIn}
              onChange={(e) =>
                setFormData({ ...formData, checkIn: e.target.value })
              }
            />
            <Input
              label="Check Out"
              type="date"
              value={formData.checkOut}
              onChange={(e) =>
                setFormData({ ...formData, checkOut: e.target.value })
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
              {saving ? "Saving..." : "Assign Room"}
            </Button>
          </div>
        </div>
      </SidebarModal>
    </div>
  );
}
