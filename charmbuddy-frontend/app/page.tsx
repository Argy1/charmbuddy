import CatalogueGrid from "@/components/home/CatalogueGrid";
import EverydayBloomCarousel from "@/components/home/EverydayBloomCarousel";
import Hero from "@/components/home/Hero";
import HomeBackground from "@/components/home/HomeBackground";
import HomeFaqSection from "@/components/home/HomeFaqSection";
import MatchMosaic from "@/components/home/MatchMosaic";
import Testimonials from "@/components/home/Testimonials";
import AppShell from "@/components/layout/AppShell";

export default function HomePage() {
  return (
    <AppShell>
      <HomeBackground />
      <Hero />
      <EverydayBloomCarousel />
      <CatalogueGrid />
      <MatchMosaic />
      <Testimonials />
      <HomeFaqSection />
    </AppShell>
  );
}
