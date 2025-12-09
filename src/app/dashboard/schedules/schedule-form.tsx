"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { Calendar, Users, Edit } from "lucide-react";

const scheduleSchema = z.object({
  packageId: z.string().min(1, "Package is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().min(1, "Return date is required"),
  quota: z.string().min(1, "Quota is required"),
  notes: z.string().optional(),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  mode: "view" | "create" | "edit";
  schedule?: {
    id: string;
    departureDate: string;
    returnDate: string;
    quota: number;
    availableQuota: number;
    status: string;
    package: {
      code: string;
      name: { id?: string; en?: string };
      type: string;
      duration: number;
    };
    _count: { bookings: number };
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

interface PackageOption {
  id: string;
  code: string;
  name: { id?: string; en?: string };
  type: string;
  duration: number;
}

const statusColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  OPEN: "success",
  ALMOST_FULL: "warning",
  FULL: "destructive",
  CLOSED: "secondary",
};

export function ScheduleForm({
  mode,
  schedule,
  onSuccess,
  onCancel,
  onEdit,
}: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageOption[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      packageId: "",
      departureDate: schedule?.departureDate?.split("T")[0] || "",
      returnDate: schedule?.returnDate?.split("T")[0] || "",
      quota: schedule?.quota?.toString() || "",
    },
  });

  useEffect(() => {
    fetch("/api/packages?pageSize=100&isActive=true")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setPackages(json.data);
      })
      .catch(console.error);
  }, []);

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url =
        mode === "create" ? "/api/schedules" : `/api/schedules/${schedule?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: data.packageId,
          departureDate: data.departureDate,
          returnDate: data.returnDate,
          quota: parseInt(data.quota),
          notes: data.notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "view" && schedule) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {schedule.package.name?.id || schedule.package.name?.en}
            </h3>
            <p className="text-sm text-gray-500">{schedule.package.code}</p>
          </div>
          <Badge variant={statusColors[schedule.status] || "secondary"}>
            {schedule.status}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Departure</p>
              <p className="font-medium">
                {formatDate(schedule.departureDate)}
              </p>
            </div>
            <span className="mx-4 text-gray-300">→</span>
            <div>
              <p className="text-sm text-gray-500">Return</p>
              <p className="font-medium">{formatDate(schedule.returnDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 text-center">
              <Users className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-2xl font-bold">
                {schedule.availableQuota} / {schedule.quota}
              </p>
              <p className="text-sm text-gray-500">Available Quota</p>
            </div>
            <div className="rounded-lg border p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {schedule._count.bookings}
              </p>
              <p className="text-sm text-gray-500">Bookings</p>
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
        label="Package"
        options={packages.map((p) => ({
          value: p.id,
          label: `${p.code} - ${p.name?.id || p.name?.en}`,
        }))}
        placeholder="Select package"
        error={errors.packageId?.message}
        required
        disabled={mode === "edit"}
        {...register("packageId")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Departure Date"
          type="date"
          error={errors.departureDate?.message}
          required
          {...register("departureDate")}
        />
        <Input
          label="Return Date"
          type="date"
          error={errors.returnDate?.message}
          required
          {...register("returnDate")}
        />
      </div>

      <Input
        label="Quota"
        type="number"
        min="1"
        placeholder="e.g., 45"
        error={errors.quota?.message}
        required
        {...register("quota")}
      />
      <Input
        label="Notes"
        placeholder="Optional notes..."
        {...register("notes")}
      />

      <div className="flex gap-3 border-t pt-4">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {mode === "create" ? "Create Schedule" : "Save Changes"}
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
