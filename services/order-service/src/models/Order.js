import mongoose, { trusted } from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
    },
    deliveryAddress: {
        text: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    status: {
        type: String,
        enum: [
            'pending',
            'assigned',
            'picked_up',
            'in_transit',
            'delivered',
            'failed'
        ],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['normal', 'urgent'],
        default: 'normal'
    },
    notes: {
        type: String,
        default: '',
    },

    // Proof of delivery photo path
    proofPhoto: {
        type: String,
        default: null,
    },

    // Timestamps for each status change
    timeline: {
        assignedAt: { type: Date, default: null },
        pickedUpAt: { type: Date, default: null },
        inTransitAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null },
        failedAt: { type: Date, default: null },
    },

    // Why it failed (if failed)
    failReason: {
        type: String,
        default: null,
    },
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema);

export default Order;