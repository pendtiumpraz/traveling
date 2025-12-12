import Link from "next/link";
import { Card } from "@/components/ui";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Link>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Syarat & Ketentuan</h1>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-500 text-sm mb-6">
              Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-3">1. Penerimaan Ketentuan</h2>
            <p className="text-gray-600 mb-4">
              Dengan mengakses dan menggunakan layanan Travel ERP ini, Anda menyetujui untuk terikat oleh 
              syarat dan ketentuan ini. Jika Anda tidak menyetujui salah satu dari ketentuan ini, 
              Anda tidak diperkenankan menggunakan layanan kami.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-3">2. Deskripsi Layanan</h2>
            <p className="text-gray-600 mb-4">
              Travel ERP adalah sistem manajemen travel yang menyediakan layanan untuk:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
              <li>Manajemen pemesanan perjalanan umroh, haji, dan wisata</li>
              <li>Pengelolaan data jamaah dan pelanggan</li>
              <li>Manajemen jadwal keberangkatan</li>
              <li>Pengelolaan keuangan dan pembayaran</li>
              <li>Pelacakan dan monitoring perjalanan</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">3. Akun Pengguna</h2>
            <p className="text-gray-600 mb-4">
              Anda bertanggung jawab untuk menjaga kerahasiaan akun dan password Anda. 
              Anda setuju untuk segera memberitahu kami jika terjadi penggunaan tidak sah atas akun Anda.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-3">4. Penggunaan yang Dilarang</h2>
            <p className="text-gray-600 mb-4">Anda dilarang menggunakan layanan untuk:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
              <li>Tujuan ilegal atau tidak sah</li>
              <li>Mengganggu atau merusak layanan</li>
              <li>Mengakses data pengguna lain tanpa izin</li>
              <li>Menyebarkan virus atau kode berbahaya</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">5. Pembatasan Tanggung Jawab</h2>
            <p className="text-gray-600 mb-4">
              Layanan ini disediakan "sebagaimana adanya" tanpa jaminan apapun. 
              Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan layanan ini.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-3">6. Perubahan Ketentuan</h2>
            <p className="text-gray-600 mb-4">
              Kami berhak mengubah syarat dan ketentuan ini kapan saja. 
              Perubahan akan berlaku segera setelah dipublikasikan di halaman ini.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-3">7. Kontak</h2>
            <p className="text-gray-600 mb-4">
              Jika Anda memiliki pertanyaan tentang Syarat & Ketentuan ini, silakan hubungi kami di:
            </p>
            <ul className="list-none text-gray-600 mb-4 space-y-1">
              <li>Email: support@travelerpz.com</li>
              <li>Telepon: (021) 1234-5678</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
