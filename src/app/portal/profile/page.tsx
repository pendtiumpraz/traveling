"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Phone,
  MapPin,
  FileText,
  Shield,
  Camera,
  Save,
  AlertCircle,
} from "lucide-react";

export default function PortalProfilePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    birthDate: "",
    birthPlace: "",
    gender: "",
    bloodType: "",
    passportNumber: "",
    passportExpiry: "",
    passportIssuePlace: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

  useEffect(() => {
    if (session?.user) {
      // Load user data
      setFormData((prev) => ({
        ...prev,
        fullName: session.user.name || "",
        email: session.user.email || "",
      }));
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/portal/profile");
      const data = await res.json();
      if (data.success && data.data) {
        setFormData((prev) => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/portal/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Profil berhasil diperbarui");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Gagal menyimpan profil");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Data Pribadi", icon: User },
    { id: "address", label: "Alamat", icon: MapPin },
    { id: "passport", label: "Paspor", icon: FileText },
    { id: "emergency", label: "Kontak Darurat", icon: Phone },
    { id: "security", label: "Keamanan", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
        <p className="text-gray-500">Kelola informasi akun dan data pribadi</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
              {formData.fullName?.charAt(0) || "U"}
            </div>
            <button className="absolute bottom-0 right-0 rounded-full bg-white p-2 shadow-md hover:bg-gray-50">
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-900">
              {formData.fullName}
            </h2>
            <p className="text-gray-500">{formData.email}</p>
            <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Jamaah Verified
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {/* Personal Data */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Data Pribadi</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  No. HP
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) =>
                    setFormData({ ...formData, birthPlace: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                >
                  <option value="">Pilih</option>
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Golongan Darah
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) =>
                    setFormData({ ...formData, bloodType: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                >
                  <option value="">Pilih</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Address */}
        {activeTab === "address" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Alamat</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Alamat Lengkap
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kota
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Passport */}
        {activeTab === "passport" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Data Paspor</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nomor Paspor
                </label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, passportNumber: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tanggal Kadaluarsa
                </label>
                <input
                  type="date"
                  value={formData.passportExpiry}
                  onChange={(e) =>
                    setFormData({ ...formData, passportExpiry: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tempat Terbit
                </label>
                <input
                  type="text"
                  value={formData.passportIssuePlace}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passportIssuePlace: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Perhatian!</p>
                  <p>
                    Pastikan paspor masih berlaku minimal 8 bulan dari tanggal
                    keberangkatan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {activeTab === "emergency" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Kontak Darurat</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama
                </label>
                <input
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyName: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hubungan
                </label>
                <select
                  value={formData.emergencyRelation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyRelation: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                >
                  <option value="">Pilih</option>
                  <option value="SPOUSE">Suami/Istri</option>
                  <option value="PARENT">Orang Tua</option>
                  <option value="SIBLING">Saudara Kandung</option>
                  <option value="CHILD">Anak</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  No. HP
                </label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyPhone: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Keamanan Akun</h3>
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Ubah Password</p>
                    <p className="text-sm text-gray-500">
                      Perbarui password akun Anda
                    </p>
                  </div>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Ubah
                  </button>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-500">
                      Tambahkan lapisan keamanan ekstra
                    </p>
                  </div>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Aktifkan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        {activeTab !== "security" && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
