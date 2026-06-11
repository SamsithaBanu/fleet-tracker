import express from 'express'
import { getAllLocations, getDriverLocation, getHistory, updateLocation } from '../controllers/trackingController.js';
const router = express.Router();

//Rest endpoints

router.post('/location', updateLocation)
router.get('/location/:driverId', getDriverLocation)
router.get('/all', getAllLocations)
router.get('/history/:driverId', getHistory);

export default router;