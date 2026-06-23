// frontend/app/dashboard/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { orderApi } from "@/lib/orderApi";
import { Order } from "@/constants/types";
import { STATUS_STYLE } from "@/constants/constants";
import { useAuth } from "@/lib/authContext";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [failReason, setFailReason] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const fetchOrder = async () => {
    try {
      const data = await orderApi.getOne(id);
      if (data.success) setOrder(data.data.order);
      else setError("Order not found");
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (!user?.id) return;
      await fetchOrder();
    };

    loadOrder();
  }, [user]);

  // ── Actions ──────────────────────────────────
  const handlePickup = async () => {
    setActionLoading(true);
    const data = await orderApi.markPickedUp(id);
    if (data.success) await fetchOrder();
    else alert(data.message);
    setActionLoading(false);
  };

  const handleDeliver = async () => {
    setActionLoading(true);
    const formData = new FormData();
    if (proofFile) formData.append("photo", proofFile);
    const data = await orderApi.markDelivered(id, proofFile);
    if (data.success) await fetchOrder();
    else alert(data.message);
    setActionLoading(false);
  };

  const handleFail = async () => {
    if (!failReason.trim()) {
      alert("Please enter a reason");
      return;
    }
    setActionLoading(true);
    const data = await orderApi.markFailed(id, failReason);
    if (data.success) {
      setShowFailModal(false);
      await fetchOrder();
    } else alert(data.message);
    setActionLoading(false);
  };

  const copyTrackingLink = () => {
    if (!order) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/track/${order.orderId}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading / error ──────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading order...
      </div>
    );
  }

  if (error || !order) {
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

  const isActive = !["delivered", "failed"].includes(order.status);
  const canPickup = order.status === "assigned";
  const canDeliver = ["picked_up", "in_transit"].includes(order.status);
  const canFail = isActive;

  // Timeline entries that have timestamps
  const timelineEntries = [
    { label: "Order created", time: order.createdAt, icon: "📦" },
    { label: "Driver assigned", time: order.timeline.assignedAt, icon: "🛵" },
    { label: "Picked up", time: order.timeline.pickedUpAt, icon: "✅" },
    { label: "Delivered", time: order.timeline.deliveredAt, icon: "🎉" },
    { label: "Failed", time: order.timeline.failedAt, icon: "❌" },
  ].filter((e) => e.time);

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-gray-500
          hover:text-gray-700 mb-5 transition-colors"
      >
        ← Back to orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold text-gray-900">
              {order.orderId}
            </h1>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full
              ${STATUS_STYLE[order.status]}`}
            >
              {order.status.replace("_", " ").toUpperCase()}
            </span>
            {order.priority === "urgent" && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full
                bg-red-100 text-red-700"
              >
                🔴 Urgent
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">
            Created {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Tracking link */}
        <button
          onClick={copyTrackingLink}
          className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg
            border transition-all ${
              copied
                ? "border-green-300 bg-green-50 text-green-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
        >
          {copied ? "✅ Copied!" : "🔗 Copy tracking link"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3
              className="text-xs font-medium text-gray-400 uppercase
              tracking-wide mb-3"
            >
              Customer
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full bg-blue-50 flex
                items-center justify-center text-blue-600 font-semibold text-sm"
              >
                {order.customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {order.customer.name}
                </p>
                <p className="text-xs text-gray-500">{order.customer.phone}</p>
              </div>
              <a
                href={`tel:${order.customer.phone}`}
                className="ml-auto text-xs border border-gray-200 px-3 py-1.5
                  rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Call
              </a>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Delivery address</p>
              <p className="text-sm text-gray-700">
                {order.deliveryAddress.text}
              </p>
              {order.deliveryAddress.lat !== 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {order.deliveryAddress.lat}, {order.deliveryAddress.lng}
                </p>
              )}
            </div>
          </div>

          {/* Driver info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3
              className="text-xs font-medium text-gray-400 uppercase
              tracking-wide mb-3"
            >
              Driver
            </h3>
            {order.driverId ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full bg-green-50 flex
                  items-center justify-center text-green-600 font-semibold text-sm"
                >
                  {order.driverId.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {order.driverId.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.driverId.phone} · ★{" "}
                    {order.driverId.rating?.toFixed(1)}
                  </p>
                </div>
                <Link
                  href={`/dashboard/drivers/${order.driverId._id}`}
                  className="ml-auto text-xs text-green-600 hover:underline"
                >
                  View profile →
                </Link>
              </div>
            ) : (
              <div className="py-4 text-center text-gray-400 text-sm">
                No driver assigned yet
              </div>
            )}
          </div>

          {/* Order details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3
              className="text-xs font-medium text-gray-400 uppercase
              tracking-wide mb-3"
            >
              Order details
            </h3>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Warehouse</span>
                <span className="text-xs text-gray-700 font-medium">
                  {order.warehouseId?.name ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Priority</span>
                <span
                  className={`text-xs font-medium ${
                    order.priority === "urgent"
                      ? "text-red-600"
                      : "text-gray-700"
                  }`}
                >
                  {order.priority}
                </span>
              </div>
              {order.notes && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Notes</span>
                  <span className="text-xs text-gray-700 max-w-[200px] text-right">
                    {order.notes}
                  </span>
                </div>
              )}
              {order.failReason && (
                <div className="flex justify-between">
                  <span className="text-xs text-gray-400">Fail reason</span>
                  <span className="text-xs text-red-600 max-w-[200px] text-right">
                    {order.failReason}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Proof of delivery */}
          {order.proofPhoto && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3
                className="text-xs font-medium text-gray-400 uppercase
                tracking-wide mb-3"
              >
                Proof of delivery
              </h3>
              <img
                src={`http://localhost:3012/${order.proofPhoto}`}
                alt="Proof of delivery"
                className="w-full max-w-xs rounded-lg border border-gray-200"
              />
            </div>
          )}
        </div>

        {/* Right column — timeline + actions */}
        <div className="space-y-4">
          {/* Status actions */}
          {isActive && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3
                className="text-xs font-medium text-gray-400 uppercase
                tracking-wide mb-3"
              >
                Actions
              </h3>
              <div className="space-y-2.5">
                {canPickup && (
                  <button
                    onClick={handlePickup}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                      text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                  >
                    {actionLoading ? "Updating..." : "✅ Mark as picked up"}
                  </button>
                )}

                {canDeliver && (
                  <div>
                    {/* Optional proof photo */}
                    <label className="block text-xs text-gray-400 mb-1.5">
                      Proof photo (optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setProofFile(e.target.files?.[0] || null)
                      }
                      className="w-full text-xs text-gray-500 border border-gray-200
                        rounded-lg px-3 py-2 mb-2.5 file:mr-2 file:py-1 file:px-2
                        file:rounded file:border-0 file:text-xs file:bg-green-50
                        file:text-green-700"
                    />
                    <button
                      onClick={handleDeliver}
                      disabled={actionLoading}
                      className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50
                        text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                    >
                      {actionLoading ? "Updating..." : "🎉 Mark as delivered"}
                    </button>
                  </div>
                )}

                {canFail && (
                  <button
                    onClick={() => setShowFailModal(true)}
                    disabled={actionLoading}
                    className="w-full border border-red-200 hover:bg-red-50
                      text-red-600 text-sm font-medium py-2.5 rounded-lg
                      transition-colors disabled:opacity-50"
                  >
                    ❌ Mark as failed
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3
              className="text-xs font-medium text-gray-400 uppercase
              tracking-wide mb-4"
            >
              Timeline
            </h3>
            {timelineEntries.length === 0 ? (
              <p className="text-xs text-gray-400">No updates yet</p>
            ) : (
              <div className="space-y-0">
                {timelineEntries.map((entry, index) => (
                  <div key={index} className="flex gap-3">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-7 h-7 rounded-full bg-green-50 border
                        border-green-200 flex items-center justify-center
                        text-sm flex-shrink-0"
                      >
                        {entry.icon}
                      </div>
                      {index < timelineEntries.length - 1 && (
                        <div className="w-0.5 h-6 bg-gray-100 my-1" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-900">
                        {entry.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(entry.time!).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tracking link card */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-medium text-blue-800 mb-2">
              Customer tracking link
            </p>
            <p className="text-xs font-mono text-blue-600 break-all mb-3">
              {typeof window !== "undefined"
                ? `${window.location.origin}/track/${order.orderId}`
                : `/track/${order.orderId}`}
            </p>
            <button
              onClick={copyTrackingLink}
              className="w-full text-xs bg-white border border-blue-200 text-blue-700
                py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              {copied ? "✅ Copied!" : "📋 Copy link"}
            </button>
          </div>
        </div>
      </div>

      {/* Fail modal */}
      {showFailModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center
          justify-center z-50 p-4"
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Mark order as failed
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Please provide a reason for the failure
            </p>
            <textarea
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              rows={3}
              placeholder="Customer not available, wrong address, etc."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                text-sm focus:outline-none focus:ring-2 focus:ring-red-500
                resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleFail}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm
                  font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Updating..." : "Confirm failed"}
              </button>
              <button
                onClick={() => setShowFailModal(false)}
                className="px-4 border border-gray-200 rounded-lg text-sm
                  text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
