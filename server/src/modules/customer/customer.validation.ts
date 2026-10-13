export const validateCreateCustomer = (
  name: string,
  phone: string,
  creditLimit: number,
) => {
  if (!name || name.trim() === "") {
    throw new Error("Customer name is required");
  }

  if (!phone || phone.trim() === "") {
    throw new Error("Customer phone is required");
  }

  if (creditLimit < 0) {
    throw new Error("Credit limit cannot be negative");
  }
};