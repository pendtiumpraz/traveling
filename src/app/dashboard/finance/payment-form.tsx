"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Select, Badge } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, Calendar, CreditCard, FileText, Edit } from "lucide-react";

const paymentSchema = z.object({
  bookingId: z.string().min(1, "Booking is required"),
  amount: z.string().min(1, "Amount is required"),
  method: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD", "QRIS", "VA"]),
  bankAccountId: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Payment {
  id: string;
  code: string;
  amount: string;
  method: string;
  status: string;
  reference: string | null;
  notes: string | null;
  paidAt: string | null;
  booking: {
    id: string;
    code: string;
    customer: { fullName: string };
    totalPrice: string;
  };
}

interface BookingOption {
  id: string;
  code: string;
  customerName: string;
  totalPrice: string;
  paidAmount: string;
}

interface BankOption {
  id: string;
  bankName: string;
  accountNumber: string;
}

interface PaymentFormProps {
  mode: "view" | "create" | "edit" | "verify";
  payment?: Payment | null;
  onSuccess: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

const methodOptions = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "QRIS", label: "QRIS" },
  { value: "VA", label: "Virtual Account" },
];

const statusColors: Record<
  string,
  "warning" | "success" | "destructive" | "secondary"
> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "destructive",
  REFUNDED: "secondary",
};

export function PaymentForm({
  mode,
  payment,
  onSuccess,
  onCancel,
  onEdit,
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingOption[]>([]);
  const [banks, setBanks] = useState<BankOption[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      bookingId: payment?.booking?.id || "",
      amount: payment?.amount || "",
      method: (payment?.method as PaymentFormData["method"]) || "BANK_TRANSFER",
      reference: payment?.reference || "",
      notes: payment?.notes || "",
    },
  });

  const selectedMethod = watch("method");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, banksRes] = await Promise.all([
          fetch("/api/bookings?pageSize=100"),
          fetch("/api/banks"),
        ]);
        const bookingsData = await bookingsRes.json();
        const banksData = await banksRes.json();

        if (bookingsData.success) {
          setBookings(
            bookingsData.data.map(
              (b: {
                id: string;
                code: string;
                customer: { fullName: string };
                totalPrice: string;
              }) => ({
                id: b.id,
                code: b.code,
                customerName: b.customer?.fullName || "-",
                totalPrice: b.totalPrice,
                paidAmount: "0",
              }),
            ),
          );
        }
        if (banksData.success) {
          setBanks(banksData.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    if (mode === "create") fetchData();
  }, [mode]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const url = payment ? `/api/payments/${payment.id}` : "/api/payments";
      const method = payment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save payment");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (status: "VERIFIED" | "REJECTED") => {
    if (!payment) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to verify payment");

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === "view" && payment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Payment Code</p>
            <p className="text-lg font-semibold">{payment.code}</p>
          </div>
          <Badge variant={statusColors[payment.status]} size="lg">
            {payment.status}
          </Badge>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(Number(payment.amount))}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Method</p>
            <p className="font-medium">{payment.method.replace("_", " ")}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reference</p>
            <p className="font-medium">{payment.reference || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Paid At</p>
            <p className="font-medium">
              {payment.paidAt ? formatDate(payment.paidAt) : "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Booking</p>
            <p className="font-medium">{payment.booking?.code || "-"}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">Customer</p>
          <p className="font-medium">
            {payment.booking?.customer?.fullName || "-"}
          </p>
        </div>

        {payment.notes && (
          <div>
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-sm">{payment.notes}</p>
          </div>
        )}

        <div className="flex gap-2 border-t pt-4">
          {payment.status === "PENDING" && (
            <>
              <Button
                onClick={() => handleVerify("VERIFIED")}
                disabled={isSubmitting}
              >
                Verify Payment
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleVerify("REJECTED")}
                disabled={isSubmitting}
              >
                Reject
              </Button>
            </>
          )}
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

      <Select
        label="Booking"
        options={bookings.map((b) => ({
          value: b.id,
          label: `${b.code} - ${b.customerName} (${formatCurrency(Number(b.totalPrice))})`,
        }))}
        error={errors.bookingId?.message}
        {...register("bookingId")}
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        leftIcon={<DollarSign className="h-4 w-4" />}
        error={errors.amount?.message}
        {...register("amount")}
      />

      <Select
        label="Payment Method"
        options={methodOptions}
        error={errors.method?.message}
        {...register("method")}
      />

      {selectedMethod === "BANK_TRANSFER" && (
        <Select
          label="Bank Account"
          options={banks.map((b) => ({
            value: b.id,
            label: `${b.bankName} - ${b.accountNumber}`,
          }))}
          {...register("bankAccountId")}
        />
      )}

      <Input
        label="Reference Number"
        placeholder="Transaction ID / Receipt number"
        leftIcon={<CreditCard className="h-4 w-4" />}
        {...register("reference")}
      />

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          {...register("notes")}
        />
      </div>

      <div className="flex gap-2 border-t pt-4">
        <Button type="submit" isLoading={isSubmitting}>
          {payment ? "Update" : "Record"} Payment
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
