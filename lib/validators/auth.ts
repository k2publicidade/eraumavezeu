import { z } from "zod";

// Schemas centralizados de autenticação.
// Observação: `loginSchema` também existe em `auth.config.ts` para uso no provider
// Credentials; mantemos uma cópia aqui para que UI/Server Actions importem de
// `lib/validators` sem acoplar à config do Auth.js. A forma é idêntica.
export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nome muito curto")
      .max(80, "Nome muito longo"),
    email: z.string().email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres")
      .max(72, "Senha muito longa"), // bcrypt limita a 72 bytes
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
