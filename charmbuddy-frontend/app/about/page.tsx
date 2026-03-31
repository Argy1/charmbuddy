import AboutSection from "@/components/about/AboutSection";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-32.63775195789573deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        heightClass="h-[70vh]"
        minHeightClass="min-h-[720px]"
        noiseUrl="/about/bg-noise.png"
      />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col px-[16px] pb-[48px] pt-[24px] md:px-[24px] xl:px-[35px]">
        <HeaderTemplate />
        <Reveal className="mt-[24px] xl:mt-[40px]">
          <AboutSection />
        </Reveal>
      </div>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}
