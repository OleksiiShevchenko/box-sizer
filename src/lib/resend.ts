import { Resend } from "resend";
import { getConfiguredAppUrl } from "@/lib/app-url";
import {
  renderQuotaReachedEmail,
  renderSubscriptionPurchaseEmail,
  renderSubscriptionRenewalFailureEmail,
  renderSubscriptionRenewalSuccessEmail,
  renderVerificationEmail,
} from "@/lib/email-templates";
import type { BillingInterval, SubscriptionTier } from "@/lib/subscription-plans";

const resend = new Resend(process.env.RESEND_API_KEY);
const TRANSACTIONAL_FROM_EMAIL = "noreply@packwell.io";

async function sendEmailOrThrow(payload: Parameters<typeof resend.emails.send>[0]) {
  const result = await resend.emails.send(payload);

  if (result.error) {
    throw new Error(result.error.message || "Failed to send email");
  }

  return result.data;
}

interface SubscriptionBaseEmailArgs {
  email: string;
  tier: SubscriptionTier;
  billingInterval: BillingInterval | null;
  currentPeriodEnd?: Date | null;
}

interface SubscriptionRenewalSuccessEmailArgs extends SubscriptionBaseEmailArgs {
  amountPaidCents?: number | null;
  paymentMethodLabel?: string | null;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
}

interface SubscriptionRenewalFailureEmailArgs extends SubscriptionBaseEmailArgs {
  amountDueCents?: number | null;
  paymentMethodLabel?: string | null;
  nextRetryAt?: Date | null;
}

interface QuotaEmailArgs {
  email: string;
  tier: SubscriptionTier;
  usageCount: number;
  usageLimit: number;
  quotaResetDate: Date;
  recommendedUpgradeTier: SubscriptionTier | null;
}

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = getConfiguredAppUrl();
  const confirmUrl = `${appUrl}/confirm?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "Confirm your Packwell account",
    html: renderVerificationEmail({
      appUrl,
      confirmUrl,
    }),
  });

  const configEmail = process.env.CONFIG_EMAIL;
  if (configEmail) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
        to: configEmail,
        subject: "New Box Sizer signup",
        html: `<p>New user signed up: <strong>${email}</strong></p>`,
      });
    } catch {
      // Admin notifications are best-effort and must not block signup.
    }
  }
}

export async function sendSubscriptionPurchaseSuccessEmail({
  email,
  tier,
  billingInterval,
  currentPeriodEnd,
}: SubscriptionBaseEmailArgs) {
  const appUrl = getConfiguredAppUrl();

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "Your Packwell subscription is active",
    html: renderSubscriptionPurchaseEmail({
      appUrl,
      tier,
      billingInterval,
      currentPeriodEnd,
    }),
  });
}

export async function sendSubscriptionRenewalSuccessEmail({
  email,
  tier,
  billingInterval,
  currentPeriodEnd,
  amountPaidCents,
  paymentMethodLabel,
  hostedInvoiceUrl,
  invoicePdfUrl,
}: SubscriptionRenewalSuccessEmailArgs) {
  const appUrl = getConfiguredAppUrl();

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "Your Packwell subscription renewed successfully",
    html: renderSubscriptionRenewalSuccessEmail({
      appUrl,
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

export async function sendSubscriptionRenewalFailureEmail({
  email,
  tier,
  billingInterval,
  amountDueCents,
  paymentMethodLabel,
  nextRetryAt,
}: SubscriptionRenewalFailureEmailArgs) {
  const appUrl = getConfiguredAppUrl();

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "Your Packwell renewal payment failed",
    html: renderSubscriptionRenewalFailureEmail({
      appUrl,
      tier,
      billingInterval,
      amountDueCents,
      paymentMethodLabel,
      nextRetryAt,
    }),
  });
}

export async function sendQuotaReachedEmail({
  email,
  tier,
  usageCount,
  usageLimit,
  quotaResetDate,
  recommendedUpgradeTier,
}: QuotaEmailArgs) {
  const appUrl = getConfiguredAppUrl();

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "You've reached your Packwell billing period request limit",
    html: renderQuotaReachedEmail({
      appUrl,
      tier,
      usageCount,
      usageLimit,
      quotaResetDate,
      recommendedUpgradeTier,
    }),
  });
}
