import { useState, useEffect } from 'react';
import { Plane, Hotel, HomeIcon, Bell, Clock, TrendingUp, Info, Star, MapPin } from 'lucide-react';
import ReviewSystem from '@/components/ReviewSystem'; 
import { useSelector } from 'react-redux';

export default function MasterDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [liveStatus, setLiveStatus] = useState("AI-202: On Time");
  const [showCancel, setShowCancel] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{id: string, name: string} | null>(null);
  const [recommendation, setRecommendation] = useState({ title: "Loading...", reason: "..." });

  const user = useSelector((state: any) => state.user?.user);

  useEffect(() => {
    const fetchMyTrips = async () => {
      // 1. ENSURE THIS MATCHES: Use the same ID logic as your booking pages
      const userId = user?.id || "user-123"; 
      try {
        // FIXED: Changed localhost:8080 to the Render URL
        const res = await fetch(`https://makemytrip-backend-030l.onrender.com/api/bookings/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          // Sort by newest first (assuming createdAt is a timestamp or ISO string)
          const sortedData = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setTrips(sortedData); 
          generateRecommendation(sortedData);
        }
      } catch (err) {
        console.error("Database offline, empty dashboard.");
        generateRecommendation([]);
      }
    };
    fetchMyTrips();

    const msgs = ["Flight AI-202: Boarding", "Hotel Grand Palace: Room Ready", "Flight AI-202: Delayed 10m"];
    const interval = setInterval(() => setLiveStatus(msgs[Math.floor(Math.random() * msgs.length)]), 10000);
    return () => clearInterval(interval);
  }, [user]); 

  const generateRecommendation = (userTrips: any[]) => {
    if (userTrips.length === 0) {
      setRecommendation({ title: "Goa Beach Resort", reason: "Popular among new users for a perfect first getaway!" });
      return;
    }
    
    const latestTripName = userTrips[0].targetName?.toLowerCase() || "";
    
    if (latestTripName.includes("mumbai") || latestTripName.includes("goa") || latestTripName.includes("beach")) {
      setRecommendation({ title: "Bali Ocean Villa", reason: "Based on your recent coastal trips and beach stays." });
    } else if (latestTripName.includes("delhi") || latestTripName.includes("taj")) {
      setRecommendation({ title: "Jaipur Heritage Stay", reason: "Since you like historical and cultural destinations!" });
    } else if (latestTripName.includes("flight")) {
      setRecommendation({ title: "Premium Airport Lounge Access", reason: "Based on your frequent flight bookings." });
    } else {
      setRecommendation({ title: "Kerala Backwaters", reason: "A highly-rated serene escape matching your travel profile." });
    }
  };

  const handleConfirmCancel = async () => {
    const tripToCancel = trips.find(t => t.id === showCancel);
    if(!tripToCancel) return;

    const refundAmount = (tripToCancel.totalAmount * 0.5).toFixed(0);

    try {
      // FIXED: Changed localhost:8080 to the Render URL
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
        <h1 className="text-3xl font-black text-blue-800">MakeMyTour Dashboard</h1>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl flex items-center gap-3 animate-pulse shadow-lg">
          <Bell size={18}/> <span className="text-xs font-bold">{liveStatus}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="p-6 bg-blue-900 rounded-[32px] text-white relative overflow-hidden group shadow-md transition-all">
            <Star className="absolute -right-4 -top-4 opacity-10" size={150}/>
            <h2 className="text-xl font-bold">Suggested: {recommendation.title}</h2>
            <p className="text-xs opacity-70 mt-1 italic">Handpicked just for you.</p>
            <div className="mt-4 bg-white/10 p-2 rounded-lg w-fit flex items-center gap-2 cursor-help relative">
              <Info size={14}/> <span className="text-[10px] font-bold tracking-widest uppercase">Why this recommendation?</span>
              <div className="hidden group-hover:block absolute bottom-10 left-0 bg-black text-white p-2 rounded text-[10px] w-56 shadow-xl z-10 leading-relaxed">
                {recommendation.reason}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">My Upcoming Trips</h3>
            
            {trips.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-100 text-slate-500 shadow-sm">
                No trips found. Go to the Home Page to book one!
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
