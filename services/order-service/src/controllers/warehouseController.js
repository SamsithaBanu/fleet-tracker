import Warehouse from "../models/Warehouse.js";
import Driver from "../models/Driver.js";
import Order from "../models/Order.js";
import redis from "../utils/redisClient.js";

export const getAllWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find({ isActive: true })

        // Add live stats to each warehouse
        const warehousesWithStats = await Promise.all(
            warehouses.map(async (wh) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                const [activeOrders, totalDrivers, onlineDriverIds] = await Promise.all([
                    Order.countDocuments({
                        warehouseId: wh._id,
                        status: { $in: ['assigned', 'picked_up', 'in_transit'] }
                    }),
                    Driver.countDocuments({ warehouseId: wh._id, isActive: true }),
                    redis.smembers('drivers:online'),
                ])

                // Count online drivers for this warehouse
                const warehouseDrivers = await Driver.find({ warehouseId: wh._id })
                const onlineCount = warehouseDrivers.filter(d =>
                    onlineDriverIds.includes(d._id.toString())
                ).length

                return {
                    ...wh.toObject(),
                    activeOrders,
                    totalDrivers,
                    onlineDrivers: onlineCount,
                }
            })
        )

        res.json({ success: true, data: { warehouses: warehousesWithStats } })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const getWareHouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id)
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' })
        }

        const drivers = await Driver.find({ warehouseId: warehouse._id, isActive: true })
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayOrders = await Order.find({
            warehouseId: warehouse._id,
            createdAt: { $gte: today }
        }).populate('driverId', 'name')

        res.json({
            success: true,
            data: { warehouse, drivers, todayOrders }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const seedWarehouses = async (req, res) => {
    try {
        const existing = await Warehouse.countDocuments()
        if (existing > 0) {
            return res.json({
                success: false,
                message: 'Warehouses already seeded'
            })
        }

        await Warehouse.insertMany([
            {
                name: 'Bagalur Warehouse',
                address: '5th street, Kattigenahalli,Bagalur Bengaluru, Karnataka 560095',
                location: { lat: 13.12376, lng: 77.61637 },
                city: 'Bangalore',
            },
            {
                name: 'Devanahalli Warehouse',
                address: '12th Main Street, near airport, Devanahalli, Bengaluru, Karnataka 560038',
                location: { lat: 13.2417, lng: 77.7137 },
                city: 'Bangalore',
            },
        ])
        res.json({
            success: true,
            message: '3 Bangalore warehouses created!'
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}