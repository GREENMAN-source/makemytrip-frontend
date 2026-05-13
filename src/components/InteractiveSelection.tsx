import { useState } from 'react';
import { BedDouble, Plane, CheckCircle2 } from 'lucide-react';

// FIX: We tell TypeScript that this component accepts 'onConfirm'
export default function InteractiveSelection({ 
  type = "HOTEL", 
  onConfirm 
}: { 
  type: "HOTEL" | "FLIGHT", 
  onConfirm: (selectionId: string, extraPrice: number) => void 
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [extraPrice, setExtraPrice] = useState(0);

  const rooms = [
    { id: 'Standard Room', price: 0, preview: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=300&q=80', desc: 'Cozy and economical.' },
    { id: 'Deluxe Ocean View', price: 2500, preview: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=80', desc: 'Balcony with sea view.' }
  ];

  const rows = [1, 2, 3];
  const cols = ['A', 'B', 'C', 'D'];
  const premiumSeats = ['1A', '1B', '1C', '1D'];

  const handleSelectRoom = (id: string, price: number) => {
    setSelected(id);
    setExtraPrice(price);
  };

  const handleSelectSeat = (id: string, isPremium: boolean) => {
    setSelected(id);
    setExtraPrice(isPremium ? 500 : 0);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mt-4">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
        {type === 'HOTEL' ? <BedDouble className="text-blue-600" /> : <Plane className="text-blue-600" />}
        {type === 'HOTEL' ? 'Choose Room' : 'Choose Seat'}
      </h3>

      {/* HOTEL ROOMS */}
      {type === 'HOTEL' && (
        <div className="space-y-4">
          {rooms.map((room) => (
            <div key={room.id} onClick={() => handleSelectRoom(room.id, room.price)} className={`p-4 rounded-2xl border-2 cursor-pointer flex gap-4 transition-all ${selected === room.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
               <img src={room.preview} alt={room.id} className="w-24 h-16 rounded-lg object-cover" />
               <div className="flex-1 flex flex-col justify-center">
                 <p className="font-bold text-slate-800">{room.id}</p>
                 <p className="text-xs text-slate-500 font-bold mt-1">{room.price === 0 ? 'Included' : `+ ₹${room.price}`}</p>
               </div>
               {selected === room.id && <CheckCircle2 className="text-blue-600 my-auto" />}
            </div>
          ))}
        </div>
      )}

      {/* FLIGHT SEATS */}
      {type === 'FLIGHT' && (
        <div className="space-y-3 bg-slate-50 p-6 rounded-2xl">
           {rows.map(row => (
             <div key={row} className="flex justify-center gap-4">
               {cols.map((col, idx) => {
                 const seatId = `${row}${col}`;
                 const isPremium = premiumSeats.includes(seatId);
                 return (
                   <div key={seatId} className="flex items-center">
                      {idx === 2 && <div className="w-6"></div>} 
                      <button
                        onClick={() => handleSelectSeat(seatId, isPremium)}
                        className={`w-10 h-10 rounded-md font-bold text-xs border transition-all ${selected === seatId ? 'bg-green-500 text-white border-green-500 scale-110 shadow-lg' : isPremium ? 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200' : 'bg-white border-slate-200 hover:border-blue-400'}`}
                      >
                        {seatId}
                      </button>
                   </div>
                 );
               })}
             </div>
           ))}
        </div>
      )}

      {/* CONFIRM BUTTON */}
      {selected && (
        <button 
          onClick={() => onConfirm(selected, extraPrice)} 
          className="w-full mt-8 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          Confirm & Pay
        </button>
      )}
    </div>
  );
}