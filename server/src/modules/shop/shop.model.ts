import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    businessType: {
      type: String,
      required: true,
      enum: [
        "GROCERY",
        "RETAIL",
        "PHARMACY",
        "ELECTRONICS",
        "OTHER",
      ],
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;