import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middleware/verifyToken.js';
import { createOrder, getAllOrders, getAnalytics, getLiveOrders, getOrder, markDelivered, markFailed, markPickedUp, trackOrder } from '../controllers/orderController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `proof-${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage })

router.get('/track/:orderId', trackOrder);

router.get('/', verifyToken, getAllOrders);;
router.post('/', verifyToken, createOrder);
router.get('/live', verifyToken, getLiveOrders);
router.get('/analytics', verifyToken, getAnalytics);
router.get('/:id', verifyToken, getOrder);
router.put('/:id/pickup', verifyToken, markPickedUp);
router.put('/:id/deliver', verifyToken, upload.single('photo'), markDelivered);
router.put('/:id/fail', verifyToken, markFailed);

export default router;
