import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    licenseNumber: {
        type: String,
        required: true
    },
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    isOnline: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,

    },
    fcmToken: {
        type: String,
        default: null,
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5
    },
    totalDeliveries: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});
const Driver = mongoose.model('Driver', driverSchema);
export default Driver;