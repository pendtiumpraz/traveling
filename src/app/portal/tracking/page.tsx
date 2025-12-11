"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Battery,
  Heart,
  Footprints,
  AlertTriangle,
  RefreshCw,
  Smartphone,
} from "lucide-react";

interface TrackingData {
  latitude: number;
  longitude: number;
  lastUpdate: string;
  battery: number;
  heartRate: number;
  steps: number;
  status: "ONLINE" | "OFFLINE";
  location: string;
  inGeofence: boolean;
}

export default function PortalTrackingPage() {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceConnected, setDeviceConnected] = useState(false);

  useEffect(() => {
    // Mock data - replace with real tracking API
    setTimeout(() => {
      setTracking({
        latitude: 21.4225,
        longitude: 39.8262,
        lastUpdate: new Date().toISOString(),
        battery: 78,
        heartRate: 72,
        steps: 8543,
        status: "ONLINE",
        location: "Masjidil Haram, Makkah",
        inGeofence: true,
      });
      setDeviceConnected(true);
      setLoading(false);
    }, 1000);
  }, []);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="h-96 animate-pulse rounded-xl bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Tracking</h1>
          <p className="text-gray-500">Pantau lokasi Anda secara real-time</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Device Status */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${deviceConnected ? "bg-green-100" : "bg-gray-100"}`}
            >
              <Smartphone
                className={`h-6 w-6 ${deviceConnected ? "text-green-600" : "text-gray-400"}`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Huawei Watch GT 3</h3>
              <p className="text-sm text-gray-500">
                {deviceConnected ? "Terhubung" : "Tidak terhubung"}
              </p>
            </div>
          </div>
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              tracking?.status === "ONLINE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                tracking?.status === "ONLINE" ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            {tracking?.status}
          </span>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative h-80 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-primary" />
            <p className="mt-2 font-medium text-gray-900">
              {tracking?.location}
            </p>
            <p className="text-sm text-gray-500">
              {tracking?.latitude.toFixed(4)}, {tracking?.longitude.toFixed(4)}
            </p>
          </div>
        </div>

        {/* Map overlay - in real app, use Google Maps / Mapbox */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-lg bg-white/90 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-900">
                  {tracking?.location}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Update: {tracking && formatTime(tracking.lastUpdate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Battery className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tracking?.battery}%
              </p>
              <p className="text-sm text-gray-500">Baterai</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tracking?.heartRate}
              </p>
              <p className="text-sm text-gray-500">Detak Jantung (bpm)</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Footprints className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tracking?.steps.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Langkah Hari Ini</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 ${tracking?.inGeofence ? "bg-green-100" : "bg-red-100"}`}
            >
              <MapPin
                className={`h-5 w-5 ${tracking?.inGeofence ? "text-green-600" : "text-red-600"}`}
              />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {tracking?.inGeofence ? "Aman" : "Keluar"}
              </p>
              <p className="text-sm text-gray-500">Status Geofence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Geofence Warning */}
      {!tracking?.inGeofence && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">
                Peringatan Geofence
              </h3>
              <p className="text-sm text-red-700">
                Anda berada di luar area yang ditentukan. Harap kembali ke zona
                aman atau hubungi Tour Leader.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-gray-900">Kontak Darurat</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-500">Tour Leader</p>
            <p className="font-medium text-gray-900">Ustadz Ahmad</p>
            <a
              href="tel:+6281234567890"
              className="text-sm text-primary hover:underline"
            >
              +62 812 3456 7890
            </a>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-500">Kantor Pusat</p>
            <p className="font-medium text-gray-900">PT Travel Indonesia</p>
            <a
              href="tel:+622112345678"
              className="text-sm text-primary hover:underline"
            >
              +62 21 1234 5678
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
