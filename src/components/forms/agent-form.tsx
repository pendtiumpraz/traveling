"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface AgentFormProps {
  initialData?: Partial<AgentFormData>;
  onSubmit: (data: AgentFormData) => Promise<void>;
  onCancel: () => void;
}

export interface AgentFormData {
  name: string;
  code: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  tier: string;
  commissionRate: number;
  contactPerson?: string;
  contactPhone?: string;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
  npwp?: string;
  isActive: boolean;
}

export function AgentForm({ initialData, onSubmit, onCancel }: AgentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    name: initialData?.name || "",
    code: initialData?.code || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    tier: initialData?.tier || "BRONZE",
    commissionRate: initialData?.commissionRate || 5,
    contactPerson: initialData?.contactPerson || "",
    contactPhone: initialData?.contactPhone || "",
    bankName: initialData?.bankName || "",
    bankAccount: initialData?.bankAccount || "",
    bankAccountName: initialData?.bankAccountName || "",
    npwp: initialData?.npwp || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleChange = (
    field: keyof AgentFormData,
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
        <h3 className="mb-4 font-medium text-gray-900">Info Agent</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kode Agent *"
              value={formData.code}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
              required
              placeholder="AGT-001"
            />
            <Select
              label="Tier *"
              value={formData.tier}
              onChange={(e) => handleChange("tier", e.target.value)}
              options={[
                { value: "BRONZE", label: "Bronze" },
                { value: "SILVER", label: "Silver" },
                { value: "GOLD", label: "Gold" },
                { value: "PLATINUM", label: "Platinum" },
              ]}
            />
          </div>
          <Input
            label="Nama Agent / Perusahaan *"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
            <Input
              label="No. HP *"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>
          <Input
            label="Alamat"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kota"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
            <Input
              label="Komisi (%)"
              type="number"
              value={formData.commissionRate}
              onChange={(e) =>
                handleChange("commissionRate", parseFloat(e.target.value) || 0)
              }
              min={0}
              max={100}
              step={0.5}
            />
          </div>
        </div>
      </div>

      {/* Contact Person */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Contact Person</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nama"
            value={formData.contactPerson}
            onChange={(e) => handleChange("contactPerson", e.target.value)}
          />
          <Input
            label="No. HP"
            value={formData.contactPhone}
            onChange={(e) => handleChange("contactPhone", e.target.value)}
          />
        </div>
      </div>

      {/* Bank Info */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Info Bank</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Bank"
              value={formData.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              placeholder="BCA, Mandiri, dll"
            />
            <Input
              label="No. Rekening"
              value={formData.bankAccount}
              onChange={(e) => handleChange("bankAccount", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Pemilik Rekening"
              value={formData.bankAccountName}
              onChange={(e) => handleChange("bankAccountName", e.target.value)}
            />
            <Input
              label="NPWP"
              value={formData.npwp}
              onChange={(e) => handleChange("npwp", e.target.value)}
            />
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
          Agent Aktif
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
