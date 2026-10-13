import mongoose from "mongoose";
import crypto from "node:crypto";

import Shop from "../shop/shop.model.js";
import Customer from "../customer/customer.model.js";
import Invoice from "../billing/invoice.model.js";
import Payment from "./payment.model.js";
import razorpayGateway from "./gateways/razorpay.gateway.instance.js";
import { createLedgerEntry } from "../ledger/ledger.service.js";

export const createGatewayPaymentOrder = async (
  shopId: string,
  ownerId: string,
  invoiceId: string,
  amount: number,
) => {
  if (amount <= 0) {
    throw new Error(
      "Payment amount must be greater than zero",
    );
  }

  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    shopId,
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.status === "CANCELLED") {
    throw new Error(
      "Cannot create payment order for a cancelled invoice",
    );
  }

  if (invoice.paymentStatus === "PAID") {
    throw new Error(
      "Invoice is already fully paid",
    );
  }

  const customer = await Customer.findOne({
    _id: invoice.customerId,
    shopId,
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  /*
   * Calculate how much has already been paid
   * through completed payments for this invoice.
   */
  const paymentSummary =
    await Payment.aggregate([
      {
        $match: {
          shopId: new mongoose.Types.ObjectId(
            shopId,
          ),
          invoiceId: invoice._id,
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: null,
          totalPaid: {
            $sum: "$amount",
          },
        },
      },
    ]);

  const totalPaid =
    paymentSummary.length > 0
      ? paymentSummary[0].totalPaid
      : 0;

  const remainingAmount =
    invoice.grandTotal - totalPaid;

  if (remainingAmount <= 0) {
    throw new Error(
      "Invoice is already fully paid",
    );
  }

  if (amount > remainingAmount) {
    throw new Error(
      `Payment amount cannot exceed remaining amount of ${remainingAmount}`,
    );
  }

  const receipt =
    `KHATAX-${invoice.invoiceNumber}-${Date.now()}`;

  const gatewayOrder =
    await razorpayGateway.createOrder({
      amount,
      currency: "INR",
      receipt,
      notes: {
        shopId,
        invoiceId,
        customerId:
          invoice.customerId.toString(),
      },
    });

  const payment = new Payment({
    shopId,
    customerId: invoice.customerId,
    invoiceId: invoice._id,
    amount,
    paymentMethod: "ONLINE_GATEWAY",
    status: "PENDING",
    receivedBy: ownerId,
    gateway: "RAZORPAY",
    gatewayOrderId: gatewayOrder.id,
  });

  await payment.save();

  return {
    paymentId: payment._id,
    orderId: gatewayOrder.id,
    amount: gatewayOrder.amount,
    currency: gatewayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    customer: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone,
    },
    remainingAmount,
  };
};
const completeGatewayPayment = async (
  shopId: string,
  ownerId: string,
  paymentId: string,
  gatewayPaymentId: string,
) => {
  const session =
    await mongoose.startSession();

  try {
    let completedPayment;

    await session.withTransaction(
      async () => {
        const payment =
          await Payment.findOne({
            _id: paymentId,
            shopId,
            status: "PENDING",
          }).session(session);

        if (!payment) {
          throw new Error(
            "Payment is not pending or does not exist",
          );
        }

        if (!payment.invoiceId) {
          throw new Error(
            "Payment is not associated with an invoice",
          );
        }

        const invoice =
          await Invoice.findOne({
            _id: payment.invoiceId,
            shopId,
          }).session(session);

        if (!invoice) {
          throw new Error(
            "Invoice not found",
          );
        }

        if (invoice.status === "CANCELLED") {
          throw new Error(
            "Cannot complete payment for a cancelled invoice",
          );
        }

        const customer =
          await Customer.findOne({
            _id: payment.customerId,
            shopId,
          }).session(session);

        if (!customer) {
          throw new Error(
            "Customer not found",
          );
        }

        payment.gatewayPaymentId =
          gatewayPaymentId;

        payment.status = "COMPLETED";
        payment.paidAt = new Date();

        await payment.save({ session });

        await createLedgerEntry(
          shopId,
          ownerId,
          payment.customerId.toString(),
          "DEBIT",
          payment.amount,
          "Razorpay payment received",
          "PAYMENT",
          payment._id.toString(),
          session,
        );

        const paymentSummary =
          await Payment.aggregate([
            {
              $match: {
                shopId:
                  new mongoose.Types.ObjectId(
                    shopId,
                  ),
                invoiceId: invoice._id,
                status: "COMPLETED",
              },
            },
            {
              $group: {
                _id: null,
                totalPaid: {
                  $sum: "$amount",
                },
              },
            },
          ]).session(session);

        const totalPaid =
          paymentSummary.length > 0
            ? paymentSummary[0].totalPaid
            : 0;

        if (
          totalPaid >= invoice.grandTotal
        ) {
          invoice.paymentStatus = "PAID";
        } else if (totalPaid > 0) {
          invoice.paymentStatus =
            "PARTIAL";
        } else {
          invoice.paymentStatus =
            "UNPAID";
        }

        await invoice.save({ session });

        completedPayment = payment;
      },
    );

    return completedPayment;
  } finally {
    await session.endSession();
  }
};

export const verifyGatewayPayment = async (
  shopId: string,
  ownerId: string,
  orderId: string,
  gatewayPaymentId: string,
  signature: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const payment =
    await Payment.findOne({
      shopId,
      gateway: "RAZORPAY",
      gatewayOrderId: orderId,
    });

  if (!payment) {
    throw new Error(
      "Gateway payment record not found",
    );
  }

  if (payment.status === "COMPLETED") {
    return payment;
  }

  if (payment.status !== "PENDING") {
    throw new Error(
      `Payment cannot be verified from status ${payment.status}`,
    );
  }

  const isValid =
    razorpayGateway.verifyPayment({
      orderId,
      paymentId: gatewayPaymentId,
      signature,
    });

  if (!isValid) {
    throw new Error(
      "Invalid Razorpay payment signature",
    );
  }

  return completeGatewayPayment(
    shopId,
    ownerId,
    payment._id.toString(),
    gatewayPaymentId,
  );
};

export const processRazorpayWebhook = async (
  rawBody: Buffer,
  signature: string,
) => {
  const webhookSecret =
    process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      "Razorpay webhook secret is not configured",
    );
  }

  // 1. Verify Razorpay webhook signature
  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        webhookSecret,
      )
      .update(rawBody)
      .digest("hex");

  if (expectedSignature !== signature) {
    throw new Error(
      "Invalid Razorpay webhook signature",
    );
  }

  // 2. Parse the raw webhook body
  const payload = JSON.parse(
    rawBody.toString("utf8"),
  );

  // 3. We only process payment.captured
  if (payload.event !== "payment.captured") {
    return {
      processed: false,
      message: "Event ignored",
    };
  }

  // 4. Extract Razorpay payment details
  const razorpayPayment =
    payload.payload?.payment?.entity;

  if (!razorpayPayment) {
    throw new Error(
      "Payment data missing from webhook",
    );
  }

  const orderId =
    razorpayPayment.order_id;

  const gatewayPaymentId =
    razorpayPayment.id;

  if (!orderId || !gatewayPaymentId) {
    throw new Error(
      "Razorpay order or payment ID missing",
    );
  }

  // 5. Find the corresponding KhataX payment
  const payment = await Payment.findOne({
    gateway: "RAZORPAY",
    gatewayOrderId: orderId,
  });

  if (!payment) {
    throw new Error(
      "KhataX payment record not found",
    );
  }

  // 6. Idempotency protection
  if (payment.status === "COMPLETED") {
    return {
      processed: true,
      message: "Payment already processed",
    };
  }

  if (payment.status !== "PENDING") {
    throw new Error(
      `Payment cannot be processed from status ${payment.status}`,
    );
  }

  // 7. Verify shop
  const shop = await Shop.findById(
    payment.shopId,
  );

  if (!shop) {
    throw new Error("Shop not found");
  }

  // 8. Verify amount
  // Razorpay sends amount in paise.
  const gatewayAmount =
    Number(razorpayPayment.amount) / 100;

  if (gatewayAmount !== payment.amount) {
    throw new Error(
      "Razorpay payment amount does not match KhataX payment amount",
    );
  }

  // 9. Complete the same financial flow
  // used by the normal Razorpay verification flow.
  const completedPayment =
    await completeGatewayPayment(
      payment.shopId.toString(),
      shop.ownerId.toString(),
      payment._id.toString(),
      gatewayPaymentId,
    );

  return {
    processed: true,
    message: "Payment processed successfully",
    payment: completedPayment,
  };
};