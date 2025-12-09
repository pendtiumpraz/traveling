"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Package, Calendar, Edit, DollarSign } from "lucide-react";

const packageSchema = z.object({
  name: z.string().min(2, "Name is required"),
  type: z.enum([
    "UMROH",
    "HAJI",
    "OUTBOUND",
    "INBOUND",
    "DOMESTIC",
    "MICE",
    "CRUISE",
    "CUSTOM",
  ]),
  description: z.string().optional(),
  destinations: z.string().min(1, "At least one destination required"),
  duration: z.string().min(1),
  nights: z.string().min(1),
  priceQuad: z.string().min(1),
  priceTriple: z.string().min(1),
  priceDouble: z.string().min(1),
  priceSingle: z.string().optional(),
  minPax: z.string().optional(),
  maxPax: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface PackageFormProps {
  mode: "view" | "create" | "edit";
  package?: {
    id: string;
    code: string;
    name: { id?: string; en?: string };
    type: string;
    duration: number;
    nights: number;
    priceDouble: string;
    isActive: boolean;
    isFeatured: boolean;
    _count: { schedules: number; bookings: number };
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

const typeOptions = [
  { value: "UMROH", label: "Umroh" },
  { value: "HAJI", label: "Haji" },
  { value: "OUTBOUND", label: "Outbound Tour" },
  { value: "INBOUND", label: "Inbound Tour" },
  { value: "DOMESTIC", label: "Domestic Tour" },
  { value: "MICE", label: "MICE" },
  { value: "CRUISE", label: "Cruise" },
  { value: "CUSTOM", label: "Custom" },
];

export function PackageForm({
  mode,
  package: pkg,
  onSuccess,
  onCancel,
  onEdit,
}: PackageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: pkg?.name?.id || pkg?.name?.en || "",
      type: (pkg?.type as PackageFormData["type"]) || "UMROH",
      duration: pkg?.duration?.toString() || "",
      nights: pkg?.nights?.toString() || "",
      priceDouble: pkg?.priceDouble || "",
      isActive: pkg?.isActive ?? true,
    },
  });

  const onSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url =
        mode === "create" ? "/api/packages" : `/api/packages/${pkg?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          type: data.type,
          description: data.description,
          destinations: data.destinations.split(",").map((d) => d.trim()),
          duration: parseInt(data.duration),
          nights: parseInt(data.nights),
          priceQuad: parseFloat(data.priceQuad),
          priceTriple: parseFloat(data.priceTriple),
          priceDouble: parseFloat(data.priceDouble),
          priceSingle: data.priceSingle
            ? parseFloat(data.priceSingle)
            : undefined,
          minPax: data.minPax ? parseInt(data.minPax) : 1,
          maxPax: data.maxPax ? parseInt(data.maxPax) : undefined,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
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

  if (mode === "view" && pkg) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {pkg.name?.id || pkg.name?.en}
              </h3>
              <p className="text-sm text-gray-500">{pkg.code}</p>
            </div>
          </div>
          <Badge variant={pkg.isActive ? "success" : "secondary"}>
            {pkg.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Duration</span>
            </div>
            <p className="mt-1 text-lg font-semibold">
              {pkg.duration}D / {pkg.nights}N
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-gray-500">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Price (Double)</span>
            </div>
            <p className="mt-1 text-lg font-semibold">
              {formatCurrency(Number(pkg.priceDouble))}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Schedules</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {pkg._count.schedules}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-gray-500">Bookings</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {pkg._count.bookings}
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t pt-4">
          <Button
            onClick={onEdit}
            leftIcon={<Edit className="h-4 w-4" />}
            className="flex-1"
          >
            Edit Package
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

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Basic Information</h4>
        <Input
          label="Package Name"
          placeholder="e.g., Umroh Reguler 9 Hari"
          error={errors.name?.message}
          required
          {...register("name")}
        />
        <Select
          label="Type"
          options={typeOptions}
          required
          {...register("type")}
        />
        <Input
          label="Destinations"
          placeholder="e.g., Jeddah, Makkah, Madinah"
          helperText="Comma separated"
          error={errors.destinations?.message}
          required
          {...register("destinations")}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duration (Days)"
            type="number"
            min="1"
            error={errors.duration?.message}
            required
            {...register("duration")}
          />
          <Input
            label="Nights"
            type="number"
            min="0"
            error={errors.nights?.message}
            required
            {...register("nights")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Pricing</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price Quad"
            type="number"
            min="0"
            placeholder="0"
            error={errors.priceQuad?.message}
            required
            {...register("priceQuad")}
          />
          <Input
            label="Price Triple"
            type="number"
            min="0"
            placeholder="0"
            error={errors.priceTriple?.message}
            required
            {...register("priceTriple")}
          />
          <Input
            label="Price Double"
            type="number"
            min="0"
            placeholder="0"
            error={errors.priceDouble?.message}
            required
            {...register("priceDouble")}
          />
          <Input
            label="Price Single"
            type="number"
            min="0"
            placeholder="0"
            {...register("priceSingle")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Min Pax"
            type="number"
            min="1"
            placeholder="1"
            {...register("minPax")}
          />
          <Input
            label="Max Pax"
            type="number"
            min="1"
            placeholder="No limit"
            {...register("maxPax")}
          />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary"
              {...register("isActive")}
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary"
              {...register("isFeatured")}
            />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 border-t pt-4">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {mode === "create" ? "Create Package" : "Save Changes"}
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
