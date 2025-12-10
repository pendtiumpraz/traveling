"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface BookingFormProps {
  initialData?: Partial<BookingFormData>;
  customers?: Array<{ id: string; fullName: string; phone: string }>;
  schedules?: Array<{
    id: string;
    code: string;
    packageName: string;
    departureDate: string;
  }>;
  onSubmit: (data: BookingFormData) => Promise<void>;
  onCancel: () => void;
}

export interface BookingFormData {
  customerId: string;
  scheduleId: string;
  roomType: string;
  paxAdult: number;
  paxChild: number;
  paxInfant: number;
  specialRequest?: string;
  notes?: string;
}

export function BookingForm({
  initialData,
  customers = [],
  schedules = [],
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    customerId: initialData?.customerId || "",
    scheduleId: initialData?.scheduleId || "",
    roomType: initialData?.roomType || "DOUBLE",
    paxAdult: initialData?.paxAdult || 1,
    paxChild: initialData?.paxChild || 0,
    paxInfant: initialData?.paxInfant || 0,
    specialRequest: initialData?.specialRequest || "",
    notes: initialData?.notes || "",
  });

  const handleChange = (
    field: keyof BookingFormData,
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
      {/* Customer & Schedule */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Data Booking</h3>
        <div className="grid gap-4">
          <Select
            label="Customer *"
            value={formData.customerId}
            onChange={(e) => handleChange("customerId", e.target.value)}
            required
            options={[
              { value: "", label: "Pilih Customer" },
              ...customers.map((c) => ({
                value: c.id,
                label: `${c.fullName} (${c.phone})`,
              })),
            ]}
          />
          <Select
            label="Jadwal Keberangkatan *"
            value={formData.scheduleId}
            onChange={(e) => handleChange("scheduleId", e.target.value)}
            required
            options={[
              { value: "", label: "Pilih Jadwal" },
              ...schedules.map((s) => ({
                value: s.id,
                label: `${s.code} - ${s.packageName} (${s.departureDate})`,
              })),
            ]}
          />
        </div>
      </div>

      {/* Room & Pax */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Kamar & Peserta</h3>
        <div className="grid gap-4">
          <Select
            label="Tipe Kamar *"
            value={formData.roomType}
            onChange={(e) => handleChange("roomType", e.target.value)}
            options={[
              { value: "QUAD", label: "Quad (4 orang)" },
              { value: "TRIPLE", label: "Triple (3 orang)" },
              { value: "DOUBLE", label: "Double (2 orang)" },
              { value: "SINGLE", label: "Single (1 orang)" },
            ]}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Dewasa *"
              type="number"
              value={formData.paxAdult}
              onChange={(e) =>
                handleChange("paxAdult", parseInt(e.target.value) || 0)
              }
              required
              min={1}
            />
            <Input
              label="Anak (2-12 th)"
              type="number"
              value={formData.paxChild}
              onChange={(e) =>
                handleChange("paxChild", parseInt(e.target.value) || 0)
              }
              min={0}
            />
            <Input
              label="Infant (< 2 th)"
              type="number"
              value={formData.paxInfant}
              onChange={(e) =>
                handleChange("paxInfant", parseInt(e.target.value) || 0)
              }
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Catatan</h3>
        <div className="grid gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Permintaan Khusus
            </label>
            <textarea
              value={formData.specialRequest}
              onChange={(e) => handleChange("specialRequest", e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Kursi roda, diet khusus, dll..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Catatan Internal
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Catatan untuk tim internal..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update" : "Buat Booking"}
        </Button>
      </div>
    </form>
  );
}
