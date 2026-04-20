import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import WhatsAppFloatingButton from "@/components/site/WhatsAppFloatingButton";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
