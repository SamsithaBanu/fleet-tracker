"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusConfig } from "@/data/data";
import { useEffect, useState } from "react";
import { orderApi } from "@/lib/orderApi";
import { readableDate } from "@/lib/utilsFunction";
import moment from "moment-timezone";
import { Truck } from "lucide-react";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          orderApi.getAnalytics(),
          orderApi.getAll("?limit=12"),
        ]);
        if (analyticsRes.success) {
          setAnalytics(analyticsRes.data);
          setLastUpdated(
            moment(analyticsRes?.data?.createdAt)
              .tz("Asia/Kolkata")
              .format("DD-MM-YYYY hh:mm A"),
          );
        }
        if (ordersRes.success) setRecentOrders(ordersRes.data.orders);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#088395]" />
      </div>
    );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Overview
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-1.5 text-[#088395] border-[#088395]/20 bg-[#088395]/5 rounded-full px-3 py-1 font-semibold text-xs shrink-0"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#088395] animate-pulse shadow-[0_0_6px_#088395]" />
          Live data
        </Badge>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        {Object.entries(analytics)
          .filter(([key]) => key !== "createdAt" && key !== "successRate")
          .map(([key, value], index) => (
            <Card
              key={key}
              className={`border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 ${
                index === 4 ? "hidden sm:block" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-500 capitalize leading-tight">
                  {key}
                </CardTitle>
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <Truck className="h-3.5 w-3.5 md:h-4 md:w-4 text-violet-500" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {String(value)}
                </p>
                <p className="text-[10px] md:text-xs text-gray-400 mt-1 font-medium">
                  Updated {lastUpdated}
                </p>
              </CardContent>
            </Card>
          ))}
      </div>
      <Card className="border border-gray-200/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 px-4 md:px-6">
          <div>
            <CardTitle className="text-sm md:text-base font-semibold text-gray-900">
              Recent Orders
            </CardTitle>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">
              Latest {recentOrders.length} orders across all warehouses
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-xs text-gray-500 border-gray-200 rounded-full shrink-0"
          >
            {recentOrders.length} orders
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/60 hover:bg-gray-50/60">
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide pl-4 md:pl-6 whitespace-nowrap">
                    Order ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Customer
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Warehouse
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Date &amp; Time
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => {
                  const status = statusConfig[order.status] ?? {
                    label: order.status,
                    className: "bg-gray-50 text-gray-600 border-gray-200",
                  };
                  return (
                    <TableRow
                      key={order._id}
                      className="hover:bg-[#088395]/[0.03] transition-colors"
                    >
                      <TableCell className="pl-4 md:pl-6 font-mono text-xs md:text-sm font-semibold text-[#088395] whitespace-nowrap">
                        {order.orderId}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm font-medium text-gray-800 whitespace-nowrap">
                        {order?.customer?.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-600">
                        {order?.warehouseId?.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-500 whitespace-nowrap">
                        {order.date}{" "}
                        <span className="text-gray-400">
                          {readableDate(order?.updatedAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] md:text-xs font-semibold rounded-full px-2 md:px-2.5 py-0.5 whitespace-nowrap ${status.className}`}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
