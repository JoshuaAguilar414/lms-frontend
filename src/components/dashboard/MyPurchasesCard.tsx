'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui';
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BriefcaseIcon,
} from '@/components/icons';
import { COMPANY_INFO } from '@/lib/constants';
import { api, getStoredToken, type EnrollmentResponse } from '@/lib/api';

export interface PurchaseItem {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  status: string;
  /** Course or product detail URL */
  productUrl?: string;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=112&h=112&fit=crop';
const ITEMS_PER_PAGE = 10;

function enrollmentToPurchaseItem(e: EnrollmentResponse): PurchaseItem {
  const course = e.courseId;
  const progress = e.progress;
  const status = progress?.completed ? 'Complete' : 'In progress';
  const productUrl = course?.handle
    ? COMPANY_INFO.marketplaceProductUrl(course.handle)
    : `/courses/${course?._id ?? e._id}`;
  return {
    id: e._id,
    title: course?.title ?? 'Course',
    thumbnail: course?.thumbnail ?? PLACEHOLDER_IMAGE,
    author: COMPANY_INFO.name,
    status,
    productUrl,
  };
}

interface MyPurchasesCardProps {
  purchases?: PurchaseItem[] | null;
  itemsPerPage?: number;
}

export function MyPurchasesCard({
  purchases: purchasesProp,
  itemsPerPage = ITEMS_PER_PAGE,
}: MyPurchasesCardProps) {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (purchasesProp != null) {
      setPurchases(Array.isArray(purchasesProp) ? purchasesProp : []);
      setLoading(false);
      setError(null);
      return;
    }
    const token = getStoredToken();
    if (!token) {
      setPurchases([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.enrollments
      .list()
      .then((data) => {
        if (!cancelled) {
          setPurchases((data || []).map(enrollmentToPurchaseItem));
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load purchases');
          setPurchases([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [purchasesProp]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(purchases.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = purchases.slice(startIndex, startIndex + itemsPerPage);

  const noAuth = purchasesProp == null && !getStoredToken() && !loading;
  const empty = !loading && !error && purchases.length === 0;

  return (
    <Card className="overflow-hidden border border-gray-200 p-0">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-5 w-5 text-black" />
          <h2 className="font-poppins text-xl font-bold text-[#00263d]">My Courses</h2>
        </div>
        {!noAuth && !empty && (
          <span className="text-sm text-gray-500">Displaying {itemsPerPage} Items per Page</span>
        )}
      </div>

      {loading && (
        <div className="px-6 py-12 text-center text-gray-500">Loading…</div>
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
          Sign in via Shopify to see your courses.
          <br />
          <a
            href={COMPANY_INFO.marketplaceUrl}
            className="mt-2 inline-block text-[#54bd01] hover:underline"
          >
            Go to Marketplace
          </a>
        </div>
      )}

      {!loading && !error && empty && !noAuth && (
        <div className="px-6 py-12 text-center text-gray-500">No purchases yet.</div>
      )}

      {!loading && !error && purchases.length > 0 && (
        <>
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
                      {item.productUrl?.startsWith('http') ? (
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#54bd01] transition-colors hover:text-[#54bd01]/80"
                        >
                          View Details
                          <ArrowRightIcon className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link
                          href={item.productUrl ?? '/courses'}
                          className="inline-flex items-center gap-1 text-sm font-medium text-[#54bd01] transition-colors hover:text-[#54bd01]/80"
                        >
                          View Details
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      )}
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
