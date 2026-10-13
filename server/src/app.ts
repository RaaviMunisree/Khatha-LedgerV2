import express from "express";
import cors from "cors";
import userRoutes from "./modules/auth/user.routes.js";
import shopRoutes from "./modules/shop/shop.routes.js";
import customerRoutes from "./modules/customer/customer.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import invoiceRoutes from "./modules/billing/invoice.routes.js";
import ledgerRoutes from "./modules/ledger/ledger.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import paymentWebhookRoutes from "./modules/payment/payment-webhook.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());
/*
 * Razorpay webhook
 *
 * IMPORTANT:
 * This must be registered BEFORE express.json()
 * because Razorpay signature verification requires
 * the original raw request body.
 */
app.use(
  "/api/payments",
  paymentWebhookRoutes,
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to KhataX API",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "KhataX API",
    status: "healthy",
  });
});

app.use("/api/auth", userRoutes);

app.use("/api/shops", shopRoutes);

app.use("/api/shops", customerRoutes);

app.use("/api/shops", productRoutes);

app.use("/api/shops", invoiceRoutes);

app.use("/api/shops", ledgerRoutes);

app.use("/api/shops", paymentRoutes);

app.use(
  "/api/shops",
  reportsRoutes,
);
app.use(
  "/api/ai",
  aiRoutes,
);

export default app;


