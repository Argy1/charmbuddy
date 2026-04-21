import type { MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AppImage from "@/components/shared/AppImage";

type PaymentMethodModalProps = {
  open?: boolean;
  asPage?: boolean;
  onDone?: () => void;
  onBrowse?: () => void;
  onOverlayClick?: () => void;
  selectedFileName?: string;
  isUploading?: boolean;
  errorMessage?: string;
};

function UploadFeedback({ selectedFileName, errorMessage, className = "" }: { selectedFileName?: string; errorMessage?: string; className?: string }) {
  if (!selectedFileName && !errorMessage) {
    return null;
  }

  return (
    <div className={`rounded-[10px] border bg-white/80 px-[10px] py-[8px] ${className}`}>
      {selectedFileName ? <p className="font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] text-green-700">File siap diupload: {selectedFileName}</p> : null}
      {errorMessage ? <p className="font-[var(--font-satoshi)] text-[12px] tracking-[0.8px] text-red-600">{errorMessage}</p> : null}
    </div>
  );
}

function PaymentRow() {
  return (
    <div className="flex h-[65px] w-[353px] items-center justify-between">
      <AppImage alt="Transfer Bank" className="h-[65px] w-[111px] rounded-[5px] object-cover" height={65} src="/payment-method/thumbnail.png" width={111} />
      <p className="w-[132px] font-[var(--font-satoshi)] text-[16px] font-bold leading-[normal] tracking-[2.4px] text-black">Transfer Bank</p>
      <div className="flex h-[20px] w-[20px] items-center justify-between rounded-[15px] border border-black p-[6px]">
        <AppImage alt="Selected" className="h-[10px] w-[10px]" height={10} src="/payment-method/radio-dot.svg" width={10} />
      </div>
    </div>
  );
}

function InstructionLeft() {
  return (
    <ol className="w-full list-decimal whitespace-pre-wrap pl-[30px] font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black md:w-[353px]">
      <li>
        Silakan transfer ke rekening <span className="font-black">[Bank]</span> <span className="font-black">[Nomor Rekening]</span> a.n <span className="font-black">[Nama]</span>.
      </li>
      <li>Upload bukti pembayaranmu di sini.</li>
    </ol>
  );
}

function InstructionRight() {
  return (
    <ol className="w-full list-decimal whitespace-pre-wrap pl-[30px] font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-black md:w-[349px]" start={3}>
      <li>
        Pastikan bukti ter-upload, lalu klik &quot;<span className="font-black">Done</span>&quot; agar pesanan segera diproses.
      </li>
    </ol>
  );
}

function UploadBox({ onBrowse, selectedFileName }: { onBrowse?: () => void; selectedFileName?: string }) {
  return (
    <div className="flex h-[250px] w-[250px] items-center justify-between bg-[#d9d9d9] px-[91px] py-[22px]">
      <div className="flex w-[121px] flex-col items-start gap-[34px]">
        <div className="flex h-[61px] w-full flex-col items-center gap-[10px]">
          <AppImage alt="Camera" className="h-[24px] w-[24px]" height={24} src="/payment-method/camera.svg" width={24} />
          <p className="w-full text-center font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-[rgba(0,0,0,0.5)]">{selectedFileName ? "Selected" : "Drop Here"}</p>
        </div>
        <button className="flex h-[43px] w-full items-center justify-center rounded-[50px] bg-black px-[16px] py-[8px]" onClick={onBrowse} type="button">
          <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-white">Browse</p>
        </button>
      </div>
    </div>
  );
}

export default function PaymentMethodModal({ open = true, asPage = false, onDone, onBrowse, onOverlayClick, selectedFileName, isUploading = false, errorMessage }: PaymentMethodModalProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!open) {
    return null;
  }

  const handleOverlayClick = () => {
    onOverlayClick?.();
  };

  const stopPropagation = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const overlayClassName = asPage
    ? "relative z-[10] w-full"
    : "fixed inset-0 z-[100] bg-[rgba(82,82,82,0.6)] backdrop-blur-[2px]";

  const containerClassName = asPage
    ? "mx-auto flex w-full max-w-[1440px] items-center justify-center px-[16px] py-[24px] md:px-[24px] xl:px-[53px]"
    : "flex min-h-screen items-center justify-center p-[16px]";

  return (
    <AnimatePresence>
      <motion.div animate={{ opacity: 1 }} className={overlayClassName} exit={{ opacity: 0 }} initial={{ opacity: 0 }} onClick={asPage ? undefined : handleOverlayClick}>
        <div className={containerClassName}>
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            className="relative w-[min(900px,92vw)] rounded-[20px] bg-white"
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.94, y: prefersReducedMotion ? 0 : 20, filter: prefersReducedMotion ? "blur(0px)" : "blur(4px)" }}
            onClick={stopPropagation}
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(149, 178, 254, 0.5) 0%, rgba(149, 178, 254, 0.5) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)",
            }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.55 }}
          >
          <div className="flex flex-col gap-[20px] px-[20px] py-[23px] md:px-[40px] xl:hidden">
            <div className="flex w-full flex-col items-center gap-[10px]">
              <p className="w-full text-center font-[var(--font-fanlste)] text-[24px] font-normal leading-[normal] tracking-[3.6px] text-black">Payment Method</p>
              <AppImage alt="" className="h-[1.565px] w-full" height={2} src="/payment-method/divider-line.svg" width={432} />
            </div>

            <PaymentRow />
            <InstructionLeft />
            <UploadBox onBrowse={onBrowse} selectedFileName={selectedFileName} />
            <InstructionRight />

            <motion.button className="flex h-[43px] w-[121px] items-center justify-center rounded-[50px] bg-black px-[16px] py-[8px] disabled:opacity-60" disabled={isUploading} onClick={onDone} type="button" whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}>
              <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-white">{isUploading ? "Uploading..." : "Done"}</p>
            </motion.button>
            <UploadFeedback errorMessage={errorMessage} selectedFileName={selectedFileName} />
          </div>

          <div className="relative hidden h-[650px] w-[900px] xl:block">
            <div className="absolute left-[212px] top-[23px] flex h-[40.565px] w-[432px] flex-col items-center gap-[10px]">
              <p className="w-full text-center font-[var(--font-fanlste)] text-[24px] font-normal leading-[normal] tracking-[3.6px] text-black">Payment Method</p>
              <AppImage alt="" className="h-[1.565px] w-full" height={2} src="/payment-method/divider-line.svg" width={432} />
            </div>

            <div className="absolute left-[75px] top-[97.5px]">
              <PaymentRow />
            </div>

            <div className="absolute left-[75px] top-[196px] h-[428px] w-[774px]">
              <div className="absolute left-0 top-0 w-[353px]">
                <InstructionLeft />
              </div>
              <div className="absolute left-[425px] top-0 w-[349px]">
                <InstructionRight />
              </div>
              <motion.button className="absolute left-[425px] top-[135px] flex h-[43px] w-[121px] items-center justify-center rounded-[50px] bg-black px-[16px] py-[8px] disabled:opacity-60" disabled={isUploading} onClick={onDone} type="button" whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.04 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}>
                <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] tracking-[3px] text-white">{isUploading ? "Uploading..." : "Done"}</p>
              </motion.button>
              <div className="absolute left-0 top-[178px]">
                <UploadBox onBrowse={onBrowse} selectedFileName={selectedFileName} />
              </div>
              <UploadFeedback className="absolute left-[425px] top-[190px] w-[310px] border-black/15" errorMessage={errorMessage} selectedFileName={selectedFileName} />
            </div>
          </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
