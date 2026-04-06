import {
  formatPrice,
  getPlanForTier,
  type BillingInterval,
  type SubscriptionTier,
} from "@/lib/subscription-plans";

const FONT_STACK = "Inter, Arial, sans-serif";
const COMPANY_NAME = "Packwell Inc.";
const COMPANY_ADDRESS = "10089 Willow Creek Road, Floor 1, San Diego, CA US";
const COMPANY_EMAIL = "support@packwell.io";

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
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;">
      <tr>
        <td align="center" style="padding:32px 40px;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;padding-right:8px;">
                <img alt="Packwell" src="${escapeHtml(logoUrl)}" width="28" height="28" style="display:block;border:0;" />
              </td>
              <td style="vertical-align:middle;font-family:${FONT_STACK};font-size:20px;font-weight:700;color:#1e293b;line-height:1;">
                Packwell
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function renderDivider(): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td style="height:1px;background:#e2e8f0;line-height:1px;font-size:1px;">&nbsp;</td>
      </tr>
    </table>
  `;
}

function renderIconCircle(symbol: string, backgroundColor: string, symbolColor: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td align="center" style="width:64px;height:64px;border-radius:32px;background:${backgroundColor};font-family:${FONT_STACK};font-size:28px;line-height:1;color:${symbolColor};">
                ${symbol}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function renderPrimaryButton({
  href,
  label,
  backgroundColor = "#2563eb",
}: RenderPrimaryButtonArgs): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:8px 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td align="center" style="border-radius:8px;background:${backgroundColor};">
                <a href="${escapeHtml(href)}" style="display:block;padding:14px 32px;font-family:${FONT_STACK};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                  ${escapeHtml(label)}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:12px;background:#f1f5f9;">
      <tr>
        <td style="padding:24px;">
          <div style="font-family:${FONT_STACK};font-size:13px;font-weight:700;color:#1e293b;padding-bottom:16px;">
            ${escapeHtml(title)}
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${rowsMarkup}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function renderFooter(appUrl: string): string {
  return `
    ${renderDivider()}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;">
      <tr>
        <td align="center" style="padding:32px 40px;">
          <div style="font-family:${FONT_STACK};font-size:13px;font-weight:600;color:#94a3b8;">${escapeHtml(COMPANY_NAME)}</div>
          <div style="margin-top:8px;font-family:${FONT_STACK};font-size:12px;color:#94a3b8;">${escapeHtml(COMPANY_ADDRESS)}</div>
          <div style="margin-top:8px;font-family:${FONT_STACK};font-size:12px;">
            <a href="${escapeHtml(`${appUrl}/settings/notifications`)}" style="color:#2563eb;text-decoration:none;">Unsubscribe</a>
            <span style="color:#94a3b8;"> &middot; </span>
            <a href="${escapeHtml(`${appUrl}/privacy-policy`)}" style="color:#2563eb;text-decoration:none;">Privacy Policy</a>
          </div>
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailShell({
  appUrl,
  bodyContent,
  topDivider = false,
}: RenderEmailShellArgs): string {
  return `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
        <title>Packwell</title>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f1f5f9;">
          <tr>
            <td align="center" style="padding:24px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;max-width:600px;">
                <tr><td>${renderLogo(appUrl)}</td></tr>
                ${topDivider ? `<tr><td>${renderDivider()}</td></tr>` : ""}
                <tr><td>${bodyContent}</td></tr>
                <tr><td>${renderFooter(appUrl)}</td></tr>
              </table>
            </td>
          </tr>
        </table>
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
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;">
        <tr>
          <td style="padding:48px 40px;">
            <div style="font-family:${FONT_STACK};font-size:20px;font-weight:600;color:#1e293b;">
              Hi there,
            </div>
            <div style="margin-top:24px;font-family:${FONT_STACK};font-size:15px;line-height:1.6;color:#64748b;">
              Thanks for signing up for Packwell! Please confirm your email address by clicking the button below.
            </div>
            ${renderPrimaryButton({ href: confirmUrl, label: "Confirm Email Address" })}
            <div style="margin-top:24px;font-family:${FONT_STACK};font-size:13px;line-height:1.5;color:#94a3b8;text-align:center;">
              This link will expire in 24 hours. If you didn&#39;t create an account, you can safely ignore this email.
            </div>
            <div style="margin-top:24px;font-family:${FONT_STACK};font-size:12px;line-height:1.5;color:#94a3b8;">
              If the button doesn&#39;t work, copy and paste this link into your browser:
              <div style="margin-top:8px;word-break:break-all;">${fallbackUrl}</div>
            </div>
          </td>
        </tr>
      </table>
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
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;">
        <tr>
          <td style="padding:48px 40px;">
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
          </td>
        </tr>
      </table>
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
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;">
        <tr>
          <td style="padding:48px 40px;">
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
          </td>
        </tr>
      </table>
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
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;">
        <tr>
          <td style="padding:32px 40px;">
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
          </td>
        </tr>
      </table>
    `,
  });
}

function formatPeriodQuota(limit: number): string {
  return `${limit.toLocaleString("en-US")} req/period`;
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
    recommendedUpgradeTier === "growth"
      ? "Upgrade to Growth"
      : recommendedUpgradeTier === "pro"
        ? "Upgrade to Pro"
        : "View Pricing";
  const upgradeTitle = upgradePlan ? `Need more requests?` : "Keep your team moving";
  const upgradeDescription = upgradePlan
    ? upgradePlan.description
    : "Review pricing options to choose the best Packwell plan for your workflow.";

  return renderEmailShell({
    appUrl,
    topDivider: true,
    bodyContent: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#ffffff;">
        <tr>
          <td style="padding:32px 40px;">
            ${renderIconCircle("↯", "#fef3c7", "#d97706")}
            ${renderCenteredText("Request Limit Reached", {
              fontSize: 28,
              fontWeight: 700,
              marginTop: 24,
            })}
            ${renderCenteredText(
              `You&#39;ve used all ${escapeHtml(usageLimit.toLocaleString("en-US"))} requests included in your current billing period. Your quota will reset on ${escapeHtml(formatDate(quotaResetDate) ?? "the next billing period")}.`,
              { fontSize: 15, color: "#64748b", lineHeight: 1.6, marginTop: 16 }
            )}
            <div style="margin-top:24px;">
              ${renderDetailCard({
                title: "Current Period Usage",
                rows: [
                  {
                    label: "Current Period Usage",
                    value: `${usageCount.toLocaleString("en-US")} / ${usageLimit.toLocaleString("en-US")}`,
                    emphasize: true,
                    accentColor: "#dc2626",
                  },
                  {
                    label: "Current Plan",
                    value: `${plan.name} (${formatPeriodQuota(usageLimit)})`,
                    emphasize: true,
                  },
                  {
                    label: "Quota Resets",
                    value: formatDate(quotaResetDate) ?? "Next billing period",
                    emphasize: true,
                  },
                ],
              })}
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding-top:24px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-radius:12px;background:#eff6ff;">
                    <tr>
                      <td style="padding:20px 24px;text-align:center;">
                        <div style="font-family:${FONT_STACK};font-size:16px;font-weight:700;color:#1e293b;">${escapeHtml(upgradeTitle)}</div>
                        <div style="margin-top:8px;font-family:${FONT_STACK};font-size:13px;line-height:1.6;color:#64748b;">
                          ${escapeHtml(upgradeDescription)}
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            ${renderPrimaryButton({ href: `${appUrl}/pricing`, label: upgradeLabel })}
            ${renderCenteredText(
              "You can still access your account, but new requests will be queued until your quota resets or you upgrade your plan.",
              { fontSize: 13, color: "#64748b", lineHeight: 1.6, marginTop: 16 }
            )}
          </td>
        </tr>
      </table>
    `,
  });
}
