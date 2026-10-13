import mongoose from "mongoose";

import Shop from "../shop/shop.model.js";
import Invoice from "../billing/invoice.model.js";
import Payment from "../payment/payment.model.js";
import InventoryTransaction from "../inventory/inventory.model.js";
import Product from "../product/product.model.js";

type SalesReportFilters = {
  from?: string;
  to?: string;
};

const buildDateFilter = (
  from?: string,
  to?: string,
) => {
  const createdAt: {
    $gte?: Date;
    $lte?: Date;
  } = {};

  if (from) {
    const fromDate = new Date(from);

    if (Number.isNaN(fromDate.getTime())) {
      throw new Error("Invalid from date");
    }

    createdAt.$gte = fromDate;
  }

  if (to) {
    const toDate = new Date(to);

    if (Number.isNaN(toDate.getTime())) {
      throw new Error("Invalid to date");
    }

    // If only a date is supplied,
    // include the complete day.
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      toDate.setHours(23, 59, 59, 999);
    }

    createdAt.$lte = toDate;
  }

  return createdAt;
};

export const getSalesReport = async (
  shopId: string,
  ownerId: string,
  filters: SalesReportFilters = {},
) => {
  // 1. Verify shop ownership
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  // 2. Validate date range
  if (filters.from && filters.to) {
    const fromDate = new Date(filters.from);
    const toDate = new Date(filters.to);

    if (
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime())
    ) {
      throw new Error("Invalid date range");
    }

    if (fromDate > toDate) {
      throw new Error(
        "from date cannot be after to date",
      );
    }
  }

  const createdAt = buildDateFilter(
    filters.from,
    filters.to,
  );

  // 3. Build invoice filter
  const match: {
    shopId: mongoose.Types.ObjectId;
    status: "CONFIRMED";
    createdAt?: {
      $gte?: Date;
      $lte?: Date;
    };
  } = {
    shopId:
      new mongoose.Types.ObjectId(shopId),
    status: "CONFIRMED",
  };

  if (Object.keys(createdAt).length > 0) {
    match.createdAt = createdAt;
  }

  // 4. Generate summary and invoice list
  const [
    summaryResult,
    invoiceResult,
  ] = await Promise.all([
    Invoice.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,

          totalInvoices: {
            $sum: 1,
          },

          subtotal: {
            $sum: "$subtotal",
          },

          taxAmount: {
            $sum: "$taxAmount",
          },

          discount: {
            $sum: "$discount",
          },

          grossSales: {
            $sum: "$grandTotal",
          },
        },
      },
    ]),

    Invoice.aggregate([
      {
        $match: match,
      },

      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },

      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          invoiceNumber: 1,
          customerId: 1,

          customerName:
            "$customer.name",

          customerPhone:
            "$customer.phone",

          subtotal: 1,
          taxAmount: 1,
          discount: 1,
          grandTotal: 1,
          paymentStatus: 1,
          status: 1,
          createdAt: 1,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]),
  ]);

  // 5. Handle no-sales case
  const summary =
    summaryResult.length > 0
      ? summaryResult[0]
      : {
          totalInvoices: 0,
          subtotal: 0,
          taxAmount: 0,
          discount: 0,
          grossSales: 0,
        };

  const totalInvoices =
    summary.totalInvoices ?? 0;

  const averageInvoiceValue =
    totalInvoices > 0
      ? summary.grossSales /
        totalInvoices
      : 0;

  // 6. Return report
  return {
    filters: {
      from: filters.from ?? null,
      to: filters.to ?? null,
    },

    summary: {
      totalInvoices,
      subtotal: summary.subtotal ?? 0,
      taxAmount: summary.taxAmount ?? 0,
      discount: summary.discount ?? 0,
      grossSales:
        summary.grossSales ?? 0,
      averageInvoiceValue,
    },

    invoices: invoiceResult,
  };
};


type PaymentReportFilters = {
  from?: string;
  to?: string;
};

const buildPaymentDateFilter = (
  from?: string,
  to?: string,
) => {
  const createdAt: {
    $gte?: Date;
    $lte?: Date;
  } = {};

  if (from) {
    const fromDate = new Date(from);

    if (Number.isNaN(fromDate.getTime())) {
      throw new Error("Invalid from date");
    }

    createdAt.$gte = fromDate;
  }

  if (to) {
    const toDate = new Date(to);

    if (Number.isNaN(toDate.getTime())) {
      throw new Error("Invalid to date");
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      toDate.setHours(23, 59, 59, 999);
    }

    createdAt.$lte = toDate;
  }

  return createdAt;
};

export const getPaymentReport = async (
  shopId: string,
  ownerId: string,
  filters: PaymentReportFilters = {},
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  if (filters.from && filters.to) {
    const fromDate = new Date(filters.from);
    const toDate = new Date(filters.to);

    if (
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime())
    ) {
      throw new Error("Invalid date range");
    }

    if (fromDate > toDate) {
      throw new Error(
        "from date cannot be after to date",
      );
    }
  }

  const createdAt = buildPaymentDateFilter(
    filters.from,
    filters.to,
  );

  const match: {
    shopId: mongoose.Types.ObjectId;
    createdAt?: {
      $gte?: Date;
      $lte?: Date;
    };
  } = {
    shopId:
      new mongoose.Types.ObjectId(shopId),
  };

  if (Object.keys(createdAt).length > 0) {
    match.createdAt = createdAt;
  }

  const [
    summaryResult,
    methodResult,
    paymentResult,
  ] = await Promise.all([
    Payment.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,

          totalPayments: {
            $sum: 1,
          },

          totalAmount: {
            $sum: "$amount",
          },

          completedAmount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "COMPLETED",
                  ],
                },
                "$amount",
                0,
              ],
            },
          },

          pendingAmount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "PENDING",
                  ],
                },
                "$amount",
                0,
              ],
            },
          },

          failedAmount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "FAILED",
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]),

    Payment.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: "$paymentMethod",

          paymentCount: {
            $sum: 1,
          },

          totalAmount: {
            $sum: "$amount",
          },

          completedAmount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "COMPLETED",
                  ],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          totalAmount: -1,
        },
      },
    ]),

    Payment.aggregate([
      {
        $match: match,
      },

      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },

      {
        $unwind: {
          path: "$customer",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "invoices",
          localField: "invoiceId",
          foreignField: "_id",
          as: "invoice",
        },
      },

      {
        $unwind: {
          path: "$invoice",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          amount: 1,
          paymentMethod: 1,
          status: 1,
          transactionReference: 1,
          gateway: 1,
          gatewayOrderId: 1,
          gatewayPaymentId: 1,
          customerId: 1,

          customerName:
            "$customer.name",

          customerPhone:
            "$customer.phone",

          invoiceId: 1,

          invoiceNumber:
            "$invoice.invoiceNumber",

          paidAt: 1,
          createdAt: 1,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]),
  ]);

  const summary =
    summaryResult.length > 0
      ? summaryResult[0]
      : {
          totalPayments: 0,
          totalAmount: 0,
          completedAmount: 0,
          pendingAmount: 0,
          failedAmount: 0,
        };

  return {
    filters: {
      from: filters.from ?? null,
      to: filters.to ?? null,
    },

    summary: {
      totalPayments:
        summary.totalPayments ?? 0,

      totalAmount:
        summary.totalAmount ?? 0,

      completedAmount:
        summary.completedAmount ?? 0,

      pendingAmount:
        summary.pendingAmount ?? 0,

      failedAmount:
        summary.failedAmount ?? 0,
    },

    byPaymentMethod:
      methodResult,

    payments:
      paymentResult,
  };
};

type InventoryReportFilters = {
  from?: string;
  to?: string;
};

const buildInventoryDateFilter = (
  from?: string,
  to?: string,
) => {
  const createdAt: {
    $gte?: Date;
    $lte?: Date;
  } = {};

  if (from) {
    const fromDate = new Date(from);

    if (Number.isNaN(fromDate.getTime())) {
      throw new Error("Invalid from date");
    }

    createdAt.$gte = fromDate;
  }

  if (to) {
    const toDate = new Date(to);

    if (Number.isNaN(toDate.getTime())) {
      throw new Error("Invalid to date");
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      toDate.setHours(23, 59, 59, 999);
    }

    createdAt.$lte = toDate;
  }

  return createdAt;
};

export const getInventoryReport = async (
  shopId: string,
  ownerId: string,
  filters: InventoryReportFilters = {},
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  if (filters.from && filters.to) {
    const fromDate = new Date(filters.from);
    const toDate = new Date(filters.to);

    if (
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime())
    ) {
      throw new Error("Invalid date range");
    }

    if (fromDate > toDate) {
      throw new Error(
        "from date cannot be after to date",
      );
    }
  }

  const createdAt =
    buildInventoryDateFilter(
      filters.from,
      filters.to,
    );

  const transactionMatch: {
    shopId: mongoose.Types.ObjectId;
    createdAt?: {
      $gte?: Date;
      $lte?: Date;
    };
  } = {
    shopId:
      new mongoose.Types.ObjectId(shopId),
  };

  if (Object.keys(createdAt).length > 0) {
    transactionMatch.createdAt =
      createdAt;
  }

  const [
    productSummary,
    transactionSummary,
    productStock,
    transactions,
  ] = await Promise.all([
    Product.aggregate([
      {
        $match: {
          shopId:
            new mongoose.Types.ObjectId(shopId),
        },
      },
      {
        $group: {
          _id: null,

          totalProducts: {
            $sum: 1,
          },

          activeProducts: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "ACTIVE",
                  ],
                },
                1,
                0,
              ],
            },
          },

          inactiveProducts: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "INACTIVE",
                  ],
                },
                1,
                0,
              ],
            },
          },

          totalStockUnits: {
            $sum: "$currentStock",
          },

          lowStockProducts: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    "$currentStock",
                    "$minimumStock",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    InventoryTransaction.aggregate([
      {
        $match: transactionMatch,
      },
      {
        $group: {
          _id: "$type",

          transactionCount: {
            $sum: 1,
          },

          totalQuantity: {
            $sum: "$quantity",
          },
        },
      },
      {
        $sort: {
          totalQuantity: -1,
        },
      },
    ]),

    Product.aggregate([
      {
        $match: {
          shopId:
            new mongoose.Types.ObjectId(shopId),
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          unit: 1,
          currentStock: 1,
          minimumStock: 1,
          sellingPrice: 1,
          status: 1,

          stockStatus: {
            $cond: [
              {
                $lte: [
                  "$currentStock",
                  "$minimumStock",
                ],
              },
              "LOW_STOCK",
              "AVAILABLE",
            ],
          },
        },
      },
      {
        $sort: {
          currentStock: 1,
          name: 1,
        },
      },
    ]),

    InventoryTransaction.aggregate([
      {
        $match: transactionMatch,
      },

      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          productId: 1,

          productName:
            "$product.name",

          sku:
            "$product.sku",

          type: 1,
          quantity: 1,
          previousStock: 1,
          newStock: 1,
          referenceType: 1,
          referenceId: 1,
          performedBy: 1,
          createdAt: 1,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },
    ]),
  ]);

  const productStats =
    productSummary.length > 0
      ? productSummary[0]
      : {
          totalProducts: 0,
          activeProducts: 0,
          inactiveProducts: 0,
          totalStockUnits: 0,
          lowStockProducts: 0,
        };

  const transactionTotals = {
    PURCHASE: {
      transactionCount: 0,
      totalQuantity: 0,
    },

    SALE: {
      transactionCount: 0,
      totalQuantity: 0,
    },

    RETURN: {
      transactionCount: 0,
      totalQuantity: 0,
    },

    DAMAGE: {
      transactionCount: 0,
      totalQuantity: 0,
    },

    EXPIRY: {
      transactionCount: 0,
      totalQuantity: 0,
    },

    ADJUSTMENT: {
      transactionCount: 0,
      totalQuantity: 0,
    },
  };

  for (const item of transactionSummary) {
    const type = item._id as keyof typeof transactionTotals;

    if (type in transactionTotals) {
      transactionTotals[type] = {
        transactionCount:
          item.transactionCount ?? 0,

        totalQuantity:
          item.totalQuantity ?? 0,
      };
    }
  }

  return {
    filters: {
      from: filters.from ?? null,
      to: filters.to ?? null,
    },

    summary: {
      totalProducts:
        productStats.totalProducts ?? 0,

      activeProducts:
        productStats.activeProducts ?? 0,

      inactiveProducts:
        productStats.inactiveProducts ?? 0,

      totalStockUnits:
        productStats.totalStockUnits ?? 0,

      lowStockProducts:
        productStats.lowStockProducts ?? 0,
    },

    transactions: transactionTotals,

    products: productStock,

    inventoryTransactions: transactions,
  };
};