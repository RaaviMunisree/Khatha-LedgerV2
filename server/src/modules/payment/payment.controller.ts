import type { Request, Response } from "express";
import type { PaymentMethod } from "./payment.types.js";
import { createPayment, getCustomerPaymentHistory, getCustomerPayments } from "./payment.service.js";
import {
  createGatewayPaymentOrder,
   processRazorpayWebhook,
   verifyGatewayPayment,
} from "./gateway-payment.service.js";
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

interface CreatePaymentBody {
  customerId: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  notes?: string;
  idempotencyKey?: string;
}

interface VerifyGatewayPaymentBody {
  orderId: string;
  paymentId: string;
  signature: string;
}

export const verifyGatewayPaymentController =
  async (
    req: AuthenticatedRequest & {
      params: {
        shopId: string;
      };
      body: VerifyGatewayPaymentBody;
    },
    res: Response,
  ): Promise<void> => {
    try {
      const { shopId } = req.params;

      const {
        orderId,
        paymentId,
        signature,
      } = req.body;

      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      if (
        !orderId ||
        !paymentId ||
        !signature
      ) {
        res.status(400).json({
          success: false,
          message:
            "orderId, paymentId and signature are required",
        });
        return;
      }

      const payment =
        await verifyGatewayPayment(
          shopId,
          req.user.userId,
          orderId,
          paymentId,
          signature,
        );

      res.status(200).json({
        success: true,
        message:
          "Payment verified successfully",
        data: payment,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to verify payment";

      res.status(400).json({
        success: false,
        message,
      });
    }
  };
  
export const createPaymentController = async (
  req: AuthenticatedRequest & {
    params: { shopId: string };
    body: CreatePaymentBody;
  },
  res: Response,
): Promise<void> => {
  try {
    const { shopId } = req.params;

    const {
      customerId,
      invoiceId,
      amount,
      paymentMethod,
      transactionReference,
      notes,
      idempotencyKey,
    } = req.body;

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const payment = await createPayment(
      shopId,
      req.user.userId,
      customerId,
      amount,
      paymentMethod,
      invoiceId,
      transactionReference,
      notes,
      idempotencyKey,
    );

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create payment";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const getCustomerPaymentsController = async (
  req: AuthenticatedRequest & {
    params: {
      shopId: string;
      customerId: string;
    };
  },
  res: Response,
): Promise<void> => {
  try {
    const { shopId, customerId } = req.params;

    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const payments = await getCustomerPayments(
      shopId,
      req.user.userId,
      customerId,
    );

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch payments";

    res.status(400).json({
      success: false,
      message,
    });
  }
};

export const createGatewayPaymentOrderController =
  async (
    req: AuthenticatedRequest & {
      params: {
        shopId: string;
        invoiceId: string;
      };
      body: {
        amount: number;
      };
    },
    res: Response,
  ): Promise<void> => {
    try {
      const {
        shopId,
        invoiceId,
      } = req.params;

      const { amount } = req.body;

      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const paymentOrder =
        await createGatewayPaymentOrder(
          shopId,
          req.user.userId,
          invoiceId,
          amount,
        );

      res.status(201).json({
        success: true,
        message:
          "Payment order created successfully",
        data: paymentOrder,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create payment order";

      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  export const razorpayWebhookController =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const signature =
        req.headers["x-razorpay-signature"];

      if (typeof signature !== "string") {
        res.status(400).json({
          success: false,
          message:
            "Missing Razorpay webhook signature",
        });
        return;
      }

      if (!Buffer.isBuffer(req.body)) {
        res.status(400).json({
          success: false,
          message: "Invalid webhook body",
        });
        return;
      }

      const result =
        await processRazorpayWebhook(
          req.body,
          signature,
        );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error(
        "Razorpay webhook error:",
        error,
      );

      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Invalid webhook",
      });
    }
  };

  export const getCustomerPaymentHistoryController =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { shopId, customerId } =
        req.params;

      if (
        typeof shopId !== "string" ||
        typeof customerId !== "string"
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid shop ID or customer ID",
        });

        return;
      }

      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });

        return;
      }

      const result =
        await getCustomerPaymentHistory(
          shopId,
          customerId,
          req.user.userId,
        );

      res.status(200).json({
        success: true,
        message:
          "Customer payment history fetched successfully",
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch customer payment history";

      res.status(400).json({
        success: false,
        message,
      });
    }
  };