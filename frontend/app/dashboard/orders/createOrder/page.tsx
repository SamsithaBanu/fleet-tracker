"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orderApi, wareHouseAPi } from "@/lib/orderApi";
import toast from "react-hot-toast";

interface Warehouse {
  _id: string;
  name: string;
  address: string;
  onlineDrivers: number;
}

export default function CreateOrderPage() {
  const router = useRouter();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryLat: "",
    deliveryLng: "",
    warehouseId: "",
    priority: "normal",
    notes: "",
  });

  const formatPhoneNumber = (phone: string): string => {
    // Remove all spaces, dashes, parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, "");

    // If it doesn't start with +, add +91 (India)
    if (!cleaned.startsWith("+")) {
      // Remove leading 0 if present
      cleaned = cleaned.replace(/^0/, "");
      cleaned = `+91${cleaned}`;
    }

    return cleaned;
  };

  useEffect(() => {
    wareHouseAPi.getAll().then((data) => {
      if (data.success) setWarehouses(data.data.warehouses);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const selectedWarehouse = warehouses.find((w) => w._id === form.warehouseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    const formattedData = {
      ...form,
      customerPhone: formatPhoneNumber(form.customerPhone),
    };

    try {
      const data = await orderApi.create(formattedData);
      if (!data.success) {
        setError(data.message || "Failed to create order");
        return;
      }
      setSuccess(data);
      // Redirect to order detail after 2.5 seconds
      setTimeout(() => {
        router.push(`/dashboard/orders/${data.data.order._id}`);
      }, 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    toast.success("hhelo");
  }, []);

  // ── Success screen ────────────────────────────
  if (success) {
    const order = success.data.order;
    const assigned = order.driverId;

    return (
      <div className="max-w-md mx-auto mt-20 text-center px-4">
        <div
          className="w-16 h-16 bg-green-100 rounded-full flex items-center
          justify-center text-3xl mx-auto mb-5"
        >
          {assigned ? "✅" : "⚠️"}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Order {assigned ? "created & assigned!" : "created"}
        </h2>
        <p className="text-sm text-gray-400 font-mono mb-5">{order.orderId}</p>

        {assigned ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full bg-green-200 flex items-center
                justify-center text-green-800 font-semibold text-sm"
              >
                {order.driverId?.name?.charAt(0) ?? "?"}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-green-800">
                  {order.driverId?.name}
                </p>
                <p className="text-xs text-green-600">
                  Nearest driver auto-assigned
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-sm font-medium text-amber-800">
              No drivers available right now
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Order saved as pending — will auto-assign when a driver comes
              online
            </p>
          </div>
        )}

        <p className="text-xs text-gray-400">Redirecting to order detail...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-gray-500
          hover:text-gray-700 mb-5 transition-colors"
      >
        ← Back to orders
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Create new order
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Nearest available driver will be auto-assigned instantly
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-700 text-sm
          px-4 py-3 rounded-lg mb-5"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Customer name *
          </label>
          <input
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            required
            placeholder="Rohan Mehta"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500
              transition-all"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Customer phone *
          </label>
          <input
            name="customerPhone"
            value={form.customerPhone}
            onChange={handleChange}
            required
            placeholder="+919876511111 dd"
            pattern="^\+[1-9]\d{1,14}$"
            title="Enter phone with country code, e.g. +919876511111"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5
      text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Include country code, no spaces. e.g. +919876511111
          </p>
        </div>

        {/* Delivery address */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Delivery address *
          </label>
          <input
            name="deliveryAddress"
            value={form.deliveryAddress}
            onChange={handleChange}
            required
            placeholder="14, 5th Cross, HSR Layout, Bengaluru 560102"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500
              transition-all"
          />
        </div>

        {/* GPS coordinates */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-gray-600">
              GPS coordinates
            </label>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-green-600 hover:underline"
            >
              Get from Google Maps →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="deliveryLat"
              value={form.deliveryLat}
              onChange={handleChange}
              placeholder="Latitude  e.g. 12.9116"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                transition-all"
            />
            <input
              name="deliveryLng"
              value={form.deliveryLng}
              onChange={handleChange}
              placeholder="Longitude  e.g. 77.6389"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5
                text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                transition-all"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Right-click any location on Google Maps → copy lat,lng
          </p>
        </div>

        {/* Warehouse */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Warehouse *
          </label>
          <select
            name="warehouseId"
            value={form.warehouseId}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500
              bg-white transition-all"
          >
            <option value="">Select warehouse</option>
            {warehouses.map((wh) => (
              <option key={wh._id} value={wh._id}>
                {wh.name} — {wh.onlineDrivers} drivers online
              </option>
            ))}
          </select>

          {/* Online driver count warning */}
          {selectedWarehouse && selectedWarehouse.onlineDrivers === 0 && (
            <p className="text-xs text-amber-600 mt-1.5">
              ⚠️ No drivers online at this warehouse right now. Order will be
              saved as pending.
            </p>
          )}
          {selectedWarehouse && selectedWarehouse.onlineDrivers > 0 && (
            <p className="text-xs text-green-600 mt-1.5">
              ✅ {selectedWarehouse.onlineDrivers} driver(s) online — will
              auto-assign nearest
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Priority
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: "normal",
                label: "🟢 Normal",
                desc: "Standard delivery",
              },
              { value: "urgent", label: "🔴 Urgent", desc: "Rush delivery" },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, priority: p.value }))
                }
                className={`py-3 rounded-lg text-sm border transition-all ${
                  form.priority === p.value
                    ? p.value === "urgent"
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-green-50 border-green-300 text-green-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{p.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Delivery notes (optional)
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Leave at door, ring bell twice, fragile items..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5
              text-sm focus:outline-none focus:ring-2 focus:ring-green-500
              resize-none transition-all"
          />
        </div>

        {/* Auto-assign notice */}
        <div
          className="bg-blue-50 border border-blue-100 rounded-lg px-4
          py-3 text-xs text-blue-700"
        >
          🤖 <span className="font-medium">Auto-assign enabled</span> — system
          will automatically find and assign the nearest available driver from
          the selected warehouse when you submit.
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50
              text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Creating order..." : "📦 Create & auto-assign driver"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 border border-gray-200 rounded-lg text-sm
              text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
