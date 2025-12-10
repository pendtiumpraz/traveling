/**
 * Huawei Health Kit Integration for Smartwatch Tracking
 *
 * This module integrates with Huawei Health Kit API to track jamaah
 * using Huawei smartwatches (GT series, Watch 3, etc.)
 *
 * Features:
 * - Real-time GPS location tracking
 * - Heart rate monitoring
 * - Step count
 * - Sleep data
 * - Battery level
 * - Device status
 *
 * Prerequisites:
 * 1. Register app at Huawei Developer Console
 * 2. Enable Health Kit API
 * 3. Get Client ID and Client Secret
 * 4. Configure OAuth2 for user authorization
 */

export interface HuaweiConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  batteryLevel: number;
  lastSyncTime: Date;
  isOnline: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  bearing?: number;
  timestamp: Date;
}

export interface HealthData {
  heartRate?: number;
  stepCount?: number;
  calories?: number;
  distance?: number;
  sleepDuration?: number;
  stressLevel?: number;
  spo2?: number;
  timestamp: Date;
}

export interface JamaahTracking {
  jamaahId: string;
  customerId: string;
  deviceId: string;
  location: LocationData;
  health: HealthData;
  device: DeviceInfo;
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: "GEOFENCE_EXIT" | "LOW_BATTERY" | "SOS" | "HEALTH_ABNORMAL" | "OFFLINE";
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: Date;
  acknowledged: boolean;
}

// Huawei Health Kit API endpoints
const HUAWEI_AUTH_URL =
  "https://oauth-login.cloud.huawei.com/oauth2/v3/authorize";
const HUAWEI_TOKEN_URL = "https://oauth-login.cloud.huawei.com/oauth2/v3/token";
const HUAWEI_HEALTH_API = "https://health-api.cloud.huawei.com/healthkit/v1";

class HuaweiHealthService {
  private config: HuaweiConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: HuaweiConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope:
        "https://www.huawei.com/healthkit/location.read https://www.huawei.com/healthkit/heartrate.read https://www.huawei.com/healthkit/activity.read",
      state,
    });
    return `${HUAWEI_AUTH_URL}?${params}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await fetch(HUAWEI_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<string> {
    const response = await fetch(HUAWEI_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    return data.access_token;
  }

  /**
   * Get real-time location data
   */
  async getLocation(userId: string): Promise<LocationData | null> {
    if (!this.accessToken) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${HUAWEI_HEALTH_API}/location/realtime`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.location) {
        return {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          accuracy: data.location.accuracy,
          altitude: data.location.altitude,
          speed: data.location.speed,
          bearing: data.location.bearing,
          timestamp: new Date(data.location.timestamp),
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get location:", error);
      return null;
    }
  }

  /**
   * Get health data (heart rate, steps, etc.)
   */
  async getHealthData(
    userId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<HealthData | null> {
    if (!this.accessToken) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${HUAWEI_HEALTH_API}/data/query`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          userId,
          dataTypes: ["heartRate", "stepCount", "calories", "distance"],
          startTime: startTime.getTime(),
          endTime: endTime.getTime(),
        }),
      });

      const data = await response.json();

      return {
        heartRate: data.heartRate?.value,
        stepCount: data.stepCount?.value,
        calories: data.calories?.value,
        distance: data.distance?.value,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Failed to get health data:", error);
      return null;
    }
  }

  /**
   * Get device info
   */
  async getDeviceInfo(userId: string): Promise<DeviceInfo | null> {
    if (!this.accessToken) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${HUAWEI_HEALTH_API}/device/info`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.device) {
        return {
          deviceId: data.device.deviceId,
          deviceName: data.device.deviceName,
          deviceType: data.device.deviceType,
          batteryLevel: data.device.batteryLevel,
          lastSyncTime: new Date(data.device.lastSyncTime),
          isOnline: data.device.isOnline,
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to get device info:", error);
      return null;
    }
  }

  /**
   * Subscribe to real-time updates via webhook
   */
  async subscribeToUpdates(
    userId: string,
    webhookUrl: string,
  ): Promise<boolean> {
    if (!this.accessToken) throw new Error("Not authenticated");

    try {
      const response = await fetch(`${HUAWEI_HEALTH_API}/subscription/create`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          userId,
          callbackUrl: webhookUrl,
          dataTypes: ["location", "heartRate", "deviceStatus"],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      return false;
    }
  }
}

// Singleton instance
let huaweiService: HuaweiHealthService | null = null;

export function getHuaweiService(): HuaweiHealthService {
  if (!huaweiService) {
    huaweiService = new HuaweiHealthService({
      clientId: process.env.HUAWEI_CLIENT_ID || "",
      clientSecret: process.env.HUAWEI_CLIENT_SECRET || "",
      redirectUri: process.env.HUAWEI_REDIRECT_URI || "",
    });
  }
  return huaweiService;
}

/**
 * Check if location is within geofence
 */
export function isWithinGeofence(
  location: LocationData,
  center: { lat: number; lng: number },
  radiusMeters: number,
): boolean {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(location.latitude - center.lat);
  const dLng = toRad(location.longitude - center.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(center.lat)) *
      Math.cos(toRad(location.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusMeters;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Generate alert based on tracking data
 */
export function checkForAlerts(
  tracking: JamaahTracking,
  geofences: Array<{ lat: number; lng: number; radius: number; name: string }>,
): Alert[] {
  const alerts: Alert[] = [];

  // Check battery level
  if (tracking.device.batteryLevel < 20) {
    alerts.push({
      id: `battery-${tracking.jamaahId}-${Date.now()}`,
      type: "LOW_BATTERY",
      message: `Battery rendah (${tracking.device.batteryLevel}%) untuk ${tracking.customerId}`,
      severity: tracking.device.batteryLevel < 10 ? "HIGH" : "MEDIUM",
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  // Check device offline
  if (!tracking.device.isOnline) {
    alerts.push({
      id: `offline-${tracking.jamaahId}-${Date.now()}`,
      type: "OFFLINE",
      message: `Device offline untuk ${tracking.customerId}`,
      severity: "HIGH",
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  // Check geofence
  for (const geofence of geofences) {
    if (
      !isWithinGeofence(
        tracking.location,
        { lat: geofence.lat, lng: geofence.lng },
        geofence.radius,
      )
    ) {
      alerts.push({
        id: `geofence-${tracking.jamaahId}-${Date.now()}`,
        type: "GEOFENCE_EXIT",
        message: `${tracking.customerId} keluar dari area ${geofence.name}`,
        severity: "HIGH",
        timestamp: new Date(),
        acknowledged: false,
      });
    }
  }

  // Check abnormal heart rate
  if (
    tracking.health.heartRate &&
    (tracking.health.heartRate > 150 || tracking.health.heartRate < 40)
  ) {
    alerts.push({
      id: `health-${tracking.jamaahId}-${Date.now()}`,
      type: "HEALTH_ABNORMAL",
      message: `Detak jantung abnormal (${tracking.health.heartRate} bpm) untuk ${tracking.customerId}`,
      severity: "CRITICAL",
      timestamp: new Date(),
      acknowledged: false,
    });
  }

  return alerts;
}

export default HuaweiHealthService;
