import { useState, useEffect } from 'react';
import { Plane, Hotel, HomeIcon, Bell, Clock, TrendingUp, Info, MapPin, Sparkles, Building, Loader2 } from 'lucide-react';
import ReviewSystem from '@/components/ReviewSystem'; 
import { useSelector } from 'react-redux';

// 1. TypeScript Interface - Essential for Netlify to pass build
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
  const [cancelReason, setCancelReason] = useState("Change of plans");
  const [reviewTarget, setReviewTarget] = useState<{id: string, name: string} | null>(null);
  const [isEngineLoading, setIsEngineLoading] = useState(true);
  const [recommendation, setRecommendation] = useState({ 
    title: "Analyzing Itinerary...", 
    reason: "Scanning logs...", 
    targetType: "HOTEL", 
    highlightCity: "SYNCING",
    matchedItem: "",
    extraInsight: "" 
  });

  const user = useSelector((state: any) => state.user?.user);

  useEffect(() => {
    const fetchMyTrips = async () => {
      const userId = user?.id || user?._id || "user-123"; 
      try {
        const res = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          
          const parseTimeToMs = (val: any) => {
            if (!val) return 0;
            return isNaN(Number(val)) ? new Date(val).getTime() : Number(val);
          };

          // FORCE REVERSE: Puts the latest booking at index [0] so the AI sees it first
          const sortedData = [...data].reverse().sort((a: any, b: any) => 
            parseTimeToMs(b.createdAt) - parseTimeToMs(a.createdAt)
          );

          setTrips(sortedData); 
          generateFlawlessRecommendation(sortedData); 
        } else {
          generateFlawlessRecommendation([]);
        }
      } catch (err) {
        console.error("Backend Error");
        generateFlawlessRecommendation([]);
      } finally {
        setIsEngineLoading(false);
      }
    };
    fetchMyTrips();

    const msgs = ["Route Sync: Optimal", "AI Engine: Processing", "Network: Secured"];
    const interval = setInterval(() => setLiveStatus(msgs[Math.floor(Math.random() * msgs.length)]), 8000);
    return () => clearInterval(interval);
  }, [user]); 

  const generateFlawlessRecommendation = (userTrips: Trip[]) => {
    const travelRegistry: Record<string, { hotel: string; flight: string; spot: string }> = {
      goa: { hotel: "Goa Marriott Resort & Spa", flight: "Goa Coastal Indigo", spot: "Calangute Beach" },
      delhi: { hotel: "The Oberoi New Delhi", flight: "Delhi Vistara Skyline", spot: "Connaught Place" },
      mumbai: { hotel: "The Taj Mahal Palace", flight: "Mumbai Express Jets", spot: "Gateway of India" },
      chennai: { hotel: "The Leela Palace Chennai", flight: "Chennai Air India Hub", spot: "Marina Bay Deck" },
      jaipur: { hotel: "Rambagh Palace Jaipur", flight: "Jaipur Desert Jetliners", spot: "Amer Fort" },
      bangalore: { hotel: "ITC Gardenia Bangalore", flight: "Bangalore Express", spot: "Cubbon Park" },
      pune: { hotel: "JW Marriott Pune", flight: "Pune Deccan Air", spot: "Shaniwar Wada" },
      hyderabad: { hotel: "Taj Falaknuma Palace", flight: "Hyderabad Pearl Jets", spot: "Charminar" },
      kochi: { hotel: "Brunton Boatyard Kochi", flight: "Kochi Malabar Stream", spot: "Fort Kochi" },
      kolkata: { hotel: "ITC Sonar Kolkata", flight: "Kolkata Eastern Hub", spot: "Victoria Memorial" }
    };

    if (!userTrips || userTrips.length === 0) {
      setRecommendation({ 
        title: "Explore Premier Stays", 
        reason: "Welcome to MakeMyTour! Book a trip to activate the AI Recommendation Engine.",
        targetType: "HOTEL",
        highlightCity: "READY",
        matchedItem: "",
        extraInsight: "AI Engine is standing by."
      });
      return;
    }
    
    const latestTrip = userTrips[0];
    const tripType = (latestTrip.serviceType || "").toUpperCase();
    const rawText = (latestTrip.targetName || "").toLowerCase();
    
    // NEW ALGORITHM: Scan for the LAST mentioned city in the string
    let detectedCity = "";
    let lastFoundIndex = -1;

    Object.keys(travelRegistry).forEach(city => {
      const idx = rawText.lastIndexOf(city);
      if (idx > lastFoundIndex) {
        lastFoundIndex = idx;
        detectedCity = city;
      }
    });

    const displayCity = detectedCity ? detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1) : "Destination";
    const registry = travelRegistry[detectedCity] || { hotel: `Grand ${displayCity} Resort`, flight: `${displayCity} Airways`, spot: "Downtown" };

    if (tripType === "FLIGHT") {
      setRecommendation({
        title: registry.hotel,
        reason: `System Analysis: We noticed your flight to ${displayCity}. We recommend completing your trip with this luxury stay.`,
        targetType: "HOTEL",
        highlightCity: displayCity,
        matchedItem: registry.hotel,
        extraInsight: `📍 Proximity: Located near ${registry.spot}.`
      });
    } else {
      setRecommendation({
        title: registry.flight,
        reason: `System Analysis: You have a hotel confirmed in ${displayCity}. Our engine found a matching flight itinerary.`,
        targetType: "FLIGHT",
        highlightCity: displayCity,
        matchedItem: registry.flight,
        extraInsight: `✈️ Transit: Optimized for your check-in time.`
      });
    }
  };

  const handleConfirmCancel = async () => {
    try {
      const response = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/cancel/${showCancel}`, { method: "POST" });
      if (response.ok) {
        setTrips(trips.map(t => t.id === showCancel ? { ...t, refundStatus: "REFUNDED" } : t));
        setShowCancel(null);
      }
    } catch (err) { alert("Action Failed"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-900">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-blue-800">MakeMyTour</h1>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <Bell size={16} className="animate-pulse"/> <span className="text-xs font-bold uppercase">{liveStatus}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI ENGINE CARD */}
          <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-[32px] text-white relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-bold uppercase">
                <Sparkles size={12}/> AI Synchronized
              </div>
              <div className="text-xs font-bold text-orange-400">📍 HUB: {recommendation.highlightCity}</div>
            </div>
            <h2 className="text-2xl font-black mb-2">{recommendation.title}</h2>
            <p className="text-sm text-slate-300 mb-6">{recommendation.reason}</p>
            <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-2 text-[11px]">
              <Info size={14} className="text-blue-400"/> {recommendation.extraInsight}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg">Upcoming Trips</h3>
            {isEngineLoading && <Loader2 className="animate-spin mx-auto text-blue-600" />}
            {trips.map((trip) => (
              <div key={trip.id} className="p-5 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    {trip.serviceType === 'FLIGHT' ? <Plane /> : <Hotel />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{trip.targetName}</p>
                    <p className="text-xs text-slate-500 font-bold">₹{trip.totalAmount} • {trip.refundStatus}</p>
                  </div>
                </div>
                <button onClick={() => setReviewTarget({id: trip.targetName, name: trip.targetName})} className="text-blue-600 text-xs font-bold px-3 py-2 bg-blue-50 rounded-lg">Logs</button>
              </div>
            ))}
          </div>

          <div id="review-section">
            {reviewTarget && <ReviewSystem targetId={reviewTarget.id} targetName={reviewTarget.name} />}
          </div>
        </div>

        <aside className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit">
          <h4 className="font-bold mb-4 text-sm flex items-center gap-2"><TrendingUp size={16}/> Price Metrics</h4>
          <div className="flex items-end gap-1 h-20">
            {[40, 70, 90, 60, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-blue-100 rounded-t-md" style={{height: `${h}%`}}></div>
            ))}
          </div>
        </aside>
      </main>

      {showCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[32px] max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Abort Booking?</h2>
            <div className="flex gap-4">
              <button onClick={() => setShowCancel(null)} className="flex-1 text-slate-400 font-bold">Back</button>
              <button onClick={handleConfirmCancel} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
