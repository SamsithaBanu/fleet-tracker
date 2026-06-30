"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { statusConfig } from "@/data/data";
import { Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { authApi, driverApi, wareHouseAPi } from "@/lib/orderApi";
import { useRouter } from "next/navigation";
import { Warehouse } from "@/constants/types";
import toast from "react-hot-toast";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function DriversPage() {
  const router = useRouter();
  const [isAddDriver, setIsAddDriver] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    warehouseId: "",
    userId: "temp-user-id", // replace with real auth userId later
  });

  useEffect(() => {
    wareHouseAPi.getAll().then((data) => {
      if (data.success) setWarehouses(data.data.warehouses);
    });
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      const params = "?";
      const data = await driverApi.getAll(params);
      if (data.success) setDrivers(data.data.drivers);
      setLoading(false);
    };
    fetchDrivers();
  }, [warehouseFilter, statusFilter]);

  useEffect(() => {
    wareHouseAPi.getAll().then((data) => {
      if (data.success) setWarehouses(data.data.warehouses);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await driverApi.add(form);

      const registerData = await authApi.register({
        name: form?.name,
        email: form?.email,
        phone: form?.phone,
        password: "123456",
        role: "driver", // Default role
      });

      if (data.success) {
        toast.success("Driver added successfully");
        setIsAddDriver(false);

        const driversData = await driverApi.getAll("?");
        if (driversData.success) {
          setDrivers(driversData.data.drivers);
        }

        setForm({
          name: "",
          phone: "",
          email: "",
          licenseNumber: "",
          warehouseId: "",
          userId: "temp-user-id",
        });
      } else {
        toast.error(data.message || "Failed to add driver");
        setError(data.message || "Failed to add driver");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin", "driver"]}>
      <div className="space-y-4 md:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              Drivers
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[260px] md:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#088395]/60" />
              <Input
                type="text"
                placeholder="Search drivers..."
                className="pl-9 bg-[#088395]/5 border-[#088395]/15 focus-visible:border-[#088395]/40 focus-visible:ring-[#088395]/15 text-sm placeholder:text-gray-400 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 sm:w-[180px] md:w-[220px]">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All Drivers</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsAddDriver(true)}
                className="flex items-center gap-1.5 text-[#088395] border-[#088395]/20 bg-[#088395]/5 hover:bg-[#088395]/10 rounded-full px-4 py-1.5 font-semibold text-xs disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                + Add Driver
              </Button>
            </div>
          </div>
        </div>
        <Separator className="bg-[#088395]/10" />
        <div className="md:hidden space-y-3">
          {drivers.map((driver) => {
            const currentStatus = driver.isOnline ? "online" : "offline";
            const status = statusConfig[currentStatus] ?? {
              label: currentStatus,
              className: "bg-gray-50 text-gray-600 border-gray-200",
            };
            return (
              <div
                key={driver._id}
                onClick={() => router.push(`/dashboard/drivers/${driver?._id}`)}
                className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="shrink-0">
                      <AvatarFallback>
                        {driver.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {driver.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {driver.warehouseId?.name}
                      </p>
                    </div>
                  </div>
                  <Badge className={`shrink-0 ${status.className}`}>
                    {driver?.isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
                <Separator className="my-3 bg-gray-100" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {driver.totalDeliveries} deliveries
                  </span>
                  <div className="flex items-center gap-1 text-gray-700 font-medium">
                    <Star className="h-3.5 w-3.5" />
                    {driver.rating}
                  </div>
                </div>
              </div>
            );
          })}
          {drivers.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-10">
              No drivers found.
            </div>
          )}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableBody>
              {drivers.map((driver) => {
                const currentStatus = driver.isOnline ? "online" : "offline";
                const status = statusConfig[currentStatus] ?? {
                  label: currentStatus,
                  className: "bg-gray-50 text-gray-600 border-gray-200",
                };
                return (
                  <TableRow
                    key={driver._id}
                    onClick={() =>
                      router.push(`/dashboard/drivers/${driver?._id}`)
                    }
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {driver.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{driver.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="pl-12">
                      {driver.warehouseId?.name}
                    </TableCell>

                    <TableCell>
                      <Badge className={status.className}>
                        {driver?.isOnline ? "Online" : "Offline"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-gray-600">
                      {driver.totalDeliveries} del
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {driver.rating}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {isAddDriver && (
          <Sheet open={isAddDriver} onOpenChange={setIsAddDriver}>
            <SheetContent className="w-full sm:max-w-[420px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Add Driver</SheetTitle>
                <SheetDescription>
                  Add a new driver to the warehouse.
                </SheetDescription>
              </SheetHeader>
              <Separator className="bg-[#088395]/10 m-0" />
              <div className="grid gap-6 py-1">
                <div className="grid gap-3 px-4">
                  <Label htmlFor="name">Driver Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter driver name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-3 px-4">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-3 px-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-3 px-4">
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    placeholder="Enter license number"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-3 px-4">
                  <Label htmlFor="warehouse">Warehouse</Label>

                  <Select
                    value={form.warehouseId}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        warehouseId: value,
                      }))
                    }
                  >
                    {/* Full width within sheet, instead of fixed 360px */}
                    <SelectTrigger className="rounded-xl w-full">
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>

                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse._id} value={warehouse._id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button
                  className="w-full sm:w-auto p-6 bg-[#088395]"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Driver"}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </ProtectedRoute>
  );
}
