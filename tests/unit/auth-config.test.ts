import { describe, it, expect } from "vitest";
import authConfig from "@/auth.config";

// `authorized` é o callback executado pelo middleware (edge runtime) para decidir
// se o request pode prosseguir. Testamos direto a função — sem NextAuth wrapper —
// porque é uma função pura que só olha URL + sessão.
const authorized = authConfig.callbacks!.authorized!;

type AuthInput = null | { user: { role: string } };

function call(pathname: string, auth: AuthInput) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return authorized({
    // auth real tem shape complexa do NextAuth; aqui só o que o callback lê.
    auth: auth as any,
    request: { nextUrl: new URL(`http://localhost${pathname}`) } as any,
  } as any);
}

describe("authorized callback — matriz role × rota", () => {
  it.each([
    // [pathname, auth, expected]
    ["/admin/dashboard", null, false],
    ["/admin/dashboard", { user: { role: "CUSTOMER" } }, false],
    ["/admin/dashboard", { user: { role: "ADMIN" } }, true],
    ["/pedidos", null, false],
    ["/pedidos", { user: { role: "CUSTOMER" } }, true],
    ["/perfil", { user: { role: "CUSTOMER" } }, true],
    ["/cliente/qualquer-coisa", null, false],
    ["/cliente/qualquer-coisa", { user: { role: "CUSTOMER" } }, true],
    ["/", null, true],
    ["/produtos", null, true],
    ["/como-funciona", null, true],
  ] as Array<[string, AuthInput, boolean]>)(
    "%s com auth=%o → %s",
    (pathname, auth, expected) => {
      expect(call(pathname, auth)).toBe(expected);
    }
  );
});
