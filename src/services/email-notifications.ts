import { prisma } from "@/lib/prisma";
import {
  sendQuotaReachedEmail,
  sendSubscriptionPurchaseSuccessEmail,
  sendSubscriptionRenewalFailureEmail,
  sendSubscriptionRenewalSuccessEmail,
} from "@/lib/resend";

type EmailNotificationType =
  | "subscription_purchase_success"
  | "subscription_renewal_success"
  | "subscription_renewal_failure"
  | "quota_reached";

type BillingInterval = "monthly" | "annual" | null;

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
  planName: string;
  billingInterval: BillingInterval;
  currentPeriodEnd?: Date | null;
  eventId: string;
}

interface QuotaNotificationArgs {
  userId: string;
  email: string;
  planName: string;
  usageCount: number;
  usageLimit: number;
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
  planName,
  billingInterval,
  currentPeriodEnd,
  eventId,
}: SubscriptionNotificationArgs) {
  return sendDedupedEmailNotification({
    userId,
    type: "subscription_purchase_success",
    dedupeKey: `stripe:event:${eventId}`,
    subject: "Your Box Sizer subscription is active",
    send: () =>
      sendSubscriptionPurchaseSuccessEmail({
        email,
        planName,
        billingInterval,
        currentPeriodEnd,
      }),
  });
}

export async function notifySubscriptionRenewalSuccess({
  userId,
  email,
  planName,
  billingInterval,
  currentPeriodEnd,
  eventId,
}: SubscriptionNotificationArgs) {
  return sendDedupedEmailNotification({
    userId,
    type: "subscription_renewal_success",
    dedupeKey: `stripe:event:${eventId}`,
    subject: "Your Box Sizer subscription renewed successfully",
    send: () =>
      sendSubscriptionRenewalSuccessEmail({
        email,
        planName,
        billingInterval,
        currentPeriodEnd,
      }),
  });
}

export async function notifySubscriptionRenewalFailure({
  userId,
  email,
  planName,
  billingInterval,
  currentPeriodEnd,
  eventId,
}: SubscriptionNotificationArgs) {
  return sendDedupedEmailNotification({
    userId,
    type: "subscription_renewal_failure",
    dedupeKey: `stripe:event:${eventId}`,
    subject: "Your Box Sizer renewal payment failed",
    send: () =>
      sendSubscriptionRenewalFailureEmail({
        email,
        planName,
        billingInterval,
        currentPeriodEnd,
      }),
  });
}

export async function notifyQuotaReached({
  userId,
  email,
  planName,
  usageCount,
  usageLimit,
  periodKey,
}: QuotaNotificationArgs) {
  return sendDedupedEmailNotification({
    userId,
    type: "quota_reached",
    dedupeKey: `quota:${userId}:${periodKey}`,
    subject: "You've reached your Box Sizer monthly calculation limit",
    send: () =>
      sendQuotaReachedEmail({
        email,
        planName,
        usageCount,
        usageLimit,
      }),
  });
}
