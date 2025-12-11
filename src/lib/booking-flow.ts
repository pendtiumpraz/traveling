import { prisma } from "@/lib/prisma";

/**
 * Booking Flow Logic
 *
 * Flow: Customer -> Booking -> Payment -> Invoice -> Manifest
 *
 * 1. When booking created: Decrease schedule quota
 * 2. When payment verified: Update booking paymentStatus
 * 3. When booking confirmed: Auto-create invoice, update customer type
 * 4. When booking ready: Auto-add to manifest participants
 * 5. When booking completed: Calculate & create commission
 */

// 1. Decrease schedule quota when booking created
export async function decreaseScheduleQuota(scheduleId: string, pax: number) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule) throw new Error("Schedule not found");
  if (schedule.availableQuota < pax) throw new Error("Insufficient quota");

  const newAvailable = schedule.availableQuota - pax;
  const newStatus =
    newAvailable === 0
      ? "FULL"
      : newAvailable <= 5
        ? "ALMOST_FULL"
        : schedule.status;

  return prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      availableQuota: newAvailable,
      status: newStatus as "OPEN" | "ALMOST_FULL" | "FULL",
    },
  });
}

// 2. Increase schedule quota when booking cancelled
export async function increaseScheduleQuota(scheduleId: string, pax: number) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule) throw new Error("Schedule not found");

  const newAvailable = Math.min(schedule.availableQuota + pax, schedule.quota);
  const newStatus =
    newAvailable === schedule.quota
      ? "OPEN"
      : newAvailable > 5
        ? "OPEN"
        : "ALMOST_FULL";

  return prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      availableQuota: newAvailable,
      status: newStatus as "OPEN" | "ALMOST_FULL",
    },
  });
}

// 3. Update booking payment status based on payments
export async function updateBookingPaymentStatus(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payments: {
        where: { status: "SUCCESS", isDeleted: false },
      },
    },
  });

  if (!booking) throw new Error("Booking not found");

  const totalPaid = booking.payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  );
  const totalPrice = Number(booking.totalPrice);

  let paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  if (totalPaid >= totalPrice) {
    paymentStatus = "PAID";
  } else if (totalPaid > 0) {
    paymentStatus = "PARTIAL";
  } else {
    paymentStatus = "UNPAID";
  }

  // Also update booking status if payment is complete
  let bookingStatus = booking.status;
  if (paymentStatus === "PAID" && booking.status === "PENDING") {
    bookingStatus = "CONFIRMED";
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus,
      status: bookingStatus as "PENDING" | "CONFIRMED",
    },
  });
}

// 4. Auto-create invoice when booking confirmed
export async function createInvoiceForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      package: true,
      schedule: true,
      invoices: true,
    },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.invoices.length > 0) return booking.invoices[0]; // Already has invoice

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // 7 days payment term

  const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}`;

  const packageName =
    typeof booking.package.name === "object"
      ? (booking.package.name as { id?: string }).id ||
        (booking.package.name as { en?: string }).en
      : booking.package.name;

  return prisma.invoice.create({
    data: {
      invoiceNo,
      bookingId,
      subtotal: booking.basePrice,
      discount: booking.discount,
      tax: 0,
      total: booking.totalPrice,
      paidAmount: 0,
      balance: booking.totalPrice,
      dueDate,
      items: [
        {
          description: `${packageName} - ${booking.roomType} (${booking.pax} pax)`,
          qty: booking.pax,
          price: Number(booking.basePrice) / booking.pax,
          total: Number(booking.basePrice),
        },
      ],
    },
  });
}

// 5. Update customer type based on bookings
export async function updateCustomerType(customerId: string) {
  const bookingCount = await prisma.booking.count({
    where: {
      customerId,
      status: { in: ["CONFIRMED", "COMPLETED"] },
      isDeleted: false,
    },
  });

  let customerType: "PROSPECT" | "CLIENT" | "VIP";
  if (bookingCount >= 3) {
    customerType = "VIP";
  } else if (bookingCount >= 1) {
    customerType = "CLIENT";
  } else {
    customerType = "PROSPECT";
  }

  return prisma.customer.update({
    where: { id: customerId },
    data: { customerType },
  });
}

// 6. Auto-add to manifest when booking ready
export async function addToManifest(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      schedule: {
        include: {
          manifests: true,
        },
      },
    },
  });

  if (!booking) throw new Error("Booking not found");

  // Find or create manifest for this schedule
  let manifest = booking.schedule.manifests[0];

  if (!manifest) {
    // Create new manifest
    manifest = await prisma.manifest.create({
      data: {
        code: `MNF-${Date.now().toString(36).toUpperCase()}`,
        scheduleId: booking.scheduleId,
        name: `Manifest ${new Date(booking.schedule.departureDate).toLocaleDateString("id-ID")}`,
        businessType: booking.businessType,
        departureDate: booking.schedule.departureDate,
        returnDate: booking.schedule.returnDate,
        status: "DRAFT",
      },
    });
  }

  // Check if already in manifest
  const existing = await prisma.manifestParticipant.findUnique({
    where: {
      manifestId_customerId: {
        manifestId: manifest.id,
        customerId: booking.customerId,
      },
    },
  });

  if (existing) return manifest;

  // Get next order number
  const lastParticipant = await prisma.manifestParticipant.findFirst({
    where: { manifestId: manifest.id },
    orderBy: { orderNo: "desc" },
  });

  const orderNo = (lastParticipant?.orderNo || 0) + 1;

  await prisma.manifestParticipant.create({
    data: {
      manifestId: manifest.id,
      customerId: booking.customerId,
      orderNo,
    },
  });

  return manifest;
}

// 7. Calculate and create commission
export async function createCommission(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      agent: true,
      sales: true,
      commissions: true,
    },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.commissions.length > 0) return booking.commissions[0]; // Already has commission

  // Determine who gets commission
  const recipient = booking.agent || booking.sales;
  if (!recipient) return null; // No agent/sales assigned

  const rate = Number(recipient.commissionRate || 5);
  const amount = Number(booking.totalPrice) * (rate / 100);

  return prisma.commission.create({
    data: {
      bookingId,
      agentId: booking.agentId,
      salesId: booking.salesId,
      amount,
      rate,
      status: "PENDING",
    },
  });
}

// 8. Award loyalty points
export async function awardLoyaltyPoints(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");

  // 1 point per 100,000 IDR
  const points = Math.floor(Number(booking.totalPrice) / 100000);

  if (points <= 0) return null;

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiry

  return prisma.loyaltyPoint.create({
    data: {
      customerId: booking.customerId,
      points,
      type: "EARN",
      description: `Booking ${booking.bookingCode} completed`,
      referenceId: bookingId,
      expiresAt,
    },
  });
}

// Main handler: Process booking status change
export async function processBookingStatusChange(
  bookingId: string,
  oldStatus: string,
  newStatus: string,
) {
  const results: Record<string, unknown> = {};

  // PENDING -> CONFIRMED: Create invoice, update customer
  if (oldStatus === "PENDING" && newStatus === "CONFIRMED") {
    results.invoice = await createInvoiceForBooking(bookingId);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (booking) {
      results.customer = await updateCustomerType(booking.customerId);
    }
  }

  // CONFIRMED -> READY: Add to manifest
  if (newStatus === "READY") {
    results.manifest = await addToManifest(bookingId);
  }

  // Any -> COMPLETED: Create commission, award points
  if (newStatus === "COMPLETED") {
    results.commission = await createCommission(bookingId);
    results.points = await awardLoyaltyPoints(bookingId);
  }

  // Any -> CANCELLED: Restore quota
  if (newStatus === "CANCELLED") {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (booking) {
      results.schedule = await increaseScheduleQuota(
        booking.scheduleId,
        booking.pax,
      );
    }
  }

  return results;
}

// Handler: Process payment verification
export async function processPaymentVerified(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) throw new Error("Payment not found");

  // Update booking payment status
  const booking = await updateBookingPaymentStatus(payment.bookingId);

  // Update invoice if exists
  const invoice = await prisma.invoice.findFirst({
    where: { bookingId: payment.bookingId },
  });

  if (invoice) {
    const totalPaid = await prisma.payment.aggregate({
      where: {
        bookingId: payment.bookingId,
        status: "SUCCESS",
        isDeleted: false,
      },
      _sum: { amount: true },
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: totalPaid._sum.amount || 0,
        balance: Number(invoice.total) - Number(totalPaid._sum.amount || 0),
      },
    });
  }

  return booking;
}
