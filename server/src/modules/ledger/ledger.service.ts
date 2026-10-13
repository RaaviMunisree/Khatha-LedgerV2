import mongoose from "mongoose";

import Shop from "../shop/shop.model.js";
import Customer from "../customer/customer.model.js";
import Ledger from "./ledger.model.js";

type LedgerType =
  | "CREDIT"
  | "DEBIT"
  | "ADJUSTMENT";

type ReferenceType =
  | "INVOICE"
  | "PAYMENT"
  | "ADJUSTMENT"
  | "MANUAL";

export const createLedgerEntry = async (
  shopId: string,
  ownerId: string,
  customerId: string,
  type: LedgerType,
  amount: number,
  description?: string,
  referenceType?: ReferenceType,
  referenceId?: string,
  session?: mongoose.ClientSession,
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
  }).session(session ?? null);

  if (!customer) {
    throw new Error("Customer not found");
  }

  // 3. Validate amount

  if (amount <= 0) {
    throw new Error(
      "Amount must be greater than zero",
    );
  }

  const balanceBefore =
    customer.currentOutstanding;

  let balanceAfter: number;

  // Customer owes more
  if (type === "CREDIT") {
    balanceAfter =
      balanceBefore + amount;
  } else {
    // Customer pays / outstanding decreases
    balanceAfter =
      balanceBefore - amount;
  }

  // 4. Prevent negative outstanding

  if (balanceAfter < 0) {
    throw new Error(
      "Payment cannot exceed outstanding amount",
    );
  }

  // 5. Update customer outstanding

  customer.currentOutstanding =
    balanceAfter;

  if (session) {
  await customer.save({ session });
} else {
  await customer.save();
}

  // 6. Create ledger entry

  const ledgerData = {
    shopId,
    customerId,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    createdBy: ownerId,
  };

  const ledger = new Ledger(ledgerData);

  if (description !== undefined) {
    ledger.description = description;
  }

  if (referenceType !== undefined) {
    ledger.referenceType = referenceType;
  }

  if (referenceId !== undefined) {
    ledger.referenceId = referenceId as never;
  }

  if (session) {
  await ledger.save({ session });
} else {
  await ledger.save();
}
  return ledger;
};

export const getCustomerLedger = async (
  shopId: string,
  ownerId: string,
  customerId: string,
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

  const ledgerEntries = await Ledger.find({
    shopId,
    customerId,
  })
    .populate(
      "createdBy",
      "name email role",
    )
    .sort({
      createdAt: 1,
    });

  return {
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      currentOutstanding:
        customer.currentOutstanding,
    },
    ledger: ledgerEntries,
  };
};