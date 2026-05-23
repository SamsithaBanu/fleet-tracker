"use client"
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
import { allOrders, driverList, statusConfig } from "@/data/data";
import { Search, Star } from "lucide-react";
import { useState } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label";

export default function OrdersPage() {
    const [isAddOrder, setIsAddOrder] = useState(false);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Orders
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#088395]/60" />

                        <Input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-9 bg-[#088395]/5 border-[#088395]/15 focus-visible:border-[#088395]/40 focus-visible:ring-[#088395]/15 text-sm placeholder:text-gray-400 rounded-xl"
                        />
                    </div>

                    {/* Filter */}
                    <div className="w-[220px]">
                        <Select>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    All Orders
                                </SelectItem>

                                <SelectItem value="online">
                                    Pending
                                </SelectItem>

                                <SelectItem value="offline">
                                    Delivered
                                </SelectItem>
                                <SelectItem value="offline">
                                    In transit
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsAddOrder(true)}
                        className="flex items-center gap-1.5 text-[#088395] border-[#088395]/20 bg-[#088395]/5 hover:bg-[#088395]/10 rounded-full px-4 py-1.5 font-semibold text-xs disabled:opacity-40"
                    >
                        + Add Order
                    </Button>
                </div>
            </div>

            <Separator className="bg-[#088395]/10" />
            <Table>
                <TableBody>
                    {allOrders.map((order) => {
                        const status = statusConfig[order.status] ?? {
                            label: order.status,
                            className: "bg-gray-50 text-gray-600 border-gray-200",
                        };
                        return (
                            <TableRow key={order.id} className="py-3">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <span>{order?.orderId}</span>
                                        <span>{order?.customerName}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="pl-12">{order?.Warehouse}</TableCell>
                                <TableCell className="text-gray-600">{order?.driverName} </TableCell>
                                <TableCell>
                                    <Badge className={status.className}>{order?.status}</Badge>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
            {isAddOrder && (
                <Sheet open={isAddOrder} onOpenChange={setIsAddOrder}>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Create New Order</SheetTitle>
                            <SheetDescription>
                                Add a new order to the warehouse.
                            </SheetDescription>
                        </SheetHeader>
                        <Separator className="bg-[#088395]/10 m-0" />
                        <div className="grid gap-6 py-1">
                            <div className="grid gap-3 px-4">
                                <Label htmlFor="name">
                                    Customer Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div className="grid gap-3 px-4">
                                <Label htmlFor="warehouse">
                                    Phone Number
                                </Label>

                                <Input
                                    id="warehouse"
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="grid gap-3 px-4">
                                <Label htmlFor="warehouse">
                                    Email
                                </Label>

                                <Input
                                    id="email"
                                    placeholder="Enter email"
                                />
                            </div>
                            <div className="grid gap-3 px-4">
                                <Label htmlFor="address">
                                    Delivery address(bangalore)
                                </Label>

                                <Input
                                    id="address"
                                    placeholder="Enter delivery address"
                                />
                            </div>
                            <div className="grid gap-3 px-4">
                                <Label htmlFor="warehouse">
                                    Warehouse
                                </Label>
                                <Select>
                                    <SelectTrigger className="rounded-xl w-[360px]">
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Koramangala
                                        </SelectItem>
                                        <SelectItem value="online">
                                            Whitefield
                                        </SelectItem>
                                        <SelectItem value="offline">
                                            Indiranagar
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <SheetFooter>
                            <Button className="p-6 bg-[#088395]">
                                Send Order
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            )
            }
        </div>
    );
}