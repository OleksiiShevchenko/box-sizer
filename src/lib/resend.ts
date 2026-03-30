import { Resend } from "resend";
import { getConfiguredAppUrl } from "@/lib/app-url";

const resend = new Resend(process.env.RESEND_API_KEY);
const TRANSACTIONAL_FROM_EMAIL = "noreply@packwell.io";

async function sendEmailOrThrow(payload: Parameters<typeof resend.emails.send>[0]) {
  const result = await resend.emails.send(payload);

  if (result.error) {
    throw new Error(result.error.message || "Failed to send email");
  }

  return result.data;
}

type BillingIntervalLabel = "monthly" | "annual";

interface SubscriptionEmailArgs {
  email: string;
  planName: string;
  billingInterval: BillingIntervalLabel | null;
  currentPeriodEnd?: Date | null;
}

interface QuotaEmailArgs {
  email: string;
  planName: string;
  usageCount: number;
  usageLimit: number;
}

function formatBillingInterval(interval: BillingIntervalLabel | null): string {
  if (interval === "annual") {
    return "Annual";
  }

  if (interval === "monthly") {
    return "Monthly";
  }

  return "Subscription";
}

function formatDate(value: Date | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(value);
}

function renderEmailLayout(args: {
  title: string;
  intro: string;
  bulletLines: string[];
  ctaLabel: string;
  ctaHref: string;
  footer: string;
}) {
  const bulletMarkup = args.bulletLines
    .map((line) => `<li style="margin: 0 0 8px;">${line}</li>`)
    .join("");

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111827;">
      <h2>${args.title}</h2>
      <p>${args.intro}</p>
      <ul style="padding-left: 20px; margin: 16px 0;">
        ${bulletMarkup}
      </ul>
      <a href="${args.ctaHref}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
        ${args.ctaLabel}
      </a>
      <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
        ${args.footer}
      </p>
    </div>
  `;
}

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = getConfiguredAppUrl();
  const confirmUrl = `${appUrl}/confirm?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "Confirm your Box Sizer account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to Box Sizer!</h2>
        <p>Please confirm your email address by clicking the link below:</p>
        <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Confirm Email
        </a>
        <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  // Also notify config email about new signup
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
  planName,
  billingInterval,
  currentPeriodEnd,
}: SubscriptionEmailArgs) {
  const billingUrl = `${getConfiguredAppUrl()}/settings/billing`;
  const formattedPeriodEnd = formatDate(currentPeriodEnd);

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "Your Box Sizer subscription is active",
    html: renderEmailLayout({
      title: "Your subscription is active",
      intro: "Your Box Sizer subscription purchase completed successfully.",
      bulletLines: [
        `Plan: <strong>${planName}</strong>`,
        `Billing: <strong>${formatBillingInterval(billingInterval)}</strong>`,
        ...(formattedPeriodEnd
          ? [`Current billing period ends on <strong>${formattedPeriodEnd}</strong>`]
          : []),
      ],
      ctaLabel: "Manage Billing",
      ctaHref: billingUrl,
      footer: "You can review your subscription details and payment information at any time.",
    }),
  });
}

export async function sendSubscriptionRenewalSuccessEmail({
  email,
  planName,
  billingInterval,
  currentPeriodEnd,
}: SubscriptionEmailArgs) {
  const billingUrl = `${getConfiguredAppUrl()}/settings/billing`;
  const formattedPeriodEnd = formatDate(currentPeriodEnd);

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "Your Box Sizer subscription renewed successfully",
    html: renderEmailLayout({
      title: "Your subscription renewed successfully",
      intro: "We successfully processed your latest Box Sizer renewal payment.",
      bulletLines: [
        `Plan: <strong>${planName}</strong>`,
        `Billing: <strong>${formatBillingInterval(billingInterval)}</strong>`,
        ...(formattedPeriodEnd
          ? [`Your next renewal date is <strong>${formattedPeriodEnd}</strong>`]
          : []),
      ],
      ctaLabel: "View Billing",
      ctaHref: billingUrl,
      footer: "No action is needed unless you want to review your billing settings.",
    }),
  });
}

export async function sendSubscriptionRenewalFailureEmail({
  email,
  planName,
  billingInterval,
  currentPeriodEnd,
}: SubscriptionEmailArgs) {
  const billingUrl = `${getConfiguredAppUrl()}/settings/billing`;
  const formattedPeriodEnd = formatDate(currentPeriodEnd);

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "Your Box Sizer renewal payment failed",
    html: renderEmailLayout({
      title: "Your renewal payment failed",
      intro: "Stripe could not collect your latest Box Sizer renewal payment.",
      bulletLines: [
        `Plan: <strong>${planName}</strong>`,
        `Billing: <strong>${formatBillingInterval(billingInterval)}</strong>`,
        ...(formattedPeriodEnd
          ? [`Your current billing period ends on <strong>${formattedPeriodEnd}</strong>`]
          : []),
      ],
      ctaLabel: "Update Billing",
      ctaHref: billingUrl,
      footer: "Please review your payment method to avoid an interruption to your subscription.",
    }),
  });
}

export async function sendQuotaReachedEmail({
  email,
  planName,
  usageCount,
  usageLimit,
}: QuotaEmailArgs) {
  const pricingUrl = `${getConfiguredAppUrl()}/pricing`;

  await sendEmailOrThrow({
    from: process.env.RESEND_FROM_EMAIL || TRANSACTIONAL_FROM_EMAIL,
    to: email,
    subject: "You've reached your Box Sizer monthly calculation limit",
    html: renderEmailLayout({
      title: "You've reached your monthly calculation limit",
      intro: "You have used all of the calculations included with your current Box Sizer plan this month.",
      bulletLines: [
        `Plan: <strong>${planName}</strong>`,
        `Usage: <strong>${usageCount} of ${usageLimit}</strong> calculations used`,
      ],
      ctaLabel: "Upgrade Plan",
      ctaHref: pricingUrl,
      footer: "Upgrade your plan to continue running calculations without waiting for the next monthly reset.",
    }),
  });
}
