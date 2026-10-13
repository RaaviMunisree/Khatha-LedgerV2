import type { Request, Response } from "express";

import {
  createLedgerEntry,
  getCustomerLedger,
} from "./ledger.service.js";

import {
  validateCreateLedgerEntry,
} from "./ledger.validation.js";

export const createLedgerEntryController =
  async (
    req: Request<{ shopId: string }>,
    res: Response,
  ) => {
    try {
      const { shopId } = req.params;

      const {
        customerId,
        type,
        amount,
        description,
        referenceType,
        referenceId,
      } = req.body;

      validateCreateLedgerEntry(
        customerId,
        type,
        amount,
      );

      const user = (req as any).user;

      const ledger =
        await createLedgerEntry(
          shopId,
          user.userId,
          customerId,
          type,
          amount,
          description,
          referenceType,
          referenceId,
        );

      res.status(201).json({
        success: true,
        message:
          "Ledger entry created successfully",
        data: ledger,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to create ledger entry",
      });
    }
  };

export const getCustomerLedgerController =
  async (
    req: Request<{
      shopId: string;
      customerId: string;
    }>,
    res: Response,
  ) => {
    try {
      const {
        shopId,
        customerId,
      } = req.params;

      const user = (req as any).user;

      const ledger =
        await getCustomerLedger(
          shopId,
          user.userId,
          customerId,
        );

      res.status(200).json({
        success: true,
        message:
          "Customer ledger fetched successfully",
        data: ledger,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch customer ledger",
      });
    }
  };