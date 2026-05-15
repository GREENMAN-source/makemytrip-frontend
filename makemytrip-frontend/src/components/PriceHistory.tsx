import { Lock, TrendingUp } from "lucide-react";
import { buildPriceHistory, calculateDynamicPrice } from "@/lib/travel";

export default function PriceHistory({
  basePrice,
  frozenPrice,
  onFreeze,
}: {
  basePrice: number;
  frozenPrice?: number | null;
  onFreeze: (price: number) => void;
}) {
  const history = buildPriceHistory(basePrice);
  const currentPrice = calculateDynamicPrice(basePrice);
  const maxPrice = Math.max(...history.map((item) => item.price), currentPrice, 1);

  return (
    <section className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
            <TrendingUp size={20} className="text-blue-600" />
            Dynamic Pricing
          </h3>
          <p className="mt-1 text-sm text-gray-500">Prices update by demand and peak-season rules.</p>
        </div>
        <button
          onClick={() => onFreeze(currentPrice)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Lock size={16} />
          {frozenPrice ? `Frozen Rs. ${frozenPrice}` : "Freeze price"}
        </button>
      </div>

      <div className="flex h-28 items-end gap-2 rounded-lg bg-gray-50 p-3 sm:h-32">
        {history.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t bg-blue-500"
              style={{ height: `${Math.max(16, (item.price / maxPrice) * 100)}%` }}
              title={`Rs. ${item.price}`}
            />
            <span className="text-[10px] font-bold text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-700">
        Live price: <span className="text-blue-600">Rs. {currentPrice}</span>
      </p>
    </section>
  );
}
