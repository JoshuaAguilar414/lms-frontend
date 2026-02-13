import { MyPurchasesCard, OtherProductsCard } from '@/components/dashboard';

export default function PurchasesPage() {
  return (
    <div className="bg-gray-100">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[7.5fr_2.5fr]">
          <MyPurchasesCard />
          <OtherProductsCard />
        </div>
      </div>
    </div>
  );
}
