"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Users,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Clock,
  Hotel,
  User,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";

interface Schedule {
  id: string;
  departureDate: string;
  returnDate: string;
  quota: number;
  availableQuota: number;
  priceQuad: number;
  priceTriple: number;
  priceDouble: number;
  priceSingle: number;
  package: {
    id: string;
    name: string;
    businessType: string;
    duration: number;
    thumbnail: string | null;
    description: string | null;
    inclusions: string | null;
  };
}

type RoomType = "QUAD" | "TRIPLE" | "DOUBLE" | "SINGLE";

const steps = [
  { id: 1, name: "Pilih Jadwal", icon: Calendar },
  { id: 2, name: "Data Pemesan", icon: User },
  { id: 3, name: "Konfirmasi", icon: CheckCircle },
];

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const scheduleId = searchParams.get("scheduleId");

  const [currentStep, setCurrentStep] = useState(1);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    roomType: "QUAD" as RoomType,
    paxAdult: 1,
    paxChild: 0,
    paxInfant: 0,
    specialRequests: "",
    // Customer data
    name: "",
    email: "",
    phone: "",
    identityNumber: "",
  });

  const fetchSchedule = useCallback(async () => {
    if (!scheduleId) return;

    try {
      const res = await fetch(`/api/schedules/${scheduleId}`);
      const data = await res.json();
      if (data.success) {
        setSchedule(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch schedule:", error);
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useEffect(() => {
    // Pre-fill user data if logged in
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const getRoomPrice = (type: RoomType) => {
    if (!schedule) return 0;
    switch (type) {
      case "QUAD":
        return schedule.priceQuad;
      case "TRIPLE":
        return schedule.priceTriple;
      case "DOUBLE":
        return schedule.priceDouble;
      case "SINGLE":
        return schedule.priceSingle;
      default:
        return 0;
    }
  };

  const calculateTotal = () => {
    const basePrice = getRoomPrice(formData.roomType);
    const adultTotal = basePrice * formData.paxAdult;
    const childTotal = basePrice * 0.75 * formData.paxChild;
    const infantTotal = basePrice * 0.1 * formData.paxInfant;
    return adultTotal + childTotal + infantTotal;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!schedule) return;

    setSubmitting(true);
    try {
      // If not logged in, create a guest booking or redirect to login
      if (!session) {
        // For now, redirect to login with return URL
        router.push(`/login?callbackUrl=/booking?scheduleId=${scheduleId}`);
        return;
      }

      const response = await fetch("/api/portal/bookings", {
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

      const data = await response.json();

      if (data.success) {
        // Redirect to payment or confirmation page
        router.push(`/portal/bookings/${data.data.id}`);
      } else {
        alert(data.error || "Gagal membuat booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Jadwal Tidak Ditemukan
        </h1>
        <p className="text-gray-600">
          Silakan pilih jadwal dari halaman jadwal.
        </p>
        <Link
          href="/schedules"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-700"
        >
          <Calendar className="h-5 w-5" />
          Lihat Jadwal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/schedules"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Booking Online
              </h1>
              <p className="text-sm text-gray-500">{schedule.package.name}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${currentStep >= step.id ? "text-emerald-600" : "text-gray-400"}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStep >= step.id
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="mx-4 h-5 w-5 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Pilih Jadwal */}
            {currentStep === 1 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  Detail Perjalanan
                </h2>

                {/* Schedule Card */}
                <div className="rounded-lg border p-4 mb-6">
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={
                          schedule.package.thumbnail ||
                          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=200"
                        }
                        alt={schedule.package.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {schedule.package.businessType}
                      </span>
                      <h3 className="font-semibold text-gray-900 mt-1">
                        {schedule.package.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {schedule.package.duration} Hari
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Sisa {schedule.availableQuota} kursi
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Keberangkatan</p>
                      <p className="font-medium">
                        {formatDate(schedule.departureDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Kepulangan</p>
                      <p className="font-medium">
                        {formatDate(schedule.returnDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Room Type Selection */}
                <h3 className="font-medium mb-3">Pilih Tipe Kamar</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(["QUAD", "TRIPLE", "DOUBLE", "SINGLE"] as RoomType[]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setFormData({ ...formData, roomType: type })
                        }
                        className={`flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-colors ${
                          formData.roomType === type
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Hotel
                          className={`h-6 w-6 ${formData.roomType === type ? "text-emerald-600" : "text-gray-400"}`}
                        />
                        <span className="font-medium">{type}</span>
                        <span className="text-sm text-emerald-600 font-semibold">
                          {formatCurrency(getRoomPrice(type))}
                        </span>
                      </button>
                    ),
                  )}
                </div>

                {/* Pax Count */}
                <h3 className="font-medium mb-3">Jumlah Peserta</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Dewasa</p>
                      <p className="text-sm text-gray-500">12 tahun ke atas</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paxAdult: Math.max(1, formData.paxAdult - 1),
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {formData.paxAdult}
                      </span>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paxAdult: formData.paxAdult + 1,
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Anak</p>
                      <p className="text-sm text-gray-500">2-11 tahun (75%)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paxChild: Math.max(0, formData.paxChild - 1),
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {formData.paxChild}
                      </span>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paxChild: formData.paxChild + 1,
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">Bayi</p>
                      <p className="text-sm text-gray-500">
                        Di bawah 2 tahun (10%)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paxInfant: Math.max(0, formData.paxInfant - 1),
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {formData.paxInfant}
                      </span>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            paxInfant: formData.paxInfant + 1,
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Data Pemesan */}
            {currentStep === 2 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Data Pemesan</h2>

                {!session && (
                  <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
                    <p className="text-amber-800 text-sm">
                      Sudah punya akun?{" "}
                      <Link
                        href={`/login?callbackUrl=/booking?scheduleId=${scheduleId}`}
                        className="font-semibold underline"
                      >
                        Login
                      </Link>{" "}
                      untuk booking lebih cepat.
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-lg border py-3 pl-10 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Sesuai KTP/Paspor"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-lg border py-3 pl-10 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Handphone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-lg border py-3 pl-10 pr-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIK (Nomor Induk Kependudukan)
                    </label>
                    <input
                      type="text"
                      value={formData.identityNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          identityNumber: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border py-3 px-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="16 digit NIK"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full rounded-lg border py-3 px-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Contoh: Vegetarian, kursi roda, dll."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Konfirmasi */}
            {currentStep === 3 && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">
                  Konfirmasi Booking
                </h2>

                {/* Trip Summary */}
                <div className="rounded-lg border p-4 mb-6">
                  <h3 className="font-medium mb-3">Detail Perjalanan</h3>
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={
                          schedule.package.thumbnail ||
                          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=200"
                        }
                        alt={schedule.package.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{schedule.package.name}</p>
                      <p className="text-gray-500">
                        {formatDate(schedule.departureDate)}
                      </p>
                      <p className="text-gray-500">
                        {schedule.package.duration} Hari
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passenger Summary */}
                <div className="rounded-lg border p-4 mb-6">
                  <h3 className="font-medium mb-3">Data Pemesan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">No. HP</span>
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Rincian Harga</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipe Kamar</span>
                      <span className="font-medium">{formData.roomType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Dewasa ({formData.paxAdult}x)
                      </span>
                      <span>
                        {formatCurrency(
                          getRoomPrice(formData.roomType) * formData.paxAdult,
                        )}
                      </span>
                    </div>
                    {formData.paxChild > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Anak ({formData.paxChild}x 75%)
                        </span>
                        <span>
                          {formatCurrency(
                            getRoomPrice(formData.roomType) *
                              0.75 *
                              formData.paxChild,
                          )}
                        </span>
                      </div>
                    )}
                    {formData.paxInfant > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Bayi ({formData.paxInfant}x 10%)
                        </span>
                        <span>
                          {formatCurrency(
                            getRoomPrice(formData.roomType) *
                              0.1 *
                              formData.paxInfant,
                          )}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-emerald-600">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-6 text-xs text-gray-500">
                  <p>Dengan melakukan booking, Anda menyetujui:</p>
                  <ul className="list-disc ml-4 mt-1 space-y-1">
                    <li>Syarat dan ketentuan yang berlaku</li>
                    <li>Kebijakan pembatalan dan pengembalian dana</li>
                    <li>
                      Data yang diberikan adalah benar dan dapat
                      dipertanggungjawabkan
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 rounded-xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Ringkasan Harga</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipe Kamar</span>
                  <span className="font-medium">{formData.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Harga/orang</span>
                  <span>{formatCurrency(getRoomPrice(formData.roomType))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah Peserta</span>
                  <span>
                    {formData.paxAdult + formData.paxChild + formData.paxInfant}{" "}
                    orang
                  </span>
                </div>
              </div>

              <div className="border-t my-4" />

              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total</span>
                <span className="text-emerald-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Kembali
                  </button>
                )}
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={
                      currentStep === 2 &&
                      (!formData.name || !formData.email || !formData.phone)
                    }
                    className="flex-1 rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Lanjutkan
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-700 disabled:bg-gray-300 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        Booking Sekarang
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Contact Info */}
              <div className="mt-6 rounded-lg bg-gray-50 p-4 text-center text-sm">
                <p className="text-gray-500">Butuh bantuan?</p>
                <p className="font-medium text-emerald-600">0812-3456-7890</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
    </div>
  );
}

export default function PublicBookingPage() {
  return (
    <Suspense fallback={<BookingLoadingFallback />}>
      <BookingPageContent />
    </Suspense>
  );
}
