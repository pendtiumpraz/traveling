import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// Default landing page content
const defaultLandingContent = {
  hero: {
    title: "Wujudkan Ibadah Umrah & Haji Impian Anda",
    subtitle:
      "Bersama kami, perjalanan suci Anda akan menjadi pengalaman yang tak terlupakan dengan pelayanan terbaik dan harga terjangkau.",
    cta1: "Lihat Paket",
    cta2: "Hubungi Kami",
    image:
      "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1920&q=80",
  },
  stats: [
    { value: "15+", label: "Tahun Pengalaman" },
    { value: "50K+", label: "Jamaah Terlayani" },
    { value: "99%", label: "Kepuasan Pelanggan" },
    { value: "24/7", label: "Customer Support" },
  ],
  features: [
    {
      icon: "Shield",
      title: "Terpercaya & Berizin",
      description: "Resmi terdaftar di Kemenag dengan izin PPIU lengkap",
    },
    {
      icon: "Users",
      title: "Pembimbing Berpengalaman",
      description:
        "Ustadz dan pembimbing profesional mendampingi perjalanan Anda",
    },
    {
      icon: "Hotel",
      title: "Hotel Dekat Masjidil Haram",
      description: "Akomodasi premium dengan akses mudah ke tempat ibadah",
    },
    {
      icon: "Plane",
      title: "Penerbangan Nyaman",
      description: "Maskapai terpercaya dengan layanan terbaik",
    },
    {
      icon: "HeartHandshake",
      title: "Pelayanan Prima",
      description: "Tim support 24/7 siap membantu kebutuhan Anda",
    },
    {
      icon: "MapPin",
      title: "Live Tracking",
      description: "Pantau lokasi jamaah secara real-time dengan smartwatch",
    },
  ],
  packages: {
    title: "Paket Pilihan Terbaik",
    subtitle:
      "Berbagai pilihan paket yang sesuai dengan kebutuhan dan budget Anda",
  },
  testimonials: {
    title: "Apa Kata Jamaah Kami",
    subtitle: "Pengalaman nyata dari jamaah yang telah berangkat bersama kami",
    items: [
      {
        name: "H. Ahmad Sudirman",
        location: "Jakarta",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
        text: "Alhamdulillah perjalanan umrah bersama travel ini sangat nyaman. Pembimbing sangat sabar dan hotel sangat dekat dengan Masjidil Haram.",
        rating: 5,
      },
      {
        name: "Hj. Siti Aminah",
        location: "Surabaya",
        image:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
        text: "Pelayanan luar biasa dari awal pendaftaran hingga pulang. Insya Allah akan berangkat lagi bersama keluarga.",
        rating: 5,
      },
      {
        name: "Ir. Bambang Wijaya",
        location: "Bandung",
        image:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
        text: "Harga sangat worth it dengan fasilitas yang didapat. Tim sangat responsif dan profesional.",
        rating: 5,
      },
    ],
  },
  cta: {
    title: "Siap Memulai Perjalanan Suci Anda?",
    subtitle: "Daftarkan diri Anda sekarang dan dapatkan penawaran spesial",
    button: "Daftar Sekarang",
    image:
      "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&q=80",
  },
  gallery: [
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
    "https://images.unsplash.com/photo-1565552645632-d725f8bfc50a?w=600&q=80",
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
    "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80",
  ],
  contact: {
    phone: "+62 812-3456-7890",
    email: "info@travelerp.com",
    whatsapp: "6281234567890",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
  },
  footer: {
    copyright: "© 2024 TravelERP. All rights reserved.",
    tagline: "Perjalanan Suci, Pelayanan Istimewa",
  },
};

export async function GET() {
  try {
    // For public landing, use default tenant or first tenant
    const settings = await prisma.setting.findFirst({
      where: { key: "landing_content" },
    });

    const content = settings?.value
      ? JSON.parse(settings.value as string)
      : defaultLandingContent;

    return successResponse(content);
  } catch (error) {
    console.error("Landing settings GET error:", error);
    return successResponse(defaultLandingContent);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await request.json();
    const tenantId =
      (session.user as { tenantId?: string }).tenantId || "default";

    // Find existing setting
    const existing = await prisma.setting.findFirst({
      where: { tenantId, key: "landing_content" },
    });

    if (existing) {
      await prisma.setting.update({
        where: { id: existing.id },
        data: { value: JSON.stringify(body) },
      });
    } else {
      // Get or create default tenant
      let tenant = await prisma.tenant.findFirst({ where: { id: tenantId } });
      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            id: "default",
            name: "Default Travel",
            subdomain: "default",
          },
        });
      }

      await prisma.setting.create({
        data: {
          tenantId: tenant.id,
          key: "landing_content",
          value: JSON.stringify(body),
          type: "json",
        },
      });
    }

    return successResponse(body, "Landing page updated");
  } catch (error) {
    console.error("Landing settings PUT error:", error);
    return errorResponse("Failed to update landing page", 500);
  }
}
