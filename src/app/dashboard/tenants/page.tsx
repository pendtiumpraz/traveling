"use client";

import { useState, useEffect } from "react";
import { Card, Button, Badge, Input } from "@/components/ui";
import {
  Building2,
  Plus,
  Search,
  Users,
  CreditCard,
  DollarSign,
  Globe,
  Settings,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface TenantStats {
  customers: number;
  bookings: number;
  revenue: number;
  employees: number;
  agents: number;
  users: number;
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  domain?: string | null;
  logo?: string | null;
  businessTypes: string[];
  defaultCurrency: string;
  isActive: boolean;
  stats?: TenantStats;
}

interface CreateTenantData {
  tenantName: string;
  subdomain: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  businessTypes: string[];
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createData, setCreateData] = useState<CreateTenantData>({
    tenantName: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    businessTypes: ["UMROH"],
  });
  const [subdomainStatus, setSubdomainStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  useEffect(() => {
    fetchTenants();
  }, [search]);

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tenant?search=${search}`);
      const data = await res.json();
      if (data.success) {
        setTenants(data.data.tenants);
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubdomain = async (subdomain: string) => {
    if (subdomain.length < 3) {
      setSubdomainStatus({ checking: false });
      return;
    }

    setSubdomainStatus({ checking: true });
    try {
      const res = await fetch(`/api/tenant/check?subdomain=${subdomain}`);
      const data = await res.json();
      if (data.success) {
        setSubdomainStatus({
          checking: false,
          available: data.data.available,
          message: data.data.message,
        });
      }
    } catch {
      setSubdomainStatus({ checking: false });
    }
  };

  const handleSubdomainChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setCreateData({ ...createData, subdomain: cleaned });
    checkSubdomain(cleaned);
  };

  const handleCreateTenant = async () => {
    if (!subdomainStatus.available) return;
    
    setCreating(true);
    try {
      const res = await fetch("/api/tenant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });
      const data = await res.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setCreateData({
          tenantName: "",
          subdomain: "",
          adminName: "",
          adminEmail: "",
          adminPassword: "",
          businessTypes: ["UMROH"],
        });
        fetchTenants();
      } else {
        alert(data.error || "Gagal membuat tenant");
      }
    } catch (error) {
      console.error("Failed to create tenant:", error);
      alert("Gagal membuat tenant");
    } finally {
      setCreating(false);
    }
  };

  const toggleTenantStatus = async (tenantId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, isActive: !currentStatus }),
      });
      if (res.ok) {
        fetchTenants();
      }
    } catch (error) {
      console.error("Failed to toggle tenant:", error);
    }
  };

  const deleteTenant = async (tenantId: string) => {
    if (!confirm("Yakin ingin menghapus tenant ini? Data tidak bisa dikembalikan.")) return;
    
    try {
      const res = await fetch(`/api/tenant?id=${tenantId}`, { method: "DELETE" });
      if (res.ok) {
        fetchTenants();
      }
    } catch (error) {
      console.error("Failed to delete tenant:", error);
    }
  };

  const businessTypeColors: Record<string, string> = {
    UMROH: "bg-green-100 text-green-700",
    HAJI: "bg-yellow-100 text-yellow-700",
    OUTBOUND: "bg-blue-100 text-blue-700",
    INBOUND: "bg-purple-100 text-purple-700",
    DOMESTIC: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-gray-500">Kelola semua tenant dalam sistem</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Tenant
        </Button>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama atau subdomain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={fetchTenants}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Tenant Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      ) : tenants.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada tenant</h3>
          <p className="text-gray-500 mt-1">Klik tombol "Tambah Tenant" untuk membuat tenant baru</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    {tenant.logo ? (
                      <img src={tenant.logo} alt="" className="w-8 h-8 rounded" />
                    ) : (
                      <Building2 className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                    <p className="text-sm text-gray-500">{tenant.subdomain}.domain.com</p>
                  </div>
                </div>
                <Badge variant={tenant.isActive ? "default" : "secondary"}>
                  {tenant.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>

              {/* Business Types */}
              <div className="flex flex-wrap gap-1 mb-3">
                {tenant.businessTypes.map((type) => (
                  <span
                    key={type}
                    className={`text-xs px-2 py-0.5 rounded-full ${businessTypeColors[type] || "bg-gray-100 text-gray-700"}`}
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Stats */}
              {tenant.stats && (
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b mb-3">
                  <div className="text-center">
                    <Users className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium">{tenant.stats.customers}</p>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                  <div className="text-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium">{tenant.stats.bookings}</p>
                    <p className="text-xs text-gray-500">Booking</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium">{formatCurrency(tenant.stats.revenue).replace("Rp", "").trim()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTenantStatus(tenant.id, tenant.isActive)}
                    title={tenant.isActive ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {tenant.isActive ? (
                      <ToggleRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" title="Settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTenant(tenant.id)}
                    title="Hapus"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Buka
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 p-6">
            <h2 className="text-xl font-bold mb-4">Tambah Tenant Baru</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Perusahaan
                </label>
                <Input
                  value={createData.tenantName}
                  onChange={(e) => setCreateData({ ...createData, tenantName: e.target.value })}
                  placeholder="PT Travel Umroh Indonesia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subdomain
                </label>
                <div className="flex items-center">
                  <Input
                    value={createData.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    placeholder="travelumroh"
                    className="rounded-r-none"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-gray-500 text-sm">
                    .domain.com
                  </span>
                </div>
                {subdomainStatus.checking && (
                  <p className="text-sm text-gray-500 mt-1">Mengecek...</p>
                )}
                {!subdomainStatus.checking && subdomainStatus.message && (
                  <p className={`text-sm mt-1 ${subdomainStatus.available ? "text-green-600" : "text-red-600"}`}>
                    {subdomainStatus.message}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Admin User</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Admin</label>
                    <Input
                      value={createData.adminName}
                      onChange={(e) => setCreateData({ ...createData, adminName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={createData.adminEmail}
                      onChange={(e) => setCreateData({ ...createData, adminEmail: e.target.value })}
                      placeholder="admin@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <Input
                      type="password"
                      value={createData.adminPassword}
                      onChange={(e) => setCreateData({ ...createData, adminPassword: e.target.value })}
                      placeholder="Min 8 karakter"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateTenant}
                  disabled={!subdomainStatus.available || creating || !createData.tenantName || !createData.adminEmail}
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Tenant
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
