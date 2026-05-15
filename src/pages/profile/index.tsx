import { useState, useEffect } from 'react';
import { Plane, Hotel, HomeIcon, Bell, Clock, TrendingUp, Info, MapPin, Sparkles, Building, Loader2 } from 'lucide-react';
import ReviewSystem from '@/components/ReviewSystem'; 
import { useSelector } from 'react-redux';

interface Trip {
  id: string;
  targetName: string;
  totalAmount: string | number;
  serviceType: string;
  refundStatus: string;
  selectionId?: string;
  createdAt: string;
}

export default function MasterDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [liveStatus, setLiveStatus] = useState("AI Engine: Online");
  const [showCancel, setShowCancel] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{id: string, name: string} | null>(null);
  const [isEngineLoading, setIsEngineLoading] = useState(true);
  const [recommendation, setRecommendation] = useState({ 
    title: "Analyzing...", reason: "Scanning...", targetType: "HOTEL", highlightCity: "SYNC", matchedItem: "", extraInsight: "" 
  });

  const user = useSelector((state: any) => state.user?.user);

  useEffect(() => {
    const fetchMyTrips = async () => {
      const userId = user?.id || user?._id || "user-123"; 
      try {
        const res = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          // THE CRITICAL FIX: We reverse the data so the newest booking is ALWAYS at index [0]
          const newestFirst = [...data].reverse();
          setTrips(newestFirst); 
          generateFlawlessRecommendation(newestFirst); 
        }
      } catch (err) {
        console.error("Connection Error");
      } finally {
        setIsEngineLoading(false);
      }
    };
    fetchMyTrips();
  }, [user]); 

  const generateFlawlessRecommendation = (userTrips: Trip[]) => {
    const travelRegistry: Record<string, { hotel: string; flight: string; spot: string }> = {
      goa: { hotel: "Goa Marriott Resort", flight: "Goa Coastal Indigo", spot: "Calangute Beach" },
      delhi: { hotel: "The Oberoi New Delhi", flight: "Delhi Vistara Skyline", spot: "Connaught Place" },
      mumbai: { hotel: "The Taj Mahal Palace", flight: "Mumbai Express Jets", spot: "Gateway of India" },
      chennai: { hotel: "The Leela Palace Chennai", flight: "Chennai Air India Hub", spot: "Marina Bay Deck" },
      pune: { hotel: "JW Marriott Pune", flight: "Pune Deccan Air Connect", spot: "Shaniwar Wada" },
      kolkata: { hotel: "ITC Sonar Kolkata", flight: "Kolkata Eastern Hub", spot: "Victoria Memorial" }
    };

    if (!userTrips || userTrips.length === 0) return;
    
    // Grabs the absolute newest trip
    const latestTrip = userTrips[0];
    const rawText = (latestTrip.targetName || "").toLowerCase();
    
    // Find the LAST city mentioned in the trip string (The Destination)
    let detectedCity = "";
    let lastFoundIndex = -1;

    Object.keys(travelRegistry).forEach(city => {
      const idx = rawText.lastIndexOf(city);
      if (idx > lastFoundIndex) {
        lastFoundIndex = idx;
        detectedCity = city;
      }
    });

    const displayCity = detectedCity ? detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1) : "Your Destination";
    const registry = travelRegistry[detectedCity] || { hotel: `Grand ${displayCity} Stay`, flight: `${displayCity} Airways`, spot: "City Center" };

    if (latestTrip.serviceType === "FLIGHT") {
      setRecommendation({
        title: registry.hotel,
        reason: `System Analysis: We noticed your flight to ${displayCity}. To complete your travel layout, we matched a verified luxury lodging option.`,
        targetType: "HOTEL",
        highlightCity: displayCity,
        matchedItem: registry.hotel,
        extraInsight: `📍 Located near ${registry.spot}.`
      });
    } else {
      setRecommendation({
        title: registry.flight,
        reason: `System Analysis: You have a confirmed stay in ${displayCity}. Our engine found optimized flight routing for your dates.`,
        targetType: "FLIGHT",
        highlightCity: displayCity,
        matchedItem: registry.flight,
        extraInsight: `✈️ High-speed transit sync mapped for ${displayCity}.`
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-blue-800 tracking-tight">MakeMyTour</h1>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <Bell size={16} className="animate-pulse"/> <span className="text-xs font-bold uppercase">{liveStatus}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-[32px] text-white relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-bold uppercase">
                <Sparkles size={12}/> AI Synchronized
              </div>
              <div className="text-xs font-bold text-orange-400">📍 HUB: {recommendation.highlightCity}</div>
            </div>
            <h2 className="text-2xl font-black mb-2">{recommendation.title}</h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">{recommendation.reason}</p>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-2 text-[11px] font-medium">
              <Info size={14} className="text-blue-400"/> {recommendation.extraInsight}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800">My Upcoming Trips</h3>
            {isEngineLoading && <Loader2 className="animate-spin mx-auto text-blue-600" />}
            {trips.map((trip) => (
              <div key={trip.id} className="p-5 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    {trip.serviceType === 'FLIGHT' ? <Plane /> : <Hotel />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{trip.targetName}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">₹{trip.totalAmount} • {trip.refundStatus}</p>
                  </div>
                </div>
                <button onClick={() => setReviewTarget({id: trip.targetName, name: trip.targetName})} className="text-blue-600 text-xs font-bold px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Details</button>
              </div>
            ))}
          </div>
          {reviewTarget && <div className="mt-8"><ReviewSystem targetId={reviewTarget.id} targetName={reviewTarget.name} /></div>}
        </div>

        <aside className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit sticky top-10">
          <h4 className="font-bold mb-4 text-sm flex items-center gap-2 text-slate-700"><TrendingUp size={16} className="text-blue-600"/> Market Trends</h4>
          <div className="flex items-end gap-1 h-20 mb-4">
            {[40, 70, 90, 60, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-100 rounded-t-md hover:bg-blue-500 transition-colors" style={{height: `${h}%`}}></div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center italic">Dynamic pricing active for peak holiday routes.</p>
        </aside>
      </main>
    </div>
  );
}
