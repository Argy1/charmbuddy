"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useParams } from "next/navigation";

import InteractivePress from "@/components/motion/InteractivePress";
import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { resolveApiAsset } from "@/lib/api/asset";
import { useProduct } from "@/lib/api/hooks";
import { useCart } from "@/lib/cart-context";
import { routes } from "@/lib/routes";

export default function ProductDetailPage() {
  const prefersReducedMotion = useReducedMotion();
  const params = useParams<{ slug?: string | string[] }>();
  const slug = params?.slug;
  const resolvedSlug = Array.isArray(slug) ? slug[0] : slug ?? "diamond-necklace";
  const { product, isLoading } = useProduct(resolvedSlug);
  const { addItem } = useCart();

  return (
    <div className="bloo-bg min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[24px] px-[16px] pb-[48px] pt-[24px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />

        <Reveal>
          <section className="rounded-[20px] border border-black bg-[rgba(255,255,255,0.5)] p-[24px] backdrop-blur-[14.7px]">
          {isLoading || !product ? (
            <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[500px_1fr]">
              <div className="h-[500px] w-full animate-pulse rounded-[20px] bg-white/60" />
              <div className="space-y-[16px]">
                <div className="h-[42px] w-[220px] animate-pulse rounded-[10px] bg-white/60" />
                <div className="h-[32px] w-[140px] animate-pulse rounded-[10px] bg-white/60" />
                <div className="h-[120px] w-full animate-pulse rounded-[10px] bg-white/60" />
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-[24px] lg:grid-cols-[500px_1fr]">
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="overflow-hidden rounded-[20px]"
              initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.92, y: prefersReducedMotion ? 0 : 20 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.8 }}
            >
              <AppImage
                alt={product.name}
                className="h-[500px] w-full rounded-[20px] object-cover"
                height={500}
                src={resolveApiAsset(product.image_path, "/catalogue/product-image.png")}
                width={500}
              />
            </motion.div>

            <div className="flex flex-col gap-[20px]">
              <h1 className="page-title">{product.name}</h1>
              <p className="section-title">${product.price}</p>
              <p className="body-lead max-w-[620px] text-[rgba(0,0,0,0.6)]">{product.description}</p>

              <div className="mt-[8px] flex items-center gap-[16px]">
                <InteractivePress>
                  <button
                    className="rounded-[50px] border border-black bg-black px-[24px] py-[10px] font-[var(--font-satoshi)] text-[20px] tracking-[3px] text-white"
                    onClick={() =>
                      addItem({
                        id: String(product.id),
                        image: resolveApiAsset(product.image_path, "/catalogue/product-image.png"),
                        name: product.name,
                        price: product.price,
                        productId: product.id,
                        slug: resolvedSlug,
                      })
                    }
                    type="button"
                  >
                    Add to Cart
                  </button>
                </InteractivePress>
                <InteractivePress>
                  <Link className="rounded-[50px] border border-black bg-white px-[24px] py-[10px] font-[var(--font-satoshi)] text-[20px] tracking-[3px] text-black" href={routes.cart}>
                    Go to Cart
                  </Link>
                </InteractivePress>
              </div>
            </div>
          </div>
          )}
        </section>
        </Reveal>

        <Footer />
      </div>
    </div>
  );
}
