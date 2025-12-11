import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// Default landing page content with Makkah/Umrah images from Unsplash
const defaultLandingContent = {
  hero: {
    title: "Wujudkan Ibadah Umrah & Haji Impian Anda",
    subtitle:
      "Bersama kami, perjalanan suci Anda akan menjadi pengalaman yang tak terlupakan dengan pelayanan terbaik dan harga terjangkau.",
    cta1: "Lihat Paket",
    cta2: "Hubungi Kami",
    image:
      "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=1920&q=80",
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
      description:
        "Resmi terdaftar di Kemenag dengan izin PPIU lengkap dan beroperasi sejak 2009",
    },
    {
      icon: "Users",
      title: "Pembimbing Berpengalaman",
      description:
        "Ustadz dan pembimbing profesional bersertifikat mendampingi perjalanan ibadah Anda",
    },
    {
      icon: "Hotel",
      title: "Hotel Bintang 5 Dekat Haram",
      description:
        "Akomodasi premium hanya 50-200m dari Masjidil Haram & Masjid Nabawi",
    },
    {
      icon: "Plane",
      title: "Penerbangan Langsung",
      description: "Garuda Indonesia & Saudia Airlines dengan layanan terbaik",
    },
    {
      icon: "HeartHandshake",
      title: "Pelayanan Prima",
      description:
        "Tim support 24/7 siap membantu kebutuhan jamaah selama perjalanan",
    },
    {
      icon: "MapPin",
      title: "Live Tracking GPS",
      description:
        "Pantau lokasi jamaah secara real-time dengan smartwatch Huawei",
    },
  ],
  packages: {
    title: "Paket Pilihan Terbaik",
    subtitle:
      "Berbagai pilihan paket Umrah & Haji yang sesuai dengan kebutuhan dan budget Anda",
    items: [
      {
        name: "Umrah Reguler 9 Hari",
        price: "Rp 25.000.000",
        duration: "9 Hari",
        hotel: "Bintang 4",
        airline: "Garuda Indonesia",
        image:
          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
      },
      {
        name: "Umrah Plus Turki 12 Hari",
        price: "Rp 35.000.000",
        duration: "12 Hari",
        hotel: "Bintang 5",
        airline: "Turkish Airlines",
        image:
          "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80",
      },
      {
        name: "Umrah VIP 9 Hari",
        price: "Rp 45.000.000",
        duration: "9 Hari",
        hotel: "Bintang 5 (50m dari Haram)",
        airline: "Saudia Airlines",
        image:
          "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80",
      },
    ],
  },
  testimonials: {
    title: "Apa Kata Jamaah Kami",
    subtitle: "Pengalaman nyata dari jamaah yang telah berangkat bersama kami",
    items: [
      {
        name: "H. Ahmad Sudirman",
        location: "Jakarta",
        image:
          "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=150&q=80",
        text: "Alhamdulillah perjalanan umrah bersama travel ini sangat nyaman. Pembimbing sangat sabar dan hotel sangat dekat dengan Masjidil Haram. Proses visa juga cepat dan mudah.",
        rating: 5,
      },
      {
        name: "Hj. Siti Aminah",
        location: "Surabaya",
        image:
          "https://images.unsplash.com/photo-1609241728358-53a5813c9d51?w=150&q=80",
        text: "Pelayanan luar biasa dari awal pendaftaran hingga pulang. Makanan enak, hotel bersih, dan pembimbing sangat membantu. Insya Allah akan berangkat lagi bersama keluarga.",
        rating: 5,
      },
      {
        name: "H. Bambang Wijaya",
        location: "Bandung",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80",
        text: "Harga sangat worth it dengan fasilitas yang didapat. Tim sangat responsif dan profesional. Smartwatch tracking sangat membantu keluarga di rumah.",
        rating: 5,
      },
    ],
  },
  cta: {
    title: "Siap Memulai Perjalanan Suci Anda?",
    subtitle:
      "Daftarkan diri Anda sekarang dan dapatkan penawaran spesial early bird",
    button: "Daftar Sekarang",
    image:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1920&q=80",
  },
  gallery: [
    "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=600&q=80",
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80",
    "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80",
    "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80",
    "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&q=80",
    "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=600&q=80",
    "https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?w=600&q=80",
    "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&q=80",
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
