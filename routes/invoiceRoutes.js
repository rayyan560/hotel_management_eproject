const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoiceById,
  addServiceCharge,
  recordPayment,
  printInvoice,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.get('/', protect, getAllInvoices);
router.get('/:id', protect, getInvoiceById);
router.get('/:id/print', protect, printInvoice);

// Add service charges (restaurant, food, laundry, etc.)
router.post(
  '/:id/add-charge',
  protect,
  authorize('admin', 'manager', 'receptionist'),
  requireFields(['description', 'unitPrice']),
  addServiceCharge
);

// Process payment
router.post('/:id/pay', protect, recordPayment);

module.exports = router;
