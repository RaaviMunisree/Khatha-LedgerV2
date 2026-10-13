import { Router } from "express";

import {
  createShopController,
  getMyShopsController,
  getShopByIdController,
  updateShopController,
  deactivateShopController,
} from "./shop.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createShopController,
);

router.get(
  "/",
  authMiddleware,
  getMyShopsController,
);

router.get(
  "/:id",
  authMiddleware,
  getShopByIdController,
);

router.put(
  "/:id",
  authMiddleware,
  updateShopController,
);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  deactivateShopController,
);

export default router;