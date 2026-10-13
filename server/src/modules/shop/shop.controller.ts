import type { Request, Response } from "express";

import {
  createShop,
  getMyShops,
  getShopById,
  updateShop,
  deactivateShop,
} from "./shop.service.js";

export const createShopController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      name,
      businessType,
      phone,
      address,
    } = req.body;

    const user = (req as any).user;

    const shop = await createShop(
      name,
      user.userId,
      businessType,
      phone,
      address,
    );

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      data: shop,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create shop",
    });
  }
};

export const getMyShopsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = (req as any).user;

    const shops = await getMyShops(user.userId);

    res.status(200).json({
      success: true,
      message: "Shops fetched successfully",
      data: shops,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch shops",
    });
  }
};

export const getShopByIdController = async (
  req: Request<{id:string}>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const user = (req as any).user;

    const shop = await getShopById(
      id,
      user.userId,
    );

    if (!shop) {
      res.status(404).json({
        success: false,
        message: "Shop not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Shop fetched successfully",
      data: shop,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch shop",
    });
  }
};

export const updateShopController = async (
  req: Request<{id:string}>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const {
      name,
      businessType,
      phone,
      address,
    } = req.body;

    const user = (req as any).user;

    const shop = await updateShop(
      id,
      user.userId,
      name,
      businessType,
      phone,
      address,
    );

    if (!shop) {
      res.status(404).json({
        success: false,
        message: "Shop not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      data: shop,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update shop",
    });
  }
};

export const deactivateShopController = async (
  req: Request<{id:string}>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const user = (req as any).user;

    const shop = await deactivateShop(
      id,
      user.userId,
    );

    if (!shop) {
      res.status(404).json({
        success: false,
        message: "Shop not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Shop deactivated successfully",
      data: shop,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate shop",
    });
  }
};