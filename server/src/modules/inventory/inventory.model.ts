import mongoose, { Document } from "mongoose";

type InventoryType =
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "DAMAGE"
  | "EXPIRY"
  | "ADJUSTMENT";

type ReferenceType =
  | "INVOICE"
  | "PURCHASE"
  | "RETURN"
  | "MANUAL";

interface IInventoryTransaction extends Document {
  shopId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: InventoryType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType?: ReferenceType;
  referenceId?: mongoose.Types.ObjectId;
  performedBy: mongoose.Types.ObjectId;
}

const inventoryTransactionSchema =
  new mongoose.Schema<IInventoryTransaction>(
    {
      shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true,
      },

      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      type: {
        type: String,
        enum: [
          "PURCHASE",
          "SALE",
          "RETURN",
          "DAMAGE",
          "EXPIRY",
          "ADJUSTMENT",
        ],
        required: true,
      },

      quantity: {
        type: Number,
        required: true,
      },

      previousStock: {
        type: Number,
        required: true,
      },

      newStock: {
        type: Number,
        required: true,
      },

      referenceType: {
        type: String,
        enum: [
          "INVOICE",
          "PURCHASE",
          "RETURN",
          "MANUAL",
        ],
      },

      referenceId: {
        type: mongoose.Schema.Types.ObjectId,
      },

      performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    {
      timestamps: true,
    },
  );

inventoryTransactionSchema.index({
  shopId: 1,
  productId: 1,
  createdAt: -1,
});

const InventoryTransaction =
  mongoose.model<IInventoryTransaction>(
    "InventoryTransaction",
    inventoryTransactionSchema,
  );

export default InventoryTransaction;