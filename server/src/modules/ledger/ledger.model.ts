import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "CREDIT",
        "DEBIT",
        "ADJUSTMENT",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },

    referenceType: {
      type: String,
      enum: [
        "INVOICE",
        "PAYMENT",
        "ADJUSTMENT",
        "MANUAL",
      ],
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

ledgerSchema.index({
  shopId: 1,
  customerId: 1,
  createdAt: -1,
});

const Ledger = mongoose.model(
  "Ledger",
  ledgerSchema,
);

export default Ledger;