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
const PORT = process.env.PORT || 3012

app.use(cors({
  origin: '*',
  credentials: true
}));

app.options(/.*/, cors());

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static('uploads'));

app.use('/orders', orderRoutes);
app.use('/drivers', driverRoutes);
app.use('/warehouses', warehouseRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'order-service', port: PORT })
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'order-service',
        port: PORT,
        time: new Date().toISOString()
    })
});

app.listen(PORT, () => {
    console.log(`Order service running on port ${PORT}`)
})
