"use client";

import { useState, useEffect } from "react";
import { Card, Button, Badge } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  Plane,
  Users,
  LayoutGrid,
  GanttChart,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { AgendaCalendarView } from "./agenda-view";

interface Schedule {
  id: string;
  departureDate: string;
  returnDate: string;
  quota: number;
  available: number;
  status: string;
  priceQuad: number;
  package: {
    id: string;
    name: string;
    businessType: string;
    duration: number;
  };
}

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function ScheduleCalendarPage() {
  const [viewMode, setViewMode] = useState<"calendar" | "agenda">("agenda");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch("/api/schedules");
        const data = await res.json();
        if (data.success) {
          setSchedules(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      }
    };
    fetchSchedules();
  }, [currentDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getSchedulesForDate = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const dateStr = date.toISOString().split("T")[0];

    return schedules.filter((s) => {
      const depDate = s.departureDate.split("T")[0];
      return depDate === dateStr;
    });
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string, available: number) => {
    if (available === 0 || status === "FULL") return "bg-red-500";
    if (available <= 5) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getBusinessTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      UMROH: "bg-emerald-100 text-emerald-700 border-emerald-200",
      HAJI: "bg-green-100 text-green-700 border-green-200",
      OUTBOUND: "bg-blue-100 text-blue-700 border-blue-200",
      INBOUND: "bg-purple-100 text-purple-700 border-purple-200",
      DOMESTIC: "bg-orange-100 text-orange-700 border-orange-200",
      MICE: "bg-pink-100 text-pink-700 border-pink-200",
      CRUISE: "bg-cyan-100 text-cyan-700 border-cyan-200",
    };
    return colors[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const selectedSchedules = selectedDate
    ? getSchedulesForDate(selectedDate.getDate())
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Schedule Calendar
          </h1>
          <p className="text-gray-500">View departures in calendar format</p>
        </div>
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-2 flex items-center gap-1 text-sm ${
                viewMode === "calendar"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`px-3 py-2 flex items-center gap-1 text-sm ${
                viewMode === "agenda"
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <GanttChart className="h-4 w-4" />
              Agenda
            </button>
          </div>
          <Link href="/dashboard/schedules">
            <Button variant="outline">
              <List className="mr-2 h-4 w-4" />
              List View
            </Button>
          </Link>
          <Link href="/dashboard/schedules/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* Agenda View */}
      {viewMode === "agenda" && <AgendaCalendarView />}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-4 gap-6">
          {/* Calendar */}
          <Card className="col-span-3 p-6">
            {/* Calendar Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={prevMonth}
                  className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={nextMonth}
                  className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}

              {/* Days */}
              {days.map((day, index) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="h-28 bg-gray-50/50"
                    />
                  );
                }

                const daySchedules = getSchedulesForDate(day);
                const hasSchedules = daySchedules.length > 0;

                return (
                  <div
                    key={day}
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day,
                        ),
                      )
                    }
                    className={`h-28 border rounded-lg p-1 cursor-pointer transition-all ${
                      isToday(day)
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-primary/50 hover:bg-gray-50"
                    } ${
                      selectedDate?.getDate() === day &&
                      selectedDate?.getMonth() === currentDate.getMonth()
                        ? "ring-2 ring-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${
                          isToday(day)
                            ? "flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {day}
                      </span>
                      {hasSchedules && (
                        <span className="text-xs text-gray-400">
                          {daySchedules.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      {daySchedules.slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`rounded px-1.5 py-0.5 text-xs truncate border ${getBusinessTypeColor(schedule.package.businessType)}`}
                        >
                          {schedule.package.name.substring(0, 15)}...
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-400 text-center">
                          +{daySchedules.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center gap-6 border-t pt-4">
              <span className="text-sm text-gray-500">Legend:</span>
              {[
                { label: "Umroh", color: "bg-emerald-100 border-emerald-200" },
                { label: "Haji", color: "bg-green-100 border-green-200" },
                { label: "Outbound", color: "bg-blue-100 border-blue-200" },
                { label: "Domestic", color: "bg-orange-100 border-orange-200" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded border ${item.color}`} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Sidebar - Selected Date Details */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedDate
                ? `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                : "Select a Date"}
            </h3>

            {selectedDate && selectedSchedules.length === 0 && (
              <div className="text-center py-8">
                <Plane className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  No departures on this date
                </p>
                <Link href="/dashboard/schedules/new">
                  <Button size="sm" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Schedule
                  </Button>
                </Link>
              </div>
            )}

            {selectedSchedules.length > 0 && (
              <div className="space-y-4">
                {selectedSchedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    href={`/dashboard/schedules?edit=${schedule.id}`}
                    className="block"
                  >
                    <div className="rounded-lg border p-4 hover:border-primary hover:bg-gray-50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          className={getBusinessTypeColor(
                            schedule.package.businessType,
                          )}
                        >
                          {schedule.package.businessType}
                        </Badge>
                        <div
                          className={`h-2 w-2 rounded-full ${getStatusColor(schedule.status, schedule.available)}`}
                        />
                      </div>
                      <h4 className="font-medium text-gray-900 line-clamp-2">
                        {schedule.package.name}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {schedule.available}/{schedule.quota} seats
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {schedule.package.duration} days
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-primary">
                        {formatCurrency(schedule.priceQuad)}/pax
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Upcoming Departures */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-3">
                Upcoming Departures
              </h4>
              <div className="space-y-2">
                {schedules
                  .filter((s) => new Date(s.departureDate) >= today)
                  .sort(
                    (a, b) =>
                      new Date(a.departureDate).getTime() -
                      new Date(b.departureDate).getTime(),
                  )
                  .slice(0, 5)
                  .map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${getStatusColor(schedule.status, schedule.available)}`}
                        />
                        <span className="text-gray-600 truncate max-w-[120px]">
                          {schedule.package.name}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        {new Date(schedule.departureDate).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
