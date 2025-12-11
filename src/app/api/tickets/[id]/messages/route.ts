import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List ticket comments/messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id, isDeleted: false },
      include: {
        customer: {
          select: { id: true, fullName: true, phone: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 },
      );
    }

    const comments = await prisma.ticketComment.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        ticket,
        comments,
      },
    });
  } catch (error) {
    console.error("Get ticket messages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

// POST - Add comment to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { comment, isInternal } = body;

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment is required" },
        { status: 400 },
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id, isDeleted: false },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 },
      );
    }

    const ticketComment = await prisma.ticketComment.create({
      data: {
        ticketId: id,
        comment,
        isInternal: isInternal || false,
        userId: session.user.id,
      },
    });

    // Update ticket status if it was OPEN
    if (ticket.status === "OPEN") {
      await prisma.ticket.update({
        where: { id },
        data: { status: "IN_PROGRESS" },
      });
    }

    return NextResponse.json({
      success: true,
      data: ticketComment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Create ticket comment error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add comment" },
      { status: 500 },
    );
  }
}
