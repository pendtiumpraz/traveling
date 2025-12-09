"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { User, Phone, Mail, Building, MapPin, Edit } from "lucide-react";

const agentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(8, "Phone is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  tier: z.enum(["REGULAR", "SILVER", "GOLD", "PLATINUM"]),
  commissionRate: z.string().min(1, "Commission rate is required"),
});

type AgentFormData = z.infer<typeof agentSchema>;

interface Agent {
  id: string;
  code: string;
  name: string;
  companyName: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  tier: string;
  commissionRate: string;
  isActive: boolean;
  createdAt: string;
  _count: { bookings: number; commissions: number };
}

interface AgentFormProps {
  mode: "view" | "create" | "edit";
  agent?: Agent | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

const tierOptions = [
  { value: "REGULAR", label: "Regular" },
  { value: "SILVER", label: "Silver" },
  { value: "GOLD", label: "Gold" },
  { value: "PLATINUM", label: "Platinum" },
];

const tierColors: Record<
  string,
  "secondary" | "default" | "warning" | "success"
> = {
  REGULAR: "secondary",
  SILVER: "default",
  GOLD: "warning",
  PLATINUM: "success",
};

export function AgentForm({
  mode,
  agent,
  onSuccess,
  onCancel,
  onEdit,
}: AgentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: agent?.name || "",
      companyName: agent?.companyName || "",
      email: agent?.email || "",
      phone: agent?.phone || "",
      address: agent?.address || "",
      city: agent?.city || "",
      tier: (agent?.tier as AgentFormData["tier"]) || "REGULAR",
      commissionRate: agent?.commissionRate || "5",
    },
  });

  const onSubmit = async (data: AgentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = agent ? `/api/agents/${agent.id}` : "/api/agents";
      const method = agent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          commissionRate: parseFloat(data.commissionRate),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save agent");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "view" && agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Agent Code</p>
            <p className="font-mono text-lg font-semibold">{agent.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={tierColors[agent.tier]}>{agent.tier}</Badge>
            <Badge variant={agent.isActive ? "success" : "secondary"}>
              {agent.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p className="text-xl font-bold">{agent.name}</p>
          {agent.companyName && (
            <p className="text-gray-600">{agent.companyName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{agent.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{agent.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">City</p>
            <p className="font-medium">{agent.city || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Joined</p>
            <p className="font-medium">
              {formatDate(agent.createdAt, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {agent.commissionRate}%
            </p>
            <p className="text-sm text-gray-500">Commission Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{agent._count?.bookings || 0}</p>
            <p className="text-sm text-gray-500">Total Bookings</p>
          </div>
        </div>

        {agent.address && (
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-sm">{agent.address}</p>
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
        label="Contact Name"
        leftIcon={<User className="h-4 w-4" />}
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Company Name"
        leftIcon={<Building className="h-4 w-4" />}
        placeholder="Optional"
        {...register("companyName")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Phone"
          leftIcon={<Phone className="h-4 w-4" />}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <Input
        label="City"
        leftIcon={<MapPin className="h-4 w-4" />}
        {...register("city")}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={2}
          {...register("address")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Tier"
          options={tierOptions}
          error={errors.tier?.message}
          {...register("tier")}
        />

        <Input
          label="Commission Rate (%)"
          type="number"
          step="0.1"
          error={errors.commissionRate?.message}
          {...register("commissionRate")}
        />
      </div>

      <div className="flex gap-2 border-t pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {agent ? "Update" : "Create"} Agent
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
