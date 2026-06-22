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
import { driverApi, orderApi, wareHouseAPi } from "@/lib/orderApi";
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
    // Load warehouses for filter dropdown
    wareHouseAPi.getAll().then((data) => {
      if (data.success) setWarehouses(data.data.warehouses);
    });
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      let params = "?";
      // if (warehouseFilter) params += `warehouseId=${warehouseFilter}&`;
      // if (statusFilter) params += `status=${statusFilter}`;

      const data = await driverApi.getAll(params);
      console.log("data", data);
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

    console.log("FORM DATA:", form);

    try {
      const data = await driverApi.add(form);

      console.log("API RESPONSE:", data);

      if (data.success) {
        toast.success("Driver added successfully");
        setIsAddDriver(false);

        // Refresh drivers list
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
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Drivers</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#088395]/60" />

              <Input
                type="text"
                placeholder="Search drivers..."
                className="pl-9 bg-[#088395]/5 border-[#088395]/15 focus-visible:border-[#088395]/40 focus-visible:ring-[#088395]/15 text-sm placeholder:text-gray-400 rounded-xl"
              />
            </div>

            {/* Filter */}
            <div className="w-[220px]">
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
              className="flex items-center gap-1.5 text-[#088395] border-[#088395]/20 bg-[#088395]/5 hover:bg-[#088395]/10 rounded-full px-4 py-1.5 font-semibold text-xs disabled:opacity-40"
            >
              + Add Driver
            </Button>
          </div>
        </div>

        <Separator className="bg-[#088395]/10" />
        <Table>
          <TableBody>
            {drivers.map((driver) => {
              const currentStatus = driver.isOnline ? "online" : "offline";

              const status = statusConfig[currentStatus] ?? {
                label: currentStatus,
                className: "bg-gray-50 text-gray-600 border-gray-200",
              };
              return (
                <TableRow key={driver._id} onClick={()=>router.push(`/dashboard/drivers/${driver?._id}`)}>
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
        {isAddDriver && (
          <Sheet open={isAddDriver} onOpenChange={setIsAddDriver}>
            <SheetContent>
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
                  <Label htmlFor="warehouse">Phone Number</Label>

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
                  <Label htmlFor="warehouse">Email</Label>

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
                  <Label htmlFor="license">License Number</Label>

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
                    <SelectTrigger className="rounded-xl w-[360px]">
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
                  className="p-6 bg-[#088395]"
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
