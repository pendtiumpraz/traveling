import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse("Email wajib diisi", 400);
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email, isDeleted: false },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse({
        message: "Jika email terdaftar, kami akan mengirim instruksi reset password",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In production, send email here
    // For now, just log it (you would integrate with email service like SendGrid, Resend, etc.)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    
    console.log("=== PASSWORD RESET ===");
    console.log("Email:", email);
    console.log("Reset URL:", resetUrl);
    console.log("Token expires:", resetTokenExpiry);
    console.log("======================");

    // TODO: Send actual email
    // await sendEmail({
    //   to: email,
    //   subject: "Reset Password",
    //   html: `<p>Klik link berikut untuk reset password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    // });

    return successResponse({
      message: "Jika email terdaftar, kami akan mengirim instruksi reset password",
      // Only in development - remove in production
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return errorResponse("Gagal memproses permintaan", 500);
  }
}
