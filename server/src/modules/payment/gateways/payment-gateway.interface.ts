export interface CreateGatewayOrderInput {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface GatewayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface VerifyGatewayPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentGateway {
  createOrder(
    input: CreateGatewayOrderInput,
  ): Promise<GatewayOrder>;

  verifyPayment(
    input: VerifyGatewayPaymentInput,
  ): boolean;

  refundPayment(
    paymentId: string,
    amount?: number,
  ): Promise<void>;
}