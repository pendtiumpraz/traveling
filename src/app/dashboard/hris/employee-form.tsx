"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { User, Phone, Mail, Briefcase, Calendar, Edit } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  joinDate: z.string().min(1, "Join date is required"),
  baseSalary: z.string().optional(),
  isTourLeader: z.boolean().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Employee {
  id: string;
  nip: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string;
  department: string;
  joinDate: string;
  status: string;
  baseSalary: string | null;
  isTourLeader: boolean;
  branch: { name: string } | null;
}

interface EmployeeFormProps {
  mode: "view" | "create" | "edit";
  employee?: Employee | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

const departmentOptions = [
  { value: "Operations", label: "Operations" },
  { value: "Sales", label: "Sales" },
  { value: "Marketing", label: "Marketing" },
  { value: "Finance", label: "Finance" },
  { value: "HR", label: "Human Resources" },
  { value: "IT", label: "IT" },
  { value: "Customer Service", label: "Customer Service" },
];

const statusColors: Record<
  string,
  "success" | "warning" | "destructive" | "secondary"
> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  RESIGNED: "warning",
  TERMINATED: "destructive",
};

export function EmployeeForm({
  mode,
  employee,
  onSuccess,
  onCancel,
  onEdit,
}: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || "",
      email: employee?.email || "",
      phone: employee?.phone || "",
      position: employee?.position || "",
      department: employee?.department || "Operations",
      joinDate: employee?.joinDate?.split("T")[0] || "",
      baseSalary: employee?.baseSalary || "",
      isTourLeader: employee?.isTourLeader || false,
    },
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = employee ? `/api/employees/${employee.id}` : "/api/employees";
      const method = employee ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          baseSalary: data.baseSalary ? parseFloat(data.baseSalary) : null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save employee");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "view" && employee) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Employee ID</p>
            <p className="font-mono text-lg font-semibold">{employee.nip}</p>
          </div>
          <div className="flex items-center gap-2">
            {employee.isTourLeader && (
              <Badge variant="default">Tour Leader</Badge>
            )}
            <Badge variant={statusColors[employee.status]}>
              {employee.status}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Full Name</p>
          <p className="text-xl font-bold">{employee.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Position</p>
            <p className="font-medium">{employee.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{employee.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{employee.email || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{employee.phone || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Join Date</p>
            <p className="font-medium">
              {formatDate(employee.joinDate, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Branch</p>
            <p className="font-medium">
              {employee.branch?.name || "Head Office"}
            </p>
          </div>
        </div>

        {employee.baseSalary && (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Base Salary</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency(Number(employee.baseSalary))}
            </p>
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
        label="Full Name"
        leftIcon={<User className="h-4 w-4" />}
        error={errors.name?.message}
        {...register("name")}
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
          {...register("phone")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Position"
          leftIcon={<Briefcase className="h-4 w-4" />}
          error={errors.position?.message}
          {...register("position")}
        />

        <Select
          label="Department"
          options={departmentOptions}
          error={errors.department?.message}
          {...register("department")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Join Date"
          type="date"
          leftIcon={<Calendar className="h-4 w-4" />}
          error={errors.joinDate?.message}
          {...register("joinDate")}
        />

        <Input
          label="Base Salary"
          type="number"
          step="0.01"
          {...register("baseSalary")}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isTourLeader"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          {...register("isTourLeader")}
        />
        <label
          htmlFor="isTourLeader"
          className="text-sm font-medium text-gray-700"
        >
          Tour Leader / Guide
        </label>
      </div>

      <div className="flex gap-2 border-t pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {employee ? "Update" : "Create"} Employee
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
