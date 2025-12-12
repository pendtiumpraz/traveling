import Link from "next/link";
import { Card } from "@/components/ui";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Kebijakan Privasi</h1>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-gray-500 text-sm mb-6">
              Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p className="text-gray-600 mb-4">Kami mengumpulkan informasi berikut:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
              <li>Informasi identitas (nama, email, nomor telepon)</li>
              <li>Data dokumen perjalanan (paspor, visa)</li>
              <li>Informasi pembayaran</li>
              <li>Data lokasi saat perjalanan</li>
              <li>Log aktivitas penggunaan aplikasi</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">2. Penggunaan Informasi</h2>
            <p className="text-gray-600 mb-4">Informasi Anda digunakan untuk:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
              <li>Memproses pemesanan perjalanan</li>
              <li>Mengirim konfirmasi dan update perjalanan</li>
              <li>Menyediakan layanan pelanggan</li>
              <li>Meningkatkan layanan kami</li>
              <li>Memenuhi kewajiban hukum</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">3. Perlindungan Data</h2>
            <p className="text-gray-600 mb-4">
              Kami menerapkan langkah-langkah keamanan yang sesuai untuk melindungi data Anda dari akses tidak sah, 
              perubahan, pengungkapan, atau penghancuran. Data disimpan dengan enkripsi dan akses terbatas.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-3">4. Berbagi Informasi</h2>
            <p className="text-gray-600 mb-4">Kami dapat membagikan informasi Anda kepada:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
              <li>Maskapai penerbangan dan hotel untuk pemesanan</li>
              <li>Pihak berwenang untuk keperluan visa dan imigrasi</li>
              <li>Penyedia layanan pihak ketiga yang membantu operasional kami</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">5. Hak Anda</h2>
            <p className="text-gray-600 mb-4">Anda memiliki hak untuk:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-1">
              <li>Mengakses data pribadi Anda</li>
              <li>Meminta koreksi data yang tidak akurat</li>
              <li>Meminta penghapusan data</li>
              <li>Menarik persetujuan penggunaan data</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-3">6. Cookie</h2>
            <p className="text-gray-600 mb-4">
              Kami menggunakan cookie untuk meningkatkan pengalaman pengguna. 
              Anda dapat mengatur preferensi cookie melalui pengaturan browser Anda.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-3">7. Kontak</h2>
            <p className="text-gray-600 mb-4">
              Untuk pertanyaan tentang kebijakan privasi ini, hubungi kami di:
            </p>
            <ul className="list-none text-gray-600 mb-4 space-y-1">
              <li>Email: privacy@travelerpz.com</li>
              <li>Telepon: (021) 1234-5678</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
