import { useState, useEffect } from 'react';
import { Plane, Hotel, Sparkles, Loader2, MapPin, TrendingUp } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function MasterDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isEngineLoading, setIsEngineLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const user = useSelector((state: any) => state.user?.user);

  useEffect(() => {
    const fetchTrips = async () => {
      const userId = user?.id || user?._id || "user-123"; 
      try {
        const res = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/user/${userId}`);
        const data = await res.json();
        
        // Put the newest booking at the top
        const sorted = [...data].reverse();
        setTrips(sorted);
        
        if (sorted.length > 0) {
          const latest = sorted[0];
          const name = (latest.targetName || "").toLowerCase();
          
          // THE "NO-KOLKATA" LOGIC: 
          // We split the name and remove the first part (The "From" city)
          // so the AI only looks at the second half of the string.
          let searchArea = name;
          if (name.includes("➔")) {
            searchArea = name.split("➔").pop() || name;
          } else if (name.includes(" ")) {
            const parts = name.split(" ");
            parts.shift(); // This removes the first word (e.g., "Kolkata")
            searchArea = parts.join(" ");
          }

          let detectedCity = "Goa"; // Default
          if (searchArea.includes("pune")) detectedCity = "Pune";
          else if (searchArea.includes("chennai")) detectedCity = "Chennai";
          else if (searchArea.includes("mumbai")) detectedCity = "Mumbai";
          else if (searchArea.includes("delhi")) detectedCity = "Delhi";
          else if (searchArea.includes("goa")) detectedCity = "Goa";

          setRecommendation({
            city: detectedCity.toUpperCase(),
            hotel: detectedCity === "Pune" ? "JW Marriott Pune" : `Luxury ${detectedCity} Stay`,
            reason: `AI Analysis: Destination ${detectedCity} detected. We have matched a verified luxury stay for your arrival.`
          });
        }
      } catch (e) { console.error("Sync Error"); }
      setIsEngineLoading(false);
    };
    fetchTrips();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-blue-800 tracking-tighter">My Dashboard</h1>
          <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-100">
            Engine Optimized
          </div>
        </header>
        
        {recommendation && (
          <div className="p-10 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] text-white mb-12 shadow-2xl relative border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Plane size={150} /></div>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <span className="bg-blue-600/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400 border border-blue-400/20"><Sparkles size={12} className="inline mr-1.5"/> AI Recommended</span>
              <span className="text-orange-400 font-black text-xs">📍 {recommendation.city}</span>
            </div>
            <h2 className="text-3xl font-black mb-3 relative z-10">{recommendation.hotel}</h2>
            <p className="text-sm opacity-60 leading-relaxed max-w-lg relative z-10">{recommendation.reason}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest ml-2">Booking History</h3>
          {isEngineLoading ? <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" /></div> : 
            trips.map((t: any) => (
              <div key={t.id} className="p-6 bg-white rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                    {t.serviceType === 'FLIGHT' ? <Plane size={22}/> : <Hotel size={22}/>}
                  </div>
                  <span className="font-bold text-slate-700 text-lg">{t.targetName}</span>
                </div>
                <div className="text-blue-600 font-black text-lg">₹{t.totalAmount}</div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
