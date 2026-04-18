import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks precisam vir ANTES dos imports das funções testadas.
// redirect() e notFound() do Next normalmente lançam erros especiais — aqui
// convertemos em Error convencional para podermos assertar via .rejects.toThrow.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const authMock = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

// Import DEPOIS dos mocks — garantido pelo hoisting do vi.mock.
import { requireAuth, requireAdmin } from "@/lib/auth-guards";

describe("requireAuth", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("redireciona para /login quando não há sessão", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow(/NEXT_REDIRECT:\/login/);
  });

  it("redireciona para /login quando sessão sem user.id", async () => {
    authMock.mockResolvedValue({ user: { email: "x@y.com" } });
    await expect(requireAuth()).rejects.toThrow(/NEXT_REDIRECT:\/login/);
  });

  it("retorna user quando sessão válida", async () => {
    const user = { id: "u1", email: "a@b.com", role: "CUSTOMER" as const };
    authMock.mockResolvedValue({ user });
    const out = await requireAuth();
    expect(out).toEqual(user);
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("notFound quando não há sessão", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("notFound quando role=CUSTOMER", async () => {
    authMock.mockResolvedValue({
      user: { id: "u1", email: "a@b.com", role: "CUSTOMER" },
    });
    await expect(requireAdmin()).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("retorna user quando role=ADMIN", async () => {
    const user = { id: "u1", email: "admin@a.com", role: "ADMIN" as const };
    authMock.mockResolvedValue({ user });
    const out = await requireAdmin();
    expect(out).toEqual(user);
  });
});
