"use client";

import AddressCard from "@/components/profile/AddressCard";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import OrdersTable from "@/components/profile/OrdersTable";
import ProfileCard from "@/components/profile/ProfileCard";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { useRequireAuth } from "@/lib/use-require-auth";

export default function ProfilePage() {
  const isAllowed = useRequireAuth();
  if (!isAllowed) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-36.35516976673699deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        noiseUrl="/profile/bg-noise.png"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-[16px] pb-[56px] pt-[24px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />

        <Reveal className="mt-[24px] space-y-[20px] xl:mt-[40px] xl:space-y-[30px]">
          <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-[minmax(0,697px)_minmax(0,548px)] xl:justify-between">
            <ProfileCard />
            <AddressCard />
          </div>
          <OrdersTable />
        </Reveal>
      </div>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}
