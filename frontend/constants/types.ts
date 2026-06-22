export interface WarehouseItem {
    id: string | number;
    name: string;
    location: string;
    status: string;
    ordersToday: number;
    activeDrivers: number;
    lat: string;
    lng: string
}

export interface Warehouse {
  _id: string
  name: string
  address: string
}

export interface Order {
  _id: string;
  orderId: string;
  status: string;
  priority: string;
  customer: { name: string; phone: string };
  deliveryAddress: { text: string; lat: number; lng: number };
  warehouseId: { _id: string; name: string; address: string } | null;
  driverId: { _id: string; name: string; phone: string; rating: number } | null;
  notes: string;
  proofPhoto: string | null;
  failReason: string | null;
  timeline: {
    assignedAt: string | null;
    pickedUpAt: string | null;
    inTransitAt: string | null;
    deliveredAt: string | null;
    failedAt: string | null;
  };
  createdAt: string;
}

export interface Driver {
  _id: string
  name: string
  phone: string
  email: string
  isOnline: boolean
  rating: number
  totalDeliveries: number
  licenseNumber: string
}