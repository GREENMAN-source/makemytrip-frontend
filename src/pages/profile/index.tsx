import { useState, useEffect } from 'react';
import { Plane, Hotel, Sparkles, Loader2, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function MasterDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isEngineLoading, setIsEngineLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const user = useSelector((state: any) => state.user?.user);

  useEffect(() => {
    const fetchTrips = async () => {
      const userId = user?.id || user?._id || "user-123"; 
      const res = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        // REVERSE ensures your NEW Pune/Mumbai bookings appear at the top
        const sorted = [...data].reverse();
        setTrips(sorted);
        
        if (sorted.length > 0) {
          const latest = sorted[0];
          const name = (latest.targetName || "").toLowerCase();
          
          // KOLKATA IS REMOVED FROM AI PROCESSING
          const cities = ["pune", "mumbai", "chennai", "delhi", "goa", "jaipur", "bangalore"];
          let detected = "";

          for (const city of cities) {
            if (name.includes(city)) {
              detected = city;
              break;
            }
          }

          if (detected) {
            const cityName = detected.charAt(0).toUpperCase() + detected.slice(1);
            setRecommendation({
              city: cityName,
              hotel: cityName === "Pune" ? "JW Marriott Pune" : (cityName === "Chennai" ? "The Leela Palace" : `Grand ${cityName} Resort`),
              reason: `AI Insight: You have an upcoming stay in ${cityName}. We've matched a luxury lodging option for you.`
            });
          }
        }
      }
      setIsEngineLoading(false);
    };
    fetchTrips();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <h1 className="text-3xl font-black text-blue-800 mb-10 tracking-tighter">Travel Dashboard</h1>
      
      {recommendation && (
        <div className="p-8 bg-slate-900 rounded-[40px] text-white mb-12 shadow-2xl relative border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-blue-600/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-400 border border-blue-400/20"><Sparkles size={12} className="inline mr-1"/> AI recommendation</span>
            <span className="text-orange-400 font-black text-xs">📍 {recommendation.city}</span>
          </div>
          <h2 className="text-3xl font-black mb-2">{recommendation.hotel}</h2>
          <p className="text-sm opacity-60 leading-relaxed max-w-lg">{recommendation.reason}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest ml-2">Your Activity Logs</h3>
        {isEngineLoading ? <Loader2 className="animate-spin mx-auto text-blue-600" /> : 
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
  );
}
