"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, Button, Input, Badge } from "@/components/ui";
import {
  Building2,
  Save,
  Globe,
  Palette,
  Settings,
  Loader2,
  Check,
  Languages,
  Clock,
  DollarSign,
  Key,
  Eye,
  EyeOff,
  Bot,
} from "lucide-react";

interface TenantSettings {
  id: string;
  name: string;
  subdomain: string;
  domain?: string | null;
  logo?: string | null;
  businessTypes: string[];
  defaultCurrency: string;
  defaultLanguage: string;
  timezone: string;
  features?: Record<string, boolean>;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  terminology?: Record<string, string>;
  geminiApiKey?: string | null;
}

const BUSINESS_TYPES = [
  { value: "UMROH", label: "Umroh" },
  { value: "HAJI", label: "Haji" },
  { value: "OUTBOUND", label: "Wisata Luar Negeri" },
  { value: "INBOUND", label: "Wisata Domestik Inbound" },
  { value: "DOMESTIC", label: "Wisata Domestik" },
  { value: "MICE", label: "MICE" },
  { value: "CRUISE", label: "Cruise" },
];

const CURRENCIES = [
  { value: "IDR", label: "Rupiah (IDR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "SAR", label: "Saudi Riyal (SAR)" },
  { value: "SGD", label: "Singapore Dollar (SGD)" },
];

const LANGUAGES = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية (Arabic)" },
];

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "WIB (Jakarta)" },
  { value: "Asia/Makassar", label: "WITA (Makassar)" },
  { value: "Asia/Jayapura", label: "WIT (Jayapura)" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Riyadh", label: "Riyadh" },
];

export default function TenantSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [session]);

  const fetchSettings = async () => {
    if (!session?.user?.tenantId) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tenant/${session.user.tenantId}`);
      const data = await res.json();
      if (data.success) {
        setSettings(data.data.tenant);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const res = await fetch("/api/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: settings.id,
          name: settings.name,
          domain: settings.domain,
          businessTypes: settings.businessTypes,
          defaultCurrency: settings.defaultCurrency,
          defaultLanguage: settings.defaultLanguage,
          timezone: settings.timezone,
          theme: settings.theme,
          geminiApiKey: settings.geminiApiKey,
        }),
      });
      
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBusinessType = (type: string) => {
    if (!settings) return;
    
    const types = settings.businessTypes.includes(type)
      ? settings.businessTypes.filter((t) => t !== type)
      : [...settings.businessTypes, type];
    
    setSettings({ ...settings, businessTypes: types });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Tidak dapat memuat pengaturan</h3>
        <p className="text-gray-500 mt-1">Silakan coba refresh halaman</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Tenant</h1>
          <p className="text-gray-500">Konfigurasi pengaturan perusahaan Anda</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Tersimpan
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </>
          )}
        </Button>
      </div>

      {/* Basic Info */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Informasi Dasar</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Perusahaan
            </label>
            <Input
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subdomain
            </label>
            <div className="flex items-center">
              <Input
                value={settings.subdomain}
                disabled
                className="rounded-r-none bg-gray-50"
              />
              <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-gray-500 text-sm">
                .domain.com
              </span>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Domain (Opsional)
            </label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <Input
                value={settings.domain || ""}
                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                placeholder="travel.yourcompany.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hubungi support untuk setup custom domain
            </p>
          </div>
        </div>
      </Card>

      {/* Business Types */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Tipe Bisnis</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Pilih tipe bisnis yang dijalankan perusahaan Anda
        </p>
        
        <div className="flex flex-wrap gap-2">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => toggleBusinessType(type.value)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                settings.businessTypes.includes(type.value)
                  ? "bg-purple-100 border-purple-300 text-purple-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Regional Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Pengaturan Regional</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Mata Uang Default
            </label>
            <select
              value={settings.defaultCurrency}
              onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Languages className="h-4 w-4 inline mr-1" />
              Bahasa Default
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-4 w-4 inline mr-1" />
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              {TIMEZONES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Tema & Warna</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warna Utama
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.theme?.primaryColor || "#7c3aed"}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, primaryColor: e.target.value }
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={settings.theme?.primaryColor || "#7c3aed"}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, primaryColor: e.target.value }
                })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warna Sekunder
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.theme?.secondaryColor || "#4f46e5"}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, secondaryColor: e.target.value }
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={settings.theme?.secondaryColor || "#4f46e5"}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, secondaryColor: e.target.value }
                })}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warna Aksen
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.theme?.accentColor || "#06b6d4"}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, accentColor: e.target.value }
                })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={settings.theme?.accentColor || "#06b6d4"}
                onChange={(e) => setSettings({
                  ...settings,
                  theme: { ...settings.theme, accentColor: e.target.value }
                })}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* API Keys */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">API Keys</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Konfigurasi API key untuk fitur AI dan integrasi lainnya
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Bot className="h-4 w-4 inline mr-1" />
              Gemini API Key
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  value={settings.geminiApiKey || ""}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Dapatkan API key dari{" "}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Google AI Studio
              </a>
              . Key ini digunakan untuk AI Assistant.
            </p>
          </div>
        </div>
      </Card>

      {/* Tenant Info */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Tenant ID: {settings.id}</span>
          <Badge variant="secondary">{session?.user?.tenantName || settings.name}</Badge>
        </div>
      </Card>
    </div>
  );
}
