import { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-[24px] border border-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.4)] backdrop-blur-[50px] ${className}`}
      style={{ boxShadow: "0px 12px 42px rgba(89, 0, 255, 0.10)" }}
    >
      {children}
    </div>
  );
}
