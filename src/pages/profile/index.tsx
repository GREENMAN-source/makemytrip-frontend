import { useState, useEffect } from 'react';
import { Plane, Hotel, HomeIcon, Bell, Clock, TrendingUp, Info, MapPin, Sparkles, Building, Loader2 } from 'lucide-react';
import ReviewSystem from '@/components/ReviewSystem'; 
import { useSelector } from 'react-redux';

// 1. Strict TypeScript Interface to ensure Netlify build success
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
  const [reviewTarget, setReviewTarget] = useState<{id: string, name: string} | null>(null);
  const [isEngineLoading, setIsEngineLoading] = useState(true);
  const [recommendation, setRecommendation] = useState({ 
    title: "Analyzing...", reason: "Scanning...", targetType: "HOTEL", highlightCity: "SYNC", matchedItem: "", extraInsight: "" 
  });

  const user = useSelector((state: any) => state.user?.user);

  useEffect(() => {
    const fetchMyTrips = async () => {
      // Use the active user ID or fallback to user-123
      const userId = user?.id || user?._id || "user-123"; 
      try {
        const res = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          
          // THE SORTING FIX: 
          // Reversing the array ensures the NEWEST booking is at trips[0] 
          // even if the database doesn't provide a valid createdAt timestamp.
          const newestFirst = [...data].reverse();
          
          setTrips(newestFirst); 
          generateFlawlessRecommendation(newestFirst); 
        }
      } catch (err) {
        console.error("Backend connection failed.");
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
    
    // Always analyze the NEWEST trip
    const latestTrip = userTrips[0];
    const rawText = (latestTrip.targetName || "").toLowerCase();
    
    // THE DESTINATION FIX:
    // We strictly isolate everything AFTER the arrow/dash symbols.
    let destinationSegment = rawText;
    const splitSymbols = ["➔", "->", " to ", " - ", "-"];
    
    for (const symbol of splitSymbols) {
      if (rawText.includes(symbol)) {
        destinationSegment = rawText.split(symbol).pop() || rawText;
        break;
      }
    }

    // Clean brackets and extra spaces (e.g. "(Mumbai -> Pune)" becomes "pune")
    destinationSegment = destinationSegment.replace(/[\(\)]/g, '').trim();

    let detectedCity = "";
    Object.keys(travelRegistry).forEach(city => {
      if (destinationSegment.includes(city)) {
        detectedCity = city;
      }
    });

    const displayCity = detectedCity ? detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1) : destinationSegment.split(',')[0].trim().toUpperCase();
    const registry = travelRegistry[detectedCity] || { hotel: `Grand ${displayCity} Stay`, flight: `${displayCity} Airways`, spot: "Downtown" };

    if (latestTrip.serviceType === "FLIGHT") {
      setRecommendation({
        title: registry.hotel,
        reason: `Analysis: We detected your flight arriving in ${displayCity}. To complete your travel layout, we've matched a luxury stay for your arrival.`,
        targetType: "HOTEL",
        highlightCity: displayCity,
        matchedItem: registry.hotel,
        extraInsight: `📍 Located near ${registry.spot}.`
      });
    } else {
      setRecommendation({
        title: registry.flight,
        reason: `Analysis: You have a confirmed stay in ${displayCity}. Our engine found optimized flight routing for your dates.`,
        targetType: "FLIGHT",
        highlightCity: displayCity,
        matchedItem: registry.flight,
        extraInsight: `✈️ High-speed transit sync mapped for ${displayCity}.`
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-blue-800 tracking-tighter">MakeMyTour</h1>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg">
          <Bell size={16} className="animate-pulse"/> <span className="text-[10px] font-bold uppercase tracking-widest">{liveStatus}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI SYNCED ENGINE CARD */}
          <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-[40px] text-white relative overflow-hidden shadow-2xl border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-full font-bold uppercase tracking-widest">
                <Sparkles size={12}/> AI Synchronized
              </div>
              <div className="text-xs font-bold text-orange-400 font-mono">📍 HUB: {recommendation.highlightCity}</div>
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight">{recommendation.title}</h2>
            <p className="text-sm text-slate-300 mb-8 leading-relaxed max-w-xl">{recommendation.reason}</p>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3 text-xs font-medium text-slate-200">
              <Info size={16} className="text-blue-400 shrink-0"/> {recommendation.extraInsight}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-xl text-slate-800">My Upcoming Trips</h3>
            {isEngineLoading && (
              <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
            )}
            
            {trips.length === 0 && !isEngineLoading && (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 text-sm italic">
                No active bookings discovered.
              </div>
            )}

            {trips.map((trip) => (
              <div key={trip.id} className="p-5 bg-white rounded-[24px] border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
                <div className="flex gap-5 items-center">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {trip.serviceType === 'FLIGHT' ? <Plane size={24} /> : <Hotel size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-800 leading-tight">{trip.targetName}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-1">₹{trip.totalAmount} • {trip.refundStatus}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setReviewTarget({id: trip.targetName, name: trip.targetName})} 
                  className="text-blue-600 text-xs font-bold px-5 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  Details
                </button>
              </div>
            ))}
          </div>

          <div id="review-section" className="pt-4">
            {reviewTarget && <ReviewSystem targetId={reviewTarget.id} targetName={reviewTarget.name} />}
          </div>
        </div>

        {/* SIDEBAR METRICS */}
        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm sticky top-10">
            <h4 className="font-bold mb-6 text-sm flex items-center gap-2 text-slate-700 uppercase tracking-widest"><TrendingUp size={16} className="text-blue-600"/> Market Trends</h4>
            <div className="flex items-end gap-2 h-24 mb-6">
              {[40, 70, 90, 60, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-100 rounded-t-lg hover:bg-blue-500 transition-all cursor-help" style={{height: `${h}%`}}></div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Dynamic pricing metrics active for your preferred routes.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
