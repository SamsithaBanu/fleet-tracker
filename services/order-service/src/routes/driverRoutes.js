import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getAllDrivers, getDriver, toggleStatus, getEarnings, addDriver } from '../controllers/driverController.js';

const router = express.Router();

router.get('/', verifyToken, getAllDrivers);
router.post('/', verifyToken, addDriver);
router.get('/:id', verifyToken, getDriver);
router.put('/status', verifyToken, toggleStatus);
router.get('/:id/earnings', verifyToken, getEarnings);

export default router;