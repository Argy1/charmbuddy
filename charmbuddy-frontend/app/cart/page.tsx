import CartSummary from "@/components/cart/CartSummary";
import CartTable from "@/components/cart/CartTable";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";

export default function CartPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-36.35516976673699deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        noiseUrl="/cart/bg-noise.png"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-[16px] pb-[56px] pt-[24px] md:px-[24px] xl:px-[55px]">
        <HeaderTemplate />

        <Reveal className="mt-[24px] grid grid-cols-1 gap-[20px] xl:mt-[33px] xl:grid-cols-[minmax(0,759px)_minmax(0,500px)] xl:items-start xl:justify-between">
          <CartTable />
          <CartSummary />
        </Reveal>
      </div>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}
