import { useState, useEffect } from 'react';
import { Plane, Hotel, HomeIcon, Bell, Clock, TrendingUp, Info, MapPin, Sparkles, Building, Loader2 } from 'lucide-react';
import ReviewSystem from '@/components/ReviewSystem'; 
import { useSelector } from 'react-redux';

// TypeScript Interface to prevent Netlify build failures
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
  const [liveStatus, setLiveStatus] = useState("AI-202: On Time");
  const [showCancel, setShowCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("Change of plans");
  const [reviewTarget, setReviewTarget] = useState<{id: string, name: string} | null>(null);
  const [isEngineLoading, setIsEngineLoading] = useState(true);
  const [recommendation, setRecommendation] = useState({ 
    title: "Loading Insight...", 
    reason: "Scanning travel logs...", 
    targetType: "HOTEL", 
    highlightCity: "LOCATING",
    matchedItem: "",
    extraInsight: "" 
  });

  const user = useSelector((state: any) => state.user?.user);

  useEffect(() => {
    const fetchMyTrips = async () => {
      const userId = user?.id || "user-123"; 
      try {
        const res = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          
          const parseTimeToMs = (val: any) => {
            if (!val) return 0;
            return isNaN(Number(val)) ? new Date(val).getTime() : Number(val);
          };

          const sortedData = data.sort((a: any, b: any) => parseTimeToMs(b.createdAt) - parseTimeToMs(a.createdAt));
          setTrips(sortedData); 
          generateFlawlessRecommendation(sortedData); 
        } else {
          generateFlawlessRecommendation([]);
        }
      } catch (err) {
        console.error("Database offline or unreachable.");
        generateFlawlessRecommendation([]);
      } finally {
        setIsEngineLoading(false);
      }
    };
    
    fetchMyTrips();

    const msgs = ["Flight AI-202: Boarding", "Hotel Grand Palace: Room Ready", "Flight AI-202: Delayed 10m", "AI Engine: Optimal"];
    const interval = setInterval(() => setLiveStatus(msgs[Math.floor(Math.random() * msgs.length)]), 8000);
    return () => clearInterval(interval);
  }, [user]); 

  // --- AI ENGINE LOGIC ---
  const generateFlawlessRecommendation = (userTrips: Trip[]) => {
    const travelRegistry: Record<string, { hotel: string; flight: string; spot: string }> = {
      goa: { hotel: "Goa Marriott Resort & Spa", flight: "Goa Coastal Indigo Direct Airways", spot: "Calangute Premium Beach Pavilion" },
      delhi: { hotel: "The Oberoi New Delhi", flight: "Delhi Capital Vistara Skyline", spot: "Connaught Place Heritage Quarter" },
      mumbai: { hotel: "The Taj Mahal Palace Mumbai", flight: "Mumbai Chhatrapati Shivaji Express Jets", spot: "Gateway of India Luxury Promenade" },
      chennai: { hotel: "The Leela Palace Chennai", flight: "Chennai Air India Express Hub", spot: "Marina Premium Bay Deck" },
      jaipur: { hotel: "Rambagh Palace Jaipur", flight: "Jaipur Royal Desert Jetliners", spot: "Amer Fort Cultural Heritage Circuit" },
      bangalore: { hotel: "ITC Gardenia Bangalore", flight: "Bangalore Tech-City Express Lines", spot: "Cubbon Park Botanical Enclave" },
      pune: { hotel: "JW Marriott Hotel Pune", flight: "Pune Deccan Air Connect", spot: "Shaniwar Wada Historical Walkways" },
      hyderabad: { hotel: "Taj Falaknuma Palace Hyderabad", flight: "Hyderabad Pearl City Jetliners", spot: "Charminar Heritage Enclosure" },
      kochi: { hotel: "Brunton Boatyard Kochi", flight: "Kochi Malabar Jet Stream", spot: "Fort Kochi Premium Backwater Cruise" },
      kolkata: { hotel: "ITC Sonar Kolkata", flight: "Kolkata Eastern Hub Express", spot: "Victoria Memorial Heritage Zone" }
    };

    if (!userTrips || userTrips.length === 0) {
      setRecommendation({ 
        title: "Explore Goa Marriott Resort & Spa", 
        reason: "Welcome to MakeMyTour! Get started by booking a premier holiday package customized to our highest-rated coastal route.",
        targetType: "HOTEL",
        highlightCity: "Goa",
        matchedItem: "Goa Marriott Resort & Spa",
        extraInsight: "🔥 Highly Requested: 92% of new platform users book this route."
      });
      return;
    }
    
    const latestTrip = userTrips[0];
    const tripType = (latestTrip.serviceType || "").toUpperCase();
    
    const rawTargetName = (latestTrip.targetName || "").toLowerCase();
    let isolatedDestination = rawTargetName;

    if (rawTargetName.includes(" to ")) {
      const parts = rawTargetName.split(" to ");
      isolatedDestination = parts[parts.length - 1].trim(); 
    } else if (rawTargetName.includes("-")) {
      const parts = rawTargetName.split("-");
      isolatedDestination = parts[parts.length - 1].trim();
    }

    let detectedCityKey = "";
    for (const city of Object.keys(travelRegistry)) {
      if (isolatedDestination.includes(city) || rawTargetName.includes(city)) {
        detectedCityKey = city;
        break;
      }
    }

    const displayCityName = detectedCityKey 
      ? detectedCityKey.charAt(0).toUpperCase() + detectedCityKey.slice(1) 
      : isolatedDestination.charAt(0).toUpperCase() + isolatedDestination.slice(1);

    if (tripType === "FLIGHT") {
      setRecommendation({
        title: detectedCityKey ? travelRegistry[detectedCityKey].hotel : `Premium Hotel ${displayCityName}`,
        reason: `System Analysis: Active flight arriving in ${displayCityName}. Engine matched your itinerary to a verified luxury lodging option at your destination.`,
        targetType: "HOTEL",
        highlightCity: displayCityName,
        matchedItem: detectedCityKey ? travelRegistry[detectedCityKey].hotel : `Hotel ${displayCityName}`,
        extraInsight: `📍 Proximity Anchor: Located in central ${displayCityName}. Transport logistics synchronized.`
      });
    } else if (tripType === "HOTEL") {
      setRecommendation({
        title: detectedCityKey ? travelRegistry[detectedCityKey].flight : `${displayCityName} Direct Airways`,
        reason: `System Analysis: Confirmed room stay booked in ${displayCityName}. System matched optimized flight routing tables to coordinate cleanly with your calendar.`,
        targetType: "FLIGHT",
        highlightCity: displayCityName,
        matchedItem: detectedCityKey ? travelRegistry[detectedCityKey].flight : `${displayCityName} Flight`,
        extraInsight: `✈️ Route Optimization: High-speed transit sync mapped perfectly for your check-in time.`
      });
    } else {
      setRecommendation({
        title: `Explore ${displayCityName}`,
        reason: `Standard configuration logic active for ${displayCityName}. Displaying an elite-tier destination bundle.`,
        targetType: "HOTEL",
        highlightCity: displayCityName,
        matchedItem: displayCityName,
        extraInsight: "Includes custom culinary meal mapping."
      });
    }
  };

  const handleConfirmCancel = async () => {
    const tripToCancel = trips.find(t => t.id === showCancel);
    if(!tripToCancel) return;

    const baseAmount = parseFloat(tripToCancel.totalAmount as string) || 0;
    const refundAmount = (baseAmount * 0.5).toFixed(0);

    try {
      const response = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/cancel/${showCancel}?reason=${encodeURIComponent(cancelReason)}`, { method: "POST" });
      if (response.ok) {
        setTrips(trips.map(t => t.id === showCancel ? { ...t, refundStatus: `₹${refundAmount} REFUND INITIATED` } : t));
        setShowCancel(null);
      } else {
        alert("Server validation failed during cancellation request.");
      }
    } catch (err) {
      alert("Error saving cancellation to database.");
    }
  };

  const renderIcon = (type: string) => {
    if (type === 'HOTEL') return <Hotel />;
    if (type === 'FLIGHT') return <Plane />;
    return <HomeIcon />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-10 font-sans">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl font-black text-blue-800 tracking-tight">
          MakeMyTour Dashboard
        </h1>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl flex items-center gap-3 shadow-lg">
          <Bell size={18} className="animate-pulse"/> 
          <span className="text-xs font-bold">{liveStatus}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* --- SMART AI RECOMMENDER CONTAINER (Original MMT Indigo Theme) --- */}
          <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 rounded-[32px] text-white relative overflow-hidden group shadow-2xl border border-slate-800">
            <div className="absolute right-[-20px] bottom-[-20px] opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-110">
              {recommendation.targetType === "HOTEL" ? <Building size={250} /> : <Plane size={250} />}
            </div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center gap-2 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 w-fit px-3 py-1.5 rounded-full font-bold uppercase tracking-widest">
                {isEngineLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="animate-pulse"/>}
                {isEngineLoading ? "Booting Engine..." : "AI Engine Synchronized"}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl">
                <MapPin size={12}/> Destination Hub: <span className="underline decoration-wavy decoration-orange-400 font-extrabold">{recommendation.highlightCity.toUpperCase()}</span>
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <span className="text-[11px] font-black tracking-widest text-blue-400 uppercase block">
                COMPLEMENTARY SUGGESTION FOR YOUR TIMELINE
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight text-white group-hover:text-blue-200 transition-colors duration-300">
                {recommendation.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal pt-2 max-w-xl">
                {recommendation.reason}
              </p>
            </div>

            <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3 text-xs font-medium text-slate-200 shadow-inner relative z-10">
              <Info size={16} className="text-blue-400 shrink-0"/>
              <span>{recommendation.extraInsight}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">My Upcoming Trips</h3>
            
            {isEngineLoading ? (
               <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-4 shadow-sm">
                 <Loader2 size={24} className="text-blue-600 animate-spin" />
                 <span className="text-slate-500 text-sm animate-pulse">Loading secure travel logs...</span>
               </div>
            ) : trips.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 shadow-sm text-sm">
                No active bookings discovered. Schedule a flight or hotel path to display matching context.
              </div>
            ) : null}

            {trips.map((trip) => (
              <div key={trip.id} className={`p-5 rounded-[24px] border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${trip.refundStatus === "ACTIVE" ? "bg-white border-slate-100 shadow-sm hover:shadow-md" : "bg-red-50 border-red-200"}`}>
                <div className="flex gap-4 items-center w-full md:w-auto">
                  <div className={`p-4 rounded-2xl shrink-0 ${trip.refundStatus === "ACTIVE" ? "bg-blue-50 text-blue-600" : "bg-red-100 text-red-600"}`}>
                    {renderIcon(trip.serviceType)}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-800 line-clamp-1">{trip.targetName}</p>
                    <div className="flex flex-wrap gap-3 mt-1 items-center">
                      <p className="text-sm font-bold text-slate-500">₹{trip.totalAmount}</p>
                      {trip.selectionId && (
                        <p className="text-[10px] font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 uppercase tracking-wider">
                          <MapPin size={10}/> {trip.selectionId}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-bold mt-2 w-fit uppercase tracking-widest ${trip.refundStatus === "ACTIVE" ? "text-orange-500 bg-orange-50 border border-orange-100" : "text-red-600 bg-red-100 border border-red-200"}`}>
                      <Clock size={10}/> {trip.refundStatus}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <button onClick={() => { setReviewTarget({ id: trip.targetName, name: trip.targetName }); setTimeout(() => { document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className="flex-1 md:flex-none text-blue-600 font-bold text-xs px-4 py-2.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100 text-center">
                    View / Write Review
                  </button>
                  {trip.refundStatus === "ACTIVE" && (
                    <button onClick={() => setShowCancel(trip.id)} className="flex-1 md:flex-none text-red-500 font-bold text-xs px-4 py-2.5 hover:bg-red-50 rounded-xl transition-colors text-center border border-transparent hover:border-red-100">
                      Cancel Trip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10" id="review-section">
            {reviewTarget ? (
              <ReviewSystem targetId={reviewTarget.id} targetName={reviewTarget.name} />
            ) : (
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 text-center text-slate-500 shadow-sm text-sm">
                Click <strong>"View / Write Review"</strong> to fetch reviews from database.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm sticky top-6">
            <h4 className="font-bold flex items-center gap-2 mb-6 text-sm text-slate-800"> <TrendingUp size={16} className="text-blue-600"/> Price Trends</h4>
            <div className="h-24 flex items-end gap-1.5 px-2">
              {[40, 70, 90, 50, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-600 transition-colors cursor-pointer relative group" style={{height: `${h}%`}}>
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100">{h}%</div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                Dynamic Pricing: <span className="text-blue-600 font-bold">+20% surge</span> applied during peak holiday season.
              </p>
            </div>
          </div>
        </aside>
      </main>

      {/* CANCEL MODAL - LIGHT THEME */}
      {showCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 md:p-8 rounded-[40px] max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-black mb-2 text-slate-900">Cancel Trip?</h2>
            <p className="text-xs text-slate-500 mb-6">A 50% refund policy applies to this booking.</p>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason</label>
            <select 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full bg-slate-50 p-4 rounded-2xl mb-8 mt-2 text-sm outline-none border border-slate-200 focus:border-blue-500 text-slate-800 transition-colors"
            >
              <option value="Change of plans">Change of plans</option>
              <option value="Health Emergency">Health Emergency</option>
              <option value="Found better price">Found better price</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(null)} className="flex-1 text-slate-500 font-bold hover:text-slate-700 transition-colors text-sm py-3.5 bg-slate-50 rounded-2xl border border-slate-200">Back</button>
              <button onClick={handleConfirmCancel} className="flex-1 bg-red-600 text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200">Confirm Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
