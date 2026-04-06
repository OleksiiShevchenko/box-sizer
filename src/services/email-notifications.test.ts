import { prisma } from "@/lib/prisma";
import {
  notifyQuotaReached,
  notifySubscriptionPurchaseSuccess,
  notifySubscriptionRenewalFailure,
  notifySubscriptionRenewalSuccess,
  sendDedupedEmailNotification,
} from "./email-notifications";
import {
  sendQuotaReachedEmail,
  sendSubscriptionPurchaseSuccessEmail,
  sendSubscriptionRenewalFailureEmail,
  sendSubscriptionRenewalSuccessEmail,
} from "@/lib/resend";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    emailNotification: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/resend", () => ({
  sendQuotaReachedEmail: jest.fn(),
  sendSubscriptionPurchaseSuccessEmail: jest.fn(),
  sendSubscriptionRenewalFailureEmail: jest.fn(),
  sendSubscriptionRenewalSuccessEmail: jest.fn(),
}));

const emailNotificationCreate = prisma.emailNotification.create as unknown as jest.Mock;
const emailNotificationUpdate = prisma.emailNotification.update as unknown as jest.Mock;
const emailNotificationDelete = prisma.emailNotification.delete as unknown as jest.Mock;
const mockedSendQuotaReachedEmail = jest.mocked(sendQuotaReachedEmail);
const mockedSendSubscriptionPurchaseSuccessEmail = jest.mocked(sendSubscriptionPurchaseSuccessEmail);
const mockedSendSubscriptionRenewalFailureEmail = jest.mocked(sendSubscriptionRenewalFailureEmail);
const mockedSendSubscriptionRenewalSuccessEmail = jest.mocked(sendSubscriptionRenewalSuccessEmail);

describe("email notifications service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    emailNotificationCreate.mockResolvedValue({ id: "notification-1" });
    emailNotificationUpdate.mockResolvedValue({ id: "notification-1" });
    emailNotificationDelete.mockResolvedValue({ id: "notification-1" });
  });

  it("creates, sends, and marks deduped email notifications as sent", async () => {
    const send = jest.fn().mockResolvedValue(undefined);

    await expect(
      sendDedupedEmailNotification({
        userId: "user-1",
        type: "quota_reached",
        dedupeKey: "quota:user-1:2026-03",
        subject: "Quota reached",
        send,
      })
    ).resolves.toBe("sent");

    expect(emailNotificationCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        type: "quota_reached",
        dedupeKey: "quota:user-1:2026-03",
        subject: "Quota reached",
      },
      select: { id: true },
    });
    expect(send).toHaveBeenCalled();
    expect(emailNotificationUpdate).toHaveBeenCalledWith({
      where: { id: "notification-1" },
      data: {
        status: "sent",
        sentAt: expect.any(Date),
      },
    });
  });

  it("skips duplicate dedupe keys", async () => {
    emailNotificationCreate.mockRejectedValue({ code: "P2002" });
    const send = jest.fn();

    await expect(
      sendDedupedEmailNotification({
        userId: "user-1",
        type: "quota_reached",
        dedupeKey: "quota:user-1:2026-03",
        subject: "Quota reached",
        send,
      })
    ).resolves.toBe("skipped");

    expect(send).not.toHaveBeenCalled();
    expect(emailNotificationUpdate).not.toHaveBeenCalled();
  });

  it("deletes pending notification rows when email sending fails", async () => {
    const send = jest.fn().mockRejectedValue(new Error("Resend failed"));

    await expect(
      sendDedupedEmailNotification({
        userId: "user-1",
        type: "quota_reached",
        dedupeKey: "quota:user-1:2026-03",
        subject: "Quota reached",
        send,
      })
    ).rejects.toThrow("Resend failed");

    expect(emailNotificationDelete).toHaveBeenCalledWith({
      where: { id: "notification-1" },
    });
  });

  it("passes the expected payload to the purchase success mailer", async () => {
    mockedSendSubscriptionPurchaseSuccessEmail.mockResolvedValue(undefined);

    await notifySubscriptionPurchaseSuccess({
      userId: "user-1",
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      eventId: "evt_123",
    });

    expect(mockedSendSubscriptionPurchaseSuccessEmail).toHaveBeenCalledWith({
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
    });
  });

  it("passes invoice and receipt metadata to the renewal success mailer", async () => {
    mockedSendSubscriptionRenewalSuccessEmail.mockResolvedValue(undefined);

    await notifySubscriptionRenewalSuccess({
      userId: "user-1",
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      eventId: "evt_234",
      amountPaidCents: 2900,
      paymentMethodLabel: "Visa •••• 4242",
      hostedInvoiceUrl: "https://pay.stripe.com/invoice/123",
      invoicePdfUrl: "https://stripe.com/invoice.pdf",
    });

    expect(mockedSendSubscriptionRenewalSuccessEmail).toHaveBeenCalledWith({
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      amountPaidCents: 2900,
      paymentMethodLabel: "Visa •••• 4242",
      hostedInvoiceUrl: "https://pay.stripe.com/invoice/123",
      invoicePdfUrl: "https://stripe.com/invoice.pdf",
    });
  });

  it("passes invoice failure metadata to the renewal failure mailer", async () => {
    mockedSendSubscriptionRenewalFailureEmail.mockResolvedValue(undefined);

    await notifySubscriptionRenewalFailure({
      userId: "user-1",
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      eventId: "evt_345",
      amountDueCents: 2900,
      paymentMethodLabel: "Visa •••• 4242",
      nextRetryAt: new Date("2026-04-02T00:00:00.000Z"),
    });

    expect(mockedSendSubscriptionRenewalFailureEmail).toHaveBeenCalledWith({
      email: "alex@example.com",
      tier: "growth",
      billingInterval: "monthly",
      amountDueCents: 2900,
      paymentMethodLabel: "Visa •••• 4242",
      nextRetryAt: new Date("2026-04-02T00:00:00.000Z"),
    });
  });

  it("passes the expected payload to the quota mailer", async () => {
    mockedSendQuotaReachedEmail.mockResolvedValue(undefined);

    await notifyQuotaReached({
      userId: "user-1",
      email: "alex@example.com",
      tier: "starter",
      usageCount: 15,
      usageLimit: 15,
      quotaResetDate: new Date("2026-04-01T00:00:00.000Z"),
      recommendedUpgradeTier: "growth",
      periodKey: "2026-03",
    });

    expect(mockedSendQuotaReachedEmail).toHaveBeenCalledWith({
      email: "alex@example.com",
      tier: "starter",
      usageCount: 15,
      usageLimit: 15,
      quotaResetDate: new Date("2026-04-01T00:00:00.000Z"),
      recommendedUpgradeTier: "growth",
    });
  });
});
