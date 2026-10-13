import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "ONLINE_GATEWAY",
      ],
      required: true,
    },

    transactionReference: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "COMPLETED",
        "FAILED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
      ],
      default: "COMPLETED",
    },

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    // Prevents accidental duplicate payment requests.
    idempotencyKey: {
      type: String,
      trim: true,
    },

    // Future gateway support.
    gateway: {
      type: String,
      trim: true,
    },

    gatewayOrderId: {
      type: String,
      trim: true,
    },

    gatewayPaymentId: {
      type: String,
      trim: true,
    },

    paidAt: {
      type: Date,
    },

    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({
  shopId: 1,
  customerId: 1,
  createdAt: -1,
});

paymentSchema.index({
  shopId: 1,
  invoiceId: 1,
});

paymentSchema.index(
  { shopId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      idempotencyKey: { $exists: true },
    },
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;