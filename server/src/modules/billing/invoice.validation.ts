export const validateCreateInvoice = (
  customerId: string,
  items: unknown[],
  discount: number,
) => {
  if (!customerId || customerId.trim() === "") {
    throw new Error("Customer is required");
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "Invoice must contain at least one item",
    );
  }

  if (discount < 0) {
    throw new Error(
      "Discount cannot be negative",
    );
  }

  for (const item of items) {
    if (
      typeof item !== "object" ||
      item === null
    ) {
      throw new Error("Invalid invoice item");
    }

    const invoiceItem = item as {
      productId?: string;
      quantity?: number;
    };

    if (
      !invoiceItem.productId ||
      invoiceItem.productId.trim() === ""
    ) {
      throw new Error(
        "Product is required for every item",
      );
    }

    if (
      typeof invoiceItem.quantity !== "number" ||
      invoiceItem.quantity <= 0
    ) {
      throw new Error(
        "Item quantity must be greater than zero",
      );
    }
  }
};