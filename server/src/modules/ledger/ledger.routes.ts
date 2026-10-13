import { Router } from "express";

import {
  createLedgerEntryController,
  getCustomerLedgerController,
} from "./ledger.controller.js";

import {
  authMiddleware,
} from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/:shopId/ledger",
  authMiddleware,
  createLedgerEntryController,
);

router.get(
  "/:shopId/customers/:customerId/ledger",
  authMiddleware,
  getCustomerLedgerController,
);

export default router;