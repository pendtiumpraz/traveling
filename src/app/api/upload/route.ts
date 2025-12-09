import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { uploadFile } from "@/lib/google-drive";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | null;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse("File size exceeds 10MB limit", 400);
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse("File type not allowed", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadFile(
      buffer,
      file.name,
      file.type,
      folderId || undefined,
    );

    return successResponse(
      {
        id: result.id,
        name: result.name,
        url: result.webViewLink,
        downloadUrl: result.webContentLink,
        size: result.size,
        mimeType: result.mimeType,
      },
      "File uploaded successfully",
    );
  } catch (error) {
    console.error("Upload error:", error);
    return errorResponse("Failed to upload file", 500);
  }
}
