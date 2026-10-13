import type { Request, Response } from "express";

import {
  createUser,
  loginUser,
} from "./user.service.js";

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      name,
      email,
      password,
      role,
      customerId,
    } = req.body;

    const user = await createUser(
      name,
      email,
      password,
      role,
      customerId,
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error("User registration error:", error);

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create user",
    });
  }
};

export const loginUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    console.error("User login error:", error);

    res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invalid email or password",
    });
  }
};

export const getProfile = (
  req: Request,
  res: Response,
): void => {
  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    user: (req as any).user,
  });
};