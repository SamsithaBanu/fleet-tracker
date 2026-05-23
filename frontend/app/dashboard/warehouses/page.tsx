import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { warehouseList } from "@/data/data";
import {
    Warehouse,
    Package,
    Bike,
} from "lucide-react";

export default function WarehousePage() {
    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        Warehouses
                    </h2>
                </div>
            </div>

            <Separator className="bg-[#088395]/10" />

            {/* Top Info */}
            <div>
                <p className="text-sm text-gray-500 font-medium">
                    {warehouseList?.length} warehouses · Bangalore · V1
                </p>
            </div>

            {/* Warehouse Cards */}
            <div className="space-y-4">
                {warehouseList.map((warehouse) => (
                    <Card
                        key={warehouse.id}
                        className="rounded-2xl border py-2 border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <CardContent className="p-2">
                            {/* Top Section */}
                            <div className="flex items-start justify-between">
                                {/* Left */}
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Warehouse className="h-6 w-6 text-emerald-600" />
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {warehouse.name}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            {warehouse.location}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                                    {warehouse?.status}
                                </div>
                            </div>

                            {/* Divider */}
                            <Separator className="my-2" />

                            {/* Bottom Stats */}
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span>{warehouse.ordersToday} orders</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Bike className="h-4 w-4" />
                                    <span>{warehouse.activeDrivers} drivers</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}