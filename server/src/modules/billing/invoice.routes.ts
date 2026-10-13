import { Router } from "express";

import {
  createInvoiceController,
  getInvoicesController,
  getInvoiceByIdController,
  cancelInvoiceController,
} from "./invoice.controller.js";

import {
  authMiddleware,
} from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/:shopId/invoices",
  authMiddleware,
  createInvoiceController,
);

router.get(
  "/:shopId/invoices",
  authMiddleware,
  getInvoicesController,
);

router.get(
  "/:shopId/invoices/:invoiceId",
  authMiddleware,
  getInvoiceByIdController,
);

router.patch(
  "/:shopId/invoices/:invoiceId/cancel",
  authMiddleware,
  cancelInvoiceController,
);

export default router;