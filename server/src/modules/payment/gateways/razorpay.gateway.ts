import Razorpay from "razorpay";
import crypto from "node:crypto";

import type {
  CreateGatewayOrderInput,
  GatewayOrder,
  PaymentGateway,
  VerifyGatewayPaymentInput,
} from "./payment-gateway.interface.ts";

class RazorpayGateway implements PaymentGateway {
  private readonly razorpay: Razorpay;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error(
        "Razorpay credentials are not configured",
      );
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(
    input: CreateGatewayOrderInput,
  ): Promise<GatewayOrder> {
    const order = await this.razorpay.orders.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency,
      receipt: input.receipt,
      ...(input.notes
        ? { notes: input.notes }
        : {}),
    });

    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      status: order.status,
    };
  }

  verifyPayment(
    input: VerifyGatewayPaymentInput,
  ): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error(
        "Razorpay secret is not configured",
      );
    }

    const generatedSignature =
      crypto
        .createHmac("sha256", keySecret)
        .update(
          `${input.orderId}|${input.paymentId}`,
        )
        .digest("hex");

    return (
      generatedSignature === input.signature
    );
  }

  async refundPayment(
    paymentId: string,
    amount?: number,
  ): Promise<void> {
    if (amount !== undefined) {
      await this.razorpay.payments.refund(
        paymentId,
        {
          amount: Math.round(amount * 100),
        },
      );
    } else {
      await this.razorpay.payments.refund(
        paymentId,
        {},
      );
    }
  }
}

export default RazorpayGateway;