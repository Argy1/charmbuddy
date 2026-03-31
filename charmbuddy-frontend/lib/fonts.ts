import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";

export const fanlste = localFont({
  src: [
    { path: "../public/fonts/fanlste-regular.otf", style: "normal", weight: "400" },
    { path: "../public/fonts/fanlste-italic.otf", style: "italic", weight: "400" },
  ],
  variable: "--font-fanlste",
  display: "swap",
});

export const satoshi = localFont({
  src: [{ path: "../public/fonts/satoshi-var.woff2", style: "normal", weight: "100 900" }],
  variable: "--font-satoshi",
  display: "swap",
});

export const dmsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});
