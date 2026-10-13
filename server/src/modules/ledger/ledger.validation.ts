export const validateCreateLedgerEntry = (
  customerId: string,
  type: string,
  amount: number,
) => {
  if (!customerId || customerId.trim() === "") {
    throw new Error("Customer is required");
  }

  const validTypes = [
    "CREDIT",
    "DEBIT",
    "ADJUSTMENT",
  ];

  if (!validTypes.includes(type)) {
    throw new Error("Invalid ledger type");
  }

  if (
    typeof amount !== "number" ||
    amount <= 0
  ) {
    throw new Error(
      "Amount must be greater than zero",
    );
  }
};