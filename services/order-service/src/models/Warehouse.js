import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    city: {
        type: String,
        default: 'Bangalore'
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;