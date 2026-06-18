import { describe, expect, it } from "vitest";
import { getPostLoginRedirect } from "@/lib/auth-redirect";

describe("getPostLoginRedirect", () => {
  it("redirects admins to the admin panel", () => {
    expect(getPostLoginRedirect("ADMIN")).toBe("/admin");
  });

  it("redirects customers to the home page", () => {
    expect(getPostLoginRedirect("CUSTOMER")).toBe("/");
  });

  it("redirects unknown roles to the home page", () => {
    expect(getPostLoginRedirect(undefined)).toBe("/");
  });
});
