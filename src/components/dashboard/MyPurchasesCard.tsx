'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui';
import {
  ShoppingCartIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BriefcaseIcon,
} from '@/components/icons';

const MARKETPLACE_PRODUCT_URL =
  'https://marketplace.vectra-intl.com/products/how-to-report-forced-labor-in-agriculture';

export interface PurchaseItem {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  status: string;
  /** Product page URL on marketplace (opens in same tab for View Details) */
  productUrl?: string;
}

const placeholderImage =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=112&h=112&fit=crop';

const ITEMS_PER_PAGE = 10;

const mockPurchases: PurchaseItem[] = Array.from({ length: 25 }, (_, i) => ({
  id: String(i + 1),
  title: 'Lorem Ipsum is simply dummy text of the printing',
  thumbnail: placeholderImage,
  author: 'VECTRA International',
  status: 'Complete',
  productUrl: MARKETPLACE_PRODUCT_URL,
}));

interface MyPurchasesCardProps {
  purchases?: PurchaseItem[];
  itemsPerPage?: number;
}

export function MyPurchasesCard({
  purchases = mockPurchases,
  itemsPerPage = ITEMS_PER_PAGE,
}: MyPurchasesCardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(purchases.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = purchases.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Card className="overflow-hidden border border-gray-200 p-0">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-5 w-5 text-black" />

          <h2 className="font-poppins text-xl font-bold text-[#00263d]">My Courses</h2>
        </div>
        <span className="text-sm text-gray-500">Displaying {itemsPerPage} Items per Page</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Course Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Author</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Course Detail
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedPurchases.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-[50px] w-[50px] flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="50px"
                      />
                    </div>
                    <span className="text-sm font-medium text-[#00263d]">{item.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex rounded-full bg-[#54bd01] px-3 py-1 text-xs font-medium text-white">
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#00263d]">{item.author}</td>
                <td className="px-6 py-4">
                  <a
                    href={item.productUrl ?? MARKETPLACE_PRODUCT_URL}
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
