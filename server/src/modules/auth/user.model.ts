import mongoose, { Schema } from "mongoose";

export type UserRole =
  | "ADMIN"
  | "SHOP_OWNER"
  | "EMPLOYEE"
  | "CUSTOMER";

export type UserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export interface IUser {
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  customerId?: mongoose.Types.ObjectId;
  status: UserStatus;
  lastLoginAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "ADMIN",
        "SHOP_OWNER",
        "EMPLOYEE",
        "CUSTOMER",
      ],
      required: true,
    },

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: [
        "ACTIVE",
        "INACTIVE",
        "SUSPENDED",
      ],
      default: "ACTIVE",
    },

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>(
  "User",
  userSchema,
);

export default User;