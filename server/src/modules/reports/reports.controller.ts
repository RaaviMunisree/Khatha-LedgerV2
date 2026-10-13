import type {
  Request,
  Response,
} from "express";
import { getInventoryReport, getPaymentReport, getSalesReport } from "./rerports.service.js";


type AuthenticatedRequest =
  Request & {
    user?: {
      userId: string;
      role: string;
    };
  };

export const getSalesReportController =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const { shopId } = req.params;
      if (typeof shopId !== "string") {
      res.status(400).json({
      success: false,
      message: "Invalid shop ID",
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

      const from =
        typeof req.query.from === "string"
          ? req.query.from
          : undefined;

      const to =
        typeof req.query.to === "string"
          ? req.query.to
          : undefined;

          
      const report =
        await getSalesReport(
          shopId,
          req.user.userId,
          {
            ...(from !== undefined
              ? { from }
              : {}),

            ...(to !== undefined
              ? { to }
              : {}),
          },
        );

      res.status(200).json({
        success: true,
        message:
          "Sales report generated successfully",
        data: report,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate sales report";

      res.status(400).json({
        success: false,
        message,
      });
    }
  };


  export const getPaymentReportController =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const shopId = req.params.shopId;

      if (typeof shopId !== "string") {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID",
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

      const from =
        typeof req.query.from === "string"
          ? req.query.from
          : undefined;

      const to =
        typeof req.query.to === "string"
          ? req.query.to
          : undefined;

      const report =
        await getPaymentReport(
          shopId,
          req.user.userId,
          {
            ...(from !== undefined
              ? { from }
              : {}),

            ...(to !== undefined
              ? { to }
              : {}),
          },
        );

      res.status(200).json({
        success: true,
        message:
          "Payment report generated successfully",
        data: report,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate payment report";

      res.status(400).json({
        success: false,
        message,
      });
    }
  };

  export const getInventoryReportController =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const shopId = req.params.shopId;

      if (typeof shopId !== "string") {
        res.status(400).json({
          success: false,
          message: "Invalid shop ID",
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

      const from =
        typeof req.query.from === "string"
          ? req.query.from
          : undefined;

      const to =
        typeof req.query.to === "string"
          ? req.query.to
          : undefined;

      const report =
        await getInventoryReport(
          shopId,
          req.user.userId,
          {
            ...(from !== undefined
              ? { from }
              : {}),

            ...(to !== undefined
              ? { to }
              : {}),
          },
        );

      res.status(200).json({
        success: true,
        message:
          "Inventory report generated successfully",
        data: report,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate inventory report";

      res.status(400).json({
        success: false,
        message,
      });
    }
  };