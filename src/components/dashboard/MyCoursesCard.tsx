'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import {
  BriefcaseIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
} from '@/components/icons';

const SHOPIFY_ORDER_URL =
  'https://shopify.com/77453132000/account/orders/6570013327584';

export interface OrderItem {
  id: string;
  orderId: string;
  title: string;
  progress: string;
  date: string;
  /** Shopify account order URL (opens in new tab for View Details) */
  orderUrl?: string;
}

const ITEMS_PER_PAGE = 10;

const mockOrders: OrderItem[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  orderId: '#12743',
  title: 'Lorem ipsum is simply dummy text of the printing',
  progress: ['Certificate', 'Micro-Learning Bytes', 'Introduction'][i % 3],
  date: '12/10/2024',
  orderUrl: SHOPIFY_ORDER_URL,
}));

interface MyCoursesCardProps {
  orders?: OrderItem[];
  itemsPerPage?: number;
}

export function MyCoursesCard({
  orders = mockOrders,
  itemsPerPage = ITEMS_PER_PAGE,
}: MyCoursesCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(orders.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="overflow-hidden border border-gray-200 p-0">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="h-5 w-5 text-black" />

          <h2 className="font-poppins text-xl font-bold text-[#00263d]">My Orders</h2>
        </div>
        <span className="text-sm text-gray-500">Displaying {itemsPerPage} Items per Page</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Course Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Course Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">Order Detail</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-4 text-sm text-gray-800">{item.orderId}</td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-800">{item.title}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">{item.progress}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{item.date}</td>
                <td className="px-6 py-4 text-right">
                  <a
                    href={item.orderUrl ?? SHOPIFY_ORDER_URL}
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
    </Card>
  );
}
