import { useState, useEffect } from 'react';
import { Plane, Hotel, HomeIcon, Bell, Sparkles, Loader2, MapPin } from 'lucide-react';
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
        // REVERSE puts your NEW booking at index [0]
        const sorted = [...data].reverse();
        setTrips(sorted);
        
        if (sorted.length > 0) {
          const latest = sorted[0];
          const name = (latest.targetName || "").toLowerCase();
          
          // EXTRACTION: Look for Pune or any city at the END of the string
          let city = "Goa";
          if (name.includes("pune")) city = "Pune";
          else if (name.includes("chennai")) city = "Chennai";
          else if (name.includes("mumbai")) city = "Mumbai";
          else if (name.includes("delhi")) city = "Delhi";
          else if (name.includes("kolkata")) city = "Kolkata";

          setRecommendation({
            city: city.toUpperCase(),
            hotel: city === "Pune" ? "JW Marriott Pune" : `Luxury ${city} Resort`,
            reason: `Detected trip to ${city}. Our AI found a matched luxury stay for you.`
          });
        }
      }
      setIsEngineLoading(false);
    };
    fetchTrips();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <h1 className="text-3xl font-black text-blue-800 mb-8">Dashboard</h1>
      
      {recommendation && (
        <div className="p-8 bg-gradient-to-br from-indigo-900 to-blue-900 rounded-[32px] text-white mb-10 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-blue-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase"><Sparkles size={12} className="inline mr-1"/> AI Synced</span>
            <span className="text-orange-400 font-bold text-sm">📍 {recommendation.city}</span>
          </div>
          <h2 className="text-2xl font-black mb-2">{recommendation.hotel}</h2>
          <p className="text-sm opacity-80">{recommendation.reason}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-bold">Your Trips</h3>
        {trips.map((t: any) => (
          <div key={t.id} className="p-5 bg-white rounded-2xl border border-slate-100 flex justify-between">
            <div className="font-bold">{t.targetName}</div>
            <div className="text-blue-600 font-black">₹{t.totalAmount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
