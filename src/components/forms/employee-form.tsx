"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
  onCancel: () => void;
}

export interface EmployeeFormData {
  employeeNo: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  status: string;
}

export function EmployeeForm({
  initialData,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeNo: initialData?.employeeNo || "",
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    position: initialData?.position || "",
    department: initialData?.department || "",
    joinDate: initialData?.joinDate || "",
    birthDate: initialData?.birthDate || "",
    gender: initialData?.gender || "",
    address: initialData?.address || "",
    emergencyContact: initialData?.emergencyContact || "",
    emergencyPhone: initialData?.emergencyPhone || "",
    status: initialData?.status || "ACTIVE",
  });

  const handleChange = (field: keyof EmployeeFormData, value: string) => {
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
        <h3 className="mb-4 font-medium text-gray-900">Data Karyawan</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="No. Karyawan *"
              value={formData.employeeNo}
              onChange={(e) => handleChange("employeeNo", e.target.value)}
              required
              placeholder="EMP-001"
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={[
                { value: "ACTIVE", label: "Aktif" },
                { value: "INACTIVE", label: "Tidak Aktif" },
                { value: "ON_LEAVE", label: "Cuti" },
                { value: "RESIGNED", label: "Resign" },
              ]}
            />
          </div>
          <Input
            label="Nama Lengkap *"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
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
          <div className="grid grid-cols-2 gap-4">
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
            <Input
              label="Tanggal Lahir"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Position */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Jabatan</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Departemen *"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              required
              options={[
                { value: "", label: "Pilih Departemen" },
                { value: "MANAGEMENT", label: "Management" },
                { value: "SALES", label: "Sales" },
                { value: "MARKETING", label: "Marketing" },
                { value: "OPERATIONS", label: "Operations" },
                { value: "FINANCE", label: "Finance" },
                { value: "HR", label: "HR" },
                { value: "IT", label: "IT" },
                { value: "CUSTOMER_SERVICE", label: "Customer Service" },
              ]}
            />
            <Input
              label="Jabatan *"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              required
              placeholder="Manager, Staff, dll"
            />
          </div>
          <Input
            label="Tanggal Bergabung *"
            type="date"
            value={formData.joinDate}
            onChange={(e) => handleChange("joinDate", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Address & Emergency */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">
          Alamat & Kontak Darurat
        </h3>
        <div className="grid gap-4">
          <Input
            label="Alamat"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kontak Darurat"
              value={formData.emergencyContact}
              onChange={(e) => handleChange("emergencyContact", e.target.value)}
              placeholder="Nama kontak darurat"
            />
            <Input
              label="No. HP Darurat"
              value={formData.emergencyPhone}
              onChange={(e) => handleChange("emergencyPhone", e.target.value)}
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
