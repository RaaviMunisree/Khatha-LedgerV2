import type { Request, Response } from "express";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  cancelInvoice,
} from "./invoice.service.js";

import {
  validateCreateInvoice,
} from "./invoice.validation.js";

export const createInvoiceController = async (
  req: Request<{ shopId: string }>,
  res: Response,
) => {
  try {
    const { shopId } = req.params;

    const {
      customerId,
      items,
      discount = 0,
    } = req.body;

    validateCreateInvoice(
      customerId,
      items,
      discount,
    );

    const user = (req as any).user;

    const invoice = await createInvoice(
      shopId,
      user.userId,
      customerId,
      items,
      discount,
    );

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create invoice",
    });
  }
};

export const getInvoicesController = async (
  req: Request<{ shopId: string }>,
  res: Response,
) => {
  try {
    const { shopId } = req.params;

    const user = (req as any).user;

    const invoices = await getInvoices(
      shopId,
      user.userId,
    );

    res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      data: invoices,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
    });
  }
};

export const getInvoiceByIdController = async (
  req: Request<{
    shopId: string;
    invoiceId: string;
  }>,
  res: Response,
) => {
  try {
    const {
      shopId,
      invoiceId,
    } = req.params;

    const user = (req as any).user;

    const invoice = await getInvoiceById(
      shopId,
      invoiceId,
      user.userId,
    );

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Invoice fetched successfully",
      data: invoice,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
    });
  }
};

export const cancelInvoiceController = async (
  req: Request<{
    shopId: string;
    invoiceId: string;
  }>,
  res: Response,
) => {
  try {
    const {
      shopId,
      invoiceId,
    } = req.params;

    const user = (req as any).user;

    const invoice = await cancelInvoice(
      shopId,
      invoiceId,
      user.userId,
    );

    if (!invoice) {
      res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Invoice cancelled successfully",
      data: invoice,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel invoice",
    });
  }
};