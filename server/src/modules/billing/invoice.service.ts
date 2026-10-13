import mongoose from "mongoose";

import Shop from "../shop/shop.model.js";
import Customer from "../customer/customer.model.js";
import Product from "../product/product.model.js";
import Invoice from "./invoice.model.js";
import { createLedgerEntry } from "../ledger/ledger.service.js";
import { createInventoryTransaction } from "../inventory/inventory.service.js";

type InvoiceItemInput = {
  productId: string;
  quantity: number;
};

type InvoiceItem = {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  total: number;
};

export const createInvoice = async (
  shopId: string,
  ownerId: string,
  customerId: string,
  items: InvoiceItemInput[],
  discount: number,
) => {
  if (!items || items.length === 0) {
    throw new Error(
      "Invoice must contain at least one item",
    );
  }

  if (discount < 0) {
    throw new Error(
      "Discount cannot be negative",
    );
  }

  const session =
    await mongoose.startSession();

  try {
    const createdInvoice =
      await session.withTransaction(
        async () => {
          // 1. Verify shop ownership
          const shop = await Shop.findOne({
            _id: shopId,
            ownerId,
          }).session(session);

          if (!shop) {
            throw new Error("Shop not found");
          }

          // 2. Verify customer belongs to shop
          const customer =
            await Customer.findOne({
              _id: customerId,
              shopId,
            }).session(session);

          if (!customer) {
            throw new Error(
              "Customer not found",
            );
          }

          const invoiceItems: InvoiceItem[] = [];

          let subtotal = 0;
          let totalTax = 0;

          // 3. Validate products and stock
          for (const item of items) {
            if (item.quantity <= 0) {
              throw new Error(
                "Item quantity must be greater than zero",
              );
            }

            const product =
              await Product.findOne({
                _id: item.productId,
                shopId,
                status: "ACTIVE",
              }).session(session);

            if (!product) {
              throw new Error(
                `Product not found: ${item.productId}`,
              );
            }

            // 4. Check stock before creating sale
            if (
              product.currentStock <
              item.quantity
            ) {
              throw new Error(
                `Insufficient stock for product: ${product.name}`,
              );
            }

            const itemSubtotal =
              product.sellingPrice *
              item.quantity;

            const itemTax =
              (itemSubtotal *
                product.taxRate) /
              100;

            const itemTotal =
              itemSubtotal + itemTax;

            subtotal += itemSubtotal;
            totalTax += itemTax;

            invoiceItems.push({
              productId: product._id,
              productName: product.name,
              quantity: item.quantity,
              unitPrice:
                product.sellingPrice,
              taxRate: product.taxRate,
              taxAmount: itemTax,
              total: itemTotal,
            });
          }

          // 5. Calculate invoice total
          const grandTotal =
            subtotal +
            totalTax -
            discount;

          if (grandTotal < 0) {
            throw new Error(
              "Discount cannot exceed invoice total",
            );
          }

          // 6. Generate invoice number
          const invoiceCount =
            await Invoice.countDocuments({
              shopId,
            });

          const invoiceNumber =
            `INV-${String(
              invoiceCount + 1,
            ).padStart(5, "0")}`;

          // 7. Create invoice
          const invoice = new Invoice({
            shopId,
            customerId,
            invoiceNumber,
            items: invoiceItems,
            subtotal,
            taxAmount: totalTax,
            discount,
            grandTotal,
            paymentStatus: "UNPAID",
            status: "CONFIRMED",
            createdBy: ownerId,
          });

          await invoice.save({
            session,
          });

          // 8. Reduce inventory for every sold product
          for (const item of items) {
            await createInventoryTransaction(
              shopId,
              item.productId,
              ownerId,
              "SALE",
              item.quantity,
              {
                session,
                referenceType: "INVOICE",
                referenceId:
                  invoice._id.toString(),
              },
            );
          }

          // 9. Create invoice CREDIT in ledger
          await createLedgerEntry(
            shopId,
            ownerId,
            customerId,
            "CREDIT",
            grandTotal,
            "Invoice credit",
            "INVOICE",
            invoice._id.toString(),
            session,
          );

          return invoice;
        },
      );

    return createdInvoice;
  } finally {
    await session.endSession();
  }
};

export const getInvoices = async (
  shopId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const invoices = await Invoice.find({
    shopId,
  })
    .populate(
      "customerId",
      "name phone",
    )
    .sort({
      createdAt: -1,
    });

  return invoices;
};

export const getInvoiceById = async (
  shopId: string,
  invoiceId: string,
  ownerId: string,
) => {
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
  })
    .populate(
      "customerId",
      "name phone email address",
    )
    .populate(
      "items.productId",
      "name sku",
    );

  return invoice;
};

export const cancelInvoice = async (
  shopId: string,
  invoiceId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const invoice =
    await Invoice.findOneAndUpdate(
      {
        _id: invoiceId,
        shopId,
        status: "CONFIRMED",
      },
      {
        status: "CANCELLED",
      },
      {
        new: true,
      },
    );

  return invoice;
};