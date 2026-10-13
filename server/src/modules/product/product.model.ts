import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
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

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    taxRate: {
      type: Number,
      default: 0,
    },

    currentStock: {
      type: Number,
      default: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      enum: [
        "PCS",
        "KG",
        "GRAM",
        "LITRE",
        "ML",
        "BOX",
        "PACK",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index(
  { shopId: 1, sku: 1 },
  { unique: true },
);

const Product = mongoose.model(
  "Product",
  productSchema,
);

export default Product;