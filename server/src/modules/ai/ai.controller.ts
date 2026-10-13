import type { Request, Response } from "express";

import { chatWithKhataXAI } from "./ai.service.js";
import type { AiContext, AiRole } from "./ai.types.js";

type AuthenticatedUser = {
  userId?: string;
  role?: string;
  customerId?: string;
};

export const chatController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { message, shopId } = req.body as {
      message?: unknown;
      shopId?: unknown;
    };

    if (
      typeof message !== "string" ||
      message.trim() === ""
    ) {
      res.status(400).json({
        success: false,
        message: "Message is required",
      });

      return;
    }

    const authUser = (req as any).user as
      | AuthenticatedUser
      | undefined;

    if (!authUser?.userId || !authUser.role) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });

      return;
    }

    const role = authUser.role as AiRole;

    const context: AiContext = {
      userId: authUser.userId,
      role,
    };

    /*
     * Customer AI
     *
     * Customer identity must already be associated with
     * the authenticated JWT/session.
     */
    if (role === "CUSTOMER") {
      if (!authUser.customerId) {
        res.status(403).json({
          success: false,
          message:
            "Customer identity is not configured",
        });

        return;
      }

      context.customerId =
        authUser.customerId;
    } else {
      /*
       * Shop-owner / employee / admin AI currently
       * requires an explicit shopId.
       */
      if (
        typeof shopId !== "string" ||
        shopId.trim() === ""
      ) {
        res.status(400).json({
          success: false,
          message:
            "shopId is required for shop AI requests",
        });

        return;
      }

      context.shopId = shopId;
    }

    const result = await chatWithKhataXAI(
      message,
      context,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI controller error:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "AI request failed",
    });
  }
};