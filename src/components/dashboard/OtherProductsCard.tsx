import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui';
import { ShoppingCartIcon, ArrowRightIcon } from '@/components/icons';

export function OtherProductsCard() {
  return (
    <Card className="flex flex-col self-start">
      <CardHeader title="Looking for Other Courses?" icon={<ShoppingCartIcon />} />
      <p className="mb-6 text-gray-600">
      Explore more courses on the VECTRA Marketplace to build job-relevant skills across roles. Learn ESG, sustainability, and compliance essentials.
      </p>
      <div className="w-full">
        <Link
          href="https://marketplace.vectra-intl.com/collections/courses"
          className="flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-[#54bd01] px-5 py-2.5 font-medium text-[#54bd01] transition-colors hover:bg-[#54bd01]/5 hover:text-[#54bd01]"
          target="_blank"
          rel="noopener noreferrer"
        >
          View All Courses
          <ArrowRightIcon className="h-5 w-5" />
        </Link>
      </div>
    </Card>
  );
}
