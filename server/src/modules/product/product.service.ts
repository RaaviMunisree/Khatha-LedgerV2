import Shop from "../shop/shop.model.js";
import Product from "./product.model.js";

type ProductUnit =
  | "PCS"
  | "KG"
  | "GRAM"
  | "LITRE"
  | "ML"
  | "BOX"
  | "PACK";

export const createProduct = async (
  shopId: string,
  ownerId: string,
  name: string,
  sku: string,
  purchasePrice: number,
  sellingPrice: number,
  taxRate: number,
  currentStock: number,
  minimumStock: number,
  unit: ProductUnit,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const existingProduct = await Product.findOne({
    shopId,
    sku,
  });

  if (existingProduct) {
    throw new Error("Product with this SKU already exists");
  }

  const product = await Product.create({
    shopId,
    name,
    sku,
    purchasePrice,
    sellingPrice,
    taxRate,
    currentStock,
    minimumStock,
    unit,
  });

  return product;
};

export const getProducts = async (
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

  const products = await Product.find({
    shopId,
  });

  return products;
};

export const getProductById = async (
  shopId: string,
  productId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const product = await Product.findOne({
    _id: productId,
    shopId,
  });

  return product;
};

export const updateProduct = async (
  shopId: string,
  productId: string,
  ownerId: string,
  name: string,
  sku: string,
  purchasePrice: number,
  sellingPrice: number,
  taxRate: number,
  minimumStock: number,
  unit: ProductUnit,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const existingProduct = await Product.findOne({
    shopId,
    sku,
    _id: { $ne: productId },
  });

  if (existingProduct) {
    throw new Error("Product with this SKU already exists");
  }

  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      shopId,
    },
    {
      name,
      sku,
      purchasePrice,
      sellingPrice,
      taxRate,
      minimumStock,
      unit,
    },
    {
      new: true,
    },
  );

  return product;
};

export const deactivateProduct = async (
  shopId: string,
  productId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      shopId,
    },
    {
      status: "INACTIVE",
    },
    {
      new: true,
    },
  );

  return product;
};