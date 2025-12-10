"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface PackageFormProps {
  initialData?: Partial<PackageFormData>;
  onSubmit: (data: PackageFormData) => Promise<void>;
  onCancel: () => void;
}

export interface PackageFormData {
  name: string;
  code: string;
  businessType: string;
  duration: number;
  description?: string;
  basePrice: number;
  currency: string;
  inclusions?: string;
  exclusions?: string;
  itinerary?: string;
  terms?: string;
  isActive: boolean;
}

export function PackageForm({
  initialData,
  onSubmit,
  onCancel,
}: PackageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>({
    name: initialData?.name || "",
    code: initialData?.code || "",
    businessType: initialData?.businessType || "UMROH",
    duration: initialData?.duration || 9,
    description: initialData?.description || "",
    basePrice: initialData?.basePrice || 0,
    currency: initialData?.currency || "IDR",
    inclusions: initialData?.inclusions || "",
    exclusions: initialData?.exclusions || "",
    itinerary: initialData?.itinerary || "",
    terms: initialData?.terms || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleChange = (
    field: keyof PackageFormData,
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
        <h3 className="mb-4 font-medium text-gray-900">Informasi Paket</h3>
        <div className="grid gap-4">
          <Input
            label="Nama Paket *"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            placeholder="Umroh Plus Turki 12 Hari"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kode Paket *"
              value={formData.code}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
              required
              placeholder="UMR-TRK-12"
            />
            <Select
              label="Jenis Bisnis *"
              value={formData.businessType}
              onChange={(e) => handleChange("businessType", e.target.value)}
              options={[
                { value: "UMROH", label: "Umroh" },
                { value: "HAJI", label: "Haji" },
                { value: "OUTBOUND", label: "Outbound" },
                { value: "INBOUND", label: "Inbound" },
                { value: "DOMESTIC", label: "Domestik" },
                { value: "MICE", label: "MICE" },
                { value: "CRUISE", label: "Cruise" },
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Durasi (hari) *"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                handleChange("duration", parseInt(e.target.value) || 0)
              }
              required
              min={1}
            />
            <Input
              label="Harga Dasar *"
              type="number"
              value={formData.basePrice}
              onChange={(e) =>
                handleChange("basePrice", parseInt(e.target.value) || 0)
              }
              required
              min={0}
            />
            <Select
              label="Mata Uang"
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              options={[
                { value: "IDR", label: "IDR - Rupiah" },
                { value: "USD", label: "USD - Dollar" },
                { value: "SAR", label: "SAR - Riyal" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Deskripsi</h3>
        <div className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Deskripsi Paket
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Deskripsi singkat tentang paket..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Termasuk (Inclusions)
              </label>
              <textarea
                value={formData.inclusions}
                onChange={(e) => handleChange("inclusions", e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="- Tiket pesawat PP&#10;- Hotel 4 star&#10;- Visa"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Tidak Termasuk (Exclusions)
              </label>
              <textarea
                value={formData.exclusions}
                onChange={(e) => handleChange("exclusions", e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="- Pengeluaran pribadi&#10;- Tips guide&#10;- Asuransi tambahan"
              />
            </div>
          </div>
        </div>
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
          Paket Aktif
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
