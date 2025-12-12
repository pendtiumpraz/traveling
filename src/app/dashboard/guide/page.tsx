"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, Badge, Button } from "@/components/ui";
import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  CreditCard,
  Plane,
  Building2,
  UserCog,
  BarChart3,
  Settings,
  MapPin,
  Megaphone,
  Boxes,
  Headphones,
  Sparkles,
  ChevronRight,
  CheckCircle,
  ArrowRight,
  Shield,
  Briefcase,
  UserCheck,
  TrendingUp,
  FileText,
  Hotel,
  Ticket,
  Globe,
  Clock,
  DollarSign,
  ClipboardList,
  Eye,
} from "lucide-react";

// Role configurations with their details
const ROLE_CONFIGS: Record<string, {
  title: string;
  description: string;
  color: string;
  icon: React.ElementType;
  menus: { key: string; title: string; icon: React.ElementType; description: string }[];
  workflows: { title: string; steps: string[] }[];
  features: string[];
}> = {
  SUPER_ADMIN: {
    title: "Super Administrator",
    description: "Full system access with user management and configuration capabilities",
    color: "bg-purple-500",
    icon: Shield,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "Overview statistics, revenue charts, recent activities" },
      { key: "customers", title: "Customers", icon: Users, description: "Manage customer data, history, and segmentation" },
      { key: "packages", title: "Packages", icon: Package, description: "Create and manage travel packages" },
      { key: "schedules", title: "Schedules", icon: Calendar, description: "Schedule management with calendar view" },
      { key: "bookings", title: "Bookings", icon: CreditCard, description: "All booking operations and management" },
      { key: "operations", title: "Operations", icon: Plane, description: "Manifests, flights, and rooming" },
      { key: "tracking", title: "Tracking", icon: MapPin, description: "Real-time GPS tracking" },
      { key: "finance", title: "Finance", icon: DollarSign, description: "Payments, invoices, commissions" },
      { key: "inventory", title: "Inventory", icon: Boxes, description: "Product and stock management" },
      { key: "marketing", title: "Marketing", icon: Megaphone, description: "Vouchers, campaigns, landing pages" },
      { key: "agents", title: "Agents", icon: Building2, description: "Agent management and performance" },
      { key: "hris", title: "HRIS", icon: UserCog, description: "Employee management, attendance, payroll" },
      { key: "support", title: "Support", icon: Headphones, description: "Customer support tickets" },
      { key: "reports", title: "Reports", icon: BarChart3, description: "Comprehensive business reports" },
      { key: "ai-assistant", title: "AI Assistant", icon: Sparkles, description: "AI-powered data queries" },
      { key: "settings", title: "Settings", icon: Settings, description: "System configuration and user management" },
    ],
    workflows: [
      {
        title: "Complete Booking Flow",
        steps: [
          "Register/Select Customer",
          "Choose Package & Schedule",
          "Set Room Type & Pax",
          "Apply Voucher (optional)",
          "Confirm Booking",
          "Record Payment",
          "Generate Invoice",
          "Add to Manifest",
        ],
      },
      {
        title: "User Management",
        steps: [
          "Go to Settings → Users",
          "Click Add New User",
          "Fill user details",
          "Assign Role(s)",
          "Save and notify user",
        ],
      },
    ],
    features: [
      "Full CRUD on all modules",
      "User and role management",
      "System configuration",
      "All reports access",
      "AI Assistant for data queries",
      "Bulk operations (import/export)",
    ],
  },
  ADMIN: {
    title: "Administrator",
    description: "Full dashboard access without system-level settings",
    color: "bg-blue-500",
    icon: UserCheck,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "Overview statistics and charts" },
      { key: "customers", title: "Customers", icon: Users, description: "Customer management" },
      { key: "packages", title: "Packages", icon: Package, description: "Package management" },
      { key: "schedules", title: "Schedules", icon: Calendar, description: "Schedule management" },
      { key: "bookings", title: "Bookings", icon: CreditCard, description: "Booking operations" },
      { key: "operations", title: "Operations", icon: Plane, description: "Operational tasks" },
      { key: "tracking", title: "Tracking", icon: MapPin, description: "Trip tracking" },
      { key: "finance", title: "Finance", icon: DollarSign, description: "Financial operations" },
      { key: "inventory", title: "Inventory", icon: Boxes, description: "Stock management" },
      { key: "marketing", title: "Marketing", icon: Megaphone, description: "Marketing tools" },
      { key: "agents", title: "Agents", icon: Building2, description: "Agent management" },
      { key: "hris", title: "HRIS", icon: UserCog, description: "HR management" },
      { key: "support", title: "Support", icon: Headphones, description: "Support tickets" },
      { key: "reports", title: "Reports", icon: BarChart3, description: "Business reports" },
      { key: "ai-assistant", title: "AI Assistant", icon: Sparkles, description: "AI queries" },
    ],
    workflows: [
      {
        title: "Daily Operations",
        steps: [
          "Check Dashboard for overview",
          "Review pending bookings",
          "Process payments",
          "Update manifest status",
          "Handle support tickets",
        ],
      },
    ],
    features: [
      "Full CRUD on operational modules",
      "Cannot manage users/roles",
      "All reports access",
      "AI Assistant access",
    ],
  },
  FINANCE: {
    title: "Finance Staff",
    description: "Handle payments, invoices, and financial reporting",
    color: "bg-green-500",
    icon: DollarSign,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "Financial overview" },
      { key: "finance", title: "Finance", icon: DollarSign, description: "Payments, invoices, commissions" },
      { key: "reports", title: "Reports", icon: BarChart3, description: "Financial reports" },
      { key: "ai-assistant", title: "AI Assistant", icon: Sparkles, description: "Query financial data" },
    ],
    workflows: [
      {
        title: "Payment Verification",
        steps: [
          "Check pending payments list",
          "Review payment proof",
          "Verify amount and bank",
          "Approve or reject",
          "System auto-generates invoice",
        ],
      },
      {
        title: "Commission Processing",
        steps: [
          "Review completed trips",
          "Calculate agent commissions",
          "Generate commission report",
          "Process payment to agents",
        ],
      },
    ],
    features: [
      "Payment verification",
      "Invoice management",
      "Commission calculation",
      "Financial reports",
      "Refund processing",
    ],
  },
  OPERASIONAL: {
    title: "Operations Staff",
    description: "Manage manifests, flights, rooming, and trip execution",
    color: "bg-orange-500",
    icon: Plane,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "Operational overview" },
      { key: "operations", title: "Operations", icon: Plane, description: "Manifests, flights, rooming" },
      { key: "schedules", title: "Schedules", icon: Calendar, description: "View schedules" },
      { key: "tracking", title: "Tracking", icon: MapPin, description: "Track active trips" },
      { key: "ai-assistant", title: "AI Assistant", icon: Sparkles, description: "Query operational data" },
    ],
    workflows: [
      {
        title: "Pre-Departure Checklist",
        steps: [
          "Verify all participants",
          "Confirm flight tickets",
          "Complete rooming assignment",
          "Assign tour leader",
          "Prepare manifest documents",
          "Update status to CONFIRMED",
        ],
      },
      {
        title: "Rooming Assignment",
        steps: [
          "Select manifest",
          "Use auto-assign or manual",
          "Group by gender/family",
          "Verify room capacity",
          "Print rooming list",
        ],
      },
    ],
    features: [
      "Manifest management",
      "Flight scheduling",
      "Room assignments",
      "Document preparation",
      "Trip tracking",
    ],
  },
  MARKETING: {
    title: "Marketing Staff",
    description: "Handle promotions, vouchers, and marketing campaigns",
    color: "bg-pink-500",
    icon: Megaphone,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "Marketing overview" },
      { key: "customers", title: "Customers", icon: Users, description: "Customer data for campaigns" },
      { key: "marketing", title: "Marketing", icon: Megaphone, description: "Vouchers, campaigns" },
      { key: "reports", title: "Reports", icon: BarChart3, description: "Marketing reports" },
      { key: "ai-assistant", title: "AI Assistant", icon: Sparkles, description: "Query marketing data" },
    ],
    workflows: [
      {
        title: "Create Voucher Campaign",
        steps: [
          "Go to Marketing → Vouchers",
          "Create new voucher",
          "Set discount type & value",
          "Define validity period",
          "Set usage quota",
          "Activate voucher",
        ],
      },
    ],
    features: [
      "Voucher management",
      "Campaign creation",
      "Customer segmentation",
      "Performance tracking",
    ],
  },
  HRD: {
    title: "HR Staff",
    description: "Manage employees, attendance, and payroll",
    color: "bg-cyan-500",
    icon: UserCog,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "HR overview" },
      { key: "hris", title: "HRIS", icon: UserCog, description: "Employee management" },
      { key: "ai-assistant", title: "AI Assistant", icon: Sparkles, description: "Query HR data" },
    ],
    workflows: [
      {
        title: "Employee Onboarding",
        steps: [
          "Add new employee",
          "Fill personal data",
          "Assign department & position",
          "Set salary information",
          "Mark as tour leader (if applicable)",
        ],
      },
    ],
    features: [
      "Employee management",
      "Attendance tracking",
      "Leave management",
      "Payroll processing",
      "Tour leader assignment",
    ],
  },
  INVENTORY: {
    title: "Inventory Staff",
    description: "Manage products and stock levels",
    color: "bg-amber-500",
    icon: Boxes,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "Inventory overview" },
      { key: "inventory", title: "Inventory", icon: Boxes, description: "Products and stock" },
      { key: "ai-assistant", title: "AI Assistant", icon: Sparkles, description: "Query inventory data" },
    ],
    workflows: [
      {
        title: "Stock Management",
        steps: [
          "Check low stock alerts",
          "Update stock quantities",
          "Record stock movements",
          "Generate stock report",
        ],
      },
    ],
    features: [
      "Product management",
      "Stock tracking",
      "Low stock alerts",
      "Warehouse management",
    ],
  },
  TOUR_LEADER: {
    title: "Tour Leader",
    description: "Manage assigned trips and track participants",
    color: "bg-indigo-500",
    icon: Globe,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "My trips overview" },
      { key: "operations", title: "Operations", icon: Plane, description: "View my manifests" },
      { key: "tracking", title: "Tracking", icon: MapPin, description: "Update location" },
    ],
    workflows: [
      {
        title: "During Trip",
        steps: [
          "Check participant list",
          "Do daily roll call",
          "Update group location",
          "Report any issues",
          "Upload trip photos",
        ],
      },
    ],
    features: [
      "View assigned manifests",
      "Participant list access",
      "Location updates",
      "Emergency contact",
    ],
  },
  AGENT: {
    title: "Travel Agent",
    description: "Book on behalf of customers and earn commission",
    color: "bg-teal-500",
    icon: Building2,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "Performance overview" },
      { key: "customers", title: "My Customers", icon: Users, description: "Manage your customers" },
      { key: "bookings", title: "My Bookings", icon: CreditCard, description: "Your bookings" },
      { key: "packages", title: "Packages", icon: Package, description: "Browse packages" },
      { key: "schedules", title: "Schedules", icon: Calendar, description: "View schedules" },
    ],
    workflows: [
      {
        title: "Create Booking for Customer",
        steps: [
          "Add/select customer",
          "Browse available packages",
          "Select schedule with quota",
          "Choose room type",
          "Submit booking",
          "Track commission earned",
        ],
      },
    ],
    features: [
      "Manage own customers",
      "Create bookings",
      "View commission",
      "Track performance",
      "Limited to own data",
    ],
  },
  SALES: {
    title: "Sales Staff",
    description: "Handle leads and convert to bookings",
    color: "bg-rose-500",
    icon: TrendingUp,
    menus: [
      { key: "dashboard", title: "Dashboard", icon: LayoutDashboard, description: "Sales overview" },
      { key: "customers", title: "Customers", icon: Users, description: "Lead management" },
      { key: "bookings", title: "Bookings", icon: CreditCard, description: "Create bookings" },
      { key: "packages", title: "Packages", icon: Package, description: "Browse packages" },
      { key: "schedules", title: "Schedules", icon: Calendar, description: "View schedules" },
      { key: "reports", title: "Reports", icon: BarChart3, description: "Sales reports" },
      { key: "ai-assistant", title: "AI Assistant", icon: Sparkles, description: "Query sales data" },
    ],
    workflows: [
      {
        title: "Lead to Booking",
        steps: [
          "Receive inquiry",
          "Register as prospect",
          "Send quotation",
          "Follow up",
          "Convert to booking",
          "Update to client status",
        ],
      },
    ],
    features: [
      "Lead management",
      "Create bookings",
      "Sales reporting",
      "Performance tracking",
    ],
  },
  CUSTOMER: {
    title: "Customer",
    description: "Access customer portal to view bookings and make payments",
    color: "bg-gray-500",
    icon: Users,
    menus: [
      { key: "home", title: "Home", icon: LayoutDashboard, description: "Portal overview" },
      { key: "my-bookings", title: "My Bookings", icon: CreditCard, description: "View your bookings" },
      { key: "payments", title: "Payments", icon: DollarSign, description: "Make payments" },
      { key: "documents", title: "Documents", icon: FileText, description: "Download documents" },
      { key: "e-tickets", title: "E-Tickets", icon: Ticket, description: "View e-tickets" },
      { key: "itinerary", title: "Itinerary", icon: ClipboardList, description: "Trip itinerary" },
      { key: "tracking", title: "Tracking", icon: MapPin, description: "Track your trip" },
      { key: "support", title: "Support", icon: Headphones, description: "Get help" },
    ],
    workflows: [
      {
        title: "Make Payment",
        steps: [
          "Go to My Bookings",
          "Click Pay Now",
          "Choose payment method",
          "Upload payment proof",
          "Wait for verification",
          "Receive confirmation",
        ],
      },
    ],
    features: [
      "View bookings",
      "Make payments",
      "Download documents",
      "View itinerary",
      "Track trip location",
      "Submit support tickets",
    ],
  },
};

export default function GuidePage() {
  const { data: session } = useSession();
  const userRoles = (session?.user as { roles?: string[] })?.roles || [];
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN");
  
  // Get current user's primary role (first role)
  const primaryRole = userRoles[0] || "CUSTOMER";
  const [selectedRole, setSelectedRole] = useState(primaryRole);
  const [expandedWorkflow, setExpandedWorkflow] = useState<number | null>(null);

  const roleConfig = ROLE_CONFIGS[selectedRole];
  const availableRoles = isSuperAdmin 
    ? Object.keys(ROLE_CONFIGS) 
    : userRoles.filter(role => ROLE_CONFIGS[role]);

  if (!roleConfig) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">User Guide</h1>
        <p className="text-gray-500 mt-2">No guide available for your role.</p>
      </div>
    );
  }

  const RoleIcon = roleConfig.icon;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Guide</h1>
          <p className="text-gray-500">Panduan penggunaan aplikasi sesuai role Anda</p>
        </div>
        
        {/* Role Selector (for SUPER_ADMIN or multi-role users) */}
        {availableRoles.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">View guide for:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {ROLE_CONFIGS[role]?.title || role}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Role Overview Card */}
      <Card className="overflow-hidden">
        <div className={`${roleConfig.color} p-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <RoleIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{roleConfig.title}</h2>
              <p className="text-white/80 mt-1">{roleConfig.description}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Key Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roleConfig.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Menu Access */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Menu yang Dapat Diakses
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({roleConfig.menus.length} menu)
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleConfig.menus.map((menu) => {
            const MenuIcon = menu.icon;
            return (
              <div
                key={menu.key}
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className={`p-2 rounded-lg ${roleConfig.color} text-white shrink-0`}>
                  <MenuIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{menu.title}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{menu.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Workflows */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Alur Kerja (Workflows)</h3>
        <div className="space-y-4">
          {roleConfig.workflows.map((workflow, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedWorkflow(expandedWorkflow === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${roleConfig.color} text-white`}>
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <span className="font-medium">{workflow.title}</span>
                  <Badge variant="secondary">{workflow.steps.length} steps</Badge>
                </div>
                <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${expandedWorkflow === idx ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedWorkflow === idx && (
                <div className="p-4 bg-white">
                  <div className="space-y-3">
                    {workflow.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${roleConfig.color} text-white text-sm font-bold shrink-0`}>
                          {stepIdx + 1}
                        </div>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-gray-700">{step}</span>
                          {stepIdx < workflow.steps.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-gray-300 hidden md:block" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Tips */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">Tips Penggunaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Klik Header Kolom</h4>
              <p className="text-sm text-blue-700">Klik header kolom pada tabel untuk mengurutkan data (sorting)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Filter Data</h4>
              <p className="text-sm text-blue-700">Gunakan tombol "Filter Data" untuk menyaring data sesuai kriteria</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Import Data</h4>
              <p className="text-sm text-blue-700">Download template Excel, isi data, lalu upload untuk import massal</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">AI Assistant</h4>
              <p className="text-sm text-blue-700">Tanyakan data dalam bahasa natural, contoh: "Total revenue bulan ini"</p>
            </div>
          </div>
        </div>
      </Card>

      {/* All Roles Overview (SUPER_ADMIN only) */}
      {isSuperAdmin && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Overview Semua Role</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Akses Menu</th>
                  <th className="text-left py-3 px-4 font-semibold">Deskripsi</th>
                  <th className="text-center py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ROLE_CONFIGS).map(([role, config]) => {
                  const Icon = config.icon;
                  return (
                    <tr key={role} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${config.color} text-white`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{config.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{config.menus.length} menu</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                        {config.description}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRole(role);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
