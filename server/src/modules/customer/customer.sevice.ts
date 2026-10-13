import Shop from "../shop/shop.model.js";
import Customer from "./customer.model.js";

export const createCustomer = async (
  shopId: string,
  ownerId: string,
  name: string,
  phone: string,
  email: string,
  address: string,
  creditLimit: number,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const customer = await Customer.create({
    shopId,
    name,
    phone,
    email,
    address,
    creditLimit,
  });

  return customer;
};

export const getCustomers = async (
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

  const customers = await Customer.find({
    shopId,
  });

  return customers;
};

export const getCustomerById = async (
  shopId: string,
  customerId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const customer = await Customer.findOne({
    _id: customerId,
    shopId,
  });

  return customer;
};

export const updateCustomer = async (
  shopId: string,
  customerId: string,
  ownerId: string,
  name: string,
  phone: string,
  email: string,
  address: string,
  creditLimit: number,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const customer = await Customer.findOneAndUpdate(
    {
      _id: customerId,
      shopId,
    },
    {
      name,
      phone,
      email,
      address,
      creditLimit,
    },
    {
      new: true,
    },
  );

  return customer;
};

export const deactivateCustomer = async (
  shopId: string,
  customerId: string,
  ownerId: string,
) => {
  const shop = await Shop.findOne({
    _id: shopId,
    ownerId,
  });

  if (!shop) {
    throw new Error("Shop not found");
  }

  const customer = await Customer.findOneAndUpdate(
    {
      _id: customerId,
      shopId,
    },
    {
      status: "INACTIVE",
    },
    {
      new: true,
    },
  );

  return customer;
};