import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    // Get customer by userId
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, isDeleted: false },
      include: {
        documents: {
          where: { isDeleted: false },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return successResponse([], "No documents found");
    }

    // Transform for frontend
    const transformed = customer.documents.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
      fileUrl: d.url,
      status: d.status,
      uploadedAt: d.createdAt,
      verifiedAt: d.verifiedAt,
      notes: d.notes,
    }));

    return successResponse(transformed);
  } catch (error) {
    console.error("Portal documents error:", error);
    return errorResponse("Failed to fetch documents", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { type, fileName, fileUrl } = body;

    if (!type || !fileUrl) {
      return errorResponse("type and fileUrl required", 400);
    }

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id, isDeleted: false },
    });

    if (!customer) {
      return errorResponse("Customer not found", 404);
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        customerId: customer.id,
        type,
        fileName: fileName || type,
        url: fileUrl,
        status: "PENDING",
      },
    });

    return successResponse(document, "Document uploaded successfully");
  } catch (error) {
    console.error("Upload document error:", error);
    return errorResponse("Failed to upload document", 500);
  }
}
