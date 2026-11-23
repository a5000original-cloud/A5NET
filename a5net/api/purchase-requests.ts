import { api } from "@app/api";
import {
  purchaseRequestsTable,
  type PurchaseRequest,
} from "../tables/purchase-requests";
import { ownerGateRedirect } from "../server/security";

// Создание заявки на покупку
export const createPurchaseRequestRoute = api.post(
  "/purchase-request",
  async (ctx) => {
    const body = (await ctx.req.json()) as {
      type: string;
      amount: number;
      price: number;
    };

    if (!ctx.user) {
      return { ok: false, error: "Не авторизован" };
    }

    const request: PurchaseRequest = {
      id: crypto.randomUUID(),
      userId: ctx.user.id,
      type: body.type,
      amount: body.amount,
      price: body.price,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await purchaseRequestsTable.insert(request);

    return { ok: true, requestId: request.id };
  },
);

// Получение заявок (для Пульта)
export const getPurchaseRequestsRoute = api.get(
  "/purchase-requests",
  async (ctx) => {
    const gate = await ownerGateRedirect(ctx);
    if (gate) return gate;

    const requests = await purchaseRequestsTable.findMany({});
    return { ok: true, requests };
  },
);

// Одобрение заявки
export const approvePurchaseRequestRoute = api.post(
  "/purchase-request/approve",
  async (ctx) => {
    const gate = await ownerGateRedirect(ctx);
    if (gate) return gate;

    const body = (await ctx.req.json()) as { requestId: string };
    const request = await purchaseRequestsTable.findOne({ id: body.requestId });

    if (!request) {
      return { ok: false, error: "Заявка не найдена" };
    }

    await purchaseRequestsTable.update(
      { id: body.requestId },
      {
        status: "approved",
        reviewedAt: new Date().toISOString(),
        reviewerId: ctx.user?.id,
      },
    );

    // TODO: Здесь добавить логику выдачи премиума/коинов пользователю
    // Например: await premiumTable.insert({ userId: request.userId, ... })

    return { ok: true };
  },
);

// Отклонение заявки
export const rejectPurchaseRequestRoute = api.post(
  "/purchase-request/reject",
  async (ctx) => {
    const gate = await ownerGateRedirect(ctx);
    if (gate) return gate;

    const body = (await ctx.req.json()) as { requestId: string; note?: string };
    const request = await purchaseRequestsTable.findOne({ id: body.requestId });

    if (!request) {
      return { ok: false, error: "Заявка не найдена" };
    }

    await purchaseRequestsTable.update(
      { id: body.requestId },
      {
        status: "rejected",
        reviewedAt: new Date().toISOString(),
        reviewerId: ctx.user?.id,
        note: body.note,
      },
    );

    return { ok: true };
  },
);
