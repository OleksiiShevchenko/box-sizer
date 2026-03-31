import {
  formatPrice,
  getPlanForTier,
  type BillingInterval,
  type SubscriptionTier,
} from "@/lib/subscription-plans";

const FONT_STACK = "Inter, Arial, sans-serif";
const COMPANY_NAME = "Packwell Inc.";
const COMPANY_ADDRESS = "10089 Willow Creek Road, Floor 1, San Diego, CA US";
const COMPANY_EMAIL = "hello@packwell.io";

type CardRow = {
  label: string;
  value: string;
  emphasize?: boolean;
  accentColor?: string;
};

interface RenderEmailShellArgs {
  appUrl: string;
  bodyContent: string;
  topDivider?: boolean;
}

interface RenderPrimaryButtonArgs {
  href: string;
  label: string;
  backgroundColor?: string;
}

interface RenderDetailCardArgs {
  title: string;
  rows: CardRow[];
}

interface SubscriptionBaseTemplateArgs {
  appUrl: string;
  tier: SubscriptionTier;
  billingInterval: BillingInterval | null;
  currentPeriodEnd?: Date | null;
}

interface RenderVerificationEmailArgs {
  appUrl: string;
  confirmUrl: string;
}

type RenderSubscriptionPurchaseEmailArgs = SubscriptionBaseTemplateArgs;

interface RenderSubscriptionRenewalSuccessEmailArgs extends SubscriptionBaseTemplateArgs {
  amountPaidCents?: number | null;
  paymentMethodLabel?: string | null;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
}

interface RenderSubscriptionRenewalFailureEmailArgs extends SubscriptionBaseTemplateArgs {
  amountDueCents?: number | null;
  paymentMethodLabel?: string | null;
  nextRetryAt?: Date | null;
}

interface RenderQuotaReachedEmailArgs {
  appUrl: string;
  tier: SubscriptionTier;
  usageCount: number;
  usageLimit: number;
  quotaResetDate: Date;
  recommendedUpgradeTier: SubscriptionTier | null;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatDate(value: Date | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(value);
}

export function formatMoney(cents: number | null | undefined): string | null {
  if (typeof cents !== "number") {
    return null;
  }

  return formatPrice(cents);
}

export function formatRecurringPrice(cents: number, interval: BillingInterval | null): string {
  const suffix = interval === "annual" ? "/yr" : "/mo";
  return `${formatPrice(cents)}${suffix}`;
}

export function formatPaymentMethodLabel(paymentMethodLabel: string | null | undefined): string {
  return paymentMethodLabel?.trim() || "Card on file";
}

function renderLogo(appUrl: string): string {
  const logoUrl = `${appUrl}/email/packwell-mark.svg`;

  return `
    <div style="text-align:center;padding:32px 40px;background:#ffffff;">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <img alt="Packwell" src="${escapeHtml(logoUrl)}" width="28" height="28" style="display:block;border:0;" />
        <span style="font-family:${FONT_STACK};font-size:20px;font-weight:700;color:#1e293b;line-height:1;">Packwell</span>
      </div>
    </div>
  `;
}

function renderDivider(): string {
  return `<div style="height:1px;background:#e2e8f0;line-height:1;font-size:0;">&nbsp;</div>`;
}

function renderIconCircle(symbol: string, backgroundColor: string, symbolColor: string): string {
  return `
    <div style="text-align:center;">
      <div style="width:64px;height:64px;border-radius:32px;background:${backgroundColor};display:inline-flex;align-items:center;justify-content:center;">
        <span style="font-family:${FONT_STACK};font-size:28px;line-height:1;color:${symbolColor};">${symbol}</span>
      </div>
    </div>
  `;
}

export function renderPrimaryButton({
  href,
  label,
  backgroundColor = "#2563eb",
}: RenderPrimaryButtonArgs): string {
  return `
    <div style="text-align:center;padding:8px 0 0;">
      <a href="${escapeHtml(href)}" style="display:inline-block;min-width:184px;padding:14px 24px;border-radius:8px;background:${backgroundColor};font-family:${FONT_STACK};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
        ${escapeHtml(label)}
      </a>
    </div>
  `;
}

export function renderDetailCard({ title, rows }: RenderDetailCardArgs): string {
  const rowsMarkup = rows
    .map(
      (row, index) => `
        <tr>
          <td style="padding:${index === 0 ? "0 0 12px" : "12px 0"};border-top:${index === 0 ? "none" : "1px solid #e2e8f0"};font-family:${FONT_STACK};font-size:13px;color:#64748b;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:${index === 0 ? "0 0 12px" : "12px 0"};border-top:${index === 0 ? "none" : "1px solid #e2e8f0"};font-family:${FONT_STACK};font-size:13px;color:${row.accentColor ?? "#1e293b"};font-weight:${row.emphasize ? "600" : "500"};text-align:right;">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `
    )
    .join("");

  return `
    <div style="border:1px solid #e2e8f0;border-radius:12px;background:#f1f5f9;padding:24px;">
      <div style="font-family:${FONT_STACK};font-size:13px;font-weight:700;color:#1e293b;padding-bottom:16px;">
        ${escapeHtml(title)}
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        ${rowsMarkup}
      </table>
    </div>
  `;
}

function renderFooter(appUrl: string): string {
  return `
    ${renderDivider()}
    <div style="padding:32px 40px;background:#ffffff;text-align:center;">
      <div style="font-family:${FONT_STACK};font-size:13px;font-weight:600;color:#94a3b8;">${escapeHtml(COMPANY_NAME)}</div>
      <div style="margin-top:8px;font-family:${FONT_STACK};font-size:12px;color:#94a3b8;">${escapeHtml(COMPANY_ADDRESS)}</div>
      <div style="margin-top:8px;font-family:${FONT_STACK};font-size:12px;">
        <a href="${escapeHtml(`${appUrl}/privacy-policy`)}" style="color:#2563eb;text-decoration:none;">Privacy Policy</a>
        <span style="color:#94a3b8;"> · </span>
        <a href="${escapeHtml(`${appUrl}/terms-of-service`)}" style="color:#2563eb;text-decoration:none;">Terms of Service</a>
        <span style="color:#94a3b8;"> · </span>
        <a href="mailto:${COMPANY_EMAIL}" style="color:#2563eb;text-decoration:none;">${COMPANY_EMAIL}</a>
      </div>
    </div>
  `;
}

export function renderEmailShell({
  appUrl,
  bodyContent,
  topDivider = false,
}: RenderEmailShellArgs): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <body style="margin:0;padding:24px;background:#f8fafc;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:0;overflow:hidden;">
          ${renderLogo(appUrl)}
          ${topDivider ? renderDivider() : ""}
          ${bodyContent}
          ${renderFooter(appUrl)}
        </div>
      </body>
    </html>
  `;
}

function renderCenteredText(
  content: string,
  styles: {
    fontSize: number;
    fontWeight?: number;
    color?: string;
    lineHeight?: number;
    marginTop?: number;
  }
): string {
  return `
    <div style="margin-top:${styles.marginTop ?? 0}px;font-family:${FONT_STACK};font-size:${styles.fontSize}px;font-weight:${styles.fontWeight ?? 400};line-height:${styles.lineHeight ?? 1.4};color:${styles.color ?? "#1e293b"};text-align:center;">
      ${content}
    </div>
  `;
}

function recurringPlanPrice(tier: SubscriptionTier, billingInterval: BillingInterval | null): string {
  const plan = getPlanForTier(tier);
  const cents =
    billingInterval === "annual" ? plan.annualPriceCents : plan.monthlyPriceCents;

  return formatRecurringPrice(cents, billingInterval);
}

export function renderVerificationEmail({
  appUrl,
  confirmUrl,
}: RenderVerificationEmailArgs): string {
  const fallbackUrl = escapeHtml(confirmUrl);

  return renderEmailShell({
    appUrl,
    bodyContent: `
      <div style="padding:48px 40px;background:#ffffff;">
        ${renderCenteredText("Hi there,", { fontSize: 20, fontWeight: 600, color: "#1e293b" }).replace('text-align:center;', 'text-align:left;')}
        <div style="margin-top:24px;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:#64748b;">
          Thanks for signing up for Packwell! Please confirm your email address by clicking the button below.
        </div>
        ${renderPrimaryButton({ href: confirmUrl, label: "Confirm Email Address" })}
        ${renderCenteredText(
          "This link will expire in 24 hours. If you didn&#39;t create an account, you can safely ignore this email.",
          { fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginTop: 24 }
        )}
        <div style="margin-top:24px;font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:#94a3b8;">
          <div>If the button doesn&#39;t work, copy and paste this link into your browser:</div>
          <div style="margin-top:8px;word-break:break-all;">${fallbackUrl}</div>
        </div>
      </div>
    `,
  });
}

export function renderSubscriptionPurchaseEmail({
  appUrl,
  tier,
  billingInterval,
  currentPeriodEnd,
}: RenderSubscriptionPurchaseEmailArgs): string {
  return renderEmailShell({
    appUrl,
    bodyContent: `
      <div style="padding:48px 40px;background:#ffffff;">
        ${renderIconCircle("✓", "#ecfdf5", "#16a34a")}
        ${renderCenteredText("Subscription Confirmed!", {
          fontSize: 22,
          fontWeight: 700,
          marginTop: 24,
        })}
        ${renderCenteredText(
          "Thank you for your purchase. Your subscription is now active and ready to use.",
          { fontSize: 15, color: "#64748b", lineHeight: 1.6, marginTop: 16 }
        )}
        <div style="margin-top:24px;">
          ${renderDetailCard({
            title: "Subscription Details",
            rows: [
              { label: "Plan", value: getPlanForTier(tier).name, emphasize: true },
              { label: "Price", value: recurringPlanPrice(tier, billingInterval), emphasize: true },
              {
                label: "Billing Cycle",
                value: billingInterval === "annual" ? "Annual" : "Monthly",
                emphasize: true,
              },
              {
                label: "Next Billing Date",
                value: formatDate(currentPeriodEnd) ?? "TBD",
                emphasize: true,
              },
            ],
          })}
        </div>
        ${renderPrimaryButton({ href: `${appUrl}/dashboard`, label: "Go to Dashboard" })}
        ${renderCenteredText(
          `Need help? Contact us at <a href="mailto:${COMPANY_EMAIL}" style="color:#2563eb;text-decoration:none;">${COMPANY_EMAIL}</a>`,
          { fontSize: 13, color: "#94a3b8", marginTop: 20 }
        )}
      </div>
    `,
  });
}

export function renderSubscriptionRenewalSuccessEmail({
  appUrl,
  tier,
  billingInterval,
  currentPeriodEnd,
  amountPaidCents,
  paymentMethodLabel,
  hostedInvoiceUrl,
  invoicePdfUrl,
}: RenderSubscriptionRenewalSuccessEmailArgs): string {
  const plan = getPlanForTier(tier);
  const fallbackAmount =
    billingInterval === "annual" ? plan.annualPriceCents : plan.monthlyPriceCents;
  const ctaHref = hostedInvoiceUrl || `${appUrl}/settings/billing`;
  const ctaLabel = hostedInvoiceUrl ? "View Receipt" : "View Billing";
  const pdfLinkMarkup = invoicePdfUrl
    ? `
      <div style="margin-top:12px;text-align:center;font-family:${FONT_STACK};font-size:12px;">
        <a href="${escapeHtml(invoicePdfUrl)}" style="color:#2563eb;text-decoration:none;">Download invoice PDF</a>
      </div>
    `
    : "";

  return renderEmailShell({
    appUrl,
    bodyContent: `
      <div style="padding:48px 40px;background:#ffffff;">
        ${renderIconCircle("↻", "#dbeafe", "#2563eb")}
        ${renderCenteredText("Subscription Renewed", {
          fontSize: 22,
          fontWeight: 700,
          marginTop: 24,
        })}
        ${renderCenteredText(
          "Your Packwell subscription has been automatically renewed. Here&#39;s a summary of your payment.",
          { fontSize: 15, color: "#64748b", lineHeight: 1.6, marginTop: 16 }
        )}
        <div style="margin-top:24px;">
          ${renderDetailCard({
            title: "Payment Summary",
            rows: [
              { label: "Plan", value: plan.name, emphasize: true },
              {
                label: "Amount Charged",
                value: formatMoney(amountPaidCents ?? fallbackAmount) ?? formatPrice(fallbackAmount),
                emphasize: true,
              },
              {
                label: "Payment Method",
                value: formatPaymentMethodLabel(paymentMethodLabel),
                emphasize: true,
              },
              {
                label: "Next Renewal",
                value: formatDate(currentPeriodEnd) ?? "TBD",
                emphasize: true,
              },
            ],
          })}
        </div>
        ${renderPrimaryButton({ href: ctaHref, label: ctaLabel })}
        ${pdfLinkMarkup}
        ${renderCenteredText(
          "You can manage your subscription settings anytime from your account dashboard.",
          { fontSize: 13, color: "#94a3b8", lineHeight: 1.5, marginTop: 20 }
        )}
      </div>
    `,
  });
}

export function renderSubscriptionRenewalFailureEmail({
  appUrl,
  tier,
  billingInterval,
  amountDueCents,
  paymentMethodLabel,
  nextRetryAt,
}: RenderSubscriptionRenewalFailureEmailArgs): string {
  const plan = getPlanForTier(tier);
  const fallbackAmount =
    billingInterval === "annual" ? plan.annualPriceCents : plan.monthlyPriceCents;
  const retryLabel = formatDate(nextRetryAt) ?? "Automatic retry pending";
  const helperCopy = nextRetryAt
    ? `We&#39;ll automatically retry the payment on ${escapeHtml(retryLabel)}. To avoid any service interruption, please update your payment method before then.`
    : "We&#39;ll automatically retry your payment soon. To avoid any service interruption, please update your payment method before the next attempt.";

  return renderEmailShell({
    appUrl,
    topDivider: true,
    bodyContent: `
      <div style="padding:32px 40px;background:#ffffff;">
        ${renderIconCircle("△", "#fee2e2", "#dc2626")}
        ${renderCenteredText("Payment Failed", {
          fontSize: 28,
          fontWeight: 700,
          marginTop: 24,
        })}
        ${renderCenteredText(
          "We were unable to process your subscription renewal payment. Your access may be interrupted if the issue isn&#39;t resolved soon.",
          { fontSize: 15, color: "#64748b", lineHeight: 1.6, marginTop: 16 }
        )}
        <div style="margin-top:24px;">
          ${renderDetailCard({
            title: "Payment Details",
            rows: [
              { label: "Plan", value: plan.name, emphasize: true },
              {
                label: "Amount Due",
                value: formatMoney(amountDueCents ?? fallbackAmount) ?? formatPrice(fallbackAmount),
                emphasize: true,
              },
              {
                label: "Payment Method",
                value: formatPaymentMethodLabel(paymentMethodLabel),
                emphasize: true,
                accentColor: paymentMethodLabel ? "#dc2626" : "#1e293b",
              },
              { label: "Next Retry", value: retryLabel, emphasize: true },
            ],
          })}
        </div>
        ${renderPrimaryButton({
          href: `${appUrl}/settings/billing`,
          label: "Update Payment Method",
          backgroundColor: "#dc2626",
        })}
        ${renderCenteredText(helperCopy, {
          fontSize: 13,
          color: "#64748b",
          lineHeight: 1.6,
          marginTop: 16,
        })}
      </div>
    `,
  });
}

function formatMonthlyQuota(limit: number): string {
  return `${limit.toLocaleString("en-US")} req/mo`;
}

export function renderQuotaReachedEmail({
  appUrl,
  tier,
  usageCount,
  usageLimit,
  quotaResetDate,
  recommendedUpgradeTier,
}: RenderQuotaReachedEmailArgs): string {
  const plan = getPlanForTier(tier);
  const upgradePlan = recommendedUpgradeTier ? getPlanForTier(recommendedUpgradeTier) : null;
  const upgradeLabel =
    recommendedUpgradeTier === "pro"
      ? "Upgrade to Pro"
      : recommendedUpgradeTier === "business"
        ? "Upgrade to Business"
        : "View Pricing";
  const upgradeTitle = upgradePlan ? `Need more requests?` : "Keep your team moving";
  const upgradeDescription = upgradePlan
    ? upgradePlan.description
    : "Review pricing options to choose the best Packwell plan for your workflow.";

  return renderEmailShell({
    appUrl,
    topDivider: true,
    bodyContent: `
      <div style="padding:32px 40px;background:#ffffff;">
        ${renderIconCircle("↯", "#fef3c7", "#d97706")}
        ${renderCenteredText("Request Limit Reached", {
          fontSize: 28,
          fontWeight: 700,
          marginTop: 24,
        })}
        ${renderCenteredText(
          `You&#39;ve used all ${escapeHtml(usageLimit.toLocaleString("en-US"))} requests included in your current plan this month. Your quota will reset on ${escapeHtml(formatDate(quotaResetDate) ?? "the next billing cycle")}.`,
          { fontSize: 15, color: "#64748b", lineHeight: 1.6, marginTop: 16 }
        )}
        <div style="margin-top:24px;">
          ${renderDetailCard({
            title: "Monthly Usage",
            rows: [
              {
                label: "Monthly Usage",
                value: `${usageCount.toLocaleString("en-US")} / ${usageLimit.toLocaleString("en-US")}`,
                emphasize: true,
                accentColor: "#dc2626",
              },
              {
                label: "Current Plan",
                value: `${plan.name} (${formatMonthlyQuota(usageLimit)})`,
                emphasize: true,
              },
              {
                label: "Quota Resets",
                value: formatDate(quotaResetDate) ?? "Next month",
                emphasize: true,
              },
            ],
          })}
        </div>
        <div style="margin-top:24px;border-radius:12px;background:#eff6ff;padding:20px 24px;text-align:center;">
          <div style="font-family:${FONT_STACK};font-size:16px;font-weight:700;color:#1e293b;">${escapeHtml(upgradeTitle)}</div>
          <div style="margin-top:8px;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:#64748b;">
            ${escapeHtml(upgradeDescription)}
          </div>
        </div>
        ${renderPrimaryButton({ href: `${appUrl}/pricing`, label: upgradeLabel })}
        ${renderCenteredText(
          "You can still access your account, but new requests will be queued until your quota resets or you upgrade your plan.",
          { fontSize: 13, color: "#64748b", lineHeight: 1.6, marginTop: 16 }
        )}
      </div>
    `,
  });
}
