"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Suspense, useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { resolveApiAsset } from "@/lib/api/asset";
import { getOrderTrackingApi, listOrdersApi } from "@/lib/api/orders";
import type { OrderTrackingPayload } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { useRequireAuth } from "@/lib/use-require-auth";

type TimelineStatus = {
  id: string;
  title: string;
  desc: string;
  date: string;
};

type ProductItem = {
  id: string;
  name: string;
  type: string;
  color: string;
  qty: number;
  price: number;
  image: string;
};

type RouteInfo = {
  from: string;
  to: string;
  packageInfo: string;
  category: string;
  courier: string;
  eta: string;
  total: number;
};

function Money({ value, className }: { value: number; className: string }) {
  return <p className={className}>${value.toFixed(2)}</p>;
}

function ItemCard({ item }: { item: ProductItem }) {
  return (
    <div className="w-full rounded-[10px] bg-white px-[11px] py-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="flex min-h-[65px] items-center gap-[12px]">
        <AppImage alt={item.name} className="h-[65px] w-[111px] rounded-[5px] object-cover" fallbackSrc="/status-order/left-item-thumb.png" height={65} src={item.image} width={111} />
        <div className="flex min-h-[65px] min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-center justify-between gap-[10px] font-[var(--font-satoshi)] text-[16px] font-bold leading-[normal] tracking-[2px] text-black xl:text-[20px] xl:tracking-[3px]">
            <p className="truncate">{item.name}</p>
            <Money className="" value={item.price} />
          </div>
          <p className="font-[var(--font-satoshi)] text-[13px] font-medium leading-[normal] tracking-[1.4px] text-[rgba(0,0,0,0.5)] xl:text-[14px] xl:tracking-[2.1px]">
            Quantity: {item.qty}
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ item, active, onClick }: { item: TimelineStatus; active: boolean; onClick: () => void }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button className="flex min-h-[59px] w-full flex-col items-start gap-[8px] text-left sm:flex-row sm:items-center sm:justify-between" onClick={onClick} type="button" whileHover={prefersReducedMotion ? undefined : { x: 4 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}>
      <div className="flex items-center">
        <div className="h-[40px] w-[40px] rounded-[50px] bg-white p-[5px]">
          <AppImage alt="Status" className="h-[30px] w-[30px]" height={30} src="/status-order/timeline-check-b.svg" width={30} />
        </div>
        <div className="ml-[20px]">
          <p className="font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] text-black xl:text-[24px]">{item.title}</p>
          <p className="font-[var(--font-satoshi)] text-[16px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[20px]">{item.desc}</p>
        </div>
      </div>
      <p className={`pl-[60px] font-[var(--font-satoshi)] text-[16px] font-medium leading-[normal] sm:pl-0 xl:text-[20px] ${active ? "text-black" : "text-[rgba(0,0,0,0.5)]"}`}>{item.date}</p>
    </motion.button>
  );
}

function LeftCard({
  timelineStep,
  setTimelineStep,
  items,
  timelineData,
  transactionId,
  orderDate,
  total,
}: {
  timelineStep: number;
  setTimelineStep: (idx: number) => void;
  items: ProductItem[];
  timelineData: TimelineStatus[];
  transactionId: string;
  orderDate: string;
  total: number;
}) {
  return (
    <section className="w-full max-w-[550px] rounded-[20px] border border-black bg-[rgba(255,255,255,0.5)] backdrop-blur-[14.7px] xl:min-h-[1364px]">
      <div className="px-[24px] py-[28px] xl:px-[24px] xl:py-[38px]">
        <div className="flex items-start justify-between">
          <div className="min-h-[139px]">
            <p className="font-[var(--font-satoshi)] text-[24px] font-bold leading-[normal] text-black xl:text-[32px]">Transaction ID - {transactionId}</p>
            <div className="mt-[8px] space-y-[4px] font-[var(--font-satoshi)] text-[16px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[20px]">
              <p>{orderDate}</p>
              <p>{items[0]?.name ?? "Item"}</p>
              <p>Qty - {items[0]?.qty ?? 1}</p>
            </div>
          </div>
          <Money className="font-[var(--font-satoshi)] text-[24px] font-bold leading-[normal] text-black xl:text-[32px]" value={total} />
        </div>

        <div className="mt-[18px] space-y-[16px]">
          {items.map((item) => (
            <ItemCard item={item} key={item.id} />
          ))}
        </div>

        <p className="mt-[18px] font-[var(--font-satoshi)] text-[13px] text-black/55">Menampilkan item aktual dari transaksi.</p>

        <div className="mt-[39px]">
          <AppImage alt="Line" className="h-[2.012430975181587px] w-full" height={2} src="/status-order/timeline-line-top.svg" width={500} />
          <div className="mt-[15px] flex items-center">
            <AppImage alt="Checklist" className="h-[50px] w-[50px]" height={50} src="/status-order/timeline-check-header.svg" width={50} />
            <p className="ml-[12px] font-[var(--font-satoshi)] text-[20px] font-bold leading-[normal] text-black xl:text-[24px]">Delivery Progress</p>
          </div>

          <div className="relative mt-[15px] min-h-[527px]">
            <AppImage alt="Timeline" className="absolute left-[22px] top-[10px] hidden h-[452.00027604809657px] w-[1.9357614184264094px] sm:block" height={452} src="/status-order/timeline-line-vertical.svg" width={2} />
            <div className="flex h-full flex-col justify-between">
              {timelineData.map((status, idx) => (
                <TimelineItem active={idx <= timelineStep} item={status} key={status.id} onClick={() => setTimelineStep(idx)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShippingCard({ routeInfo }: { routeInfo: RouteInfo }) {
  return (
    <section className="w-full max-w-[658px] rounded-[20px] border border-black bg-[rgba(255,255,255,0.5)] backdrop-blur-[14.7px] xl:min-h-[400px]">
      <div className="mx-auto mt-[28px] w-full max-w-[564px] px-[16px] pb-[24px] xl:mt-[35px] xl:px-0">
        <div className="flex min-h-[50px] items-center justify-between">
          <p className="font-[var(--font-satoshi)] text-[24px] font-bold leading-[normal] text-black xl:text-[32px]">{routeInfo.from}</p>
          <AppImage alt="Route" className="h-[50px] w-[50px]" height={50} src="/status-order/route-arrow.svg" width={50} />
          <p className="font-[var(--font-satoshi)] text-[24px] font-bold leading-[normal] text-black xl:text-[32px]">{routeInfo.to}</p>
        </div>

        <div className="mt-[20px] flex min-h-[89px] justify-between gap-[12px] xl:mt-[26px]">
          <div className="max-w-[313px] space-y-[5px] font-[var(--font-satoshi)] text-[16px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[20px]">
            <p>{routeInfo.packageInfo}</p>
            <p>{routeInfo.category}</p>
            <div className="flex items-center gap-[5px]">
              <p>{routeInfo.courier}</p>
              <AppImage alt="Clock" className="h-[24px] w-[24px]" height={24} src="/status-order/clock-icon.svg" width={24} />
              <p>{routeInfo.eta}</p>
            </div>
          </div>
          <Money className="self-end font-[var(--font-satoshi)] text-[24px] font-bold leading-[normal] text-black xl:text-[32px]" value={routeInfo.total} />
        </div>

        <AppImage alt="Map" className="mt-[26px] h-[146px] w-full rounded-[10px] object-cover" height={146} src="/status-order/map-image.png" width={564} />
      </div>
    </section>
  );
}

function OrderDetailsCard({
  orderId,
  total,
  orderProgressStep,
  setOrderProgressStep,
}: {
  orderId: string;
  total: number;
  orderProgressStep: number;
  setOrderProgressStep: (v: number) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="w-full max-w-[658px] rounded-[20px] border border-black bg-[rgba(255,255,255,0.5)] backdrop-blur-[14.7px] xl:min-h-[400px]">
      <div className="mx-auto mt-[30px] w-full max-w-[622px] px-[16px] pb-[24px] xl:px-0">
        <div className="min-h-[95px] max-w-[260px]">
          <p className="font-[var(--font-satoshi)] text-[24px] font-bold leading-[normal] text-black xl:text-[32px]">Order Details</p>
          <p className="mt-[10px] font-[var(--font-satoshi)] text-[18px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:mt-[20px] xl:text-[24px]">Order ID: {orderId}</p>
        </div>

        <div className="mt-[25px] h-[40px] w-full max-w-[586px]">
          <AppImage alt="Progress Line" className="ml-[20px] mt-[20px] h-[1px] w-[calc(100%-40px)]" height={1} src="/status-order/order-details-line.svg" width={546} />
          <div className="relative -mt-[21px] flex w-full items-center justify-between">
            <div className="ml-[20px] h-[40px] w-[40px] rounded-[50px] bg-white p-[5px]">
              <AppImage alt="Done" className="h-[30px] w-[30px]" height={30} src="/status-order/timeline-check-b.svg" width={30} />
            </div>
            <div className="h-[40px] w-[40px] rounded-[50px] bg-white p-[5px]">
              <AppImage alt="Done" className="h-[30px] w-[30px]" height={30} src="/status-order/timeline-check-b.svg" width={30} />
            </div>
            <AppImage alt="Pending" className="h-[30px] w-[30px]" height={30} src="/status-order/order-details-pending-circle.svg" width={30} />
          </div>
        </div>

        <div className="mt-[25px] flex h-[32px] w-full items-center justify-between gap-[8px] font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[24px]">
          {["Accepted", "Order Picked Up", "Delivered"].map((label, idx) => (
            <motion.button className={idx <= orderProgressStep ? "text-black" : "text-[rgba(0,0,0,0.5)]"} key={label} onClick={() => setOrderProgressStep(idx)} type="button" whileHover={prefersReducedMotion ? undefined : { y: -1 }} whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}>
              {label}
            </motion.button>
          ))}
        </div>

        <div className="mt-[32px] flex h-[32px] w-full items-center justify-between gap-[8px] font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[24px]">
          <p>Delivery Scheduled</p>
          <p>Payment Expected</p>
        </div>

        <div className="mt-[6px] flex h-[43px] w-full items-center justify-between gap-[8px]">
          <p className="font-[var(--font-satoshi)] text-[20px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[24px]">{new Date().toLocaleDateString("id-ID")}</p>
          <Money className="font-[var(--font-satoshi)] text-[28px] font-bold leading-[normal] text-black xl:text-[32px]" value={total} />
        </div>
      </div>
    </section>
  );
}

function StatusOrderPageContent() {
  const isAllowed = useRequireAuth();
  const { isAuthResolved, token } = useAuth();
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");

  const [trackingData, setTrackingData] = useState<OrderTrackingPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineStep, setTimelineStep] = useState(0);
  const [orderProgressStep, setOrderProgressStep] = useState(0);

  const mapTimelineToProgress = (step: number) => {
    if (step <= 0) {
      return 0;
    }
    if (step <= 1) {
      return 1;
    }
    return 2;
  };

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }

    let isMounted = true;

    const loadTracking = async () => {
      setIsLoading(true);

      try {
        let selectedOrderId = Number(orderParam);

        if (!selectedOrderId || Number.isNaN(selectedOrderId)) {
          const ordersResponse = await listOrdersApi(token);
          selectedOrderId = ordersResponse.data[0]?.id ?? 0;
        }

        if (!selectedOrderId) {
          if (isMounted) {
            setTrackingData(null);
          }
          return;
        }

        const trackingResponse = await getOrderTrackingApi(token, selectedOrderId);
        if (!isMounted) {
          return;
        }

        setTrackingData(trackingResponse.data);
      } catch {
        if (!isMounted) {
          return;
        }
        setTrackingData(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTracking();

    return () => {
      isMounted = false;
    };
  }, [isAuthResolved, orderParam, token]);

  const baseItems = useMemo<ProductItem[]>(() => {
    if (!trackingData) {
      return [];
    }

    return trackingData.order.items.map((item) => ({
      id: String(item.id),
      name: item.product_name,
      type: "Accessory",
      color: "Silver",
      qty: item.qty,
      price: item.unit_price,
      image: resolveApiAsset(item.image_path, "/status-order/left-item-thumb.png"),
    }));
  }, [trackingData]);

  const timelineData = useMemo<TimelineStatus[]>(() => {
    if (!trackingData) {
      return [];
    }

    const formattedDate = new Date(trackingData.order.updated_at).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

    return trackingData.timeline.map((step) => ({
      id: step.id,
      title: step.title,
      desc: step.desc,
      date: step.at
        ? new Date(step.at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          })
        : formattedDate,
    }));
  }, [trackingData]);

  const routeInfo = useMemo<RouteInfo>(() => {
    if (!trackingData) {
      return {
        from: "Warehouse",
        to: "Destination",
        packageInfo: "-",
        category: "Jewelry & Accessories",
        courier: "JNE",
        eta: "2-3 Days",
        total: 0,
      };
    }

    const order = trackingData.order;
    const cityHint = order.address.split(",")[0] || "Destination";

    return {
      from: "Warehouse",
      to: cityHint,
      packageInfo: new Date(order.created_at).toLocaleString("id-ID"),
      category: order.items[0]?.product_name ?? "Jewelry & Accessories",
      courier: order.shipping_courier,
      eta: order.shipping_eta,
      total: order.total,
    };
  }, [trackingData]);

  useEffect(() => {
    if (!trackingData) {
      return;
    }

    const activeIndex = trackingData.timeline.reduce((lastActive, step, idx) => (step.active ? idx : lastActive), 0);
    setTimelineStep(activeIndex);
    setOrderProgressStep(mapTimelineToProgress(activeIndex));
  }, [trackingData]);

  const handleTimelineStep = (step: number) => {
    setTimelineStep(step);
    setOrderProgressStep(mapTimelineToProgress(step));
  };

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-49.58872670650655deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        heightClass="h-[95vh]"
        minHeightClass="min-h-[980px]"
        noiseUrl="/status-order/bg-noise.png"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-[16px] pb-[56px] pt-[24px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />

        <Reveal className="mt-[24px] grid grid-cols-1 gap-[24px] xl:mt-[40px] xl:grid-cols-[minmax(0,550px)_minmax(0,658px)] xl:items-start xl:justify-center xl:gap-[35px]">
          {isLoading || !trackingData ? (
            <div className="h-[420px] w-full animate-pulse rounded-[20px] border border-black bg-white/60" />
          ) : (
            <LeftCard
              items={baseItems}
              orderDate={new Date(trackingData.order.created_at).toLocaleString("id-ID")}
              setTimelineStep={handleTimelineStep}
              timelineData={timelineData}
              timelineStep={timelineStep}
              total={trackingData.order.total}
              transactionId={trackingData.order.order_number}
            />
          )}

          <motion.div className="flex w-full max-w-[658px] flex-col gap-[24px] xl:gap-[41px]" whileHover={{ y: -1 }}>
            <ShippingCard routeInfo={routeInfo} />
            <OrderDetailsCard
              orderId={trackingData?.order.order_number ?? "-"}
              orderProgressStep={orderProgressStep}
              setOrderProgressStep={setOrderProgressStep}
              total={trackingData?.order.total ?? 0}
            />
          </motion.div>
        </Reveal>
      </div>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}

export default function StatusOrderPage() {
  return (
    <Suspense fallback={null}>
      <StatusOrderPageContent />
    </Suspense>
  );
}
