import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    creditLimit: {
      type: Number,
      default: 0,
    },

    currentOutstanding: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

const Customer = mongoose.model(
  "Customer",
  customerSchema,
);

export default Customer;