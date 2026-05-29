"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { orderApi } from "@/lib/orderApi";

const TrackPage = () => {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await orderApi.trackOrder(orderId);
      if (data.success) {
        setOrder(data.data.order);
      } else {
        setError("Order not found");
      }
      setLoading(false);
    };
    if (!orderId) {
      return;
    }
    fetchOrder();

    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
    
  }, [orderId]);
  return <div>hi</div>;
};
export default TrackPage;
