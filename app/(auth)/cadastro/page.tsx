import type { Metadata } from "next";
import { CadastroForm } from "./CadastroForm";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function CadastroPage() {
  return <CadastroForm />;
}
