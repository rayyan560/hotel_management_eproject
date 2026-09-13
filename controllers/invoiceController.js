const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { generateInvoiceHtml } = require('../utils/generateInvoiceHtml');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private (Staff/Admin or Guest for own)
const getAllInvoices = async (req, res, next) => {
  try {
    const { paymentStatus, guestId, bookingId, search } = req.query;
    const query = {};

    // Offline/Demo fallback
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const demoInvoices = [
        { _id: 'inv1', invoiceNumber: 'INV-2026-4821', guestName: 'James Walker', guestEmail: 'guest@luxurystay.com', roomNumber: '201', subTotal: 760, taxAmount: 91.20, grandTotal: 851.20, amountPaid: 0, balanceDue: 851.20, paymentStatus: 'Unpaid' },
        { _id: 'inv2', invoiceNumber: 'INV-2026-3311', guestName: 'Sarah Mitchell', guestEmail: 'sarah.m@email.com', roomNumber: '301', subTotal: 1950, taxAmount: 234, grandTotal: 2184, amountPaid: 2184, balanceDue: 0, paymentStatus: 'Paid' },
      ];
      return res.status(200).json({ success: true, count: demoInvoices.length, invoices: demoInvoices });
    }

    if (req.user.role === 'guest') {
      query.guest = req.user._id;
    } else if (guestId) {
      query.guest = guestId;
    }

    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (bookingId) query.booking = bookingId;
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(query)
      .populate('guest', 'name email phone')
      .populate('booking', 'bookingCode checkInDate checkOutDate status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('guest', 'name email phone address')
      .populate('booking');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    // Role check for guest
    if (req.user.role === 'guest' && invoice.guest._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invoice',
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add extra service charge to invoice (Food, Laundry, MiniBar, Spa, etc.)
// @route   POST /api/invoices/:id/add-charge
// @access  Private (Staff, Admin, Receptionist)
const addServiceCharge = async (req, res, next) => {
  try {
    const { description, category = 'Other', quantity = 1, unitPrice } = req.body;

    if (!description || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide description and unitPrice for the service charge',
      });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const totalPrice = Number((Number(quantity) * Number(unitPrice)).toFixed(2));

    invoice.items.push({
      description,
      category,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalPrice,
      date: new Date(),
    });

    // Recalculate totals
    invoice.recalculateTotals();
    await invoice.save();

    // Also update linked Booking additionalCharges & totalAmount
    const booking = await Booking.findById(invoice.booking);
    if (booking) {
      booking.additionalCharges = Number((booking.additionalCharges + totalPrice).toFixed(2));
      booking.totalAmount = invoice.grandTotal;
      booking.taxAmount = invoice.taxAmount;
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: `Charge of $${totalPrice} (${category}) added to invoice`,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process / Record payment for invoice
// @route   POST /api/invoices/:id/pay
// @access  Private (Staff, Admin, Receptionist, Guest)
const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod = 'CreditCard', transactionId } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const paymentAmount = amount ? Number(amount) : invoice.balanceDue;

    invoice.amountPaid = Number(((invoice.amountPaid || 0) + paymentAmount).toFixed(2));
    invoice.paymentMethod = paymentMethod;
    invoice.transactionId = transactionId || `TXN-${Date.now()}`;
    invoice.paidAt = new Date();

    // Recalculate balance
    invoice.recalculateTotals();
    await invoice.save();

    // Update Booking payment status
    const booking = await Booking.findById(invoice.booking);
    if (booking) {
      booking.paymentStatus = invoice.paymentStatus;
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: `Payment of $${paymentAmount} processed successfully. Status: ${invoice.paymentStatus}`,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get printable HTML invoice template
// @route   GET /api/invoices/:id/print
// @access  Private
const printInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('booking guest');
    if (!invoice) {
      return res.status(404).send('<h2>Invoice not found</h2>');
    }

    const html = generateInvoiceHtml(invoice);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  addServiceCharge,
  recordPayment,
  printInvoice,
};
