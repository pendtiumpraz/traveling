"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bed,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const scheduleId = searchParams.get("schedule");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<{
    id: string;
    departureDate: string;
    package: { name: string; priceQuad: number };
    priceQuad?: number;
    priceTriple?: number;
    priceDouble?: number;
    priceSingle?: number;
    availableQuota: number;
    status: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    roomType: "QUAD",
    paxAdult: 1,
    paxChild: 0,
    paxInfant: 0,
    specialRequests: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (scheduleId) {
      fetchSchedule(scheduleId);
    }
  }, [scheduleId]);

  const fetchSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/schedules/${id}`);
      const data = await res.json();
      if (data.success) {
        setSchedule(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
    }
  };

  const roomTypes = [
    {
      value: "QUAD",
      label: "Quad (4 orang/kamar)",
      price: schedule?.priceQuad || 0,
    },
    {
      value: "TRIPLE",
      label: "Triple (3 orang/kamar)",
      price: schedule?.priceTriple || 0,
    },
    {
      value: "DOUBLE",
      label: "Double (2 orang/kamar)",
      price: schedule?.priceDouble || 0,
    },
    {
      value: "SINGLE",
      label: "Single (1 orang/kamar)",
      price: schedule?.priceSingle || 0,
    },
  ];

  const selectedRoom = roomTypes.find((r) => r.value === formData.roomType);
  const totalPax = formData.paxAdult + formData.paxChild;
  const totalPrice = (selectedRoom?.price || 0) * totalPax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async () => {
    if (!schedule || !session?.user) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/portal/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: schedule.id,
          roomType: formData.roomType,
          paxAdult: formData.paxAdult,
          paxChild: formData.paxChild,
          paxInfant: formData.paxInfant,
          specialRequests: formData.specialRequests,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStep(4); // Success step
      } else {
        setError(data.error || "Gagal membuat booking");
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (!scheduleId) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          Pilih Jadwal Dulu
        </h2>
        <p className="mt-2 text-gray-500">
          Silakan pilih jadwal keberangkatan terlebih dahulu untuk melanjutkan
          booking.
        </p>
        <button
          onClick={() => router.push("/portal/schedules")}
          className="mt-4 rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90"
        >
          Lihat Jadwal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Baru</h1>
        <p className="text-gray-500">Lengkapi data untuk melakukan pemesanan</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`mx-2 h-1 w-12 rounded ${
                  step > s ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-8 text-sm text-gray-500">
        <span className={step >= 1 ? "text-primary font-medium" : ""}>
          Pilih Kamar
        </span>
        <span className={step >= 2 ? "text-primary font-medium" : ""}>
          Data Peserta
        </span>
        <span className={step >= 3 ? "text-primary font-medium" : ""}>
          Konfirmasi
        </span>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Step 1: Room Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Pilih Tipe Kamar
            </h2>

            {/* Schedule Info */}
            {schedule && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="font-medium text-gray-900">
                  {schedule.package?.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Keberangkatan:{" "}
                  {new Date(schedule.departureDate).toLocaleDateString("id-ID")}
                </p>
              </div>
            )}

            {/* Room Options */}
            <div className="grid gap-3 sm:grid-cols-2">
              {roomTypes.map((room) => (
                <label
                  key={room.value}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-colors ${
                    formData.roomType === room.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="roomType"
                      value={room.value}
                      checked={formData.roomType === room.value}
                      onChange={(e) =>
                        setFormData({ ...formData, roomType: e.target.value })
                      }
                      className="h-4 w-4 text-primary"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{room.label}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(room.price)}/pax
                      </p>
                    </div>
                  </div>
                  <Bed className="h-5 w-5 text-gray-400" />
                </label>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary/90"
            >
              Lanjut <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Step 2: Pax Count */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Jumlah Peserta
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dewasa (12+ tahun)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        paxAdult: Math.max(1, formData.paxAdult - 1),
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-semibold">
                    {formData.paxAdult}
                  </span>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        paxAdult: formData.paxAdult + 1,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Anak (2-11 tahun)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        paxChild: Math.max(0, formData.paxChild - 1),
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-semibold">
                    {formData.paxChild}
                  </span>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        paxChild: formData.paxChild + 1,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bayi (0-2 tahun)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        paxInfant: Math.max(0, formData.paxInfant - 1),
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-lg font-semibold">
                    {formData.paxInfant}
                  </span>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        paxInfant: formData.paxInfant + 1,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Permintaan Khusus
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialRequests: e.target.value,
                    })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Contoh: Kursi roda, makanan khusus, dll..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" /> Kembali
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary/90"
              >
                Lanjut <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Konfirmasi Booking
            </h2>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Paket</span>
                <span className="font-medium text-gray-900">
                  {schedule?.package?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Keberangkatan</span>
                <span className="font-medium text-gray-900">
                  {schedule &&
                    new Date(schedule.departureDate).toLocaleDateString(
                      "id-ID",
                    )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipe Kamar</span>
                <span className="font-medium text-gray-900">
                  {selectedRoom?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jumlah Peserta</span>
                <span className="font-medium text-gray-900">
                  {formData.paxAdult} Dewasa, {formData.paxChild} Anak,{" "}
                  {formData.paxInfant} Bayi
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Harga per pax</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(selectedRoom?.price || 0)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" /> Kembali
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Konfirmasi Booking"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Booking Berhasil!
            </h2>
            <p className="mt-2 text-gray-500">
              Booking Anda telah berhasil dibuat. Silakan lakukan pembayaran
              untuk mengonfirmasi pesanan.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => router.push("/portal/my-bookings")}
                className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Lihat Booking
              </button>
              <button
                onClick={() => router.push("/portal/payments")}
                className="rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90"
              >
                Bayar Sekarang
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortalBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse h-96 bg-gray-100 rounded-xl"></div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
