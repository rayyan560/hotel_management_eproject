const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'RoomStay',
      'Restaurant',
      'RoomService',
      'Laundry',
      'Transportation',
      'MiniBar',
      'Spa',
      'DamageCharge',
      'Other',
    ],
    default: 'Other',
  },
  quantity: {
    type: Number,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    items: [invoiceItemSchema],
    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 12,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'PartiallyPaid', 'Paid', 'Refunded'],
      default: 'Unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['CreditCard', 'DebitCard', 'Cash', 'OnlineTransfer', 'UPI', 'Pending'],
      default: 'Pending',
    },
    transactionId: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: 'Thank you for choosing LuxuryStay Hospitality. We look forward to welcoming you again.',
    },
  },
  {
    timestamps: true,
  }
);

// Calculation helper
invoiceSchema.methods.recalculateTotals = function () {
  this.subTotal = this.items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  this.discountAmount = (this.subTotal * (this.discountPercent || 0)) / 100;
  const taxableAmount = this.subTotal - this.discountAmount;
  this.taxAmount = Number(((taxableAmount * (this.taxRate || 12)) / 100).toFixed(2));
  this.grandTotal = Number((taxableAmount + this.taxAmount).toFixed(2));
  this.balanceDue = Math.max(0, Number((this.grandTotal - (this.amountPaid || 0)).toFixed(2)));
  if (this.amountPaid >= this.grandTotal && this.grandTotal > 0) {
    this.paymentStatus = 'Paid';
  } else if (this.amountPaid > 0) {
    this.paymentStatus = 'PartiallyPaid';
  } else {
    this.paymentStatus = 'Unpaid';
  }
};

module.exports = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
