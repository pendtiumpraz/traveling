"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, Badge, Button } from "@/components/ui";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plane,
  Users,
  MapPin,
  Clock,
  Hotel,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface PackageItinerary {
  day: number;
  title: { id?: string; en?: string };
  description: { id?: string; en?: string };
  activities: string[];
  meals: string[];
  hotel: string | null;
}

interface Schedule {
  id: string;
  departureDate: string;
  returnDate: string;
  quota: number;
  availableQuota: number;
  status: string;
  package: {
    id: string;
    code: string;
    name: { id?: string; en?: string };
    type: string;
    duration: number;
    nights: number;
    priceQuad: number;
    priceDouble: number;
    destinations: string[];
    inclusions: { id?: string[]; en?: string[] };
    itinerary?: PackageItinerary[];
  };
  _count?: {
    bookings: number;
    manifests: number;
  };
}

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

const BUSINESS_TYPE_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  UMROH: {
    bg: "bg-emerald-100",
    border: "border-emerald-400",
    text: "text-emerald-700",
  },
  HAJI: {
    bg: "bg-green-100",
    border: "border-green-400",
    text: "text-green-700",
  },
  OUTBOUND: {
    bg: "bg-blue-100",
    border: "border-blue-400",
    text: "text-blue-700",
  },
  INBOUND: {
    bg: "bg-purple-100",
    border: "border-purple-400",
    text: "text-purple-700",
  },
  DOMESTIC: {
    bg: "bg-orange-100",
    border: "border-orange-400",
    text: "text-orange-700",
  },
  MICE: { bg: "bg-pink-100", border: "border-pink-400", text: "text-pink-700" },
  CRUISE: {
    bg: "bg-cyan-100",
    border: "border-cyan-400",
    text: "text-cyan-700",
  },
  CUSTOM: {
    bg: "bg-gray-100",
    border: "border-gray-400",
    text: "text-gray-700",
  },
};

export function AgendaCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [expandedItinerary, setExpandedItinerary] = useState<string | null>(
    null,
  );

  // Fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          pageSize: "100",
        });

        const res = await fetch(`/api/schedules?${params}`);
        const data = await res.json();
        if (data.success) {
          setSchedules(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [currentDate]);

  // Generate days of the month
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  }, [currentDate]);

  // Group schedules by rows (avoid overlap)
  const scheduleRows = useMemo(() => {
    const rows: Schedule[][] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Filter schedules that overlap with current month
    const monthSchedules = schedules.filter((s) => {
      const depDate = new Date(s.departureDate);
      const retDate = new Date(s.returnDate);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      return depDate <= monthEnd && retDate >= monthStart;
    });

    // Sort by departure date
    monthSchedules.sort(
      (a, b) =>
        new Date(a.departureDate).getTime() -
        new Date(b.departureDate).getTime(),
    );

    // Assign to rows (avoid overlap)
    for (const schedule of monthSchedules) {
      const depDate = new Date(schedule.departureDate);
      const retDate = new Date(schedule.returnDate);

      let placed = false;
      for (const row of rows) {
        const lastInRow = row[row.length - 1];
        const lastEnd = new Date(lastInRow.returnDate);
        if (depDate > lastEnd) {
          row.push(schedule);
          placed = true;
          break;
        }
      }
      if (!placed) {
        rows.push([schedule]);
      }
    }

    return rows;
  }, [schedules, currentDate]);

  // Calculate bar position and width
  const getBarStyle = (schedule: Schedule) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth.length;

    const depDate = new Date(schedule.departureDate);
    const retDate = new Date(schedule.returnDate);
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    // Clamp dates to current month
    const startDay = depDate < monthStart ? 1 : depDate.getDate();
    const endDay = retDate > monthEnd ? daysCount : retDate.getDate();

    const left = ((startDay - 1) / daysCount) * 100;
    const width = ((endDay - startDay + 1) / daysCount) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const getStatusBadge = (status: string, available: number, quota: number) => {
    const percent = (available / quota) * 100;
    if (status === "FULL" || available === 0)
      return { variant: "destructive" as const, label: "FULL" };
    if (status === "DEPARTED")
      return { variant: "secondary" as const, label: "DEPARTED" };
    if (status === "COMPLETED")
      return { variant: "default" as const, label: "DONE" };
    if (percent <= 20)
      return { variant: "warning" as const, label: "ALMOST FULL" };
    return { variant: "success" as const, label: "OPEN" };
  };

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  const goToToday = () => setCurrentDate(new Date());

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getDate()} ${MONTHS[s.getMonth()].slice(0, 3)} - ${e.getDate()} ${MONTHS[e.getMonth()].slice(0, 3)} ${e.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3 text-sm">
            {Object.entries(BUSINESS_TYPE_COLORS)
              .slice(0, 5)
              .map(([type, colors]) => (
                <div key={type} className="flex items-center gap-1">
                  <div
                    className={`h-3 w-8 rounded ${colors.bg} ${colors.border} border`}
                  />
                  <span className="text-gray-500 text-xs">{type}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Gantt Calendar */}
        <Card className="col-span-3 p-4 overflow-hidden">
          {/* Day Headers */}
          <div className="flex border-b pb-2 mb-2">
            <div className="w-48 flex-shrink-0 text-sm font-medium text-gray-500 px-2">
              Package
            </div>
            <div className="flex-1 flex">
              {daysInMonth.map((day) => {
                const isToday =
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();
                const isWeekend =
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day,
                  ).getDay() %
                    6 ===
                  0;
                return (
                  <div
                    key={day}
                    className={`flex-1 text-center text-xs font-medium py-1 ${
                      isToday
                        ? "bg-primary text-white rounded"
                        : isWeekend
                          ? "text-red-400"
                          : "text-gray-400"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Rows */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : scheduleRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Plane className="h-12 w-12 mb-2" />
              <p>No schedules this month</p>
            </div>
          ) : (
            <div className="space-y-1">
              {scheduleRows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex min-h-[48px] items-center">
                  {/* Package Labels */}
                  <div className="w-48 flex-shrink-0 space-y-1 px-2">
                    {row.map((schedule) => (
                      <div key={schedule.id} className="text-xs truncate">
                        <span className="font-medium">
                          {schedule.package.code}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Bars Container */}
                  <div className="flex-1 relative h-12">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {daysInMonth.map((day) => (
                        <div
                          key={day}
                          className="flex-1 border-l border-gray-100"
                        />
                      ))}
                    </div>
                    {/* Schedule Bars */}
                    {row.map((schedule) => {
                      const style = getBarStyle(schedule);
                      const colors =
                        BUSINESS_TYPE_COLORS[schedule.package.type] ||
                        BUSINESS_TYPE_COLORS.CUSTOM;
                      const statusBadge = getStatusBadge(
                        schedule.status,
                        schedule.availableQuota,
                        schedule.quota,
                      );

                      return (
                        <div
                          key={schedule.id}
                          onClick={() => setSelectedSchedule(schedule)}
                          className={`absolute top-1 h-10 rounded-md border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${colors.bg} ${colors.border} ${
                            selectedSchedule?.id === schedule.id
                              ? "ring-2 ring-primary ring-offset-1"
                              : ""
                          }`}
                          style={{
                            left: style.left,
                            width: style.width,
                            minWidth: "60px",
                          }}
                        >
                          <div className="px-2 py-1 h-full flex flex-col justify-center overflow-hidden">
                            <div
                              className={`text-xs font-semibold truncate ${colors.text}`}
                            >
                              {typeof schedule.package.name === "object"
                                ? schedule.package.name.id ||
                                  schedule.package.name.en
                                : schedule.package.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                              <span className="flex items-center gap-0.5">
                                <Users className="h-3 w-3" />
                                {schedule.availableQuota}/{schedule.quota}
                              </span>
                              <Badge
                                variant={statusBadge.variant}
                                className="text-[9px] px-1 py-0 h-4"
                              >
                                {statusBadge.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Detail Sidebar */}
        <Card className="p-4">
          {selectedSchedule ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Badge
                  className={`${BUSINESS_TYPE_COLORS[selectedSchedule.package.type]?.bg} ${BUSINESS_TYPE_COLORS[selectedSchedule.package.type]?.text}`}
                >
                  {selectedSchedule.package.type}
                </Badge>
                <Link href={`/dashboard/schedules?edit=${selectedSchedule.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  {typeof selectedSchedule.package.name === "object"
                    ? selectedSchedule.package.name.id ||
                      selectedSchedule.package.name.en
                    : selectedSchedule.package.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedSchedule.package.code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {selectedSchedule.package.duration} Days
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedSchedule.package.nights} Nights
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {selectedSchedule.availableQuota} Available
                    </p>
                    <p className="text-xs text-gray-400">
                      of {selectedSchedule.quota} quota
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Plane className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {formatDateRange(
                      selectedSchedule.departureDate,
                      selectedSchedule.returnDate,
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-1">Price</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quad</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(selectedSchedule.package.priceQuad)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Double</span>
                  <span className="font-medium">
                    {formatCurrency(selectedSchedule.package.priceDouble)}
                  </span>
                </div>
              </div>

              {/* Itinerary Preview */}
              {selectedSchedule.package.itinerary &&
                selectedSchedule.package.itinerary.length > 0 && (
                  <div className="border-t pt-3">
                    <button
                      onClick={() =>
                        setExpandedItinerary(
                          expandedItinerary === selectedSchedule.id
                            ? null
                            : selectedSchedule.id,
                        )
                      }
                      className="flex items-center justify-between w-full text-sm font-medium"
                    >
                      <span>
                        Itinerary ({selectedSchedule.package.duration} Days)
                      </span>
                      {expandedItinerary === selectedSchedule.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {expandedItinerary === selectedSchedule.id && (
                      <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                        {selectedSchedule.package.itinerary.map((item) => (
                          <div
                            key={item.day}
                            className="relative pl-6 pb-3 border-l-2 border-gray-200 last:border-0"
                          >
                            <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                              {item.day}
                            </div>
                            <h5 className="font-medium text-sm">
                              {typeof item.title === "object"
                                ? item.title.id || item.title.en
                                : item.title}
                            </h5>
                            <p className="text-xs text-gray-500 mt-1">
                              {typeof item.description === "object"
                                ? item.description.id || item.description.en
                                : item.description}
                            </p>
                            {item.hotel && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                <Hotel className="h-3 w-3" />
                                {item.hotel}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {/* Actions */}
              <div className="border-t pt-3 space-y-2">
                <Link
                  href={`/dashboard/bookings?scheduleId=${selectedSchedule.id}`}
                  className="block"
                >
                  <Button className="w-full" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    View Bookings ({selectedSchedule._count?.bookings || 0})
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/operations?scheduleId=${selectedSchedule.id}`}
                  className="block"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Manifest ({selectedSchedule._count?.manifests || 0})
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <CalendarIcon className="h-12 w-12 mb-2" />
              <p className="text-center">Select a schedule to view details</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
