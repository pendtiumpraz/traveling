"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Button, Badge } from "@/components/ui";
import {
  MapPin,
  Users,
  Clock,
  Wifi,
  Battery,
  Signal,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Phone,
  Navigation,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TrackingGroup {
  id: string;
  code: string;
  name: string;
  manifestCode: string;
  businessType: string;
  departureDate: string;
  returnDate: string;
  leader: string | null;
  status: string;
  totalMembers: number;
  onlineMembers: number;
  centerPoint: { lat: number; lng: number } | null;
  members: Array<{
    id: string;
    name: string;
    phone: string | null;
    photo: string | null;
    location: {
      latitude: number;
      longitude: number;
      timestamp: string;
      source: string;
    } | null;
    device: {
      id: string;
      type: string;
      status: string;
      batteryLevel: number | null;
      signalStrength: number | null;
      lastSeen: string | null;
    } | null;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
    latitude: number | null;
    longitude: number | null;
  }>;
  geofences: Array<{
    id: string;
    name: string;
    type: string;
    coordinates: unknown;
    radius: number | null;
  }>;
}

interface TrackingSummary {
  totalGroups: number;
  totalMembers: number;
  onlineMembers: number;
  activeAlerts: number;
  criticalAlerts: number;
}

const statusColors: Record<
  string,
  "success" | "warning" | "default" | "secondary" | "destructive"
> = {
  ACTIVE: "success",
  TRANSIT: "default",
  PARTIAL: "warning",
  OFFLINE: "secondary",
};

const alertSeverityColors: Record<string, string> = {
  LOW: "bg-blue-50 text-blue-700 border-blue-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

export default function TrackingPage() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [summary, setSummary] = useState<TrackingSummary | null>(null);
  const [groups, setGroups] = useState<TrackingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrackingData = useCallback(async () => {
    try {
      const res = await fetch("/api/tracking/live");
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
        setGroups(data.data.groups);
      }
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackingData();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchTrackingData, 30000);
    return () => clearInterval(interval);
  }, [fetchTrackingData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrackingData();
  };

  const selectedGroupData = groups.find((g) => g.id === selectedGroup);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
          <p className="text-gray-500">Monitor group locations in real-time</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary?.totalGroups || 0}</p>
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
              <p className="text-2xl font-bold">{summary?.totalMembers || 0}</p>
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
                {summary?.onlineMembers || 0}
              </p>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary?.activeAlerts || 0}</p>
              <p className="text-sm text-gray-500">Active Alerts</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {summary?.criticalAlerts || 0}
              </p>
              <p className="text-sm text-gray-500">Critical</p>
            </div>
          </div>
        </Card>
      </div>

      {groups.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No Active Trips
          </h3>
          <p className="mt-2 text-gray-500">
            There are no groups currently on trip. Tracking will appear when a
            manifest is in DEPARTED or IN_PROGRESS status.
          </p>
        </Card>
      ) : (
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
                  {selectedGroupData?.centerPoint && (
                    <p className="mt-2 text-sm text-gray-600">
                      Center: {selectedGroupData.centerPoint.lat.toFixed(4)},{" "}
                      {selectedGroupData.centerPoint.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Group List */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">
              Groups ({groups.length})
            </h2>
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
                    <p className="font-medium text-gray-900">{group.name}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {group.manifestCode}
                    </p>
                  </div>
                  <Badge
                    variant={statusColors[group.status] || "default"}
                    size="sm"
                  >
                    {group.status}
                  </Badge>
                </div>

                <div className="mb-3 text-sm text-gray-600">
                  <p>
                    {formatDate(group.departureDate)} -{" "}
                    {formatDate(group.returnDate)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>
                      {group.onlineMembers}/{group.totalMembers} online
                    </span>
                  </div>
                  {group.leader && <span>Leader: {group.leader}</span>}
                </div>

                {group.alerts.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs font-medium text-red-600">
                      {group.alerts.length} active alert(s)
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Selected Group Details */}
      {selectedGroupData && (
        <div className="grid grid-cols-2 gap-6">
          {/* Members List */}
          <Card className="p-4">
            <h2 className="mb-4 font-semibold text-gray-900">
              Members ({selectedGroupData.members.length})
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {selectedGroupData.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        member.device?.status === "ACTIVE"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      {member.phone && (
                        <p className="text-xs text-gray-500">{member.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.device && (
                      <>
                        <div className="flex items-center gap-1 text-xs">
                          <Battery
                            className={`h-3 w-3 ${
                              (member.device.batteryLevel || 0) > 50
                                ? "text-green-500"
                                : (member.device.batteryLevel || 0) > 20
                                  ? "text-amber-500"
                                  : "text-red-500"
                            }`}
                          />
                          {member.device.batteryLevel || 0}%
                        </div>
                        {member.device.signalStrength && (
                          <div className="flex items-center gap-1 text-xs">
                            <Signal className="h-3 w-3 text-gray-400" />
                            {member.device.signalStrength}/5
                          </div>
                        )}
                      </>
                    )}
                    {member.location && (
                      <button className="rounded p-1 hover:bg-gray-100">
                        <Navigation className="h-4 w-4 text-blue-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Alerts */}
          <Card className="p-4">
            <h2 className="mb-4 font-semibold text-gray-900">
              Alerts ({selectedGroupData.alerts.length})
            </h2>
            {selectedGroupData.alerts.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedGroupData.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-3 ${alertSeverityColors[alert.severity]}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm">{alert.message}</p>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {alert.type}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span>{formatDate(alert.createdAt)}</span>
                      {alert.latitude && alert.longitude && (
                        <button className="flex items-center gap-1 text-blue-600 hover:underline">
                          <MapPin className="h-3 w-3" />
                          View Location
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center text-gray-500">
                No active alerts
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
