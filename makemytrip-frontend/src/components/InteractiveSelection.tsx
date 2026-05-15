import { useEffect, useState } from "react";
import { BedDouble, CheckCircle2, Eye, Plane } from "lucide-react";
import { getStoredPreference, saveStoredPreference } from "@/lib/travel";

export default function InteractiveSelection({
  type = "HOTEL",
  onConfirm,
}: {
  type: "HOTEL" | "FLIGHT";
  onConfirm: (selectionId: string, extraPrice: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [extraPrice, setExtraPrice] = useState(0);

  const rooms = [
    {
      id: "Standard Room",
      price: 0,
      preview: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
      desc: "Cozy city-view room with essential amenities.",
    },
    {
      id: "Deluxe View Room",
      price: 2500,
      preview: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
      desc: "Larger room with premium view and lounge space.",
    },
    {
      id: "Executive Suite",
      price: 5200,
      preview: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
      desc: "Suite upgrade with workspace, dining corner, and priority service.",
    },
  ];

  const rows = [1, 2, 3, 4, 5];
  const cols = ["A", "B", "C", "D"];
  const premiumSeats = ["1A", "1B", "1C", "1D", "2A", "2D"];
  const unavailableSeats = ["3B", "4C", "5A"];

  useEffect(() => {
    const savedPreference = getStoredPreference(type);
    if (savedPreference) {
      setSelected(savedPreference);
    }
  }, [type]);

  const chooseSelection = (id: string, price: number) => {
    setSelected(id);
    setExtraPrice(price);
    saveStoredPreference(type, id);
    onConfirm(id, price);
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
            {type === "HOTEL" ? <BedDouble className="text-blue-600" /> : <Plane className="text-blue-600" />}
            {type === "HOTEL" ? "Room Selection" : "Seat Selection"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {type === "HOTEL"
              ? "Choose a room type with preview images and upgrade pricing."
              : "Select seats from a live map. Premium seats include extra legroom."}
          </p>
        </div>
        {selected && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">{selected}</span>}
      </div>

      {type === "HOTEL" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => chooseSelection(room.id, room.price)}
              className={`overflow-hidden rounded-lg border-2 text-left transition-all ${
                selected === room.id ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"
              }`}
            >
              <img src={room.preview} alt={room.id} className="h-32 w-full object-cover" />
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="font-bold text-gray-900">{room.id}</p>
                  {selected === room.id && <CheckCircle2 className="text-blue-600" size={18} />}
                </div>
                <p className="text-sm text-gray-500">{room.desc}</p>
                <p className="mt-3 flex items-center gap-2 text-sm font-bold text-blue-600">
                  <Eye size={16} />
                  {room.price === 0 ? "Included" : `+ Rs. ${room.price}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {type === "FLIGHT" && (
        <div className="overflow-x-auto rounded-lg bg-gray-50 p-4 sm:p-5">
          <div className="mx-auto mb-5 h-2 w-36 rounded-full bg-gray-300" />
          <div className="min-w-[260px] space-y-3">
            {rows.map((row) => (
              <div key={row} className="flex justify-center gap-3">
                {cols.map((col, colIndex) => {
                  const seatId = `${row}${col}`;
                  const isPremium = premiumSeats.includes(seatId);
                  const unavailable = unavailableSeats.includes(seatId);
                  const price = isPremium ? 750 : 0;

                  return (
                    <div key={seatId} className="flex items-center">
                      {colIndex === 2 && <div className="w-8" />}
                      <button
                        onClick={() => !unavailable && chooseSelection(seatId, price)}
                        disabled={unavailable}
                        className={`h-11 w-11 rounded-lg border text-xs font-black transition-all ${
                          selected === seatId
                            ? "scale-110 border-green-500 bg-green-500 text-white shadow-lg"
                            : unavailable
                              ? "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-400"
                              : isPremium
                                ? "border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-200"
                                : "border-slate-200 bg-white text-slate-700 hover:border-blue-400"
                        }`}
                      >
                        {seatId}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
            <span>White: standard</span>
            <span>Blue: premium + Rs. 750</span>
            <span>Grey: unavailable</span>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm font-semibold text-gray-600">
        Saved preference: {selected || "Choose an option to save it for future bookings."}
        {extraPrice > 0 ? `, upgrade adds Rs. ${extraPrice}` : ""}
      </p>
    </section>
  );
}
