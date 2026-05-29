export const ORDER_API: string = "http://localhost:3002";

export const authHeader: () => {
  "Content-Type": string;
  Authorization: string;
} = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});
export const STATUSES = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "picked_up", label: "Picked Up" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
];

export const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  assigned: "bg-amber-100 text-amber-700",
  picked_up: "bg-blue-100 text-blue-700",
  in_transit: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export const TIMELINE_STEPS = [
  { key: "createdAt", label: "Order created", icon: "📦" },
  { key: "assignedAt", label: "Driver assigned", icon: "🛵" },
  { key: "pickedUpAt", label: "Picked up", icon: "✅" },
  { key: "deliveredAt", label: "Delivered", icon: "🎉" },
  { key: "failedAt", label: "Failed", icon: "❌" },
];
