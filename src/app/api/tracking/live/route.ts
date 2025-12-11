import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const manifestId = searchParams.get("manifestId");

    // Get active manifests (departed or in progress)
    const activeManifests = await prisma.manifest.findMany({
      where: {
        isDeleted: false,
        status: { in: ["DEPARTED", "IN_PROGRESS"] },
        ...(manifestId && { id: manifestId }),
      },
      include: {
        schedule: {
          include: {
            package: { select: { name: true, type: true } },
          },
        },
        participants: {
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                photo: true,
              },
            },
          },
        },
        devices: {
          include: {
            customer: { select: { id: true, fullName: true } },
            telemetry: {
              orderBy: { timestamp: "desc" },
              take: 1,
            },
          },
        },
        alerts: {
          where: { status: { in: ["ACTIVE", "ACKNOWLEDGED"] } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        geofences: {
          where: { isActive: true, isDeleted: false },
        },
      },
      orderBy: { departureDate: "desc" },
    });

    // Get latest locations for customers in active manifests
    const customerIds = activeManifests.flatMap((m) =>
      m.participants.map((p) => p.customer.id),
    );

    const latestLocations = await prisma.location.findMany({
      where: {
        customerId: { in: customerIds },
      },
      orderBy: { timestamp: "desc" },
      distinct: ["customerId"],
    });

    // Map locations to customers
    const locationMap = new Map(
      latestLocations.map((loc) => [loc.customerId, loc]),
    );

    // Get active alerts count
    const alertCounts = await prisma.alert.groupBy({
      by: ["severity"],
      where: {
        status: "ACTIVE",
        manifestId: { in: activeManifests.map((m) => m.id) },
      },
      _count: true,
    });

    // Transform data for response
    const groups = activeManifests.map((manifest) => {
      const packageName =
        typeof manifest.schedule.package.name === "string"
          ? manifest.schedule.package.name
          : (manifest.schedule.package.name as Record<string, string>).id ||
            "Package";

      // Calculate members with location data
      const membersWithLocation = manifest.participants.map((p) => {
        const location = locationMap.get(p.customer.id);
        const device = manifest.devices.find(
          (d) => d.customerId === p.customer.id,
        );
        const telemetry = device?.telemetry?.[0];

        return {
          id: p.customer.id,
          name: p.customer.fullName,
          phone: p.customer.phone,
          photo: p.customer.photo,
          location: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: location.timestamp,
                source: location.source,
              }
            : null,
          device: device
            ? {
                id: device.id,
                type: device.type,
                status: device.status,
                batteryLevel: telemetry?.batteryLevel || device.batteryLevel,
                signalStrength: telemetry?.signalStrength,
                lastSeen: device.lastSeen,
              }
            : null,
        };
      });

      // Find center point (average of all member locations)
      const locatedMembers = membersWithLocation.filter((m) => m.location);
      const centerPoint =
        locatedMembers.length > 0
          ? {
              lat:
                locatedMembers.reduce(
                  (sum, m) => sum + (m.location?.latitude || 0),
                  0,
                ) / locatedMembers.length,
              lng:
                locatedMembers.reduce(
                  (sum, m) => sum + (m.location?.longitude || 0),
                  0,
                ) / locatedMembers.length,
            }
          : null;

      // Determine group status based on members
      const onlineCount = membersWithLocation.filter(
        (m) => m.device?.status === "ACTIVE",
      ).length;
      const totalCount = membersWithLocation.length;
      const groupStatus =
        onlineCount === 0
          ? "OFFLINE"
          : onlineCount < totalCount * 0.5
            ? "PARTIAL"
            : manifest.status === "IN_PROGRESS"
              ? "ACTIVE"
              : "TRANSIT";

      return {
        id: manifest.id,
        code: manifest.code,
        name: `${packageName} - ${manifest.name}`,
        manifestCode: manifest.code,
        businessType: manifest.businessType,
        departureDate: manifest.departureDate,
        returnDate: manifest.returnDate,
        leader: manifest.leaderName,
        status: groupStatus,
        totalMembers: totalCount,
        onlineMembers: onlineCount,
        centerPoint,
        members: membersWithLocation,
        alerts: manifest.alerts.map((a) => ({
          id: a.id,
          type: a.type,
          severity: a.severity,
          title: a.title,
          message: a.message,
          status: a.status,
          createdAt: a.createdAt,
          latitude: a.latitude,
          longitude: a.longitude,
        })),
        geofences: manifest.geofences.map((g) => ({
          id: g.id,
          name: g.name,
          type: g.type,
          coordinates: g.coordinates,
          radius: g.radius,
        })),
      };
    });

    // Summary stats
    const summary = {
      totalGroups: groups.length,
      totalMembers: groups.reduce((sum, g) => sum + g.totalMembers, 0),
      onlineMembers: groups.reduce((sum, g) => sum + g.onlineMembers, 0),
      activeAlerts: alertCounts.reduce((sum, a) => sum + a._count, 0),
      criticalAlerts:
        alertCounts.find((a) => a.severity === "CRITICAL")?._count || 0,
    };

    return successResponse({
      summary,
      groups,
    });
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    return errorResponse("Failed to fetch tracking data", 500);
  }
}

// POST - Report location update
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      customerId,
      deviceId,
      latitude,
      longitude,
      altitude,
      accuracy,
      speed,
      source,
    } = body;

    if (!latitude || !longitude) {
      return errorResponse("Latitude and longitude are required", 400);
    }

    const location = await prisma.location.create({
      data: {
        customerId,
        deviceId,
        latitude,
        longitude,
        altitude,
        accuracy,
        speed,
        source: source || "GPS",
      },
    });

    // Update device last seen
    if (deviceId) {
      await prisma.device.update({
        where: { id: deviceId },
        data: { lastSeen: new Date() },
      });
    }

    return successResponse(location, "Location reported successfully");
  } catch (error) {
    console.error("Error reporting location:", error);
    return errorResponse("Failed to report location", 500);
  }
}
