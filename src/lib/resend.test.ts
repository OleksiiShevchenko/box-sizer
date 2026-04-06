const mockSendEmail = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSendEmail,
    },
  })),
}));

describe("resend mailers", () => {
  const originalConfigEmail = process.env.CONFIG_EMAIL;
  const originalFromEmail = process.env.RESEND_FROM_EMAIL;
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  const originalNextAuthUrl = process.env.NEXTAUTH_URL;

  beforeEach(() => {
    jest.resetModules();
    mockSendEmail.mockReset();
    delete process.env.CONFIG_EMAIL;
    delete process.env.RESEND_FROM_EMAIL;
    process.env.NEXT_PUBLIC_APP_URL = "https://packwell.io";
    delete process.env.NEXTAUTH_URL;
  });

  afterAll(() => {
    process.env.CONFIG_EMAIL = originalConfigEmail;
    process.env.RESEND_FROM_EMAIL = originalFromEmail;
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    process.env.NEXTAUTH_URL = originalNextAuthUrl;
  });

  it("uses noreply@packwell.io for verification emails by default", async () => {
    mockSendEmail.mockResolvedValue({ data: { id: "email_123" }, error: null });
    const { sendVerificationEmail } = await import("./resend");

    await sendVerificationEmail("user@example.com", "token-123");

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "noreply@packwell.io",
        to: "user@example.com",
        subject: "Confirm your Packwell account",
        html: expect.stringContaining("Confirm Email Address"),
      })
    );
  });

  it("throws when Resend reports an error", async () => {
    mockSendEmail.mockResolvedValue({
      data: null,
      error: { message: "Resend rejected the request" },
    });
    const { sendVerificationEmail } = await import("./resend");

    await expect(sendVerificationEmail("user@example.com", "token-123")).rejects.toThrow(
      "Resend rejected the request"
    );
  });

  it("does not throw when the admin notification fails", async () => {
    process.env.CONFIG_EMAIL = "ops@packwell.io";
    mockSendEmail
      .mockResolvedValueOnce({ data: { id: "email_123" }, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { message: "Admin notification rejected" },
      });
    const { sendVerificationEmail } = await import("./resend");

    await expect(sendVerificationEmail("user@example.com", "token-123")).resolves.toBeUndefined();

    expect(mockSendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: "ops@packwell.io",
      })
    );
  });

  it("renders the purchase email with Packwell branding, dashboard CTA, and footer links", async () => {
    process.env.NEXTAUTH_URL = "dashboard.packwell.io";
    mockSendEmail.mockResolvedValue({ data: { id: "email_123" }, error: null });
    const { sendSubscriptionPurchaseSuccessEmail } = await import("./resend");

    await sendSubscriptionPurchaseSuccessEmail({
      email: "user@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
    });

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Your Packwell subscription is active",
        html: expect.stringContaining("Subscription Confirmed!"),
      })
    );

    const html = mockSendEmail.mock.calls[0][0].html as string;
    expect(html).toContain("https://dashboard.packwell.io/dashboard");
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Unsubscribe");
    expect(html).toContain("10089 Willow Creek Road, Floor 1, San Diego, CA US");
  });

  it("renders the renewal success email with a receipt CTA and payment details", async () => {
    mockSendEmail.mockResolvedValue({ data: { id: "email_123" }, error: null });
    const { sendSubscriptionRenewalSuccessEmail } = await import("./resend");

    await sendSubscriptionRenewalSuccessEmail({
      email: "user@example.com",
      tier: "growth",
      billingInterval: "monthly",
      currentPeriodEnd: new Date("2026-04-30T00:00:00.000Z"),
      amountPaidCents: 2900,
      paymentMethodLabel: "Visa •••• 4242",
      hostedInvoiceUrl: "https://pay.stripe.com/invoice/acct_123",
      invoicePdfUrl: "https://stripe.com/invoice.pdf",
    });

    const html = mockSendEmail.mock.calls[0][0].html as string;
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Your Packwell subscription renewed successfully",
        html: expect.stringContaining("Subscription Renewed"),
      })
    );
    expect(html).toContain("https://pay.stripe.com/invoice/acct_123");
    expect(html).toContain("View Receipt");
    expect(html).toContain("Visa •••• 4242");
    expect(html).toContain("Download invoice PDF");
  });

  it("renders the renewal failure email with retry information", async () => {
    mockSendEmail.mockResolvedValue({ data: { id: "email_123" }, error: null });
    const { sendSubscriptionRenewalFailureEmail } = await import("./resend");

    await sendSubscriptionRenewalFailureEmail({
      email: "user@example.com",
      tier: "growth",
      billingInterval: "monthly",
      amountDueCents: 2900,
      paymentMethodLabel: "Visa •••• 4242",
      nextRetryAt: new Date("2026-04-02T12:00:00.000Z"),
    });

    const html = mockSendEmail.mock.calls[0][0].html as string;
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Your Packwell renewal payment failed",
        html: expect.stringContaining("Payment Failed"),
      })
    );
    expect(html).toContain("Apr 2, 2026");
    expect(html).toContain("Update Payment Method");
  });

  it("renders the quota email with reset date and upgrade CTA", async () => {
    mockSendEmail.mockResolvedValue({ data: { id: "email_123" }, error: null });
    const { sendQuotaReachedEmail } = await import("./resend");

    await sendQuotaReachedEmail({
      email: "user@example.com",
      tier: "starter",
      usageCount: 15,
      usageLimit: 15,
      quotaResetDate: new Date(2026, 3, 1),
      recommendedUpgradeTier: "growth",
    });

    const html = mockSendEmail.mock.calls[0][0].html as string;
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "You've reached your Packwell billing period request limit",
        html: expect.stringContaining("Request Limit Reached"),
      })
    );
    expect(html).toContain("Apr 1, 2026");
    expect(html).toContain("Upgrade to Growth");
    expect(html).toContain("15 / 15");
  });
});
