"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils";
import { User, Package, Calendar, CreditCard, Edit } from "lucide-react";

const bookingSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  scheduleId: z.string().min(1, "Schedule is required"),
  roomType: z.enum(["QUAD", "TRIPLE", "DOUBLE", "TWIN", "SINGLE"]),
  pax: z.string().min(1),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  mode: "view" | "create" | "edit";
  booking?: {
    id: string;
    bookingCode: string;
    customer: { fullName: string; phone: string };
    package: { name: { id?: string; en?: string }; type: string };
    schedule: { departureDate: string; returnDate: string };
    roomType: string;
    pax: number;
    totalPrice: string;
    status: string;
    paymentStatus: string;
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

const roomOptions = [
  { value: "QUAD", label: "Quad (4 pax)" },
  { value: "TRIPLE", label: "Triple (3 pax)" },
  { value: "DOUBLE", label: "Double (2 pax)" },
  { value: "TWIN", label: "Twin (2 pax)" },
  { value: "SINGLE", label: "Single (1 pax)" },
];

const statusColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "destructive",
};
const paymentColors: Record<string, "success" | "warning" | "destructive"> = {
  UNPAID: "destructive",
  PARTIAL: "warning",
  PAID: "success",
};

export function BookingForm({
  mode,
  booking,
  onSuccess,
  onCancel,
  onEdit,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<
    { id: string; fullName: string; code: string }[]
  >([]);
  const [schedules, setSchedules] = useState<
    { id: string; package: { name: { id?: string } }; departureDate: string }[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomType: (booking?.roomType as BookingFormData["roomType"]) || "DOUBLE",
      pax: booking?.pax?.toString() || "1",
    },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/customers?pageSize=100").then((r) => r.json()),
      fetch("/api/schedules?pageSize=100&status=OPEN").then((r) => r.json()),
    ])
      .then(([c, s]) => {
        if (c.success) setCustomers(c.data);
        if (s.success) setSchedules(s.data);
      })
      .catch(console.error);
  }, []);

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const schedule = schedules.find((s) => s.id === data.scheduleId);
      const res = await fetch(
        mode === "create" ? "/api/bookings" : `/api/bookings/${booking?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            packageId:
              (schedule as { packageId?: string })?.packageId || schedule?.id,
            pax: parseInt(data.pax),
          }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "view" && booking) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-lg font-bold text-primary">
              {booking.bookingCode}
            </p>
            <p className="text-sm text-gray-500">{booking.package.type}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={statusColors[booking.status] || "secondary"}>
              {booking.status}
            </Badge>
            <Badge
              variant={paymentColors[booking.paymentStatus] || "secondary"}
            >
              {booking.paymentStatus}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">{booking.customer.fullName}</p>
              <p className="text-sm text-gray-500">{booking.customer.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Package className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium">
                {booking.package.name?.id || booking.package.name?.en}
              </p>
              <p className="text-sm text-gray-500">
                {booking.roomType} - {booking.pax} pax
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="font-medium">
                {formatDate(booking.schedule.departureDate)} -{" "}
                {formatDate(booking.schedule.returnDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4 bg-primary/5">
            <CreditCard className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(Number(booking.totalPrice))}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t pt-4">
          <Button
            onClick={onEdit}
            leftIcon={<Edit className="h-4 w-4" />}
            className="flex-1"
          >
            Edit
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Select
        label="Customer"
        options={customers.map((c) => ({
          value: c.id,
          label: `${c.fullName} (${c.code})`,
        }))}
        placeholder="Select customer"
        error={errors.customerId?.message}
        required
        {...register("customerId")}
      />

      <Select
        label="Schedule"
        options={schedules.map((s) => ({
          value: s.id,
          label: `${s.package?.name?.id || "Package"} - ${formatDate(s.departureDate, { day: "numeric", month: "short", year: "numeric" })}`,
        }))}
        placeholder="Select schedule"
        error={errors.scheduleId?.message}
        required
        {...register("scheduleId")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Room Type"
          options={roomOptions}
          required
          {...register("roomType")}
        />
        <Input
          label="Pax"
          type="number"
          min="1"
          required
          {...register("pax")}
        />
      </div>

      <Input
        label="Notes"
        placeholder="Optional notes..."
        {...register("notes")}
      />

      <div className="flex gap-3 border-t pt-4">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {mode === "create" ? "Create Booking" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
