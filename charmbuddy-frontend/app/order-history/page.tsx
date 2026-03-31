"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { resolveApiAsset } from "@/lib/api/asset";
import { listOrdersApi } from "@/lib/api/orders";
import type { Order as ApiOrder } from "@/lib/api/types";
import { useAuth } from "@/lib/auth-context";
import AmbientBackdrop from "@/components/motion/AmbientBackdrop";
import Reveal from "@/components/motion/Reveal";
import OrderCard, { type Order } from "@/components/order/OrderCard";
import OrderExpandedDetail from "@/components/order/OrderExpandedDetail";
import OrderHistoryHeader, { type SortKey } from "@/components/order/OrderHistoryHeader";
import Footer from "@/components/shared/Footer";
import HeaderTemplate from "@/components/shared/HeaderTemplate";
import { routes } from "@/lib/routes";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useRouter } from "next/navigation";

const sortCycle: SortKey[] = ["latest", "oldest", "highest_total", "lowest_total", "status"];

const sortLabelMap: Record<SortKey, string> = {
  latest: "Latest",
  oldest: "Oldest",
  highest_total: "Highest Total",
  lowest_total: "Lowest Total",
  status: "Status",
};

const statusLabelMap: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  sent: "Sent",
};

export default function OrderHistoryPage() {
  const isAllowed = useRequireAuth();
  const { isAuthResolved, token } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("latest");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthResolved || !token) {
      return;
    }

    let isMounted = true;

    const loadOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const response = await listOrdersApi(token);
        if (!isMounted) {
          return;
        }

        const mapped = response.data.map(mapOrderToDisplay);
        setOrders(mapped);
        setExpandedOrderId(mapped[0]?.id ?? null);
      } catch {
        if (!isMounted) {
          return;
        }
        setOrders([]);
        setExpandedOrderId(null);
      } finally {
        if (isMounted) {
          setIsLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [isAuthResolved, token]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const inOrder =
        order.transactionId.toLowerCase().includes(query) ||
        order.dateLabel.toLowerCase().includes(query) ||
        order.statusLabel.toLowerCase().includes(query);
      const inItems = order.items.some((item) => item.name.toLowerCase().includes(query));
      return inOrder || inItems;
    });
  }, [orders, search]);

  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];

    if (sortKey === "latest") {
      return list;
    }
    if (sortKey === "oldest") {
      return list.reverse();
    }
    if (sortKey === "highest_total") {
      return list.sort((a, b) => b.total - a.total);
    }
    if (sortKey === "lowest_total") {
      return list.sort((a, b) => a.total - b.total);
    }

    return list.sort((a, b) => a.statusLabel.localeCompare(b.statusLabel));
  }, [filteredOrders, sortKey]);

  const handleSortCycle = () => {
    const currentIndex = sortCycle.indexOf(sortKey);
    const next = sortCycle[(currentIndex + 1) % sortCycle.length];
    setSortKey(next);
  };

  const handleToggle = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (!isAllowed) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AmbientBackdrop
        gradientStyle={{ backgroundImage: "linear-gradient(-46.8679473deg, rgb(135, 152, 255) 35.494%, rgb(165, 186, 255) 67.878%)" }}
        heightClass="h-[95vh]"
        minHeightClass="min-h-[980px]"
        noiseUrl="/order-history/bg-noise.png"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-[16px] pb-[56px] pt-[24px] md:px-[24px] xl:px-[53px]">
        <HeaderTemplate />

        <Reveal className="mx-auto mt-[24px] w-full max-w-[1296px] xl:mt-[50px]">
          <OrderHistoryHeader
            onSearchChange={setSearch}
            onSortCycle={handleSortCycle}
            search={search}
            sortKey={sortKey}
            sortLabel={sortLabelMap[sortKey]}
          />
        </Reveal>

        <div className="mx-auto mt-[24px] flex w-full max-w-[1296px] flex-col gap-[24px] xl:mt-[40px]">
          {isLoadingOrders ? (
            <div className="h-[180px] w-full animate-pulse rounded-[50px] bg-white/70" />
          ) : null}

          <AnimatePresence initial={false} mode="popLayout">
            {sortedOrders.map((order) => {
              const expanded = expandedOrderId === order.id;
              return (
                <motion.div className="flex flex-col gap-[24px]" key={order.id} layout>
                  <OrderCard
                    expanded={expanded}
                    onToggle={() => handleToggle(order.id)}
                    onTrackOrder={() => void router.push(`${routes.statusOrder}?order=${order.id}`)}
                    order={order}
                  />
                  <OrderExpandedDetail
                    expanded={expanded}
                    onToggle={() => handleToggle(order.id)}
                    onTrackOrder={() => void router.push(`${routes.statusOrder}?order=${order.id}`)}
                    order={order}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}

function mapOrderToDisplay(order: ApiOrder): Order {
  return {
    id: String(order.id),
    transactionId: order.order_number,
    dateLabel: new Date(order.created_at).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    statusLabel: statusLabelMap[order.status] ?? order.status,
    total: order.total,
    items: order.items.map((item) => ({
      id: String(item.id),
      productId: String(item.product_id ?? ""),
      name: item.product_name,
      type: "Accessory",
      color: "Silver",
      qty: item.qty,
      unitPrice: item.unit_price,
      image: resolveApiAsset(item.image_path, "/order-history/product-image.png"),
    })),
  };
}
