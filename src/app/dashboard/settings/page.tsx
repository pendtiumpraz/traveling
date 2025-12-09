"use client";

import { useState } from "react";
import { Button, Card, Input } from "@/components/ui";
import { User, Building, Bell, Lock, Palette, Globe } from "lucide-react";

type TabType =
  | "profile"
  | "company"
  | "notifications"
  | "security"
  | "appearance";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const tabs = [
    { id: "profile" as TabType, label: "Profile", icon: User },
    { id: "company" as TabType, label: "Company", icon: Building },
    { id: "notifications" as TabType, label: "Notifications", icon: Bell },
    { id: "security" as TabType, label: "Security", icon: Lock },
    { id: "appearance" as TabType, label: "Appearance", icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "company" && <CompanySettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
  };

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Profile Information</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            JD
          </div>
          <div>
            <Button variant="outline" size="sm">
              Change Photo
            </Button>
            <p className="mt-1 text-xs text-gray-500">JPG, PNG. Max 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" defaultValue="John" />
          <Input label="Last Name" defaultValue="Doe" />
        </div>

        <Input label="Email" type="email" defaultValue="john@example.com" />
        <Input label="Phone" defaultValue="+62 812 3456 7890" />

        <div className="flex justify-end border-t pt-4">
          <Button onClick={handleSave} isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function CompanySettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
  };

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Company Information</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <Button variant="outline" size="sm">
              Upload Logo
            </Button>
            <p className="mt-1 text-xs text-gray-500">
              PNG, SVG. Recommended 200x200
            </p>
          </div>
        </div>

        <Input label="Company Name" defaultValue="PT Travel Prima" />
        <Input label="Legal Name" defaultValue="PT Travel Prima Indonesia" />

        <div className="grid grid-cols-2 gap-4">
          <Input label="NPWP" defaultValue="01.234.567.8-901.000" />
          <Input label="NIB" defaultValue="1234567890123" />
        </div>

        <Input label="Address" defaultValue="Jl. Sudirman No. 123" />

        <div className="grid grid-cols-3 gap-4">
          <Input label="City" defaultValue="Jakarta" />
          <Input label="Province" defaultValue="DKI Jakarta" />
          <Input label="Postal Code" defaultValue="12190" />
        </div>

        <Input label="Website" defaultValue="https://travelprime.co.id" />

        <div className="flex justify-end border-t pt-4">
          <Button onClick={handleSave} isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Notification Preferences</h2>
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Email Notifications</h3>
          <NotificationToggle
            title="New Bookings"
            description="Get notified when a new booking is made"
            defaultChecked
          />
          <NotificationToggle
            title="Payment Received"
            description="Get notified when payment is confirmed"
            defaultChecked
          />
          <NotificationToggle
            title="Schedule Changes"
            description="Get notified about departure schedule updates"
            defaultChecked
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">WhatsApp Notifications</h3>
          <NotificationToggle
            title="Customer Messages"
            description="Receive customer inquiries via WhatsApp"
            defaultChecked
          />
          <NotificationToggle
            title="Departure Reminders"
            description="Send automatic reminders to customers"
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">System Notifications</h3>
          <NotificationToggle
            title="Low Stock Alerts"
            description="Get notified when inventory is low"
            defaultChecked
          />
          <NotificationToggle
            title="Document Expiry"
            description="Alerts for expiring passports/visas"
            defaultChecked
          />
        </div>
      </div>
    </Card>
  );
}

function NotificationToggle({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
        <div className="space-y-4">
          <Input label="Current Password" type="password" />
          <Input label="New Password" type="password" />
          <Input label="Confirm New Password" type="password" />

          <div className="flex justify-end border-t pt-4">
            <Button onClick={handleSave} isLoading={isLoading}>
              Update Password
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Two-Factor Authentication
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Enable 2FA</p>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <Button variant="outline">Setup 2FA</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Active Sessions</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">Windows - Chrome</p>
              <p className="text-sm text-gray-500">
                Jakarta, Indonesia - Current session
              </p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-medium">iPhone - Safari</p>
              <p className="text-sm text-gray-500">
                Jakarta, Indonesia - 2 hours ago
              </p>
            </div>
            <Button variant="ghost" size="sm">
              Revoke
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AppearanceSettings() {
  const [theme, setTheme] = useState("emerald");
  const [mode, setMode] = useState("light");

  const themes = [
    { id: "emerald", color: "#10b981", label: "Emerald" },
    { id: "blue", color: "#3b82f6", label: "Blue" },
    { id: "purple", color: "#8b5cf6", label: "Purple" },
    { id: "rose", color: "#f43f5e", label: "Rose" },
    { id: "orange", color: "#f97316", label: "Orange" },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Theme Color</h2>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                theme === t.id
                  ? "border-gray-900 scale-110"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: t.color }}
              title={t.label}
            >
              {theme === t.id && (
                <svg
                  className="h-5 w-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Display Mode</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setMode("light")}
            className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              mode === "light"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
          >
            <div className="h-16 w-24 rounded-lg bg-white shadow-md" />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button
            onClick={() => setMode("dark")}
            className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              mode === "dark"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
          >
            <div className="h-16 w-24 rounded-lg bg-gray-900 shadow-md" />
            <span className="text-sm font-medium">Dark</span>
          </button>
          <button
            onClick={() => setMode("system")}
            className={`flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
              mode === "system"
                ? "border-primary bg-primary/5"
                : "border-gray-200"
            }`}
          >
            <div className="flex h-16 w-24 overflow-hidden rounded-lg shadow-md">
              <div className="w-1/2 bg-white" />
              <div className="w-1/2 bg-gray-900" />
            </div>
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Language & Region</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Language
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Timezone
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
              <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
              <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="IDR">IDR - Indonesian Rupiah</option>
              <option value="USD">USD - US Dollar</option>
              <option value="SAR">SAR - Saudi Riyal</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Date Format
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}
