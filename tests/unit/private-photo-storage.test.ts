import { describe, expect, it } from "vitest";
import {
  decodePrivatePhotoKey,
  encodePrivatePhotoKey,
  isAllowedPrivatePhotoUrl,
  validatePrivatePhotoUpload,
} from "../../lib/private-photo-storage";

describe("private photo storage", () => {
  it("encodes Supabase paths as opaque keys and restores the original path", () => {
    const path = "pending/550e8400-e29b-41d4-a716-446655440000/foto criança.jpg";
    const key = encodePrivatePhotoKey(path);

    expect(key).toMatch(/^sb_[A-Za-z0-9_-]+$/);
    expect(key).not.toContain(path);
    expect(decodePrivatePhotoKey(key)).toBe(path);
  });

  it("does not interpret legacy UploadThing keys as Supabase paths", () => {
    expect(decodePrivatePhotoKey("legacy-uploadthing-key")).toBeNull();
  });

  it("accepts supported images up to 8 MB", () => {
    expect(validatePrivatePhotoUpload({ type: "image/jpeg", size: 8 * 1024 * 1024 })).toEqual({ ok: true });
  });

  it("rejects unsupported files and oversized images", () => {
    expect(validatePrivatePhotoUpload({ type: "application/pdf", size: 1000 }).ok).toBe(false);
    expect(validatePrivatePhotoUpload({ type: "image/png", size: 8 * 1024 * 1024 + 1 }).ok).toBe(false);
    expect(validatePrivatePhotoUpload({ type: "image/png", size: Number.NaN }).ok).toBe(false);
  });

  it("allows only the configured Supabase host for signed previews", () => {
    const projectUrl = "https://project-ref.supabase.co";
    expect(isAllowedPrivatePhotoUrl("https://project-ref.supabase.co/storage/v1/object/sign/x", projectUrl)).toBe(true);
    expect(isAllowedPrivatePhotoUrl("https://evil.supabase.co/storage/v1/object/sign/x", projectUrl)).toBe(false);
  });
});
