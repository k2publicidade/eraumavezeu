export type AuthRole = "ADMIN" | "CUSTOMER" | string | undefined | null;

export function getPostLoginRedirect(role: AuthRole) {
  return role === "ADMIN" ? "/admin" : "/";
}
