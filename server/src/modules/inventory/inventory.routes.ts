import { Router } from "express";

import {
  createInventoryTransactionController,
} from "./inventory.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/:shopId/products/:productId/inventory",
  authMiddleware,
  createInventoryTransactionController,
);

export default router;