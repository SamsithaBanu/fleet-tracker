// frontend/app/dashboard/drivers/[id]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { driverApi, trackingApi } from "@/lib/orderApi";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/authContext";

interface Driver {
  _id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  isOnline: boolean;
  isActive: boolean;
  rating: number;
  totalDeliveries: number;
  warehouseId: { _id: string; name: string; address: string } | null;
  createdAt: string;
}

interface Earnings {
  todayDeliveries: number;
  todayEarnings: number;
  weekDeliveries: number;
  weekEarnings: number;
  recentOrders: Order[];
}

interface Order {
  _id: string;
  orderId: string;
  status: string;
  customer: { name: string; phone: string };
  deliveryAddress: { text: string };
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  assigned: "bg-amber-100 text-amber-700",
  picked_up: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function DriverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [gpsError, setGpsError] = useState("");
  const [watchId, setWatchId] = useState<number | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [todayDelivery, setTotalDelivery] = useState<Order[]>([]);
  const [notifPermission, setNotifPermission] = useState<string>("");

  const { user } = useAuth();

  useEffect(() => {
    const checkPermission = () => {
      if (typeof window === "undefined") return;
      if (!("Notification" in window)) return;
      setNotifPermission(Notification.permission);
    };

    const timer = setTimeout(checkPermission, 0);
    return () => clearTimeout(timer);
  }, []);

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Browser does not support GPS."));
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      });
    });
  };

  const stopGeolocation = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setGpsActive(false);
    }
  };

  const startGeolocation = useCallback(async () => {
    if (!navigator.geolocation || !driver) {
      setGpsError("Browser GPS is not available.");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed } = position.coords;
        setGpsError("");

        try {
          await trackingApi.updateLocation({
            driverId: driver._id,
            lat: latitude,
            lng: longitude,
            speed: speed ?? 0,
          });
        } catch (err) {
          console.error("GPS update failed", err);
        }
      },
      (positionError) => {
        setGpsError(positionError.message || "Unable to read GPS location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    setWatchId(id);
    setGpsActive(true);
  }, [driver]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [driverRes, earningsRes] = await Promise.all([
          driverApi.getOne(id),
          driverApi.getEarnings(id),
        ]);
        if (driverRes.success) {
          setDriver(driverRes?.data?.driver);
          setTotalDelivery(driverRes?.data?.todayOrders);
        } else setError("Driver not found");
        if (earningsRes.success) setEarnings(earningsRes.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    if (!user?.id) return;
    fetchAll();
  }, [user?.id, id]);

  useEffect(() => {
    if (!driver?.isOnline || gpsActive) return;

    const timer = window.setTimeout(() => {
      startGeolocation();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [driver?.isOnline, gpsActive, startGeolocation]);

  useEffect(() => {
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    console.log("Permission result:", permission);

    if (permission === "granted") {
      // Now get FCM token
      const { getFcmToken } = await import("@/lib/firebase");
      const token = await getFcmToken();
      console.log("FCM token after permission grant:", token);

      // Save token to driver if we have one
      if (token && driver) {
        await driverApi.toggleStatus({
          driverId: driver._id,
          isOnline: driver.isOnline,
          lat: 12.9352,
          lng: 77.6245,
          fcmToken: token,
        });
        console.log("✅ FCM token saved to driver");
      }
    }
  };

  // Toggle online / offline
  const handleToggle = async () => {
    if (!driver) return;
    setToggling(true);
    setGpsError("");

    let lat = driver.warehouseId ? 12.9352 : 12.9716;
    let lng = driver.warehouseId ? 77.6245 : 77.5946;

    if (!driver.isOnline && navigator.geolocation) {
      try {
        const position = await getCurrentPosition();
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (positionError) {
        console.warn("Unable to read initial GPS location", positionError);
        setGpsError(
          "Unable to read initial GPS. Using fallback start coordinates.",
        );
      }
    }

    let requestedFcmToken = fcmToken;
    console.log("Current FCM Token:", requestedFcmToken, fcmToken);
    if (!requestedFcmToken) {
      try {
        const { getFcmToken } = await import("@/lib/firebase");
        requestedFcmToken = await getFcmToken();
        if (requestedFcmToken) {
          setFcmToken(requestedFcmToken);
        }
      } catch (tokenError) {
        console.warn("Unable to retrieve FCM token", tokenError);
      }
    }

    try {
      const data = await driverApi.toggleStatus({
        driverId: driver._id,
        isOnline: !driver.isOnline,
        lat,
        lng,
        ...(requestedFcmToken ? { fcmToken: requestedFcmToken } : {}),
      });

      if (data.success) {
        setDriver(data.data.driver);

        if (!driver.isOnline) {
          await startGeolocation();
        } else {
          stopGeolocation();
        }
      }
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading driver...
      </div>
    );
  }

  if (error || !driver) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500 text-sm">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-xs text-green-600 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["driver", "admin", "superadmin"]}>
      <div>
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs text-gray-500
          hover:text-gray-700 mb-5 transition-colors"
        >
          ← Back to drivers
        </button>

        {/* Profile header */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full bg-green-100 flex
              items-center justify-center text-green-700 text-xl font-bold"
              >
                {driver.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {driver.name}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{driver.email}</p>
                <p className="text-sm text-gray-500">{driver.phone}</p>
              </div>
            </div>

            {/* Online toggle */}
            <div className="flex flex-col items-end gap-2">
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                  driver.isOnline
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {driver.isOnline ? "● Online" : "○ Offline"}
              </span>
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium
                transition-all disabled:opacity-50 ${
                  driver.isOnline
                    ? "border-red-200 text-red-600 hover:bg-red-50"
                    : "border-green-200 text-green-600 hover:bg-green-50"
                }`}
              >
                {toggling
                  ? "Updating..."
                  : driver.isOnline
                    ? "Set offline"
                    : "Set online"}
              </button>
              {/* Add this below the online/offline toggle button */}
              <div className="mt-2">
                {notifPermission === "granted" ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    🔔 Notifications enabled
                  </span>
                ) : notifPermission === "denied" ? (
                  <div className="text-xs text-red-500">
                    <p>🔕 Notifications blocked</p>
                    <p className="text-gray-400 mt-0.5">
                      Reset in browser → Site settings → Notifications
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={requestNotificationPermission}
                    className="text-xs px-3 py-1.5 rounded-lg border font-medium
        border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
                  >
                    🔔 Enable notifications
                  </button>
                )}
              </div>
              {gpsError ? (
                <p className="text-xs text-red-600">{gpsError}</p>
              ) : null}

              {driver.isOnline ? (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={startGeolocation}
                    disabled={gpsActive || toggling}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all disabled:opacity-50 ${gpsActive ? "border-gray-200 text-gray-600" : "border-green-200 text-green-600 hover:bg-green-50"}`}
                  >
                    {gpsActive ? "GPS tracking active" : "Start GPS tracking"}
                  </button>
                  {!gpsActive && (
                    <p className="text-xs text-green-600">
                      Click to start sending live driver location to the map.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Go online to enable GPS tracking.
                </p>
              )}
            </div>
          </div>

          {/* Info row */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">License</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {driver.licenseNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Warehouse</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {driver.warehouseId?.name ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Rating</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                ★ {driver.rating.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Joined</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {new Date(driver.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            {
              label: "Today deliveries",
              value: driver?.totalDeliveries ?? 0,
              color: "text-gray-900",
            },
            {
              label: "Today earnings",
              value: `₹${earnings?.todayEarnings ?? 0}`,
              color: "text-green-600",
            },
            {
              label: "This week",
              value: earnings?.weekDeliveries ?? 0,
              color: "text-gray-900",
            },
            {
              label: "Week earnings",
              value: `₹${earnings?.weekEarnings ?? 0}`,
              color: "text-green-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* All time stat */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Total deliveries all time</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {driver.totalDeliveries}
              </p>
            </div>
            <div className="text-4xl opacity-20">🛵</div>
          </div>
        </div>

        {/* Today's orders */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Todays deliveries ({todayDelivery?.length ?? 0})
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {!todayDelivery?.length ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                No deliveries today yet
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-medium">Order</th>
                    <th className="text-left px-5 py-3 font-medium">
                      Customer
                    </th>
                    <th className="text-left px-5 py-3 font-medium">Address</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium">Earning</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {todayDelivery.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">
                        {order.orderId}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-900">
                          {order.customer.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.customer.phone}
                        </p>
                      </td>
                      <td
                        className="px-5 py-3 text-xs text-gray-500 max-w-[180px]
                      truncate"
                      >
                        {order.deliveryAddress.text}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1
                        rounded-full ${STATUS_STYLE[order.status]}`}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-green-600">
                        ₹60
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="text-xs text-green-600 hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
