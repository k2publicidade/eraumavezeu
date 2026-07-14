import { spawnSync } from "node:child_process";

if (process.env.VERCEL_ENV !== "production") {
  console.log("[database] Migração ignorada fora do ambiente de produção.");
  process.exit(0);
}

console.log("[database] Aplicando migrações pendentes de produção…");
const prismaCommand =
  process.platform === "win32"
    ? "node_modules\\.bin\\prisma.cmd"
    : "node_modules/.bin/prisma";
const result = spawnSync(prismaCommand, ["migrate", "deploy"], {
  env: process.env,
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
