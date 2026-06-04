type RouteLoadingStateProps = {
  label?: string;
};

export default function RouteLoadingState({ label = "Memuat halaman..." }: RouteLoadingStateProps) {
  return (
    <div className="bloo-bg flex min-h-screen items-center justify-center px-[16px]">
      <div className="w-full max-w-[420px] rounded-[20px] border border-black/10 bg-white/75 p-[24px] text-center backdrop-blur-[12px]">
        <div className="mx-auto h-[42px] w-[42px] animate-pulse rounded-full bg-[#8798ff]/60" />
        <p className="mt-[14px] font-satoshi text-[16px] tracking-[1px] text-black/70">{label}</p>
      </div>
    </div>
  );
}
