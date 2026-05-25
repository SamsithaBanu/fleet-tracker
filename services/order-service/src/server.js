import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './utils/database.js';
import { connectProducer } from './services/kafkaProducer.js';

import orderRoutes from './routes/orderRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';

connectDB()
connectProducer()

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));

app.use('/orders', orderRoutes);
app.use('/drivers', driverRoutes);
app.use('/warehouses', warehouseRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'order-service', port: PORT })
});

app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`)
})
