// frontend/app/dashboard/drivers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { orderApi } from "@/lib/orderApi";

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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [driverRes, earningsRes] = await Promise.all([
          orderApi.getDriver(id),
          orderApi.getDriverEarnings(id),
        ]);
        if (driverRes.success) setDriver(driverRes.data.driver);
        else setError("Driver not found");
        if (earningsRes.success) setEarnings(earningsRes.data);
      } catch (err) {
        setError("Failed to load driver");
      } finally {
        setLoading(false);
      }
    };
    if (!id) return;
    fetchAll();
  }, [id]);

  // Toggle online / offline
  const handleToggle = async () => {
    if (!driver) return;
    setToggling(true);
    try {
      const data = await orderApi.toggleDriverStatus({
        driverId: driver._id,
        isOnline: !driver.isOnline,
        lat: driver.warehouseId ? 12.9352 : 12.9716,
        lng: driver.warehouseId ? 77.6245 : 77.5946,
      });
      if (data.success) setDriver(data.data.driver);
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
            value: earnings?.todayDeliveries ?? 0,
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
          Today's deliveries ({earnings?.recentOrders?.length ?? 0})
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {!earnings?.recentOrders?.length ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No deliveries today yet
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Order</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Address</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Earning</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {earnings.recentOrders.map((order) => (
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
  );
}
