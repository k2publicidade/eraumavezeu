import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    beforeSend(event) {
      // Remove PII LGPD-sensível
      if (event.request?.data && typeof event.request.data === "object") {
        const data = event.request.data as Record<string, unknown>;
        delete data.password;
        delete data.photos;
        delete data.photoKeys;
        delete data.cpf;
        if (typeof data.phone === "string") {
          data.phone = data.phone.replace(/\d(?=\d{4})/g, "*");
        }
      }
      if (event.user) {
        delete event.user.ip_address;
      }
      return event;
    },
  });
}
