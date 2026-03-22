const mockSendEmail = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSendEmail,
    },
  })),
}));

describe("sendVerificationEmail", () => {
  const originalConfigEmail = process.env.CONFIG_EMAIL;
  const originalFromEmail = process.env.RESEND_FROM_EMAIL;
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    jest.resetModules();
    mockSendEmail.mockReset();
    delete process.env.CONFIG_EMAIL;
    delete process.env.RESEND_FROM_EMAIL;
    process.env.NEXT_PUBLIC_APP_URL = "https://packwell.io";
  });

  afterAll(() => {
    process.env.CONFIG_EMAIL = originalConfigEmail;
    process.env.RESEND_FROM_EMAIL = originalFromEmail;
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  it("uses noreply@packwell.io for verification emails by default", async () => {
    mockSendEmail.mockResolvedValue({ data: { id: "email_123" }, error: null });
    const { sendVerificationEmail } = await import("./resend");

    await sendVerificationEmail("user@example.com", "token-123");

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "noreply@packwell.io",
        to: "user@example.com",
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
});
