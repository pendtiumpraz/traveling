import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import {
  getHuaweiService,
  checkForAlerts,
  JamaahTracking,
} from "@/lib/huawei-health";

/**
 * GET /api/tracking/huawei
 * Get tracking data for all jamaah with Huawei devices
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const manifestId = searchParams.get("manifestId");

    // In production, this would fetch from database
    // For now, return mock data structure
    const mockTrackingData: JamaahTracking[] = [
      {
        jamaahId: "tracking-1",
        customerId: "Ahmad Sudirman",
        deviceId: "huawei-gt3-001",
        location: {
          latitude: 21.4225,
          longitude: 39.8262,
          accuracy: 10,
          altitude: 300,
          speed: 0,
          timestamp: new Date(),
        },
        health: {
          heartRate: 72,
          stepCount: 8500,
          calories: 320,
          distance: 5200,
          timestamp: new Date(),
        },
        device: {
          deviceId: "huawei-gt3-001",
          deviceName: "Huawei Watch GT 3",
          deviceType: "SMARTWATCH",
          batteryLevel: 65,
          lastSyncTime: new Date(),
          isOnline: true,
        },
        alerts: [],
      },
      // Add more mock data as needed
    ];

    // Check for alerts
    const geofences = [
      { lat: 21.4225, lng: 39.8262, radius: 500, name: "Masjidil Haram" },
      { lat: 21.4267, lng: 39.826, radius: 300, name: "Hotel" },
    ];

    const trackingWithAlerts = mockTrackingData.map((tracking) => ({
      ...tracking,
      alerts: checkForAlerts(tracking, geofences),
    }));

    return successResponse({
      tracking: trackingWithAlerts,
      summary: {
        total: trackingWithAlerts.length,
        online: trackingWithAlerts.filter((t) => t.device.isOnline).length,
        offline: trackingWithAlerts.filter((t) => !t.device.isOnline).length,
        alerts: trackingWithAlerts.reduce((sum, t) => sum + t.alerts.length, 0),
      },
    });
  } catch (error) {
    console.error("Huawei tracking GET error:", error);
    return errorResponse("Failed to fetch tracking data", 500);
  }
}

/**
 * POST /api/tracking/huawei/webhook
 * Webhook endpoint for real-time updates from Huawei Health Kit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-huawei-signature');

    const { eventType, data } = body;

    switch (eventType) {
      case "LOCATION_UPDATE":
        // Handle location update
        console.log("Location update:", data);
        // Save to database, broadcast via WebSocket, etc.
        break;

      case "HEALTH_UPDATE":
        // Handle health data update
        console.log("Health update:", data);
        break;

      case "DEVICE_STATUS":
        // Handle device status change
        console.log("Device status:", data);
        break;

      case "SOS_TRIGGERED":
        // Handle SOS emergency
        console.log("SOS triggered:", data);
        // Send immediate notifications, etc.
        break;

      default:
        console.log("Unknown event:", eventType);
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return errorResponse("Webhook processing failed", 500);
  }
}
