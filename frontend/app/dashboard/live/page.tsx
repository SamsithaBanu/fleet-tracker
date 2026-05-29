"use client";
import { orderApi } from "@/lib/orderApi";
import { useEffect, useState } from "react";

const LivePage = () => {
  const [liveOrders, setLiveOrders] = useState<any>({
    pending: [],
    assigned: [],
    picked_up: [],
    in_transit: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveOrders = async () => {
      const data = await orderApi.getLiveOrders();
      if (data.success) setLiveOrders(data.data.orders);
      setLoading(false);
    };
    fetchLiveOrders();

    const interval = setInterval(fetchLiveOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  return <div>live</div>;
};
export default LivePage;
