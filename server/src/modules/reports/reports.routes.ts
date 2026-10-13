
import { Router } from "express";


import {
    getInventoryReportController,
    getPaymentReportController,
  getSalesReportController,
} from "./reports.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/:shopId/reports/sales",
  authMiddleware,
  getSalesReportController,
);

router.get(
  "/:shopId/reports/payments",
  authMiddleware,
  getPaymentReportController,
);

router.get(
  "/:shopId/reports/inventory",
  authMiddleware,
  getInventoryReportController,
);
export default router;