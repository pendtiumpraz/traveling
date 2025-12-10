"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface VoucherFormProps {
  initialData?: Partial<VoucherFormData>;
  onSubmit: (data: VoucherFormData) => Promise<void>;
  onCancel: () => void;
}

export interface VoucherFormData {
  code: string;
  name: string;
  type: string;
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  quota: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms?: string;
}

export function VoucherForm({
  initialData,
  onSubmit,
  onCancel,
}: VoucherFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VoucherFormData>({
    code: initialData?.code || "",
    name: initialData?.name || "",
    type: initialData?.type || "PERCENTAGE",
    value: initialData?.value || 0,
    minPurchase: initialData?.minPurchase || 0,
    maxDiscount: initialData?.maxDiscount || undefined,
    quota: initialData?.quota || 100,
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    isActive: initialData?.isActive ?? true,
    terms: initialData?.terms || "",
  });

  const handleChange = (
    field: keyof VoucherFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Info Voucher</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kode Voucher *"
              value={formData.code}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
              required
              placeholder="DISKON10"
            />
            <Select
              label="Tipe Diskon *"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              options={[
                { value: "PERCENTAGE", label: "Persentase (%)" },
                { value: "FIXED", label: "Nominal (Rp)" },
              ]}
            />
          </div>
          <Input
            label="Nama Voucher *"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            placeholder="Diskon Ramadhan 10%"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={
                formData.type === "PERCENTAGE" ? "Nilai (%)" : "Nilai (Rp)"
              }
              type="number"
              value={formData.value}
              onChange={(e) =>
                handleChange("value", parseInt(e.target.value) || 0)
              }
              required
              min={0}
              max={formData.type === "PERCENTAGE" ? 100 : undefined}
            />
            <Input
              label="Min. Pembelian (Rp)"
              type="number"
              value={formData.minPurchase}
              onChange={(e) =>
                handleChange("minPurchase", parseInt(e.target.value) || 0)
              }
              min={0}
            />
          </div>
          {formData.type === "PERCENTAGE" && (
            <Input
              label="Maks. Diskon (Rp)"
              type="number"
              value={formData.maxDiscount || ""}
              onChange={(e) =>
                handleChange("maxDiscount", parseInt(e.target.value) || 0)
              }
              min={0}
              placeholder="Kosongkan jika tidak ada batas"
            />
          )}
        </div>
      </div>

      {/* Period & Quota */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Periode & Kuota</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai *"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              required
            />
            <Input
              label="Tanggal Berakhir *"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              required
            />
          </div>
          <Input
            label="Kuota Penggunaan *"
            type="number"
            value={formData.quota}
            onChange={(e) =>
              handleChange("quota", parseInt(e.target.value) || 0)
            }
            required
            min={1}
          />
        </div>
      </div>

      {/* Terms */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Syarat & Ketentuan
        </label>
        <textarea
          value={formData.terms}
          onChange={(e) => handleChange("terms", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="- Berlaku untuk semua paket&#10;- Tidak dapat digabung dengan promo lain"
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => handleChange("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Voucher Aktif
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
