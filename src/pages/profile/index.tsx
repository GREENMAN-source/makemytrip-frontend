import { useRouter } from "next/router";
import { Plane, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

// 1. KOLKATA COMPLETELY REMOVED FROM SEARCH LISTING
const ALL_CITIES = [
  "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, NCR", "Bangalore, Karnataka", 
  "Hyderabad, Telangana", "Goa", "Pune, Maharashtra", "Jaipur, Rajasthan", 
  "Kochi, Kerala", "Shimla, Himachal Pradesh", "Coimbatore, Tamil Nadu"
];

const BookFlightPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 2. DEFAULT STARTING CITY CHANGED TO MUMBAI
  const [from, setFrom] = useState("Mumbai, Maharashtra");
  const [to, setTo] = useState("Pune, Maharashtra");
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);

  const user = useSelector((state: any) => state.user.user);

  useEffect(() => {
    const fetchFlight = async () => {
      if (!id) return;
      try {
        const res = await fetch("https://makemytrip-backend-030l.onrender.com/api/flights");
        const data = await res.json();
        const found = data.find((f: any) => f.id === id);
        if (found) setFlight(found);
      } catch (e) { console.error("Fetch Error"); }
      setLoading(false);
    };
    fetchFlight();
  }, [id]);

  const handleCitySearch = (val: string, type: 'from' | 'to') => {
    const filtered = val ? ALL_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())) : [];
    if (type === 'from') { setFrom(val); setFromSuggestions(filtered); } 
    else { setTo(val); setToSuggestions(filtered); }
  };

  const handleBooking = async () => {
    const userId = user?.id || user?._id || "user-123";
    
    // 3. DATABASE FIX: We ONLY save the destination to prevent AI confusion
    const destinationCity = to.split(',')[0].trim();
    const cleanTargetName = `Flight to ${destinationCity}`;
    
    try {
      await fetch("https://makemytrip-backend-030l.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serviceId: flight.id,
          serviceType: "FLIGHT",
          targetName: cleanTargetName, // Saved as "Flight to Pune"
          totalAmount: (flight.price + 1124),
          createdAt: new Date().toISOString()
        })
      });
      router.push("/profile");
    } catch (e) { alert("Booking failed"); }
  };

  if (loading || !flight) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-10 bg-blue-600 text-white">
          <h1 className="text-xl font-black uppercase tracking-widest mb-8 text-center">Route Customization</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-blue-200 mb-2 block">Starting From</label>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 flex items-center">
                <MapPin size={18} className="mr-3 text-blue-300"/>
                <input value={from} onChange={(e) => handleCitySearch(e.target.value, 'from')} className="bg-transparent outline-none font-bold w-full" />
              </div>
              {fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white text-slate-800 shadow-2xl rounded-2xl mt-2 z-50 overflow-hidden">
                  {fromSuggestions.map(c => <div key={c} onClick={()=>{setFrom(c); setFromSuggestions([]);}} className="p-4 hover:bg-blue-50 cursor-pointer font-bold border-b last:border-0">{c}</div>)}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="text-[10px] font-black uppercase text-blue-200 mb-2 block">Destination</label>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 flex items-center">
                <MapPin size={18} className="mr-3 text-blue-300"/>
                <input value={to} onChange={(e) => handleCitySearch(e.target.value, 'to')} className="bg-transparent outline-none font-bold w-full" />
              </div>
              {toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white text-slate-800 shadow-2xl rounded-2xl mt-2 z-50 overflow-hidden">
                  {toSuggestions.map(c => <div key={c} onClick={()=>{setTo(c); setToSuggestions([]);}} className="p-4 hover:bg-blue-50 cursor-pointer font-bold border-b last:border-0">{c}</div>)}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-12 text-center">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-800">{flight.flightName}</h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-2">Premium Direct Airways</p>
          </div>
          <Button onClick={handleBooking} className="w-full py-9 rounded-[24px] bg-blue-600 text-white text-xl font-black shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest">
            Confirm & Pay ₹{flight.price + 1124}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default BookFlightPage;
