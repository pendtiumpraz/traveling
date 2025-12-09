"use client";

import { useState } from "react";
import { Card, Button, Badge } from "@/components/ui";
import {
  MapPin,
  Users,
  Clock,
  Wifi,
  Battery,
  Signal,
  RefreshCw,
} from "lucide-react";

interface GroupLocation {
  id: string;
  groupName: string;
  manifestCode: string;
  location: string;
  coordinates: { lat: number; lng: number };
  lastUpdate: string;
  members: number;
  leader: string;
  status: "ACTIVE" | "RESTING" | "TRANSIT" | "OFFLINE";
  batteryLevel: number;
  signalStrength: number;
}

export default function TrackingPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const groups: GroupLocation[] = [
    {
      id: "1",
      groupName: "Group A - Umrah Ramadhan",
      manifestCode: "MNF-2024-001",
      location: "Masjidil Haram, Makkah",
      coordinates: { lat: 21.4225, lng: 39.8262 },
      lastUpdate: "2 minutes ago",
      members: 45,
      leader: "Ustadz Ahmad",
      status: "ACTIVE",
      batteryLevel: 85,
      signalStrength: 4,
    },
    {
      id: "2",
      groupName: "Group B - Umrah Plus",
      manifestCode: "MNF-2024-002",
      location: "Masjid Nabawi, Madinah",
      coordinates: { lat: 24.4672, lng: 39.6112 },
      lastUpdate: "5 minutes ago",
      members: 38,
      leader: "Ustadz Budi",
      status: "RESTING",
      batteryLevel: 62,
      signalStrength: 3,
    },
    {
      id: "3",
      groupName: "Group C - Tour Turki",
      manifestCode: "MNF-2024-003",
      location: "Hagia Sophia, Istanbul",
      coordinates: { lat: 41.0086, lng: 28.9802 },
      lastUpdate: "10 minutes ago",
      members: 25,
      leader: "Guide Fatih",
      status: "TRANSIT",
      batteryLevel: 45,
      signalStrength: 5,
    },
  ];

  const statusColors: Record<
    string,
    "success" | "warning" | "default" | "secondary"
  > = {
    ACTIVE: "success",
    RESTING: "warning",
    TRANSIT: "default",
    OFFLINE: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
          <p className="text-gray-500">Monitor group locations in real-time</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{groups.length}</p>
              <p className="text-sm text-gray-500">Active Groups</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {groups.reduce((s, g) => s + g.members, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Members</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Wifi className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {groups.filter((g) => g.status !== "OFFLINE").length}
              </p>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="col-span-2">
          <Card className="h-[500px] overflow-hidden">
            <div className="flex h-full items-center justify-center bg-gray-100">
              <div className="text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">Map View</p>
                <p className="text-sm text-gray-400">
                  Google Maps integration required
                </p>
                <p className="mt-4 text-xs text-gray-400">
                  Add GOOGLE_MAPS_API_KEY to enable live map
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Group List */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Groups</h2>
          {groups.map((group) => (
            <Card
              key={group.id}
              className={`cursor-pointer p-4 transition-all hover:shadow-md ${
                selectedGroup === group.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedGroup(group.id)}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{group.groupName}</p>
                  <p className="font-mono text-xs text-gray-500">
                    {group.manifestCode}
                  </p>
                </div>
                <Badge variant={statusColors[group.status]} size="sm">
                  {group.status}
                </Badge>
              </div>

              <div className="mb-3 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{group.location}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{group.members} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{group.lastUpdate}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Battery
                      className={`h-4 w-4 ${group.batteryLevel > 50 ? "text-green-500" : group.batteryLevel > 20 ? "text-amber-500" : "text-red-500"}`}
                    />
                    <span className="text-xs">{group.batteryLevel}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Signal className="h-4 w-4 text-gray-400" />
                    <span className="text-xs">{group.signalStrength}/5</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  Leader: {group.leader}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Alert Section */}
      <Card className="p-4">
        <h2 className="mb-4 font-semibold text-gray-900">Recent Alerts</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
            <div className="rounded-full bg-amber-100 p-1">
              <Battery className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                Low Battery Warning
              </p>
              <p className="text-xs text-amber-600">
                Group C device battery below 50%
              </p>
            </div>
            <span className="text-xs text-amber-500">15 min ago</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
            <div className="rounded-full bg-blue-100 p-1">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Geofence Alert
              </p>
              <p className="text-xs text-blue-600">
                Group A entered Masjidil Haram area
              </p>
            </div>
            <span className="text-xs text-blue-500">30 min ago</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
