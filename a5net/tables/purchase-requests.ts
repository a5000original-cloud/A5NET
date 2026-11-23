import { table } from "@app/db";

export const purchaseRequestsTable = table("purchase_requests", {
  id: "uuid",
  userId: "text",
  type: "text", // 'premium_month', 'premium_year', 'coins'
  amount: "integer", // количество монет или тип подписки
  price: "integer", // цена в рублях или A5Coin
  status: "text", // 'pending', 'approved', 'rejected'
  createdAt: "timestamp",
  reviewedAt: "timestamp",
  reviewerId: "text",
  note: "text",
});

export type PurchaseRequest = {
  id: string;
  userId: string;
  type: string;
  amount: number;
  price: number;
  status: string;
  createdAt: string;
  reviewedAt?: string;
  reviewerId?: string;
  note?: string;
};
