import { Router } from "express";

import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deactivateProductController,
} from "./product.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/:shopId/products",
  authMiddleware,
  createProductController,
);

router.get(
  "/:shopId/products",
  authMiddleware,
  getProductsController,
);

router.get(
  "/:shopId/products/:productId",
  authMiddleware,
  getProductByIdController,
);

router.put(
  "/:shopId/products/:productId",
  authMiddleware,
  updateProductController,
);

router.patch(
  "/:shopId/products/:productId/deactivate",
  authMiddleware,
  deactivateProductController,
);

export default router;