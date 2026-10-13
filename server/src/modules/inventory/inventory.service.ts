import mongoose from "mongoose";

import Shop from "../shop/shop.model.js";
import Product from "../product/product.model.js";
import InventoryTransaction from "./inventory.model.js";

type InventoryType =
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "DAMAGE"
  | "EXPIRY"
  | "ADJUSTMENT";

type InventoryReferenceType =
  | "INVOICE"
  | "PURCHASE"
  | "RETURN"
  | "MANUAL";

type InventoryTransactionOptions = {
  session?: mongoose.ClientSession;
  referenceType?: InventoryReferenceType;
  referenceId?: string;
};

export const createInventoryTransaction = async (
  shopId: string,
  productId: string,
  userId: string,
  type: InventoryType,
  quantity: number,
  options: InventoryTransactionOptions = {},
) => {
  const { session, referenceType, referenceId } =
    options;

  // 1. Verify shop ownership
  const shopQuery = Shop.findOne({
    _id: shopId,
    ownerId: userId,
  });

  if (session) {
    shopQuery.session(session);
  }

  const shop = await shopQuery;

  if (!shop) {
    throw new Error("Shop not found");
  }

  // 2. Find product inside this shop
  const productQuery = Product.findOne({
    _id: productId,
    shopId,
  });

  if (session) {
    productQuery.session(session);
  }

  const product = await productQuery;

  if (!product) {
    throw new Error("Product not found");
  }

  // 3. Validate quantity
  if (quantity <= 0) {
    throw new Error(
      "Quantity must be greater than zero",
    );
  }

  // 4. Store current stock
  const previousStock = product.currentStock;

  let newStock: number;

  // 5. Calculate new stock
  if (
    type === "PURCHASE" ||
    type === "RETURN"
  ) {
    newStock = previousStock + quantity;
  } else {
    newStock = previousStock - quantity;
  }

  // 6. Prevent negative stock
  if (newStock < 0) {
    throw new Error("Insufficient stock");
  }

  // 7. Update product stock
  product.currentStock = newStock;

  if (session) {
    await product.save({ session });
  } else {
    await product.save();
  }

  // 8. Create inventory transaction
  const transaction = new InventoryTransaction({
    shopId,
    productId,
    type,
    quantity,
    previousStock,
    newStock,
    performedBy: userId,
    ...(referenceType !== undefined
      ? { referenceType }
      : {}),
    ...(referenceId !== undefined
      ? { referenceId }
      : {}),
  });

  if (session) {
    await transaction.save({ session });
  } else {
    await transaction.save();
  }

  return transaction;
};