"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";

import { orderApi, wareHouseAPi } from "@/lib/orderApi";
import { statusConfig } from "@/data/data";
import { STATUSES } from "@/constants/constants";
import toast from "react-hot-toast";

interface Warehouse {
  _id: string;
  name: string;
  onlineDrivers: number;
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddOrder, setIsAddOrder] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
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

  const fetchOrders = async () => {
    setLoading(true);

    try {
      let params = "";

      if (statusFilter !== "all") {
        params += `?status=${statusFilter}`;
      }

      const data = await orderApi.getAll(params);

      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await wareHouseAPi.getAll();

      if (data.success) {
        setWarehouses(data.data.warehouses);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchWarehouses();
  }, [statusFilter]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const selectedWarehouse = warehouses.find(
    (warehouse) => warehouse._id === form.warehouseId,
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

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

      setIsAddOrder(false);

      fetchOrders();
      console.log('data', data, data?.data?.order?._id);

      router.push(`/dashboard/orders/${data.data.order._id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order");
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Orders</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-[300px]">
            <Search
              className="absolute left-3 top-1/2
              -translate-y-1/2 h-4 w-4 text-[#088395]/60"
            />

            <Input
              type="text"
              placeholder="Search orders..."
              className="pl-9 bg-[#088395]/5
              border-[#088395]/15
              focus-visible:border-[#088395]/40
              focus-visible:ring-[#088395]/15
              text-sm placeholder:text-gray-400 rounded-xl"
            />
          </div>

          {/* Filter */}
          <div className="w-[220px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All</SelectItem>

                {STATUSES.map((status) => (
                  <SelectItem value={status.value} key={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Order */}
          <Button
            variant="outline"
            onClick={() => setIsAddOrder(true)}
            className="flex items-center gap-1.5
            text-[#088395] border-[#088395]/20
            bg-[#088395]/5 hover:bg-[#088395]/10
            rounded-full px-4 py-1.5
            font-semibold text-xs"
          >
            + Add Order
          </Button>
        </div>
      </div>

      <Separator className="bg-[#088395]/10" />

      {/* Table */}
      <Table>
        <TableBody>
          {orders.map((order) => {
            const status = statusConfig[order.status] ?? {
              label: order.status,
              className: "bg-gray-50 text-gray-600 border-gray-200",
            };

            return (
              <TableRow key={order._id} onClick={()=>router.push(`/dashboard/orders/${order?._id}`)}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.orderId}</span>

                    <span className="text-sm text-gray-500">
                      {order.customerName}
                    </span>
                  </div>
                </TableCell>

                <TableCell>{order?.warehouseId?.name || "-"}</TableCell>

                <TableCell>{order?.driverId?.name || "Unassigned"}</TableCell>

                <TableCell>
                  <Badge className={status.className}>{status.label}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Create Order Sheet */}
      {isAddOrder && (
        <Sheet open={isAddOrder} onOpenChange={setIsAddOrder}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Order</SheetTitle>

              <SheetDescription>
                Add a new order to the warehouse.
              </SheetDescription>
            </SheetHeader>

            <Separator className="bg-[#088395]/10 my-4" />

            {error && (
              <div
                className="bg-red-50 border border-red-200
                text-red-700 text-sm px-4 py-3 rounded-lg mb-4"
              >
                {error}
              </div>
            )}

            <div className="grid gap-6 py-1">
              {/* Customer Name */}
              <div className="grid gap-3 px-4">
                <Label htmlFor="customerName">Customer Name</Label>

                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Enter customer name"
                  value={form.customerName}
                  onChange={handleChange}
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

              {/* Email */}
              <div className="grid gap-3 px-4">
                <Label htmlFor="customerEmail">Email</Label>

                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  placeholder="Enter email"
                  value={form.customerEmail}
                  onChange={handleChange}
                />
              </div>

              {/* Delivery Address */}
              <div className="grid gap-3 px-4">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>

                <Input
                  id="deliveryAddress"
                  name="deliveryAddress"
                  placeholder="Enter delivery address"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                />
              </div>

              {/* GPS */}
              <div className="grid gap-3 px-4">
                <Label>GPS Coordinates</Label>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="deliveryLat"
                    value={form.deliveryLat}
                    onChange={handleChange}
                    placeholder="Latitude"
                  />

                  <Input
                    name="deliveryLng"
                    value={form.deliveryLng}
                    onChange={handleChange}
                    placeholder="Longitude"
                  />
                </div>
              </div>

              {/* Warehouse */}
              <div className="grid gap-3 px-4">
                <Label>Warehouse</Label>

                <Select
                  value={form.warehouseId}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      warehouseId: value,
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>

                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse._id} value={warehouse._id}>
                        {warehouse.name} — {warehouse.onlineDrivers} drivers
                        online
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedWarehouse && selectedWarehouse.onlineDrivers === 0 && (
                  <p className="text-xs text-amber-600">
                    ⚠️ No drivers online right now
                  </p>
                )}

                {selectedWarehouse && selectedWarehouse.onlineDrivers > 0 && (
                  <p className="text-xs text-green-600">
                    ✅ {selectedWarehouse.onlineDrivers} drivers online
                  </p>
                )}
              </div>

              {/* Priority */}
              <div className="grid gap-3 px-4">
                <Label>Priority</Label>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "normal",
                      label: "🟢 Normal",
                    },
                    {
                      value: "urgent",
                      label: "🔴 Urgent",
                    },
                  ].map((priority) => (
                    <Button
                      key={priority.value}
                      type="button"
                      variant={
                        form.priority === priority.value ? "default" : "outline"
                      }
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          priority: priority.value,
                        }))
                      }
                    >
                      {priority.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="grid gap-3 px-4">
                <Label htmlFor="notes">Delivery Notes</Label>

                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Leave at door..."
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <SheetFooter className="mt-6">
              <Button
                className="bg-[#088395]
                hover:bg-[#077181]"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Order"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
