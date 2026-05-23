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
import { driverList, statusConfig } from "@/data/data";
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

export default function DriversPage() {
    const [isAddDriver, setIsAddDriver] = useState(false);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Drivers
                    </h2>
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
                        <Select>
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">
                                    All Drivers
                                </SelectItem>

                                <SelectItem value="online">
                                    Online
                                </SelectItem>

                                <SelectItem value="offline">
                                    Offline
                                </SelectItem>
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
                    {driverList.map((driver) => {
                        const status = statusConfig[driver.status] ?? {
                            label: driver.status,
                            className: "bg-gray-50 text-gray-600 border-gray-200",
                        };
                        return (
                            <TableRow key={driver.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{driver.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span>{driver.name}</span>
                                    </div>
                                </TableCell>

                                <TableCell className="pl-12">{driver.warehouse}</TableCell>

                                <TableCell>
                                    <Badge className={status.className}>{driver?.status}</Badge>
                                </TableCell>

                                <TableCell className="text-gray-600">{driver.delivered} del</TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4" />
                                        {driver.rating}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )
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
                                <Label htmlFor="name">
                                    Driver Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Enter driver name"
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
                                Save Driver
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            )
            }
        </div>
    );
}