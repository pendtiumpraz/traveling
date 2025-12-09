"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Tag, Calendar, Hash, Edit } from "lucide-react";

const voucherSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  name: z.string().min(2, "Name is required"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.string().min(1, "Value is required"),
  minPurchase: z.string().optional(),
  maxDiscount: z.string().optional(),
  quota: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
});

type VoucherFormData = z.infer<typeof voucherSchema>;

interface Voucher {
  id: string;
  code: string;
  name: string;
  type: string;
  value: string;
  minPurchase: string | null;
  maxDiscount: string | null;
  quota: number | null;
  used: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string | null;
}

interface VoucherFormProps {
  mode: "view" | "create" | "edit";
  voucher?: Voucher | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

const typeOptions = [
  { value: "PERCENTAGE", label: "Percentage (%)" },
  { value: "FIXED", label: "Fixed Amount" },
];

export function VoucherForm({
  mode,
  voucher,
  onSuccess,
  onCancel,
  onEdit,
}: VoucherFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: voucher?.code || "",
      name: voucher?.name || "",
      type: (voucher?.type as VoucherFormData["type"]) || "PERCENTAGE",
      value: voucher?.value || "",
      minPurchase: voucher?.minPurchase || "",
      maxDiscount: voucher?.maxDiscount || "",
      quota: voucher?.quota?.toString() || "",
      startDate: voucher?.startDate?.split("T")[0] || "",
      endDate: voucher?.endDate?.split("T")[0] || "",
      description: voucher?.description || "",
    },
  });

  const selectedType = watch("type");

  const onSubmit = async (data: VoucherFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = voucher ? `/api/vouchers/${voucher.id}` : "/api/vouchers";
      const method = voucher ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          value: parseFloat(data.value),
          minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : null,
          maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
          quota: data.quota ? parseInt(data.quota) : null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save voucher");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "view" && voucher) {
    const now = new Date();
    const endDate = new Date(voucher.endDate);
    const isExpired = endDate < now;
    const remaining = voucher.quota ? voucher.quota - voucher.used : null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Voucher Code</p>
            <p className="font-mono text-2xl font-bold text-primary">
              {voucher.code}
            </p>
          </div>
          <Badge
            variant={
              isExpired
                ? "destructive"
                : voucher.isActive
                  ? "success"
                  : "secondary"
            }
          >
            {isExpired ? "Expired" : voucher.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-lg font-semibold">{voucher.name}</p>
        </div>

        <div className="rounded-lg bg-emerald-50 p-4 text-center">
          <p className="text-sm text-emerald-600">Discount Value</p>
          <p className="text-3xl font-bold text-emerald-700">
            {voucher.type === "PERCENTAGE"
              ? `${voucher.value}%`
              : formatCurrency(Number(voucher.value))}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{voucher.type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Usage</p>
            <p className="font-medium">
              {voucher.used} / {voucher.quota || "∞"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Min Purchase</p>
            <p className="font-medium">
              {voucher.minPurchase
                ? formatCurrency(Number(voucher.minPurchase))
                : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Max Discount</p>
            <p className="font-medium">
              {voucher.maxDiscount
                ? formatCurrency(Number(voucher.maxDiscount))
                : "-"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-500">Valid Period</p>
          <p className="font-medium">
            {formatDate(voucher.startDate, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            {" - "}
            {formatDate(voucher.endDate, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {voucher.description && (
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm">{voucher.description}</p>
          </div>
        )}

        <div className="flex gap-2 border-t pt-4">
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Voucher Code"
          placeholder="PROMO2024"
          leftIcon={<Hash className="h-4 w-4" />}
          error={errors.code?.message}
          {...register("code")}
        />

        <Input
          label="Name"
          placeholder="Holiday Promo"
          leftIcon={<Tag className="h-4 w-4" />}
          error={errors.name?.message}
          {...register("name")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Type"
          options={typeOptions}
          error={errors.type?.message}
          {...register("type")}
        />

        <Input
          label={selectedType === "PERCENTAGE" ? "Percentage (%)" : "Amount"}
          type="number"
          step={selectedType === "PERCENTAGE" ? "1" : "0.01"}
          error={errors.value?.message}
          {...register("value")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min Purchase"
          type="number"
          step="0.01"
          placeholder="Optional"
          {...register("minPurchase")}
        />

        <Input
          label="Max Discount"
          type="number"
          step="0.01"
          placeholder="Optional"
          {...register("maxDiscount")}
        />
      </div>

      <Input
        label="Quota"
        type="number"
        placeholder="Leave empty for unlimited"
        {...register("quota")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          leftIcon={<Calendar className="h-4 w-4" />}
          error={errors.startDate?.message}
          {...register("startDate")}
        />

        <Input
          label="End Date"
          type="date"
          leftIcon={<Calendar className="h-4 w-4" />}
          error={errors.endDate?.message}
          {...register("endDate")}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          placeholder="Terms and conditions..."
          {...register("description")}
        />
      </div>

      <div className="flex gap-2 border-t pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {voucher ? "Update" : "Create"} Voucher
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
