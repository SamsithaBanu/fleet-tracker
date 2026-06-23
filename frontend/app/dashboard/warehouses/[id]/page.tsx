// frontend/app/dashboard/warehouses/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { orderApi, wareHouseAPi } from "@/lib/orderApi";
import { STATUS_STYLE } from "@/constants/constants";
import { Driver, Order, WarehouseItem } from "@/constants/types";
import { IoIosArrowForward, IoIosArrowRoundBack } from "react-icons/io";
import { IoIosArrowRoundForward } from "react-icons/io";

export default function WarehouseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  console.log("params", params);

  const [warehouse, setWarehouse] = useState<WarehouseItem | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"drivers" | "orders">("drivers");

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const data = await wareHouseAPi.getOne(id);
        if (!data.success) {
          setError("Warehouse not found");
          return;
        }
        setWarehouse(data.data.warehouse);
        setDrivers(data.data.drivers || []);
        setTodayOrders(data.data.todayOrders || []);
      } catch (err) {
        setError("Failed to load warehouse");
      } finally {
        setLoading(false);
      }
    };
    if (!id) return;
    fetchWarehouse();
  }, [id]);

  // ── Stats ────────────────────────────────────
  const onlineDrivers = drivers.filter((d) => d.isOnline).length;
  const activeOrders = todayOrders.filter((o) =>
    ["assigned", "picked_up", "in_transit"].includes(o.status),
  ).length;
  const deliveredToday = todayOrders.filter(
    (o) => o.status === "delivered",
  ).length;

  // ── Loading ──────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading warehouse...
      </div>
    );
  }

  // ── Error ────────────────────────────────────
  if (error || !warehouse) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-gray-500 text-sm">
          {error || "Warehouse not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="text-xs text-green-600 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  console.log("warehou", warehouse);

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-gray-500
          hover:text-gray-700 mb-5 transition-colors"
      >
        <IoIosArrowRoundBack size={15} /> Back to warehouses
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 bg-green-50 border border-green-100
            rounded-xl flex items-center justify-center text-2xl"
          >
            🏪
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {warehouse.name}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{warehouse.address}</p>
          </div>
        </div>
        <span
          className="text-xs font-medium px-3 py-1.5 rounded-full
          bg-green-100 text-green-700"
        >
          ● Operational
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total drivers",
            value: drivers.length,
            color: "text-gray-900",
          },
          {
            label: "Online now",
            value: onlineDrivers,
            color: "text-green-600",
          },
          {
            label: "Active orders",
            value: activeOrders,
            color: "text-amber-600",
          },
          {
            label: "Delivered today",
            value: deliveredToday,
            color: "text-blue-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Location info */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <p className="text-xs text-gray-400 mb-2">Location coordinates</p>
        <div className="flex gap-6 text-sm">
          <span className="text-gray-700">
            <span className="text-gray-400 text-xs mr-1">Lat</span>
            {warehouse.location.lat}
          </span>
          <span className="text-gray-700">
            <span className="text-gray-400 text-xs mr-1">Lng</span>
            {warehouse.location.lng}
          </span>
          <a
            href={`https://maps.google.com/?q=${warehouse.location.lat},${warehouse.location.lng}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-xs text-green-600 hover:underline flex flex-row gap-2"
          >
            <span> Open in Google Maps </span>{" "}
            <IoIosArrowRoundForward size={15} />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["drivers", "orders"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab === "drivers"
              ? `Drivers (${drivers.length})`
              : `Today's orders (${todayOrders.length})`}
          </button>
        ))}
        <Link
          href="/dashboard/drivers/add"
          className="ml-auto px-4 py-2 rounded-lg text-sm font-medium
            bg-green-600 text-white hover:bg-green-500 transition-colors"
        >
          + Add driver
        </Link>
      </div>

      {/* Drivers tab */}
      {activeTab === "drivers" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {drivers.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No drivers assigned to this warehouse yet
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Driver</th>
                  <th className="text-left px-5 py-3 font-medium">Phone</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Rating</th>
                  <th className="text-left px-5 py-3 font-medium">
                    Total deliveries
                  </th>
                  <th className="text-left px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr
                    key={driver._id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full bg-green-100 flex
                          items-center justify-center text-green-700 text-xs font-semibold"
                        >
                          {driver.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {driver.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {driver.licenseNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {driver.phone}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          driver.isOnline
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {driver.isOnline ? "● Online" : "○ Offline"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      ★ {driver.rating.toFixed(1)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {driver.totalDeliveries}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/drivers/${driver._id}`}
                        className="text-xs text-green-600 hover:underline flex flex-row gap-2"
                      >
                        <span>View</span> <IoIosArrowRoundForward size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Orders tab */}
      {activeTab === "orders" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {todayOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No orders today yet
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium">Order ID</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Driver</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Time</th>
                  <th className="text-left px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map((order) => (
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
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {order.driverId?.name ?? (
                        <span className="text-gray-300">Not assigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1
                        rounded-full ${STATUS_STYLE[order.status]}`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/orders/${order._id}`}
                        className="text-xs text-green-600 hover:underline"
                      >
                        View <IoIosArrowRoundForward size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
