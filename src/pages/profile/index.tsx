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
        
        // 1. Sort by newest first
        const sorted = [...data].reverse();
        setTrips(sorted);
        
        if (sorted.length > 0) {
          const latest = sorted[0];
          const name = (latest.targetName || "").toLowerCase();
          
          // 2. Extract destination after the arrow ➔
          let city = "Goa";
          if (name.includes("➔")) {
            const destinationPart = name.split("➔").pop() || "";
            if (destinationPart.includes("pune")) city = "Pune";
            else if (destinationPart.includes("kolkata")) city = "Kolkata";
            else if (destinationPart.includes("chennai")) city = "Chennai";
            else if (destinationPart.includes("mumbai")) city = "Mumbai";
            else if (destinationPart.includes("delhi")) city = "Delhi";
          }

          // 3. Map to specific recommendations
          setRecommendation({
            city: city.toUpperCase(),
            hotel: city === "Pune" ? "JW Marriott Pune" : (city === "Kolkata" ? "ITC Sonar Kolkata" : `Luxury ${city} Stay`),
            reason: `Based on your recent trip to ${city}, we've selected a premier stay.`
          });
        }
      } catch (e) { console.error(e); }
      setIsEngineLoading(false);
    };
    fetchTrips();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-blue-800 mb-10 tracking-tighter">My Dashboard</h1>
        
        {recommendation && (
          <div className="p-10 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] text-white mb-12 shadow-2xl relative border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-blue-600/30 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400 border border-blue-400/20"><Sparkles size={12} className="inline mr-1.5"/> AI Recommendation</span>
              <span className="text-orange-400 font-black text-xs">DESTINATION: {recommendation.city}</span>
            </div>
            <h2 className="text-3xl font-black mb-3">{recommendation.hotel}</h2>
            <p className="text-sm opacity-60 leading-relaxed max-w-lg">{recommendation.reason}</p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest ml-2">Recent Activity</h3>
          {isEngineLoading ? <Loader2 className="animate-spin mx-auto text-blue-600 mt-10" /> : 
            trips.map((t: any) => (
              <div key={t.id} className="p-6 bg-white rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">{t.serviceType === 'FLIGHT' ? <Plane size={22}/> : <Hotel size={22}/>}</div>
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
