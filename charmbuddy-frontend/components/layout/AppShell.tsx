import { ReactNode } from "react";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import Footer from "@/components/shared/Footer";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="bloo-bg flex min-h-screen w-full flex-col">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-[16px] pt-[20px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />
        <main className="relative flex-1 py-[24px]">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
