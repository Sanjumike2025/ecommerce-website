const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/', authenticateToken, orderController.getOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.post('/', authenticateToken, orderController.createOrder);
router.put('/:id/status', authenticateToken, authorize(['admin']), orderController.updateOrderStatus);
router.put('/:id/cancel', authenticateToken, orderController.cancelOrder);

module.exports = router;
