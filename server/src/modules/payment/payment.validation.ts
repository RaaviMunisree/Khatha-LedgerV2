export const validateCreatePayment = (
  customerId: string,
  amount: number,
  paymentMethod: string,
) => {
  if (!customerId || customerId.trim() === "") {
    throw new Error("Customer is required");
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const validMethods = [
    "CASH",
    "UPI",
    "CARD",
    "BANK_TRANSFER",
    "ONLINE_GATEWAY",
  ];

  if (!validMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method");
  }
};