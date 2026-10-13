import { Router } from "express";

import {
  createCustomerController,
  getCustomersController,
  getCustomerByIdController,
  updateCustomerController,
  deactivateCustomerController,
} from "./customer.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/:shopId/customers",
  authMiddleware,
  createCustomerController,
);

router.get(
  "/:shopId/customers",
  authMiddleware,
  getCustomersController,
);

router.get(
  "/:shopId/customers/:customerId",
  authMiddleware,
  getCustomerByIdController,
);

router.put(
  "/:shopId/customers/:customerId",
  authMiddleware,
  updateCustomerController,
);

router.patch(
  "/:shopId/customers/:customerId/deactivate",
  authMiddleware,
  deactivateCustomerController,
);

export default router;