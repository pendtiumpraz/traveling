"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  Building2,
} from "lucide-react";

interface Payment {
  id: string;
  booking: {
    code: string;
    schedule: { package: { name: string } };
  };
  amount: number;
  paymentMethod: string;
  status: string;
  proofUrl?: string;
  verifiedAt?: string;
  createdAt: string;
}

interface Booking {
  id: string;
  code: string;
  totalPrice: number;
  paidAmount: number;
  schedule: { package: { name: string } };
}

export default function PortalPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchPayments();
    fetchPendingBookings();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch("/api/portal/payments");
      const data = await res.json();
      if (data.success) {
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBookings = async () => {
    try {
      const res = await fetch(
        "/api/portal/bookings?paymentStatus=UNPAID,PARTIAL",
      );
      const data = await res.json();
      if (data.success) {
        setPendingBookings(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch pending bookings:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; icon: typeof Clock }
    > = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      VERIFIED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    const style = styles[status] || styles.PENDING;
    const Icon = style.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
      >
        <Icon className="h-3 w-3" />
        {status === "PENDING"
          ? "Menunggu Verifikasi"
          : status === "VERIFIED"
            ? "Terverifikasi"
            : "Ditolak"}
      </span>
    );
  };

  const bankAccounts = [
    { bank: "BCA", account: "1234567890", name: "PT Travel Indonesia" },
    { bank: "Mandiri", account: "9876543210", name: "PT Travel Indonesia" },
    { bank: "BNI", account: "5555666677", name: "PT Travel Indonesia" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Riwayat Pembayaran</h1>
        <p className="text-gray-500">Kelola dan pantau pembayaran Anda</p>
      </div>

      {/* Pending Payments Alert */}
      {pendingBookings.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-yellow-800">
            <Clock className="h-5 w-5" />
            Tagihan Menunggu Pembayaran
          </h3>
          <div className="mt-3 space-y-2">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-lg bg-white p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.schedule?.package?.name}
                  </p>
                  <p className="text-sm text-gray-500">#{booking.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Sisa tagihan</p>
                  <p className="font-bold text-red-600">
                    {formatPrice(
                      booking.totalPrice - (booking.paidAmount || 0),
                    )}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBooking(booking);
                    setShowPaymentModal(true);
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  Bayar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bank Accounts */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
          <Building2 className="h-5 w-5" />
          Rekening Pembayaran
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {bankAccounts.map((bank) => (
            <div key={bank.bank} className="rounded-lg bg-gray-50 p-3">
              <p className="font-semibold text-gray-900">{bank.bank}</p>
              <p className="text-lg font-bold text-primary">{bank.account}</p>
              <p className="text-sm text-gray-500">a.n. {bank.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900">Riwayat Pembayaran</h3>
        </div>

        {payments.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Belum ada riwayat pembayaran</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.booking?.schedule?.package?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      #{payment.booking?.code} • {payment.paymentMethod}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatPrice(payment.amount)}
                  </p>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Konfirmasi Pembayaran
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload bukti transfer untuk booking #{selectedBooking.code}
            </p>

            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Total yang harus dibayar</p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(
                  selectedBooking.totalPrice -
                    (selectedBooking.paidAmount || 0),
                )}
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload Bukti Transfer
              </label>
              <div className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Klik untuk upload
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button className="flex-1 rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary/90">
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
