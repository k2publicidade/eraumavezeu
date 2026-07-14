import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import WhatsAppFloatingButton from "@/components/site/WhatsAppFloatingButton";
import SkipLink from "@/components/site/SkipLink";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLink />
      <Header />
      <main id="conteudo-principal" tabIndex={-1} className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
