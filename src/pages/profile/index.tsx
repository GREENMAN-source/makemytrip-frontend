import { useState, useEffect } from 'react';
import { Plane, Hotel, HomeIcon, Bell, Clock, TrendingUp, Info, Star, MapPin, Sparkles, ArrowRight, Compass } from 'lucide-react';
import ReviewSystem from '@/components/ReviewSystem'; 
import { useSelector } from 'react-redux';

export default function MasterDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [liveStatus, setLiveStatus] = useState("AI-202: On Time");
  const [showCancel, setShowCancel] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{id: string, name: string} | null>(null);
  const [recommendation, setRecommendation] = useState({ 
    title: "Loading...", 
    reason: "...", 
    targetType: "HOTEL", 
    destination: "",
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
          const sortedData = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTrips(sortedData); 
          generate智能Recommendation(sortedData); 
        }
      } catch (err) {
        console.error("Database offline, empty dashboard.");
        generate智能Recommendation([]);
      }
    };
    fetchMyTrips();

    const msgs = ["Flight AI-202: Boarding", "Hotel Grand Palace: Room Ready", "Flight AI-202: Delayed 10m"];
    const interval = setInterval(() => setLiveStatus(msgs[Math.floor(Math.random() * msgs.length)]), 10000);
    return () => clearInterval(interval);
  }, [user]); 

  // --- CROSS-MATCHING CONTEXTUAL AI ENGINE ---
  const generate智能Recommendation = (userTrips: any[]) => {
    if (!userTrips || userTrips.length === 0) {
      setRecommendation({ 
        title: "Explore Goa Elite Beach Resorts", 
        reason: "Welcome to MakeMyTour! Your timeline is fresh. Kickstart your profile with our most requested coastal holiday escape.",
        targetType: "HOTEL",
        destination: "Goa",
        extraInsight: "Trending: 94% of new platform users select this route."
      });
      return;
    }
    
    // 1. Get the absolute latest booking to parse its context
    const latestTrip = userTrips[0];
    const rawName = latestTrip.targetName || "";
    const tripType = (latestTrip.serviceType || "").toUpperCase();

    // 2. Extract City Name helper function (looks for keywords inside booking titles)
    const extractCity = (name: string): string => {
      const cities = ["mumbai", "goa", "chennai", "delhi", "jaipur", "bangalore", "pune", "hyderabad", "kochi", "kolkata"];
      const lower = name.toLowerCase();
      for (const city of cities) {
        if (lower.includes(city)) return city.charAt(0).toUpperCase() + city.slice(1);
      }
      return "your destination"; 
    };

    const targetCity = extractCity(rawName);

    // 3. Compute structural profile preference
    const flightCount = userTrips.filter(t => (t.serviceType || "").toUpperCase() === "FLIGHT").length;
    const hotelCount = userTrips.filter(t => (t.serviceType || "").toUpperCase() === "HOTEL").length;
    const userPref = flightCount >= hotelCount ? "Premium Flight Tier" : "Luxury Lodging Tier";

    // 4. Core Cross-Matching Logic Branch
    if (tripType === "FLIGHT") {
      // IF USER BOOKED A FLIGHT -> RECOMMEND COMPLEMENTARY HOTEL IN THAT EXACT CITY
      setRecommendation({
        title: `Luxury Stay at The Grand Executive ${targetCity}`,
        reason: `AI Cross-Match: We detected your confirmed flight arriving in ${targetCity}. To complete your travel profile, our engine paired your ${userPref} preference with top-tier accommodations nearby.`,
        targetType: "HOTEL",
        destination: targetCity,
        extraInsight: `📍 Nearby Spot: Just 15 mins away from ${targetCity} Transit Hub. Includes free airport pickup.`
      });
    } else if (tripType === "HOTEL") {
      // IF USER BOOKED A HOTEL -> RECOMMEND MATCHING FLIGHT TO THAT EXACT CITY
      setRecommendation({
        title: `Express Non-Stop Flights to ${targetCity}`,
        reason: `AI Cross-Match: You have a confirmed reservation at ${rawName} in ${targetCity}. Our system analyzed flight schedules to sync perfectly with your check-in timeline automatically.`,
        targetType: "FLIGHT",
        destination: targetCity,
        extraInsight: `✈️ Transit Route optimized based on your ${userPref} metrics. Priority boarding applied.`
      });
    } else {
      // Fallback
      setRecommendation({
        title: "Exclusive Kerala Backwater Cruiser",
        reason: "No immediate cross-match criteria found. Displaying custom curated travel configurations aligned with signature Indian routes.",
        targetType: "HOTEL",
        destination: "Kerala",
        extraInsight: "Recommended for leisure weekend packages."
      });
    }
  };

  const handleConfirmCancel = async () => {
    const tripToCancel = trips.find(t => t.id === showCancel);
    if(!tripToCancel) return;

    const refundAmount = (tripToCancel.totalAmount * 0.5).toFixed(0);

    try {
      await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/cancel/${showCancel}?reason=User Cancelled`, { method: "POST" });
      setTrips(trips.map(t => t.id === showCancel ? { ...t, refundStatus: `₹${refundAmount} REFUND INITIATED` } : t));
      setShowCancel(null);
      alert(`Cancellation successful. A 50% refund of ₹${refundAmount} has been initiated.`);
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-blue-800 tracking-tight">MakeMyTour Dashboard</h1>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl flex items-center gap-3 animate-pulse shadow-lg">
          <Bell size={18}/> <span className="text-xs font-bold">{liveStatus}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* --- ULTRA-DYNAMIC CONTEXTUAL AI RECOMMENDER PANEL --- */}
          <div className="p-6 bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-900 rounded-[32px] text-white relative overflow-hidden group shadow-2xl transition-all border border-blue-900">
            <div className="absolute right-0 top-0 p-8 opacity-10 pointer-events-none">
              {recommendation.targetType === "HOTEL" ? <Hotel size={180} /> : <Plane size={180} />}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs bg-blue-500/20 text-blue-300 w-fit px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
                <Sparkles size={12}/> Predictive AI Intelligence
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300 font-mono">
                Target: {recommendation.destination}
              </span>
            </div>

            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1">
              Next Smart Action <ArrowRight size={12}/> Book Matching {recommendation.targetType}
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200">
              {recommendation.title}
            </h2>
            
            <p className="text-sm text-slate-300 leading-relaxed font-normal mb-4 opacity-95">
              {recommendation.reason}
            </p>

            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center gap-3 text-xs text-slate-200 backdrop-blur-sm">
              <Compass size={16} className="text-orange-400 shrink-0"/>
              <span className="font-medium tracking-wide">{recommendation.extraInsight}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">My Upcoming Trips</h3>
            
            {trips.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 shadow-sm">
                No active bookings discovered. Schedule a package configuration to run live matching metrics.
              </div>
            ) : null}

            {trips.map((trip) => (
              <div key={trip.id} className={`p-5 rounded-[24px] border flex justify-between items-center transition-all ${trip.refundStatus === "ACTIVE" ? "bg-white border-slate-100 shadow-sm hover:shadow-md" : "bg-red-50 border-red-200"}`}>
                <div className="flex gap-4 items-center">
                  <div className={`p-4 rounded-2xl ${trip.refundStatus === "ACTIVE" ? "bg-blue-50 text-blue-600" : "bg-red-100 text-red-600"}`}>
                    {renderIcon(trip.serviceType)}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-800">{trip.targetName}</p>
                    <div className="flex gap-4 mt-1 items-center">
                      <p className="text-sm font-bold text-slate-500">₹{trip.totalAmount}</p>
                      {trip.selectionId && (
                        <p className="text-xs font-bold text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md">
                          <MapPin size={12}/> {trip.selectionId}
                        </p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-[9px] font-bold mt-2 w-fit ${trip.refundStatus === "ACTIVE" ? "text-orange-500 bg-orange-50" : "text-red-600 bg-red-100"}`}>
                      <Clock size={10}/> STATUS: {trip.refundStatus}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 text-right">
                  <button onClick={() => { setReviewTarget({ id: trip.targetName, name: trip.targetName }); setTimeout(() => { document.getElementById("review-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100); }} className="text-blue-600 font-bold text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">
                    View / Write Review
                  </button>
                  {trip.refundStatus === "ACTIVE" && (
                    <button onClick={() => setShowCancel(trip.id)} className="text-red-500 font-bold text-xs px-3 py-2 hover:bg-red-50 rounded-lg transition-colors">
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
              <div className="bg-white p-10 rounded-[32px] border border-slate-100 text-center text-slate-500 shadow-sm">
                Click <strong>"View / Write Review"</strong> to fetch reviews from database.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm sticky top-6">
            <h4 className="font-bold flex items-center gap-2 mb-4 text-sm text-slate-800"> <TrendingUp size={16}/> Price Trends</h4>
            <div className="h-16 flex items-end gap-1 px-2">
              {[40, 70, 90, 50, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-100 rounded-t-md hover:bg-blue-600 transition-colors cursor-pointer" style={{height: `${h}%`}}></div>
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-3 text-center">Dynamic Pricing: +20% surge applied during peak holiday season.</p>
          </div>
        </aside>
      </main>

      {showCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[40px] max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Cancel Trip?</h2>
            <p className="text-xs text-slate-400 mb-6">A 50% refund policy applies to this booking.</p>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Reason</label>
            <select className="w-full bg-slate-50 p-4 rounded-2xl mb-8 mt-2 text-sm outline-none border border-slate-200 focus:border-blue-500">
              <option>Change of plans</option>
              <option>Health Emergency</option>
              <option>Found better price</option>
            </select>
            <div className="flex gap-4">
              <button onClick={() => setShowCancel(null)} className="flex-1 text-slate-400 font-bold hover:text-slate-600 transition-colors">Back</button>
              <button onClick={handleConfirmCancel} className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95">Confirm Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
