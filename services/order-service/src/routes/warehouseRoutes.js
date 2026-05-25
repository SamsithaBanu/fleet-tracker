import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getAllWarehouses, getWareHouse, seedWarehouses } from '../controllers/warehouseController.js';

const router = express.Router();

router.get('/', verifyToken, getAllWarehouses)
router.get('/:id', verifyToken, getWareHouse)
router.post('/seed', seedWarehouses);

export default router;