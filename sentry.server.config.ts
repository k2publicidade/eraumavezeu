import * as Sentry from "@sentry/nextjs";
import { scrubPII } from "./lib/sentry-scrub";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      scrubPII(event as unknown as Parameters<typeof scrubPII>[0]);
      return event;
    },
  });
}
