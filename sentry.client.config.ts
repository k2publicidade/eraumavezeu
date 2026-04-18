import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    beforeSend: scrubPII,
  });
}

// Remove PII sensível de erros antes de enviar ao Sentry.
// LGPD: nunca enviar fotos, telefones completos ou CPF.
function scrubPII(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
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
}
