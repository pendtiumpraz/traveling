"use client";

import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";

interface PaymentFormProps {
  initialData?: Partial<PaymentFormData>;
  bookings?: Array<{
    id: string;
    code: string;
    customerName: string;
    balance: number;
  }>;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  onCancel: () => void;
}

export interface PaymentFormData {
  bookingId: string;
  amount: number;
  paymentMethod: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  referenceNo?: string;
  paymentDate: string;
  notes?: string;
}

export function PaymentForm({
  initialData,
  bookings = [],
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    bookingId: initialData?.bookingId || "",
    amount: initialData?.amount || 0,
    paymentMethod: initialData?.paymentMethod || "TRANSFER",
    bankName: initialData?.bankName || "",
    accountNumber: initialData?.accountNumber || "",
    accountName: initialData?.accountName || "",
    referenceNo: initialData?.referenceNo || "",
    paymentDate:
      initialData?.paymentDate || new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
  });

  const handleChange = (
    field: keyof PaymentFormData,
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

  const selectedBooking = bookings.find((b) => b.id === formData.bookingId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Selection */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Data Pembayaran</h3>
        <div className="grid gap-4">
          <Select
            label="Booking *"
            value={formData.bookingId}
            onChange={(e) => handleChange("bookingId", e.target.value)}
            required
            options={[
              { value: "", label: "Pilih Booking" },
              ...bookings.map((b) => ({
                value: b.id,
                label: `${b.code} - ${b.customerName}`,
              })),
            ]}
          />
          {selectedBooking && (
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                Sisa Pembayaran:{" "}
                <span className="font-bold">
                  Rp {selectedBooking.balance.toLocaleString("id-ID")}
                </span>
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jumlah Pembayaran *"
              type="number"
              value={formData.amount}
              onChange={(e) =>
                handleChange("amount", parseInt(e.target.value) || 0)
              }
              required
              min={1}
            />
            <Input
              label="Tanggal Pembayaran *"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => handleChange("paymentDate", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h3 className="mb-4 font-medium text-gray-900">Metode Pembayaran</h3>
        <div className="grid gap-4">
          <Select
            label="Metode *"
            value={formData.paymentMethod}
            onChange={(e) => handleChange("paymentMethod", e.target.value)}
            options={[
              { value: "TRANSFER", label: "Transfer Bank" },
              { value: "CASH", label: "Tunai" },
              { value: "CREDIT_CARD", label: "Kartu Kredit" },
              { value: "DEBIT_CARD", label: "Kartu Debit" },
              { value: "EWALLET", label: "E-Wallet" },
              { value: "VIRTUAL_ACCOUNT", label: "Virtual Account" },
            ]}
          />
          {formData.paymentMethod === "TRANSFER" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nama Bank"
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  placeholder="BCA, Mandiri, dll"
                />
                <Input
                  label="No. Rekening"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    handleChange("accountNumber", e.target.value)
                  }
                />
              </div>
              <Input
                label="Nama Pemilik Rekening"
                value={formData.accountName}
                onChange={(e) => handleChange("accountName", e.target.value)}
              />
            </>
          )}
          <Input
            label="No. Referensi"
            value={formData.referenceNo}
            onChange={(e) => handleChange("referenceNo", e.target.value)}
            placeholder="No. transaksi/bukti transfer"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Catatan
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update" : "Simpan Pembayaran"}
        </Button>
      </div>
    </form>
  );
}
