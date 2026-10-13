export type AiRole =
  | "ADMIN"
  | "SHOP_OWNER"
  | "EMPLOYEE"
  | "CUSTOMER";

export type AiContext = {
  userId: string;
  role: AiRole;
  shopId?: string;
  customerId?: string;
};

export type AiChatRequest = {
  message: string;
};