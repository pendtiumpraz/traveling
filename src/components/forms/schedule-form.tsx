"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface ScheduleFormProps {
  initialData?: Partial<ScheduleFormData>;
  packages?: Array<{ id: string; name: string; code: string }>;
  onSubmit: (data: ScheduleFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ScheduleFormData {
  packageId: string;
  departureDate: string;
  returnDate: string;
  quota: number;
  priceQuad: number;
  priceTriple: number;
  priceDouble: number;
  status: string;
  notes?: string;
}

export function ScheduleForm({
  initialData,
  packages = [],
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    packageId: initialData?.packageId || "",
    departureDate: initialData?.departureDate || "",
    returnDate: initialData?.returnDate || "",
    quota: initialData?.quota || 45,
    priceQuad: initialData?.priceQuad || 0,
    priceTriple: initialData?.priceTriple || 0,
    priceDouble: initialData?.priceDouble || 0,
    status: initialData?.status || "OPEN",
    notes: initialData?.notes || "",
  });

  const handleChange = (
    field: keyof ScheduleFormData,
    value: string | number,
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
      {/* Package & Dates */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Jadwal Keberangkatan</h3>
        <div className="grid gap-4">
          <Select
            label="Paket *"
            value={formData.packageId}
            onChange={(e) => handleChange("packageId", e.target.value)}
            required
            options={[
              { value: "", label: "Pilih Paket" },
              ...packages.map((p) => ({
                value: p.id,
                label: `${p.code} - ${p.name}`,
              })),
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Berangkat *"
              type="date"
              value={formData.departureDate}
              onChange={(e) => handleChange("departureDate", e.target.value)}
              required
            />
            <Input
              label="Tanggal Pulang *"
              type="date"
              value={formData.returnDate}
              onChange={(e) => handleChange("returnDate", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kuota *"
              type="number"
              value={formData.quota}
              onChange={(e) =>
                handleChange("quota", parseInt(e.target.value) || 0)
              }
              required
              min={1}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={[
                { value: "OPEN", label: "Open" },
                { value: "ALMOST_FULL", label: "Almost Full" },
                { value: "FULL", label: "Full" },
                { value: "CLOSED", label: "Closed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Harga per Tipe Kamar</h3>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Quad (4 org)"
            type="number"
            value={formData.priceQuad}
            onChange={(e) =>
              handleChange("priceQuad", parseInt(e.target.value) || 0)
            }
            min={0}
          />
          <Input
            label="Triple (3 org)"
            type="number"
            value={formData.priceTriple}
            onChange={(e) =>
              handleChange("priceTriple", parseInt(e.target.value) || 0)
            }
            min={0}
          />
          <Input
            label="Double (2 org)"
            type="number"
            value={formData.priceDouble}
            onChange={(e) =>
              handleChange("priceDouble", parseInt(e.target.value) || 0)
            }
            min={0}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Catatan
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
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
