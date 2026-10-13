import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "./user.model.js";
import type { UserRole } from "./user.model.js";

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
  customerId?: string,
) => {
  if (
    !name ||
    !email ||
    !password ||
    !role
  ) {
    throw new Error(
      "Name, email, password and role are required",
    );
  }

  if (
    role === "CUSTOMER" &&
    !customerId
  ) {
    throw new Error(
      "customerId is required for CUSTOMER users",
    );
  }

  if (customerId) {
    if (
      !mongoose.isValidObjectId(customerId)
    ) {
      throw new Error(
        "Invalid customerId",
      );
    }
  }

  const passwordHash =
    await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    ...(customerId
      ? {
          customerId:
            new mongoose.Types.ObjectId(
              customerId,
            ),
        }
      : {}),
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.customerId
      ? {
          customerId: user.customerId,
        }
      : {}),
  };
};

export const loginUser = async (
  email: string,
  password: string,
) => {
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user) {
    throw new Error(
      "Invalid email or password",
    );
  }

  const passwordMatch =
    await bcrypt.compare(
      password,
      user.passwordHash,
    );

  if (!passwordMatch) {
    throw new Error(
      "Invalid email or password",
    );
  }

  if (user.status !== "ACTIVE") {
    throw new Error(
      "User account is not active",
    );
  }

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET is not configured",
    );
  }

  const payload: {
    userId: string;
    role: UserRole;
    customerId?: string;
  } = {
    userId: user._id.toString(),
    role: user.role,
  };

  if (user.customerId) {
    payload.customerId =
      user.customerId.toString();
  }

  const token = jwt.sign(
    payload,
    jwtSecret,
    {
      expiresIn: "1d",
    },
  );

  await User.updateOne(
    {
      _id: user._id,
    },
    {
      $set: {
        lastLoginAt: new Date(),
      },
    },
  );

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    ...(user.customerId
      ? {
          customerId: user.customerId,
        }
      : {}),
    token,
  };
};