"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
}

export interface CustomerFormData {
  fullName: string;
  passportName?: string;
  idNumber?: string;
  birthPlace?: string;
  birthDate?: string;
  gender?: string;
  phone: string;
  phone2?: string;
  email?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  passportNumber?: string;
  passportIssuePlace?: string;
  passportIssueDate?: string;
  passportExpiry?: string;
  customerType?: string;
}

export function CustomerForm({
  initialData,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: initialData?.fullName || "",
    passportName: initialData?.passportName || "",
    idNumber: initialData?.idNumber || "",
    birthPlace: initialData?.birthPlace || "",
    birthDate: initialData?.birthDate || "",
    gender: initialData?.gender || "",
    phone: initialData?.phone || "",
    phone2: initialData?.phone2 || "",
    email: initialData?.email || "",
    whatsapp: initialData?.whatsapp || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    province: initialData?.province || "",
    postalCode: initialData?.postalCode || "",
    passportNumber: initialData?.passportNumber || "",
    passportIssuePlace: initialData?.passportIssuePlace || "",
    passportIssueDate: initialData?.passportIssueDate || "",
    passportExpiry: initialData?.passportExpiry || "",
    customerType: initialData?.customerType || "PROSPECT",
  });

  const handleChange = (field: keyof CustomerFormData, value: string) => {
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
        <h3 className="mb-4 font-medium text-gray-900">Informasi Dasar</h3>
        <div className="grid gap-4">
          <Input
            label="Nama Lengkap *"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
          <Input
            label="Nama di Paspor"
            value={formData.passportName}
            onChange={(e) => handleChange("passportName", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="NIK/KTP"
              value={formData.idNumber}
              onChange={(e) => handleChange("idNumber", e.target.value)}
            />
            <Select
              label="Jenis Kelamin"
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              options={[
                { value: "", label: "Pilih" },
                { value: "M", label: "Laki-laki" },
                { value: "F", label: "Perempuan" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tempat Lahir"
              value={formData.birthPlace}
              onChange={(e) => handleChange("birthPlace", e.target.value)}
            />
            <Input
              label="Tanggal Lahir"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Kontak</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="No. HP *"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
            <Input
              label="No. HP 2"
              value={formData.phone2}
              onChange={(e) => handleChange("phone2", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <Input
              label="WhatsApp"
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Alamat</h3>
        <div className="grid gap-4">
          <Input
            label="Alamat"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Kota"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
            <Input
              label="Provinsi"
              value={formData.province}
              onChange={(e) => handleChange("province", e.target.value)}
            />
            <Input
              label="Kode Pos"
              value={formData.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Passport */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Paspor</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="No. Paspor"
              value={formData.passportNumber}
              onChange={(e) => handleChange("passportNumber", e.target.value)}
            />
            <Input
              label="Tempat Penerbitan"
              value={formData.passportIssuePlace}
              onChange={(e) =>
                handleChange("passportIssuePlace", e.target.value)
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Terbit"
              type="date"
              value={formData.passportIssueDate}
              onChange={(e) =>
                handleChange("passportIssueDate", e.target.value)
              }
            />
            <Input
              label="Tanggal Kadaluarsa"
              type="date"
              value={formData.passportExpiry}
              onChange={(e) => handleChange("passportExpiry", e.target.value)}
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
          {initialData ? "Update" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
