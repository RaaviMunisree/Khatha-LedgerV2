import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { createGatewayPaymentOrderController, createPaymentController, getCustomerPaymentHistoryController, getCustomerPaymentsController, verifyGatewayPaymentController } from "./payment.controller.js";


const router = Router();

router.post(
  "/:shopId/payments",
  authMiddleware,
  createPaymentController,
);

router.get(
  "/:shopId/customers/:customerId/payments",
  authMiddleware,
  getCustomerPaymentsController,
);

router.post(
  "/:shopId/invoices/:invoiceId/payment-order",
  authMiddleware,
  createGatewayPaymentOrderController,
);

router.post(
  "/:shopId/payments/razorpay/verify",
  authMiddleware,
  verifyGatewayPaymentController,
);

router.get(
  "/:shopId/customers/:customerId/payments-history",
  authMiddleware,
  getCustomerPaymentHistoryController,
);

export default router;