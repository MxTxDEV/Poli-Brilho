import { FrameSequenceProvider } from "@/components/FrameSequenceProvider";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ScrollProductAnimation from "@/components/ScrollProductAnimation";
import Benefits from "@/components/Benefits";
import HowToUse from "@/components/HowToUse";
import Product from "@/components/Product";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <FrameSequenceProvider>
      <Header />
      <main>
        <Hero />
        <ScrollProductAnimation />
        <Benefits />
        <HowToUse />
        <Product />
        <CTA />
      </main>
      <Footer />
    </FrameSequenceProvider>
  );
}
