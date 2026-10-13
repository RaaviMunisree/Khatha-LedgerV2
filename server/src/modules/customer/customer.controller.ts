import type { Request, Response } from "express";

import { createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deactivateCustomer, } from "./customer.sevice.js";
import { validateCreateCustomer } from "./customer.validation.js";

export const createCustomerController = async (
  req: Request<{shopId:string}>,
  res: Response,
) => {
  try {
    const { shopId } = req.params;

    const {
      name,
      phone,
      email,
      address,
      creditLimit,
    } = req.body;

    validateCreateCustomer(
    name,
    phone,
    creditLimit,
    );
    const user = (req as any).user;

    const customer = await createCustomer(
      shopId,
      user.userId,
      name,
      phone,
      email,
      address,
      creditLimit,
    );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

export const getCustomersController = async (
  req: Request<{shopId:string}>,
  res: Response,
) => {
  try {
    const { shopId } = req.params;

    const user = (req as any).user;

    const customers = await getCustomers(
      shopId,
      user.userId,
    );

    res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const getCustomerByIdController = async (
  req: Request<{ shopId: string; customerId: string }>,
  res: Response,
) => {
  try {
    const { shopId, customerId } = req.params;

    const user = (req as any).user;

    const customer = await getCustomerById(
      shopId,
      customerId,
      user.userId,
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

export const updateCustomerController = async (
  req: Request<{ shopId: string; customerId: string }>,
  res: Response,
) => {
  try {
    const { shopId, customerId } = req.params;

    const {
      name,
      phone,
      email,
      address,
      creditLimit,
    } = req.body;

    const user = (req as any).user;

    const customer = await updateCustomer(
      shopId,
      customerId,
      user.userId,
      name,
      phone,
      email,
      address,
      creditLimit,
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

export const deactivateCustomerController = async (
  req: Request<{ shopId: string; customerId: string }>,
  res: Response,
) => {
  try {
    const { shopId, customerId } = req.params;

    const user = (req as any).user;

    const customer = await deactivateCustomer(
      shopId,
      customerId,
      user.userId,
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
      data: customer,
    });
  } catch (error) {
    console.error(error);

    res.status(200).json({
      success: false,
      message: "Failed to deactivate customer",
    });
  }
};