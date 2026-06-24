import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from 'cors';
import morgan from 'morgan';
import connectDB from "./utils/database.js";
import authRoutes from './routes/authRoutes.js'

// Server startup logic moved to bottom

const app = express()
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: '*',
    credentials: true,
}));

app.use(express.json())

app.use(morgan('dev'));

app.use('/api/auth', authRoutes);

//health check - confirm server is running

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'auth-service',
        port: PORT,
        time: new Date().toISOString()
    })
});

//handle unknown routes

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req?.method} ${req?.url} not found.`
    })
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Auth service running on http://127.0.0.1:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();

export default app;