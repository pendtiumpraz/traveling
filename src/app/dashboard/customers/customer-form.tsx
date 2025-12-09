"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { User, Phone, Mail, MapPin, Edit } from "lucide-react";

const customerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  passportName: z.string().optional(),
  phone: z.string().min(8, "Phone must be at least 8 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  gender: z.enum(["M", "F"]).optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  nationality: z.string().optional(),
  passportNumber: z.string().optional(),
  passportExpiry: z.string().optional(),
  customerType: z.enum(["PROSPECT", "CLIENT", "VIP", "INACTIVE"]).optional(),
  source: z
    .enum([
      "WEBSITE",
      "REFERRAL",
      "AGENT",
      "SOCIAL_MEDIA",
      "WALK_IN",
      "PHONE",
      "EVENT",
      "CORPORATE",
      "OTHER",
    ])
    .optional(),
  companyName: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  mode: "view" | "create" | "edit";
  customer?: {
    id: string;
    code: string;
    fullName: string;
    phone: string;
    email: string | null;
    customerType: "PROSPECT" | "CLIENT" | "VIP" | "INACTIVE";
    city: string | null;
    createdAt: string;
    _count: {
      bookings: number;
    };
  } | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

const customerTypeOptions = [
  { value: "PROSPECT", label: "Prospect (Calon Client)" },
  { value: "CLIENT", label: "Client" },
  { value: "VIP", label: "VIP" },
  { value: "INACTIVE", label: "Inactive" },
];

const genderOptions = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
];

const sourceOptions = [
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "AGENT", label: "Agent" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "WALK_IN", label: "Walk-in" },
  { value: "PHONE", label: "Phone" },
  { value: "EVENT", label: "Event" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "OTHER", label: "Other" },
];

const customerTypeColors = {
  PROSPECT: "warning",
  CLIENT: "success",
  VIP: "default",
  INACTIVE: "secondary",
} as const;

export function CustomerForm({
  mode,
  customer,
  onSuccess,
  onCancel,
  onEdit,
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: customer?.fullName || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      city: customer?.city || "",
      customerType: customer?.customerType || "PROSPECT",
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url =
        mode === "create" ? "/api/customers" : `/api/customers/${customer?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to save customer");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // View mode
  if (mode === "view" && customer) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {customer.fullName}
              </h3>
              <p className="text-sm text-gray-500">{customer.code}</p>
            </div>
          </div>
          <Badge variant={customerTypeColors[customer.customerType]} size="lg">
            {customer.customerType}
          </Badge>
        </div>

        {/* Contact Info */}
        <div className="rounded-lg border border-gray-200 p-4">
          <h4 className="mb-3 font-medium text-gray-900">
            Contact Information
          </h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{customer.email}</span>
              </div>
            )}
            {customer.city && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{customer.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {customer._count.bookings}
            </p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium text-gray-900">
              {formatDate(customer.createdAt, {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-4">
          <Button
            onClick={onEdit}
            leftIcon={<Edit className="h-4 w-4" />}
            className="flex-1"
          >
            Edit Customer
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Close
          </Button>
        </div>
      </div>
    );
  }

  // Create/Edit mode
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Basic Information</h4>

        <Input
          label="Full Name"
          placeholder="Enter full name"
          error={errors.fullName?.message}
          required
          {...register("fullName")}
        />

        <Input
          label="Passport Name"
          placeholder="Name as in passport (if different)"
          {...register("passportName")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Gender"
            options={genderOptions}
            placeholder="Select gender"
            {...register("gender")}
          />
          <Input label="Birth Date" type="date" {...register("birthDate")} />
        </div>

        <Input
          label="ID Number (KTP/NIK)"
          placeholder="Enter ID number"
          {...register("idNumber")}
        />
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Contact Information</h4>

        <Input
          label="Phone Number"
          placeholder="e.g., 08123456789"
          error={errors.phone?.message}
          required
          leftIcon={<Phone className="h-4 w-4" />}
          {...register("phone")}
        />

        <Input
          label="WhatsApp"
          placeholder="WhatsApp number (if different)"
          {...register("whatsapp")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          {...register("email")}
        />
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Address</h4>

        <Input
          label="Address"
          placeholder="Street address"
          {...register("address")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="City" placeholder="City" {...register("city")} />
          <Input
            label="Province"
            placeholder="Province"
            {...register("province")}
          />
        </div>
      </div>

      {/* Passport Info */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Passport Information</h4>

        <Input
          label="Passport Number"
          placeholder="Enter passport number"
          {...register("passportNumber")}
        />

        <Input
          label="Passport Expiry"
          type="date"
          {...register("passportExpiry")}
        />
      </div>

      {/* Classification */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Classification</h4>

        <Select
          label="Customer Type"
          options={customerTypeOptions}
          required
          {...register("customerType")}
        />

        <Select
          label="Lead Source"
          options={sourceOptions}
          placeholder="How did they find us?"
          {...register("source")}
        />

        <Input
          label="Company Name"
          placeholder="For corporate customers"
          {...register("companyName")}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-4">
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          {mode === "create" ? "Add Customer" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
