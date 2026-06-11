import type { Metadata } from "next";
import CheckoutView from "@/components/cart/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Finalize seu livro infantil personalizado com dados de entrega, pagamento e atendimento assistido.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <section className="py-10 md:py-16 bg-cream-warm min-h-[70vh]">
      <div className="container mx-auto px-4 max-w-6xl">
        <CheckoutView />
      </div>
    </section>
  );
}
