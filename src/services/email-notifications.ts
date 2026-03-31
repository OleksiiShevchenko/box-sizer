import { prisma } from "@/lib/prisma";
import {
  sendQuotaReachedEmail,
  sendSubscriptionPurchaseSuccessEmail,
  sendSubscriptionRenewalFailureEmail,
  sendSubscriptionRenewalSuccessEmail,
} from "@/lib/resend";
import type { BillingInterval, SubscriptionTier } from "@/lib/subscription-plans";

type EmailNotificationType =
  | "subscription_purchase_success"
  | "subscription_renewal_success"
  | "subscription_renewal_failure"
  | "quota_reached";

type NotificationSendFn = () => Promise<unknown>;

interface SendDedupedEmailNotificationArgs {
  userId: string;
  type: EmailNotificationType;
  dedupeKey: string;
  subject: string;
  send: NotificationSendFn;
}

interface SubscriptionNotificationArgs {
  userId: string;
  email: string;
  tier: SubscriptionTier;
  billingInterval: BillingInterval | null;
  currentPeriodEnd?: Date | null;
  eventId: string;
  amountPaidCents?: number | null;
  amountDueCents?: number | null;
  paymentMethodLabel?: string | null;
  nextRetryAt?: Date | null;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
}

interface QuotaNotificationArgs {
  userId: string;
  email: string;
  tier: SubscriptionTier;
  usageCount: number;
  usageLimit: number;
  quotaResetDate: Date;
  recommendedUpgradeTier: SubscriptionTier | null;
  periodKey: string;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function sendDedupedEmailNotification({
  userId,
  type,
  dedupeKey,
  subject,
  send,
}: SendDedupedEmailNotificationArgs): Promise<"sent" | "skipped"> {
  let notificationId: string;

  try {
    const notification = await prisma.emailNotification.create({
      data: {
        userId,
        type,
        dedupeKey,
        subject,
      },
      select: { id: true },
    });
    notificationId = notification.id;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return "skipped";
    }

    throw error;
  }

  try {
    await send();
    await prisma.emailNotification.update({
      where: { id: notificationId },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });
    return "sent";
  } catch (error) {
    await prisma.emailNotification.delete({ where: { id: notificationId } }).catch(() => undefined);
    throw error;
  }
}

export async function notifySubscriptionPurchaseSuccess({
  userId,
  email,
  tier,
  billingInterval,
  currentPeriodEnd,
  eventId,
}: SubscriptionNotificationArgs) {
  return sendDedupedEmailNotification({
    userId,
    type: "subscription_purchase_success",
    dedupeKey: `stripe:event:${eventId}`,
    subject: "Your Packwell subscription is active",
    send: () =>
      sendSubscriptionPurchaseSuccessEmail({
        email,
        tier,
        billingInterval,
        currentPeriodEnd,
      }),
  });
}

export async function notifySubscriptionRenewalSuccess({
  userId,
  email,
  tier,
  billingInterval,
  currentPeriodEnd,
  eventId,
  amountPaidCents,
  paymentMethodLabel,
  hostedInvoiceUrl,
  invoicePdfUrl,
}: SubscriptionNotificationArgs) {
  return sendDedupedEmailNotification({
    userId,
    type: "subscription_renewal_success",
    dedupeKey: `stripe:event:${eventId}`,
    subject: "Your Packwell subscription renewed successfully",
    send: () =>
      sendSubscriptionRenewalSuccessEmail({
        email,
        tier,
        billingInterval,
        currentPeriodEnd,
        amountPaidCents,
        paymentMethodLabel,
        hostedInvoiceUrl,
        invoicePdfUrl,
      }),
  });
}

export async function notifySubscriptionRenewalFailure({
  userId,
  email,
  tier,
  billingInterval,
  eventId,
  amountDueCents,
  paymentMethodLabel,
  nextRetryAt,
}: SubscriptionNotificationArgs) {
  return sendDedupedEmailNotification({
    userId,
    type: "subscription_renewal_failure",
    dedupeKey: `stripe:event:${eventId}`,
    subject: "Your Packwell renewal payment failed",
    send: () =>
      sendSubscriptionRenewalFailureEmail({
        email,
        tier,
        billingInterval,
        amountDueCents,
        paymentMethodLabel,
        nextRetryAt,
      }),
  });
}

export async function notifyQuotaReached({
  userId,
  email,
  tier,
  usageCount,
  usageLimit,
  quotaResetDate,
  recommendedUpgradeTier,
  periodKey,
}: QuotaNotificationArgs) {
  return sendDedupedEmailNotification({
    userId,
    type: "quota_reached",
    dedupeKey: `quota:${userId}:${periodKey}`,
    subject: "You've reached your Packwell monthly request limit",
    send: () =>
      sendQuotaReachedEmail({
        email,
        tier,
        usageCount,
        usageLimit,
        quotaResetDate,
        recommendedUpgradeTier,
      }),
  });
}
