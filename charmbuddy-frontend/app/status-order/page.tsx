"use client";

import { motion } from "framer-motion";
import { Suspense, useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { resolveApiAsset } from "@/lib/api/asset";
import { getOrderTrackingApi, listOrdersApi } from "@/lib/api/orders";
import type { OrderTrackingPayload } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";
import { formatRupiah } from "@/lib/currency";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import AppImage from "@/components/shared/AppImage";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import RouteLoadingState from "@/components/shared/RouteLoadingState";
import { useRequireAuth } from "@/lib/use-require-auth";

type TimelineStatus = {
  id: string;
  title: string;
  desc: string;
  date: string;
  active: boolean;
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
  return <p className={className}>{formatRupiah(value)}</p>;
}

function ItemCard({ item }: { item: ProductItem }) {
  return (
    <div className="w-full rounded-[10px] bg-white px-[11px] py-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="flex min-h-[65px] items-center gap-[12px]">
        <AppImage alt={item.name} className="h-[65px] w-[111px] rounded-[5px] object-cover" fallbackSrc="/status-order/left-item-thumb.png" height={65} src={item.image} width={111} />
        <div className="flex min-h-[65px] min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-center justify-between gap-[10px] font-satoshi text-[16px] font-bold leading-[normal] tracking-[2px] text-black xl:text-[20px] xl:tracking-[3px]">
            <p className="truncate">{item.name}</p>
            <Money className="" value={item.price} />
          </div>
          <p className="font-satoshi text-[13px] font-medium leading-[normal] tracking-[1.4px] text-[rgba(0,0,0,0.5)] xl:text-[14px] xl:tracking-[2.1px]">
            Quantity: {item.qty}
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ item }: { item: TimelineStatus }) {
  return (
    <div className="flex min-h-[59px] w-full flex-col items-start gap-[8px] text-left sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center">
        <div className={`grid h-[40px] w-[40px] place-items-center rounded-[50px] ${item.active ? "bg-white p-[5px]" : "border border-black/25 bg-white/50"}`}>
          {item.active ? (
            <AppImage alt="Completed status" className="h-[30px] w-[30px]" height={30} src="/status-order/timeline-check-b.svg" width={30} />
          ) : (
            <span className="h-[14px] w-[14px] rounded-full border border-black/45 bg-transparent" />
          )}
        </div>
        <div className="ml-[20px]">
          <p className={`font-satoshi text-[20px] font-bold leading-[normal] xl:text-[24px] ${item.active ? "text-black" : "text-black/45"}`}>{item.title}</p>
          <p className="font-satoshi text-[16px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[20px]">{item.desc}</p>
        </div>
      </div>
      <p className={`pl-[60px] font-satoshi text-[16px] font-medium leading-[normal] sm:pl-0 xl:text-[20px] ${item.active ? "text-black" : "text-[rgba(0,0,0,0.35)]"}`}>{item.active ? item.date : "-"}</p>
    </div>
  );
}

function LeftCard({
  items,
  timelineData,
  transactionId,
  orderDate,
  total,
}: {
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
            <p className="font-satoshi text-[24px] font-bold leading-[normal] text-black xl:text-[32px]">Transaction ID - {transactionId}</p>
            <div className="mt-[8px] space-y-[4px] font-satoshi text-[16px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[20px]">
              <p>{orderDate}</p>
              <p>{items[0]?.name ?? "Item"}</p>
              <p>Qty - {items[0]?.qty ?? 1}</p>
            </div>
          </div>
          <Money className="font-satoshi text-[24px] font-bold leading-[normal] text-black xl:text-[32px]" value={total} />
        </div>

        <div className="mt-[18px] space-y-[16px]">
          {items.map((item) => (
            <ItemCard item={item} key={item.id} />
          ))}
        </div>

        <p className="mt-[18px] font-satoshi text-[13px] text-black/55">Menampilkan item aktual dari transaksi.</p>

        <div className="mt-[39px]">
          <AppImage alt="Line" className="h-[2.012430975181587px] w-full" height={2} src="/status-order/timeline-line-top.svg" width={500} />
          <div className="mt-[15px] flex items-center">
            <AppImage alt="Checklist" className="h-[50px] w-[50px]" height={50} src="/status-order/timeline-check-header.svg" width={50} />
            <p className="ml-[12px] font-satoshi text-[20px] font-bold leading-[normal] text-black xl:text-[24px]">Delivery Progress</p>
          </div>

          <div className="relative mt-[15px] min-h-[527px]">
            <AppImage alt="Timeline" className="absolute left-[22px] top-[10px] hidden h-[452.00027604809657px] w-[1.9357614184264094px] sm:block" height={452} src="/status-order/timeline-line-vertical.svg" width={2} />
            <div className="flex h-full flex-col justify-between">
              {timelineData.map((status) => (
                <TimelineItem item={status} key={status.id} />
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
    <section className="w-full max-w-[658px] rounded-[20px] border border-black bg-[rgba(255,255,255,0.5)] backdrop-blur-[14.7px]">
      <div className="mx-auto mt-[28px] w-full max-w-[564px] px-[16px] pb-[24px] xl:mt-[35px] xl:px-0">
        <div className="flex min-h-[50px] items-center justify-between">
          <p className="font-satoshi text-[24px] font-bold leading-[normal] text-black xl:text-[32px]">{routeInfo.from}</p>
          <AppImage alt="Route" className="h-[50px] w-[50px]" height={50} src="/status-order/route-arrow.svg" width={50} />
          <p className="font-satoshi text-[24px] font-bold leading-[normal] text-black xl:text-[32px]">{routeInfo.to}</p>
        </div>

        <div className="mt-[20px] flex min-h-[89px] flex-col justify-between gap-[12px] sm:flex-row xl:mt-[26px]">
          <div className="max-w-[313px] space-y-[5px] font-satoshi text-[16px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[20px]">
            <p>{routeInfo.packageInfo}</p>
            <p>{routeInfo.category}</p>
            <div className="flex items-center gap-[5px]">
              <p>{routeInfo.courier}</p>
              <AppImage alt="Clock" className="h-[24px] w-[24px]" height={24} src="/status-order/clock-icon.svg" width={24} />
              <p>{routeInfo.eta}</p>
            </div>
          </div>
          <Money className="self-end font-satoshi text-[24px] font-bold leading-[normal] text-black xl:text-[32px]" value={routeInfo.total} />
        </div>
      </div>
    </section>
  );
}

function OrderDetailsCard({
  orderId,
  total,
  orderProgressStep,
}: {
  orderId: string;
  total: number;
  orderProgressStep: number;
}) {
  const progressLabels = ["Accepted", "Order Picked Up", "Delivered"];

  return (
    <section className="w-full max-w-[658px] rounded-[20px] border border-black bg-[rgba(255,255,255,0.5)] backdrop-blur-[14.7px] xl:min-h-[400px]">
      <div className="mx-auto mt-[30px] w-full max-w-[622px] px-[16px] pb-[24px] xl:px-0">
        <div className="min-h-[95px] max-w-[260px]">
          <p className="font-satoshi text-[24px] font-bold leading-[normal] text-black xl:text-[32px]">Order Details</p>
          <p className="mt-[10px] font-satoshi text-[18px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:mt-[20px] xl:text-[24px]">Order ID: {orderId}</p>
        </div>

        <div className="mt-[25px] h-[40px] w-full max-w-[586px]">
          <AppImage alt="Progress Line" className="ml-[20px] mt-[20px] h-[1px] w-[calc(100%-40px)]" height={1} src="/status-order/order-details-line.svg" width={546} />
          <div className="relative -mt-[21px] flex w-full items-center justify-between">
            {progressLabels.map((label, idx) => (
              <div className={`${idx === 0 ? "ml-[20px]" : ""} grid h-[40px] w-[40px] place-items-center rounded-full bg-white p-[5px]`} key={label}>
                {idx <= orderProgressStep ? (
                  <AppImage alt={`${label} completed`} className="h-[30px] w-[30px]" height={30} src="/status-order/timeline-check-b.svg" width={30} />
                ) : (
                  <span className="h-[30px] w-[30px] rounded-full border-[2px] border-black bg-white" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[25px] flex h-[32px] w-full items-center justify-between gap-[8px] font-satoshi text-[20px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[24px]">
          {progressLabels.map((label, idx) => (
            <p className={idx <= orderProgressStep ? "text-black" : "text-[rgba(0,0,0,0.5)]"} key={label}>
              {label}
            </p>
          ))}
        </div>

        <div className="mt-[32px] flex h-[32px] w-full items-center justify-between gap-[8px] font-satoshi text-[20px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[24px]">
          <p>Delivery Scheduled</p>
          <p>Payment Expected</p>
        </div>

        <div className="mt-[6px] flex h-[43px] w-full items-center justify-between gap-[8px]">
          <p className="font-satoshi text-[20px] font-medium leading-[normal] text-[rgba(0,0,0,0.5)] xl:text-[24px]">{new Date().toLocaleDateString("id-ID")}</p>
          <Money className="font-satoshi text-[28px] font-bold leading-[normal] text-black xl:text-[32px]" value={total} />
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
      active: step.active,
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

  const orderProgressStep = useMemo(() => {
    const hasSent = timelineData.some((step) => step.id === "sent" && step.active);
    const hasProcessed = timelineData.some((step) => step.id === "processed" && step.active);
    const hasPaid = timelineData.some((step) => step.id === "paid" && step.active);

    if (hasSent) {
      return 2;
    }
    if (hasProcessed) {
      return 1;
    }
    if (hasPaid) {
      return 0;
    }
    return -1;
  }, [timelineData]);

  if (!isAllowed) {
    return <RouteLoadingState label="Memuat status pesanan..." />;
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
              timelineData={timelineData}
              total={trackingData.order.total}
              transactionId={trackingData.order.order_number}
            />
          )}

          <motion.div className="flex w-full max-w-[658px] flex-col gap-[24px] xl:gap-[41px]" whileHover={{ y: -1 }}>
            <ShippingCard routeInfo={routeInfo} />
            <OrderDetailsCard
              orderId={trackingData?.order.order_number ?? "-"}
              orderProgressStep={orderProgressStep}
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
    <Suspense fallback={<RouteLoadingState label="Memuat status pesanan..." />}>
      <StatusOrderPageContent />
    </Suspense>
  );
}
