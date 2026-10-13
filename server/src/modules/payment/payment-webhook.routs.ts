import { Router } from "express";
import express from "express";

import {
  razorpayWebhookController,
} from "./payment.controller.js";

const router = Router();

router.post(
  "/razorpay/webhook",
  express.raw({
    type: "application/json",
  }),
  razorpayWebhookController,
);

export default router;