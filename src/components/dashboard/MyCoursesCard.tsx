'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
} from '@/components/icons';
import { COMPANY_INFO } from '@/lib/constants';
import { api, getStoredToken, type ShopifyOrderResponse } from '@/lib/api';

export interface OrderItem {
  id: string;
  orderId: string;
  title: string;
  courseType: string;
  date: string;
  /** Shopify account order URL (opens in new tab for View Details) */
  orderUrl?: string;
}

const ITEMS_PER_PAGE = 10;

function extractNumericId(input?: string | null): string | null {
  const raw = String(input ?? '');
  if (!raw) return null;
  const gidMatch = raw.match(/gid:\/\/shopify\/\w+\/(\d+)/i);
  if (gidMatch?.[1]) return gidMatch[1];
  const digits = raw.match(/^(\d+)$/);
  return digits?.[1] ?? null;
}

function formatOrderId(order: ShopifyOrderResponse): string {
  const shopifyName = order.orderData?.name;
  if (shopifyName) return shopifyName.startsWith('#') ? shopifyName : `#${shopifyName}`;
  return order.shopifyOrderNumber ? `#${order.shopifyOrderNumber}` : `#${order.shopifyOrderId}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return iso;
  }
}

function shopifyOrderToOrderItem(order: ShopifyOrderResponse, shopId?: string | null): OrderItem {
  const lineItem = order.orderData?.lineItems?.edges?.[0]?.node;
  const product = lineItem?.variant?.product;
  const courseType =
    product?.productType ??
    order.shopifyProductType ??
    order.courseId?.productType ??
    'Learning';
  const orderIdForUrl =
    extractNumericId(order.orderData?.id) ?? extractNumericId(order.shopifyOrderId) ?? order.shopifyOrderId;
  const orderDate = order.orderData?.createdAt ?? order.enrolledAt;
  return {
    id: order._id,
    orderId: formatOrderId(order),
    title: lineItem?.title ?? product?.title ?? order.courseId?.title ?? 'Course',
    courseType,
    date: formatDate(orderDate),
    orderUrl: COMPANY_INFO.marketplaceOrderUrl(orderIdForUrl, shopId),
  };
}

interface MyCoursesCardProps {
  /** Override orders (e.g. for tests/mock); when set, no API fetch */
  orders?: OrderItem[] | null;
  itemsPerPage?: number;
}

export function MyCoursesCard({
  orders: ordersProp,
  itemsPerPage = ITEMS_PER_PAGE,
}: MyCoursesCardProps) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ordersProp != null) {
      setOrders(Array.isArray(ordersProp) ? ordersProp : []);
      setLoading(false);
      setError(null);
      return;
    }
    const token = getStoredToken();
    if (!token) {
      setOrders([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.orders
      .list()
      .then(async (data) => {
        const me = await api.auth.me().catch(() => null);
        const shopId = me?.shopifyShopId ?? null;
        if (!cancelled) {
          setOrders((data || []).map((item) => shopifyOrderToOrderItem(item, shopId)));
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load orders');
          setOrders([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ordersProp]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const noAuth = ordersProp == null && !getStoredToken() && !loading;
  const empty = !loading && !error && orders.length === 0;

  return (
    <Card className="overflow-hidden border border-gray-200 p-0">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5 text-black" />
          <h2 className="font-poppins text-xl font-bold text-[#00263d]">My Orders</h2>
        </div>
        {!noAuth && !empty && (
          <span className="text-sm text-gray-500">
            Displaying {itemsPerPage} Items per Page
          </span>
        )}
      </div>

      {loading && (
        <div className="px-6 py-12 text-center text-gray-500">Loading orders…</div>
      )}

      {error && (
        <div className="px-6 py-8 text-center text-red-600">
          {error}
          <br />
          <a
            href={COMPANY_INFO.marketplaceUrl}
            className="mt-2 inline-block text-sm text-[#54bd01] hover:underline"
          >
            Open Marketplace
          </a>
        </div>
      )}

      {noAuth && !loading && (
        <div className="px-6 py-12 text-center text-gray-600">
          Sign in via Shopify to see your orders.
          <br />
          <a
            href={COMPANY_INFO.marketplaceUrl}
            className="mt-2 inline-block text-[#54bd01] hover:underline"
          >
            Go to Marketplace
          </a>
        </div>
      )}

      {!loading && !error && !noAuth && empty && (
        <div className="px-6 py-12 text-center text-gray-500">No orders yet.</div>
      )}

      {!loading && !error && (orders.length > 0 || ordersProp != null) && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Course Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Course Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                    Order Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">{item.orderId}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-800">{item.title}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.courseType}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{item.date}</td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={item.orderUrl ?? COMPANY_INFO.marketplaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#54bd01] transition-colors hover:text-[#54bd01]/80"
                      >
                        View Details
                        <ArrowRightIcon className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-center gap-2 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-[#54bd01] text-white'
                      : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
