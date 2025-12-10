"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  description?: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  supplier?: string;
  isActive: boolean;
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "",
    description: initialData?.description || "",
    unit: initialData?.unit || "PCS",
    costPrice: initialData?.costPrice || 0,
    sellPrice: initialData?.sellPrice || 0,
    stock: initialData?.stock || 0,
    minStock: initialData?.minStock || 10,
    supplier: initialData?.supplier || "",
    isActive: initialData?.isActive ?? true,
  });

  const handleChange = (
    field: keyof ProductFormData,
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
        <h3 className="mb-4 font-medium text-gray-900">Info Produk</h3>
        <div className="grid gap-4">
          <Input
            label="Nama Produk *"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU *"
              value={formData.sku}
              onChange={(e) =>
                handleChange("sku", e.target.value.toUpperCase())
              }
              required
              placeholder="PRD-001"
            />
            <Select
              label="Kategori *"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              required
              options={[
                { value: "", label: "Pilih Kategori" },
                { value: "KOPER", label: "Koper" },
                { value: "TAS", label: "Tas" },
                { value: "PERLENGKAPAN_IBADAH", label: "Perlengkapan Ibadah" },
                { value: "PAKAIAN", label: "Pakaian" },
                { value: "DOKUMEN", label: "Dokumen" },
                { value: "SOUVENIR", label: "Souvenir" },
                { value: "LAINNYA", label: "Lainnya" },
              ]}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Harga & Stok</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Harga Beli (Rp)"
              type="number"
              value={formData.costPrice}
              onChange={(e) =>
                handleChange("costPrice", parseInt(e.target.value) || 0)
              }
              min={0}
            />
            <Input
              label="Harga Jual (Rp) *"
              type="number"
              value={formData.sellPrice}
              onChange={(e) =>
                handleChange("sellPrice", parseInt(e.target.value) || 0)
              }
              required
              min={0}
            />
            <Select
              label="Satuan"
              value={formData.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              options={[
                { value: "PCS", label: "Pcs" },
                { value: "SET", label: "Set" },
                { value: "BOX", label: "Box" },
                { value: "PACK", label: "Pack" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stok Saat Ini"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                handleChange("stock", parseInt(e.target.value) || 0)
              }
              min={0}
            />
            <Input
              label="Stok Minimum"
              type="number"
              value={formData.minStock}
              onChange={(e) =>
                handleChange("minStock", parseInt(e.target.value) || 0)
              }
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Supplier */}
      <div>
        <Input
          label="Supplier"
          value={formData.supplier}
          onChange={(e) => handleChange("supplier", e.target.value)}
          placeholder="Nama supplier"
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
          Produk Aktif
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
