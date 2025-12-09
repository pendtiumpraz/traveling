"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { Package, DollarSign, Hash, Edit } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.enum([
    "EQUIPMENT",
    "CONSUMABLE",
    "MERCHANDISE",
    "DOCUMENT",
    "OTHER",
  ]),
  unit: z.string().min(1, "Unit is required"),
  price: z.string().optional(),
  cost: z.string().optional(),
  minStock: z.string().optional(),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  code: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: string | null;
  cost: string | null;
  currentStock: number;
  minStock: number;
  description: string | null;
}

interface ProductFormProps {
  mode: "view" | "create" | "edit";
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

const categoryOptions = [
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "CONSUMABLE", label: "Consumable" },
  { value: "MERCHANDISE", label: "Merchandise" },
  { value: "DOCUMENT", label: "Document" },
  { value: "OTHER", label: "Other" },
];

export function ProductForm({
  mode,
  product,
  onSuccess,
  onCancel,
  onEdit,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      sku: product?.sku || "",
      category:
        (product?.category as ProductFormData["category"]) || "EQUIPMENT",
      unit: product?.unit || "pcs",
      price: product?.price || "",
      cost: product?.cost || "",
      minStock: product?.minStock?.toString() || "10",
      description: product?.description || "",
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price: data.price ? parseFloat(data.price) : null,
          cost: data.cost ? parseFloat(data.cost) : null,
          minStock: data.minStock ? parseInt(data.minStock) : 10,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save product");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "view" && product) {
    const isLowStock = product.currentStock <= product.minStock;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Product Code</p>
            <p className="text-lg font-semibold">{product.code}</p>
          </div>
          <Badge variant={isLowStock ? "destructive" : "success"}>
            {isLowStock ? "Low Stock" : "In Stock"}
          </Badge>
        </div>

        <div>
          <p className="text-sm text-gray-500">Product Name</p>
          <p className="text-xl font-bold">{product.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">SKU</p>
            <p className="font-mono font-medium">{product.sku}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{product.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unit</p>
            <p className="font-medium">{product.unit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Stock</p>
            <p className="text-xl font-bold">
              {product.currentStock} {product.unit}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div>
            <p className="text-sm text-gray-500">Selling Price</p>
            <p className="text-lg font-semibold text-emerald-600">
              {product.price ? formatCurrency(Number(product.price)) : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cost</p>
            <p className="text-lg font-semibold">
              {product.cost ? formatCurrency(Number(product.cost)) : "-"}
            </p>
          </div>
        </div>

        {product.description && (
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="text-sm">{product.description}</p>
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

      <Input
        label="Product Name"
        leftIcon={<Package className="h-4 w-4" />}
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="SKU"
          leftIcon={<Hash className="h-4 w-4" />}
          error={errors.sku?.message}
          {...register("sku")}
        />

        <Select
          label="Category"
          options={categoryOptions}
          error={errors.category?.message}
          {...register("category")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Unit"
          placeholder="pcs, box, kg"
          error={errors.unit?.message}
          {...register("unit")}
        />

        <Input
          label="Min Stock"
          type="number"
          error={errors.minStock?.message}
          {...register("minStock")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Selling Price"
          type="number"
          step="0.01"
          leftIcon={<DollarSign className="h-4 w-4" />}
          {...register("price")}
        />

        <Input
          label="Cost"
          type="number"
          step="0.01"
          leftIcon={<DollarSign className="h-4 w-4" />}
          {...register("cost")}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="flex gap-2 border-t pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {product ? "Update" : "Create"} Product
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
