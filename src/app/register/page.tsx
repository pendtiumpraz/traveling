"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Badge } from "@/components/ui";
import { 
  Plane, Mail, Lock, User, Phone, Eye, EyeOff, Building2, 
  Globe, CheckCircle, XCircle, Loader2, ArrowRight 
} from "lucide-react";

// Schema for user registration (within a tenant)
const userRegisterSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    phone: z.string().min(8, "Nomor HP minimal 8 karakter"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

// Schema for tenant registration
const tenantRegisterSchema = z
  .object({
    tenantName: z.string().min(3, "Nama perusahaan minimal 3 karakter"),
    subdomain: z.string()
      .min(3, "Subdomain minimal 3 karakter")
      .max(63, "Subdomain maksimal 63 karakter")
      .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Subdomain hanya boleh huruf kecil, angka, dan strip"),
    adminName: z.string().min(2, "Nama admin minimal 2 karakter"),
    adminEmail: z.string().email("Email tidak valid"),
    adminPassword: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

type UserFormData = z.infer<typeof userRegisterSchema>;
type TenantFormData = z.infer<typeof tenantRegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Determine if this is tenant registration or user registration
  const [registrationType, setRegistrationType] = useState<"user" | "tenant">("user");
  const [tenantMode, setTenantMode] = useState<"single" | "multi">("single");
  
  // Subdomain check state
  const [subdomainStatus, setSubdomainStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  useEffect(() => {
    // Check tenant mode from environment (passed via API or header)
    const mode = process.env.NEXT_PUBLIC_TENANT_MODE || "single";
    setTenantMode(mode as "single" | "multi");
    
    // In multi-tenant mode on main domain, default to tenant registration
    // In single-tenant mode or on subdomain, default to user registration
    if (mode === "multi") {
      // Check if we're on main domain or subdomain
      const hostname = window.location.hostname;
      const isMainDomain = hostname === "localhost" || 
        hostname === process.env.NEXT_PUBLIC_BASE_DOMAIN?.split(":")[0] ||
        !hostname.includes(".");
      
      if (isMainDomain) {
        setRegistrationType("tenant");
      }
    }
  }, []);

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userRegisterSchema),
  });

  const tenantForm = useForm<TenantFormData>({
    resolver: zodResolver(tenantRegisterSchema),
  });

  // Check subdomain availability
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
    tenantForm.setValue("subdomain", cleaned);
    checkSubdomain(cleaned);
  };

  // Handle user registration
  const onUserSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Registrasi gagal");
      }

      // Auto sign in after registration
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/portal");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tenant registration
  const onTenantSubmit = async (data: TenantFormData) => {
    if (!subdomainStatus.available) {
      setError("Subdomain tidak tersedia");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tenant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: data.tenantName,
          subdomain: data.subdomain,
          adminName: data.adminName,
          adminEmail: data.adminEmail,
          adminPassword: data.adminPassword,
          businessTypes: ["UMROH"],
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Registrasi tenant gagal");
      }

      setSuccess(`Tenant berhasil dibuat! Silakan login di ${data.subdomain}.${process.env.NEXT_PUBLIC_TENANT_BASE_DOMAIN || "domain.com"}`);
      
      // In production, redirect to tenant subdomain
      // For now, show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/portal" });
  };

  // Render tenant registration form
  if (registrationType === "tenant") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
              <Building2 className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Daftar Tenant Baru
            </h1>
            <p className="mt-1 text-gray-500">
              Buat akun perusahaan travel Anda
            </p>
          </div>

          <Card className="p-6 shadow-xl shadow-gray-200/50">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Berhasil!</span>
                </div>
                <p className="mt-2 text-sm text-green-600">{success}</p>
                <Button 
                  className="mt-3 w-full"
                  onClick={() => router.push("/login")}
                >
                  Login Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {!success && (
              <form onSubmit={tenantForm.handleSubmit(onTenantSubmit)} className="space-y-4">
                {/* Company Info */}
                <div className="pb-4 border-b">
                  <h3 className="font-medium text-gray-900 mb-3">Informasi Perusahaan</h3>
                  
                  <Input
                    label="Nama Perusahaan"
                    placeholder="PT Travel Umroh Indonesia"
                    error={tenantForm.formState.errors.tenantName?.message}
                    leftIcon={<Building2 className="h-4 w-4" />}
                    {...tenantForm.register("tenantName")}
                  />

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subdomain
                    </label>
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          className="w-full rounded-l-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="travelumroh"
                          value={tenantForm.watch("subdomain") || ""}
                          onChange={(e) => handleSubdomainChange(e.target.value)}
                        />
                      </div>
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-lg text-gray-500 text-sm">
                        .domain.com
                      </span>
                    </div>
                    {subdomainStatus.checking && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Mengecek ketersediaan...
                      </p>
                    )}
                    {!subdomainStatus.checking && subdomainStatus.message && (
                      <p className={`text-sm mt-1 flex items-center gap-1 ${
                        subdomainStatus.available ? "text-green-600" : "text-red-600"
                      }`}>
                        {subdomainStatus.available ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {subdomainStatus.message}
                      </p>
                    )}
                    {tenantForm.formState.errors.subdomain && (
                      <p className="text-sm text-red-600 mt-1">
                        {tenantForm.formState.errors.subdomain.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Admin Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Admin Utama</h3>
                  
                  <Input
                    label="Nama Admin"
                    placeholder="John Doe"
                    error={tenantForm.formState.errors.adminName?.message}
                    leftIcon={<User className="h-4 w-4" />}
                    {...tenantForm.register("adminName")}
                  />

                  <div className="mt-4">
                    <Input
                      label="Email Admin"
                      type="email"
                      placeholder="admin@company.com"
                      error={tenantForm.formState.errors.adminEmail?.message}
                      leftIcon={<Mail className="h-4 w-4" />}
                      {...tenantForm.register("adminEmail")}
                    />
                  </div>

                  <div className="mt-4 relative">
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 karakter"
                      error={tenantForm.formState.errors.adminPassword?.message}
                      leftIcon={<Lock className="h-4 w-4" />}
                      {...tenantForm.register("adminPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="mt-4">
                    <Input
                      label="Konfirmasi Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ulangi password"
                      error={tenantForm.formState.errors.confirmPassword?.message}
                      leftIcon={<Lock className="h-4 w-4" />}
                      {...tenantForm.register("confirmPassword")}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  isLoading={isLoading} 
                  className="w-full"
                  disabled={!subdomainStatus.available}
                >
                  Daftar Sekarang
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-medium text-purple-600 hover:text-purple-700">
                Login
              </Link>
            </p>
            
            {tenantMode === "multi" && (
              <p className="mt-2 text-center text-sm text-gray-500">
                Ingin daftar sebagai jamaah?{" "}
                <button 
                  onClick={() => setRegistrationType("user")}
                  className="font-medium text-purple-600 hover:text-purple-700"
                >
                  Daftar di sini
                </button>
              </p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Render user registration form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
            <Plane className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Daftar Akun
          </h1>
          <p className="mt-1 text-gray-500">Mulai perjalanan Anda bersama kami</p>
        </div>

        <Card className="p-6 shadow-xl shadow-gray-200/50">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
            <Input
              label="Nama Lengkap"
              placeholder="John Doe"
              error={userForm.formState.errors.name?.message}
              leftIcon={<User className="h-4 w-4" />}
              {...userForm.register("name")}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={userForm.formState.errors.email?.message}
              leftIcon={<Mail className="h-4 w-4" />}
              {...userForm.register("email")}
            />

            <Input
              label="Nomor HP"
              placeholder="08123456789"
              error={userForm.formState.errors.phone?.message}
              leftIcon={<Phone className="h-4 w-4" />}
              {...userForm.register("phone")}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 6 karakter"
                error={userForm.formState.errors.password?.message}
                leftIcon={<Lock className="h-4 w-4" />}
                {...userForm.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Input
              label="Konfirmasi Password"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password"
              error={userForm.formState.errors.confirmPassword?.message}
              leftIcon={<Lock className="h-4 w-4" />}
              {...userForm.register("confirmPassword")}
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600">
                Saya setuju dengan{" "}
                <Link href="/terms" className="font-medium text-emerald-600 hover:text-emerald-700">
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link href="/privacy" className="font-medium text-emerald-600 hover:text-emerald-700">
                  Kebijakan Privasi
                </Link>
              </span>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Daftar
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">Atau daftar dengan</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full"
            leftIcon={
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            }
          >
            Lanjutkan dengan Google
          </Button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Login
            </Link>
          </p>
          
          {tenantMode === "multi" && (
            <p className="mt-2 text-center text-sm text-gray-500">
              Ingin daftar sebagai travel agent?{" "}
              <button 
                onClick={() => setRegistrationType("tenant")}
                className="font-medium text-emerald-600 hover:text-emerald-700"
              >
                Daftar Tenant
              </button>
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
