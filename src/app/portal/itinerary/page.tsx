"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  Building2,
  Utensils,
  Camera,
  Bus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  activities: {
    time: string;
    activity: string;
    location?: string;
    type: "flight" | "hotel" | "meal" | "activity" | "transport" | "ibadah";
    description?: string;
  }[];
}

// Mock data - replace with API
const initialItinerary: ItineraryDay[] = [
  {
    day: 1,
    date: "2025-02-15",
    title: "Keberangkatan Jakarta - Jeddah",
    activities: [
      {
        time: "18:00",
        activity: "Berkumpul di Bandara Soekarno-Hatta Terminal 3",
        location: "CGK Terminal 3",
        type: "transport",
      },
      { time: "19:30", activity: "Check-in dan bagasi", type: "transport" },
      {
        time: "22:00",
        activity: "Penerbangan GA 986 Jakarta - Jeddah",
        location: "Garuda Indonesia",
        type: "flight",
      },
    ],
  },
  {
    day: 2,
    date: "2025-02-16",
    title: "Tiba di Jeddah - Makkah",
    activities: [
      {
        time: "05:00",
        activity: "Tiba di Bandara King Abdulaziz Jeddah",
        type: "flight",
      },
      {
        time: "06:30",
        activity: "Imigrasi dan pengambilan bagasi",
        type: "transport",
      },
      {
        time: "08:00",
        activity: "Perjalanan menuju Makkah",
        type: "transport",
        description: "Bus AC full",
      },
      {
        time: "10:00",
        activity: "Check-in Hotel Pullman Zamzam",
        location: "Pullman Zamzam Makkah",
        type: "hotel",
      },
      { time: "11:00", activity: "Istirahat dan persiapan", type: "hotel" },
      { time: "14:00", activity: "Makan siang di hotel", type: "meal" },
      {
        time: "16:00",
        activity: "Umroh Pertama (Thawaf, Sa'i, Tahallul)",
        location: "Masjidil Haram",
        type: "ibadah",
        description: "Didampingi Muthawwif",
      },
      {
        time: "19:00",
        activity: "Sholat Maghrib & Isya berjamaah",
        location: "Masjidil Haram",
        type: "ibadah",
      },
      { time: "20:30", activity: "Makan malam", type: "meal" },
    ],
  },
  {
    day: 3,
    date: "2025-02-17",
    title: "Ibadah di Makkah",
    activities: [
      {
        time: "04:00",
        activity: "Sholat Subuh berjamaah",
        location: "Masjidil Haram",
        type: "ibadah",
      },
      { time: "07:00", activity: "Sarapan di hotel", type: "meal" },
      {
        time: "09:00",
        activity: "Thawaf Sunnah",
        location: "Masjidil Haram",
        type: "ibadah",
      },
      {
        time: "12:00",
        activity: "Sholat Dzuhur berjamaah",
        location: "Masjidil Haram",
        type: "ibadah",
      },
      { time: "13:00", activity: "Makan siang", type: "meal" },
      { time: "15:00", activity: "Istirahat / Ibadah pribadi", type: "ibadah" },
      {
        time: "19:00",
        activity: "Sholat Maghrib & Isya",
        location: "Masjidil Haram",
        type: "ibadah",
      },
    ],
  },
  {
    day: 4,
    date: "2025-02-18",
    title: "City Tour Makkah",
    activities: [
      {
        time: "04:00",
        activity: "Sholat Subuh berjamaah",
        location: "Masjidil Haram",
        type: "ibadah",
      },
      { time: "08:00", activity: "Sarapan", type: "meal" },
      {
        time: "09:00",
        activity: "City Tour: Jabal Rahmah, Muzdalifah, Mina",
        type: "activity",
        description: "Ziarah tempat bersejarah",
      },
      {
        time: "12:00",
        activity: "Sholat Dzuhur di Masjid Namira",
        location: "Arafah",
        type: "ibadah",
      },
      { time: "14:00", activity: "Kembali ke hotel", type: "transport" },
      { time: "16:00", activity: "Istirahat", type: "hotel" },
    ],
  },
];

const tripInfoData = {
  packageName: "Umroh Reguler 9 Hari",
  departureDate: "2025-02-15",
  returnDate: "2025-02-23",
};

export default function PortalItineraryPage() {
  const [itinerary] = useState<ItineraryDay[]>(initialItinerary);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  const tripInfo = tripInfoData;

  const toggleDay = (day: number) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, typeof Plane> = {
      flight: Plane,
      hotel: Building2,
      meal: Utensils,
      activity: Camera,
      transport: Bus,
      ibadah: MapPin,
    };
    const Icon = icons[type] || MapPin;
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      flight: "bg-blue-100 text-blue-600",
      hotel: "bg-purple-100 text-purple-600",
      meal: "bg-orange-100 text-orange-600",
      activity: "bg-green-100 text-green-600",
      transport: "bg-yellow-100 text-yellow-600",
      ibadah: "bg-emerald-100 text-emerald-600",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jadwal Perjalanan</h1>
        <p className="text-gray-500">Itinerary lengkap perjalanan Anda</p>
      </div>

      {/* Trip Info */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
        <h2 className="text-xl font-bold">{tripInfo.packageName}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-white/90">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(tripInfo.departureDate)}
          </span>
          <span>-</span>
          <span>{formatDate(tripInfo.returnDate)}</span>
        </div>
      </div>

      {/* Itinerary Days */}
      <div className="space-y-4">
        {itinerary.map((day) => (
          <div
            key={day.day}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            {/* Day Header */}
            <button
              onClick={() => toggleDay(day.day)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
                  <span className="text-lg font-bold">{day.day}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    {formatDate(day.date)}
                  </p>
                  <h3 className="font-semibold text-gray-900">{day.title}</h3>
                </div>
              </div>
              {expandedDays.includes(day.day) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {/* Day Activities */}
            {expandedDays.includes(day.day) && (
              <div className="border-t border-gray-100 p-4">
                <div className="relative space-y-4 pl-8">
                  {/* Timeline line */}
                  <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-gray-200"></div>

                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-5 flex h-6 w-6 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>

                      {/* Activity content */}
                      <div className="flex-1 rounded-lg bg-gray-50 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {activity.activity}
                            </p>
                            {activity.location && (
                              <p className="text-sm text-gray-500">
                                {activity.location}
                              </p>
                            )}
                            {activity.description && (
                              <p className="mt-1 text-xs text-gray-400">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-sm font-medium text-gray-600">
                            <Clock className="h-4 w-4" />
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
