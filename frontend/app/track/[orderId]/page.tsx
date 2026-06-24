// frontend/app/track/[orderId]/page.tsx
// Add Socket.io to the existing page — just add these parts

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getSocket } from "@/lib/socket";
import { ORDER_BASE } from "@/lib/config";

const CustomerMap = dynamic(() => import("@/components/map/CustomerMap"), {
  ssr: false,
  loading: () => (
    <div
      className="h-64 bg-gray-100 rounded-xl flex items-center
        justify-center text-gray-400 text-sm"
    >
      Loading map...
    </div>
  ),
});

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [driverLat, setDriverLat] = useState<number | null>(null);
  const [driverLng, setDriverLng] = useState<number | null>(null);

  // ── Fetch order ─────────────────────────────

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${ORDER_BASE}/orders/track/${orderId}`);
      const data = await res.json();

      if (data.success) {
        setOrder(data.data.order);

        // Set initial driver location from Redis (if available)
        if (data.data.order.driverLocation) {
          setDriverLat(data.data.order.driverLocation.lat);
          setDriverLng(data.data.order.driverLocation.lng);
        }
      } else {
        setError("Order not found");
      }
    } catch {
      setError("Could not load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      if (!orderId) return;
      fetchOrder();
    };
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  // ── Socket.io — live driver location ────────
  useEffect(() => {
    if (!order?.driver) return;

    const socket = getSocket();

    // Join this specific order's room
    // Server will send updates only for this order's driver
    socket.emit("join:order", orderId);

    // Listen for driver location updates
    socket.on("location:update", (data: any) => {
      setDriverLat(data.lat);
      setDriverLng(data.lng);
    });

    // Listen for order status changes
    socket.on("order:status", (data: any) => {
      if (data.orderId === orderId || data.orderId === order?._id) {
        // Refresh order to get new status
        fetchOrder();
      }
    });

    return () => {
      socket.off("location:update");
      socket.off("order:status");
    };
  }, [order?.driver, orderId]);

  const STATUS_STEPS = [
    { key: "assigned", label: "Driver assigned" },
    { key: "picked_up", label: "Picked up" },
    { key: "in_transit", label: "On the way" },
    { key: "delivered", label: "Delivered" },
  ];

  const STATUS_ORDER = ["assigned", "picked_up", "in_transit", "delivered"];
  const currentStepIndex = order ? STATUS_ORDER.indexOf(order.status) : -1;

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center
        justify-center"
      >
        <p className="text-sm text-gray-400">Loading your order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center
        justify-center"
      >
        <div className="text-center">
          <p className="text-2xl mb-2">😕</p>
          <p className="text-sm text-gray-500">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🛒</span>
          <span className="font-semibold">QuickDeliver</span>
        </div>
        <p className="text-green-100 text-sm">
          Tracking order #{order.orderId}
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        {/* Map */}
        {driverLat && driverLng ? (
          <CustomerMap
            driverLat={driverLat}
            driverLng={driverLng}
            customerLat={order.deliveryAddress.lat}
            customerLng={order.deliveryAddress.lng}
            height="240px"
          />
        ) : (
          <div
            className="h-40 bg-gray-100 rounded-xl flex items-center
            justify-center text-gray-400 text-sm"
          >
            {order.status === "pending"
              ? "Waiting for driver assignment..."
              : "Map will appear when driver starts moving"}
          </div>
        )}

        {/* Status stepper */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900">
              Order status
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {order.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {STATUS_STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      index <= currentStepIndex ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                  <span
                    className="text-[10px] text-gray-500 mt-1
                    text-center w-14 leading-tight"
                  >
                    {step.label}
                  </span>
                </div>
                {index < STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-4 ${
                      index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Driver card */}
        {order.driver && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-3">Your delivery driver</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-green-100 flex
                items-center justify-center text-green-700 font-semibold"
              >
                {order.driver.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {order.driver.name}
                </p>
                <p className="text-xs text-gray-400">{order.driver.phone}</p>
              </div>
              <a
                href={`tel:${order.driver.phone}`}
                className="bg-green-50 text-green-700 text-xs px-3
                  py-1.5 rounded-lg border border-green-200"
              >
                Call
              </a>
            </div>
          </div>
        )}

        {/* Delivery address */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Delivering to</p>
          <p className="text-sm font-medium text-gray-900">
            {order.customer.name}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {order.deliveryAddress.text}
          </p>
        </div>

        {/* Delivered */}
        {order.status === "delivered" && (
          <div
            className="bg-green-50 border border-green-200 rounded-xl
            p-5 text-center"
          >
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm font-semibold text-green-800">
              Order delivered successfully!
            </p>
            {order.timeline?.deliveredAt && (
              <p className="text-xs text-green-600 mt-1">
                {new Date(order.timeline.deliveredAt).toLocaleTimeString(
                  "en-IN",
                )}
              </p>
            )}
          </div>
        )}

        {/* Failed */}
        {order.status === "failed" && (
          <div
            className="bg-red-50 border border-red-200 rounded-xl
            p-5 text-center"
          >
            <p className="text-3xl mb-2">❌</p>
            <p className="text-sm font-semibold text-red-800">
              Delivery was unsuccessful
            </p>
            <p className="text-xs text-red-500 mt-1">
              Our team will contact you shortly
            </p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          Updates automatically every 15 seconds
        </p>
      </div>
    </div>
  );
}
