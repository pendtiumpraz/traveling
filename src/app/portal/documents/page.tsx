"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  AlertCircle,
} from "lucide-react";

interface Document {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  verifiedAt?: string;
  notes?: string;
}

const documentTypes = [
  { value: "KTP", label: "KTP", required: true },
  { value: "PASSPORT", label: "Paspor", required: true },
  { value: "PASSPORT_PHOTO", label: "Foto Paspor (4x6)", required: true },
  { value: "FAMILY_CARD", label: "Kartu Keluarga", required: true },
  { value: "VACCINE_CERT", label: "Sertifikat Vaksin", required: true },
  { value: "MARRIAGE_CERT", label: "Buku Nikah (Wanita)", required: false },
  { value: "BIRTH_CERT", label: "Akta Kelahiran (Anak)", required: false },
  { value: "OTHER", label: "Dokumen Lainnya", required: false },
];

export default function PortalDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/portal/documents");
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedType) return;

    setUploading(true);
    try {
      // Simulate upload - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add mock document
      const newDoc: Document = {
        id: Date.now().toString(),
        type: selectedType,
        fileName: uploadFile.name,
        fileUrl: URL.createObjectURL(uploadFile),
        status: "PENDING",
        uploadedAt: new Date().toISOString(),
      };
      setDocuments([...documents, newDoc]);
      setShowUploadModal(false);
      setUploadFile(null);
      setSelectedType("");
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; icon: typeof Clock }
    > = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      VERIFIED: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    const style = styles[status] || styles.PENDING;
    const Icon = style.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
      >
        <Icon className="h-3 w-3" />
        {status === "PENDING"
          ? "Menunggu"
          : status === "VERIFIED"
            ? "Terverifikasi"
            : "Ditolak"}
      </span>
    );
  };

  const getDocTypeLabel = (type: string) => {
    return documentTypes.find((d) => d.value === type)?.label || type;
  };

  const requiredDocs = documentTypes.filter((d) => d.required);
  const uploadedTypes = documents.map((d) => d.type);
  const missingDocs = requiredDocs.filter(
    (d) => !uploadedTypes.includes(d.value),
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-gray-200"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumen Saya</h1>
          <p className="text-gray-500">Upload dan kelola dokumen persyaratan</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          Upload Dokumen
        </button>
      </div>

      {/* Missing Documents Alert */}
      {missingDocs.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <h3 className="flex items-center gap-2 font-semibold text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            Dokumen Belum Lengkap
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Masih ada {missingDocs.length} dokumen wajib yang belum diupload:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missingDocs.map((doc) => (
              <span
                key={doc.value}
                className="rounded-full bg-white px-3 py-1 text-sm text-yellow-800"
              >
                {doc.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Document Checklist */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-gray-900">Checklist Dokumen</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {documentTypes
            .filter((d) => d.required)
            .map((docType) => {
              const uploaded = documents.find((d) => d.type === docType.value);
              return (
                <div
                  key={docType.value}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    uploaded
                      ? uploaded.status === "VERIFIED"
                        ? "border-green-200 bg-green-50"
                        : "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {uploaded ? (
                      uploaded.status === "VERIFIED" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span
                      className={uploaded ? "text-gray-900" : "text-gray-500"}
                    >
                      {docType.label}
                    </span>
                  </div>
                  {docType.required && (
                    <span className="text-xs text-red-500">Wajib</span>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Uploaded Documents */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900">Dokumen Terupload</h3>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">Belum ada dokumen diupload</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getDocTypeLabel(doc.type)}
                    </p>
                    <p className="text-sm text-gray-500">{doc.fileName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(doc.status)}
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Upload Dokumen
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jenis Dokumen
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 focus:border-primary focus:outline-none"
                >
                  <option value="">Pilih jenis dokumen</option>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} {type.required && "(Wajib)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  File Dokumen
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full rounded-lg border border-gray-300 p-2 file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-1 file:text-sm file:text-white"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Format: JPG, PNG, PDF. Maks 5MB
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setSelectedType("");
                }}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadFile || !selectedType || uploading}
                className="flex-1 rounded-lg bg-primary py-2 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? "Mengupload..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
