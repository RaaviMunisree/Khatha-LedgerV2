import type { Request, Response } from "express";

import {
  createInventoryTransaction,
} from "./inventory.service.js";

export const createInventoryTransactionController = async (
  req: Request<{
    shopId: string;
    productId: string;
  }>,
  res: Response,
) => {
  try {
    const { shopId, productId } = req.params;

    const {
      type,
      quantity,
    } = req.body;

    const user = (req as any).user;

    const transaction = await createInventoryTransaction(
      shopId,
      productId,
      user.userId,
      type,
      quantity,
    );

    res.status(201).json({
      success: true,
      message: "Inventory transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create inventory transaction",
    });
  }
};