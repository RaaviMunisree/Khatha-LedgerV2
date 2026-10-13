import Shop from "../shop/shop.model.js";
import Customer from "../customer/customer.model.js";
import Invoice from "../billing/invoice.model.js";
import Payment from "./payment.model.js";
import { validateCreatePayment } from "./payment.validation.js";
import type { PaymentMethod } from "./payment.types.js";
import mongoose from "mongoose";
import { createLedgerEntry } from "../ledger/ledger.service.js";

export const createPayment = async (
  shopId: string,
  ownerId: string,
  customerId: string,
  amount: number,
  paymentMethod: PaymentMethod,
  invoiceId?: string,
  transactionReference?: string,
  notes?: string,
  idempotencyKey?: string,
) => {
  validateCreatePayment(
    customerId,
    amount,
    paymentMethod,
  );

  // 1. Verify shop ownership
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  // 2. Verify customer belongs to shop
  const customer = await Customer.findOne({
    _id: customerId,
    shopId,
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // 3. Prevent duplicate payment request
  if (idempotencyKey) {
    const existingPayment = await Payment.findOne({
      shopId,
      idempotencyKey,
    });

    if (existingPayment) {
      return existingPayment;
    }
  }

  // 4. Verify invoice if supplied
  let invoice = null;

  if (invoiceId) {
    invoice = await Invoice.findOne({
      _id: invoiceId,
      shopId,
      customerId,
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.status === "CANCELLED") {
      throw new Error(
        "Cannot pay a cancelled invoice",
      );
    }
  }

  // 5. Start MongoDB transaction
  const session = await mongoose.startSession();

  try {
    let createdPayment;

    await session.withTransaction(async () => {
      // 6. Create payment
      const payment = new Payment({
        shopId,
        customerId,
        amount,
        paymentMethod,
        receivedBy: ownerId,
        status: "COMPLETED",
      });

      if (invoiceId) {
        payment.invoiceId =
          new mongoose.Types.ObjectId(invoiceId);
      }

      if (transactionReference) {
        payment.transactionReference =
          transactionReference;
      }

      if (notes) {
        payment.notes = notes;
      }

      if (idempotencyKey) {
        payment.idempotencyKey =
          idempotencyKey;
      }

      payment.paidAt = new Date();

      await payment.save({ session });

      // 7. Create ledger DEBIT
      await createLedgerEntry(
        shopId,
        ownerId,
        customerId,
        "DEBIT",
        amount,
        `Payment received via ${paymentMethod}`,
        "PAYMENT",
        payment._id.toString(),
        session,
      );

      // 8. Update invoice payment status
      if (invoice) {
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

        if (totalPaid >= invoice.grandTotal) {
          invoice.paymentStatus = "PAID";
        } else if (totalPaid > 0) {
          invoice.paymentStatus = "PARTIAL";
        } else {
          invoice.paymentStatus = "UNPAID";
        }

        await invoice.save({ session });
      }

      createdPayment = payment;
    });

    return createdPayment;
  } finally {
    await session.endSession();
  }
};

export const getCustomerPayments = async (
  shopId: string,
  ownerId: string,
  customerId: string,
) => {
  // 1. Verify shop ownership
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  // 2. Verify customer belongs to shop
  const customer = await Customer.findOne({
    _id: customerId,
    shopId,
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // 3. Fetch payment history
  const payments = await Payment.find({
    shopId,
    customerId,
  })
    .populate(
      "invoiceId",
      "invoiceNumber grandTotal",
    )
    .populate(
      "receivedBy",
      "name email role",
    )
    .sort({
      createdAt: -1,
    });

  return payments;
};

export const getCustomerPaymentHistory = async (
  shopId: string,
  customerId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const customer = await Customer.findOne({
    _id: customerId,
    shopId,
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const payments = await Payment.find({
    shopId,
    customerId,
  })
    .populate(
      "invoiceId",
      "invoiceNumber grandTotal",
    )
    .sort({
      createdAt: -1,
    });

  return {
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      currentOutstanding:
        customer.currentOutstanding,
    },

    payments,
  };
};