import Shop from "./shop.model.js";

type BusinessType =
  | "GROCERY"
  | "RETAIL"
  | "PHARMACY"
  | "ELECTRONICS"
  | "OTHER";

export const createShop = async (
  name: string,
  ownerId: string,
  businessType: BusinessType,
  phone: string,
  address: string,
) => {
  const shop = await Shop.create({
    name,
    ownerId,
    businessType,
    phone,
    address,
  });

  return shop;
};

export const getMyShops = async (ownerId: string) => {
  const shops = await Shop.find({
    ownerId,
  });

  return shops;
};

export const getShopById = async (
  shopId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  return shop;
};

export const updateShop = async (
  shopId: string,
  ownerId: string,
  name: string,
  businessType: BusinessType,
  phone: string,
  address: string,
) => {
  const shop = await Shop.findOneAndUpdate(
    {
      _id: shopId,
      ownerId,
    },
    {
      name,
      businessType,
      phone,
      address,
    },
    {
      new: true,
    },
  );

  return shop;
};

export const deactivateShop = async (
  shopId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOneAndUpdate(
    {
      _id: shopId,
      ownerId,
    },
    {
      status: "INACTIVE",
    },
    {
      new: true,
    },
  );

  return shop;
};