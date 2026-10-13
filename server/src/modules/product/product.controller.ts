import type { Request, Response } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deactivateProduct,
} from "./product.service.js";

export const createProductController = async (
  req: Request<{ shopId: string }>,
  res: Response,
) => {
  try {
    const { shopId } = req.params;

    const {
      name,
      sku,
      purchasePrice,
      sellingPrice,
      taxRate,
      currentStock,
      minimumStock,
      unit,
    } = req.body;

    const user = (req as any).user;

    const product = await createProduct(
      shopId,
      user.userId,
      name,
      sku,
      purchasePrice,
      sellingPrice,
      taxRate,
      currentStock,
      minimumStock,
      unit,
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};

export const getProductsController = async (
  req: Request<{ shopId: string }>,
  res: Response,
) => {
  try {
    const { shopId } = req.params;

    const user = (req as any).user;

    const products = await getProducts(
      shopId,
      user.userId,
    );

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getProductByIdController = async (
  req: Request<{
    shopId: string;
    productId: string;
  }>,
  res: Response,
) => {
  try {
    const { shopId, productId } = req.params;

    const user = (req as any).user;

    const product = await getProductById(
      shopId,
      productId,
      user.userId,
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

export const updateProductController = async (
  req: Request<{
    shopId: string;
    productId: string;
  }>,
  res: Response,
) => {
  try {
    const { shopId, productId } = req.params;

    const {
      name,
      sku,
      purchasePrice,
      sellingPrice,
      taxRate,
      minimumStock,
      unit,
    } = req.body;

    const user = (req as any).user;

    const product = await updateProduct(
      shopId,
      productId,
      user.userId,
      name,
      sku,
      purchasePrice,
      sellingPrice,
      taxRate,
      minimumStock,
      unit,
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

export const deactivateProductController = async (
  req: Request<{
    shopId: string;
    productId: string;
  }>,
  res: Response,
) => {
  try {
    const { shopId, productId } = req.params;

    const user = (req as any).user;

    const product = await deactivateProduct(
      shopId,
      productId,
      user.userId,
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deactivated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate product",
    });
  }
};