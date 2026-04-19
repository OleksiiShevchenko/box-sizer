jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/current-user", () => ({
  getCurrentUserId: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    box: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";
import { createBox, updateBox } from "./box-actions";

const mockedGetCurrentUserId = getCurrentUserId as jest.Mock;
const mockedRevalidatePath = revalidatePath as jest.Mock;
const mockPrisma = prisma as unknown as {
  box: {
    create: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
};

function buildFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  formData.set("boxName", "Test Box");
  formData.set("width", "30");
  formData.set("height", "20");
  formData.set("depth", "10");
  formData.set("spacing", "2");
  formData.set("maxWeight", "1500");

  for (const [key, value] of Object.entries(overrides)) {
    formData.set(key, value);
  }

  return formData;
}

describe("box actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetCurrentUserId.mockResolvedValue("user-1");
    mockPrisma.box.create.mockResolvedValue({ id: "box-1" });
    mockPrisma.box.findUnique.mockResolvedValue({ id: "box-1", userId: "user-1" });
    mockPrisma.box.update.mockResolvedValue({ id: "box-1" });
  });

  it("stores null max weight when a new box leaves the optional field blank", async () => {
    const formData = buildFormData({ maxWeight: "" });

    await expect(createBox(formData)).resolves.toEqual({ success: true });

    expect(mockPrisma.box.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        maxWeight: null,
      }),
    });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/settings/boxes");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("clears max weight to null when an edited box removes the optional field value", async () => {
    const formData = buildFormData({ maxWeight: "" });

    await expect(updateBox("box-1", formData)).resolves.toEqual({ success: true });

    expect(mockPrisma.box.update).toHaveBeenCalledWith({
      where: { id: "box-1" },
      data: expect.objectContaining({
        name: "Test Box",
        maxWeight: null,
      }),
    });
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/settings/boxes");
    expect(mockedRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });
});
