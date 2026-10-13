import mongoose from "mongoose";

import Customer from "../customer/customer.model.js";
import Product from "../product/product.model.js";
import Invoice from "../billing/invoice.model.js";
import Payment from "../payment/payment.model.js";
import Shop from "../shop/shop.model.js";


import type { AiContext } from "./ai.types.js";
import { getPaymentReport, getSalesReport,getInventoryReport } from "../reports/rerports.service.js";

type AiTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (
    args: Record<string, unknown>,
    context: AiContext,
  ) => Promise<unknown>;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const assertObjectId = (
  value: string,
  fieldName: string,
): void => {
  if (!mongoose.isValidObjectId(value)) {
    throw new Error(`Invalid ${fieldName}`);
  }
};

const assertOwnerShop = async (
  context: AiContext,
): Promise<mongoose.Types.ObjectId> => {
  if (!context.shopId) {
    throw new Error("Shop context is required");
  }

  assertObjectId(context.shopId, "shop ID");

  const shopId = new mongoose.Types.ObjectId(context.shopId);

  const shop = await Shop.findOne({
    _id: shopId,
    ownerId: context.userId,
  });

  if (!shop) {
    throw new Error("Shop not found or access denied");
  }

  return shopId;
};

const assertCustomer = async (context: AiContext) => {
  if (!context.customerId) {
    throw new Error("Customer context is required");
  }

  assertObjectId(context.customerId, "customer ID");

  const customer = await Customer.findById(context.customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};

const getDateFilters = (
  args: Record<string, unknown>,
): { from?: string; to?: string } => {
  const filters: { from?: string; to?: string } = {};

  if (
    typeof args.from === "string" &&
    args.from.trim() !== ""
  ) {
    filters.from = args.from;
  }

  if (
    typeof args.to === "string" &&
    args.to.trim() !== ""
  ) {
    filters.to = args.to;
  }

  return filters;
};

/* -------------------------------------------------------------------------- */
/* Customer Tools                                                             */
/* -------------------------------------------------------------------------- */

const customerTools: AiTool[] = [
  {
    name: "get_my_outstanding",

    description:
      "Get the authenticated customer's current outstanding balance.",

    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },

    execute: async (_args, context) => {
      const customer = await assertCustomer(context);

      return {
        customerName: customer.name,
        outstanding: Number(
          customer.currentOutstanding ?? 0,
        ),
      };
    },
  },

  {
    name: "get_my_invoices",

    description:
      "Get the authenticated customer's recent invoices and purchases.",

    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "Maximum number of invoices to return. Default is 5.",
        },
      },
      additionalProperties: false,
    },

    execute: async (args, context) => {
      const customer = await assertCustomer(context);

      const requestedLimit = Number(args.limit ?? 5);

      const limit = Math.min(
        Math.max(
          Number.isFinite(requestedLimit)
            ? requestedLimit
            : 5,
          1,
        ),
        10,
      );

      const invoices = await Invoice.find({
        shopId: customer.shopId,
        customerId: customer._id,
      })
        .select(
          "invoiceNumber items subtotal taxAmount discount grandTotal paymentStatus status createdAt",
        )
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return invoices;
    },
  },

  {
    name: "get_my_payments",

    description:
      "Get the authenticated customer's recent payment history.",

    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description:
            "Maximum number of payments to return. Default is 10.",
        },
      },
      additionalProperties: false,
    },

    execute: async (args, context) => {
      const customer = await assertCustomer(context);

      const requestedLimit = Number(args.limit ?? 10);

      const limit = Math.min(
        Math.max(
          Number.isFinite(requestedLimit)
            ? requestedLimit
            : 10,
          1,
        ),
        20,
      );

      const payments = await Payment.find({
        shopId: customer.shopId,
        customerId: customer._id,
      })
        .select(
          "amount paymentMethod status transactionReference paidAt createdAt invoiceId",
        )
        .populate({
          path: "invoiceId",
          select: "invoiceNumber grandTotal",
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return payments;
    },
  },

  {
    name: "search_products",

    description:
      "Search active products available in the customer's shop by product name or SKU.",

    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Product name or SKU to search for.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },

    execute: async (args, context) => {
      const customer = await assertCustomer(context);

      const query = String(args.query ?? "").trim();

      if (!query) {
        throw new Error(
          "Product search query is required",
        );
      }

      const products = await Product.find({
        shopId: customer.shopId,
        status: "ACTIVE",
        $or: [
          {
            name: {
              $regex: query,
              $options: "i",
            },
          },
          {
            sku: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      })
        .select(
          "name sku sellingPrice taxRate currentStock minimumStock unit",
        )
        .limit(10)
        .lean();

      return products.map((product) => ({
        name: product.name,
        sku: product.sku,
        sellingPrice: product.sellingPrice,
        taxRate: product.taxRate,
        currentStock: product.currentStock,
        minimumStock: product.minimumStock,
        unit: product.unit,
        available:
          Number(product.currentStock ?? 0) > 0,
      }));
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Shop Owner Tools                                                           */
/* -------------------------------------------------------------------------- */

const ownerTools: AiTool[] = [
  {
    name: "get_sales_summary",

    description:
      "Get sales information for the authenticated shop, optionally filtered by date range.",

    parameters: {
      type: "object",
      properties: {
        from: {
          type: "string",
          description:
            "Start date in YYYY-MM-DD format.",
        },
        to: {
          type: "string",
          description:
            "End date in YYYY-MM-DD format.",
        },
      },
      additionalProperties: false,
    },

    execute: async (args, context) => {
      await assertOwnerShop(context);

      const filters = getDateFilters(args);

      return getSalesReport(
        context.shopId!,
        context.userId,
        filters,
      );
    },
  },

  {
    name: "get_payment_summary",

    description:
      "Get payment information for the authenticated shop, optionally filtered by date range.",

    parameters: {
      type: "object",
      properties: {
        from: {
          type: "string",
          description:
            "Start date in YYYY-MM-DD format.",
        },
        to: {
          type: "string",
          description:
            "End date in YYYY-MM-DD format.",
        },
      },
      additionalProperties: false,
    },

    execute: async (args, context) => {
      await assertOwnerShop(context);

      const filters = getDateFilters(args);

      return getPaymentReport(
        context.shopId!,
        context.userId,
        filters,
      );
    },
  },

  {
    name: "get_inventory_summary",

    description:
      "Get inventory and stock information for the authenticated shop.",

    parameters: {
      type: "object",
      properties: {
        from: {
          type: "string",
          description:
            "Optional start date in YYYY-MM-DD format.",
        },
        to: {
          type: "string",
          description:
            "Optional end date in YYYY-MM-DD format.",
        },
      },
      additionalProperties: false,
    },

    execute: async (args, context) => {
      await assertOwnerShop(context);

      const filters = getDateFilters(args);

      return getInventoryReport(
        context.shopId!,
        context.userId,
        filters,
      );
    },
  },

  {
    name: "get_outstanding_summary",

    description:
      "Get customers with outstanding balances for the authenticated shop.",

    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },

    execute: async (_args, context) => {
      const shopId = await assertOwnerShop(context);

      const customers = await Customer.find({
        shopId,
        status: "ACTIVE",
        currentOutstanding: {
          $gt: 0,
        },
      })
        .select(
          "name phone currentOutstanding",
        )
        .lean();

      const totalOutstanding =
        customers.reduce(
          (sum, customer) =>
            sum +
            Number(
              customer.currentOutstanding ?? 0,
            ),
          0,
        );

      return {
        totalCustomersWithOutstanding:
          customers.length,

        totalOutstanding,

        customers: customers.map((customer) => ({
          name: customer.name,
          phone: customer.phone,
          outstanding: Number(
            customer.currentOutstanding ?? 0,
          ),
        })),
      };
    },
  },

  {
    name: "search_shop_products",

    description:
      "Search active products in the authenticated shop by product name or SKU.",

    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Product name or SKU to search for.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },

    execute: async (args, context) => {
      const shopId = await assertOwnerShop(context);

      const query = String(args.query ?? "").trim();

      if (!query) {
        throw new Error(
          "Product search query is required",
        );
      }

      const products = await Product.find({
        shopId,
        status: "ACTIVE",
        $or: [
          {
            name: {
              $regex: query,
              $options: "i",
            },
          },
          {
            sku: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      })
        .select(
          "name sku sellingPrice taxRate currentStock minimumStock unit",
        )
        .limit(10)
        .lean();

      return products.map((product) => ({
        name: product.name,
        sku: product.sku,
        sellingPrice: product.sellingPrice,
        taxRate: product.taxRate,
        currentStock: product.currentStock,
        minimumStock: product.minimumStock,
        unit: product.unit,
        available:
          Number(product.currentStock ?? 0) > 0,
      }));
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Public Tool Access                                                         */
/* -------------------------------------------------------------------------- */

export const getAiTools = (
  role: AiContext["role"],
): AiTool[] => {
  if (role === "CUSTOMER") {
    return customerTools;
  }

  return ownerTools;
};

/* -------------------------------------------------------------------------- */
/* Tool Execution                                                             */
/* -------------------------------------------------------------------------- */

export const executeAiTool = async (
  toolName: string,
  args: Record<string, unknown>,
  context: AiContext,
): Promise<unknown> => {
  const tools = getAiTools(context.role);

  const tool = tools.find(
    (candidate) => candidate.name === toolName,
  );

  if (!tool) {
    throw new Error(
      `AI tool "${toolName}" is not available for role "${context.role}"`,
    );
  }

  return tool.execute(args, context);
};