import { useRouter } from "next/router";
import {
  Plane, Luggage, Clock, Calendar, MapPin, Gift, CreditCard, AlertCircle, 
  Star, Info, ArrowRight, Ticket, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";

// --- MASTER CITY LIST ---
const ALL_CITIES = [
  "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, NCR", "Bangalore, Karnataka", 
  "Hyderabad, Telangana", "Kolkata, West Bengal", "Goa", "Pune, Maharashtra", 
  "Jaipur, Rajasthan", "Kochi, Kerala", "Shimla, Himachal Pradesh", "Coimbatore, Tamil Nadu"
];

const BookFlightPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [open, setOpen] = useState(false);
  
  // Dynamic Location States
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);

  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFlightDetails = async () => {
      if (!id) return;
      try {
        const res = await fetch("https://makemytrip-backend-030l.onrender.com/api/flights");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const found = data.find((f: any) => f.id === id);
        
        if (found) {
          setFlight(found);
          setFrom(found.from); // Default from DB
          setTo(found.to);     // Default from DB
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlightDetails();
  }, [id]);

  if (loading) return <Loader />;
  if (!flight) return <div className="p-20 text-center font-bold">Flight not found.</div>;

  const handleCitySearch = (val: string, type: 'from' | 'to') => {
    const filtered = val ? ALL_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())) : [];
    if (type === 'from') {
      setFrom(val);
      setFromSuggestions(filtered);
    } else {
      setTo(val);
      setToSuggestions(filtered);
    }
  };

  const grandTotal = (flight.price * quantity) + (1374 * quantity) - (250 * quantity);

  const handleBooking = async () => {
    try {
      const response = await fetch("https://makemytrip-backend-030l.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "user-123",
          serviceId: flight.id,
          serviceType: "FLIGHT",
          targetName: `${flight.flightName}: ${from} to ${to}`, // Captures your manual changes
          totalAmount: grandTotal,
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert("Booking Successful!");
        router.push("/profile");
      }
    } catch (error) {
      alert("Booking failed. Check Render status.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
          
          {/* Header: Route Selector */}
          <div className="p-8 bg-blue-600 text-white">
            <h1 className="text-2xl font-black mb-6">Customize Your Route</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              
              {/* FROM Input */}
              <div className="relative">
                <Label className="text-blue-100 text-xs font-bold uppercase mb-2 block">Origin</Label>
                <div className="flex items-center bg-white/10 rounded-2xl p-4 border border-white/20">
                  <MapPin className="mr-3" size={20}/>
                  <input value={from} onChange={(e) => handleCitySearch(e.target.value, 'from')} className="bg-transparent outline-none w-full font-bold placeholder:text-white/50" placeholder="Where from?" />
                </div>
                {fromSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white text-slate-800 shadow-2xl rounded-2xl mt-2 z-50 overflow-hidden">
                    {fromSuggestions.map(c => <div key={c} onClick={()=>{setFrom(c); setFromSuggestions([]);}} className="p-4 hover:bg-blue-50 cursor-pointer font-bold border-b last:border-0 text-sm">{c}</div>)}
                  </div>
                )}
              </div>

              {/* TO Input */}
              <div className="relative">
                <Label className="text-blue-100 text-xs font-bold uppercase mb-2 block">Destination</Label>
                <div className="flex items-center bg-white/10 rounded-2xl p-4 border border-white/20">
                  <MapPin className="mr-3" size={20}/>
                  <input value={to} onChange={(e) => handleCitySearch(e.target.value, 'to')} className="bg-transparent outline-none w-full font-bold placeholder:text-white/50" placeholder="Where to?" />
                </div>
                {toSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white text-slate-800 shadow-2xl rounded-2xl mt-2 z-50 overflow-hidden">
                    {toSuggestions.map(c => <div key={c} onClick={()=>{setTo(c); setToSuggestions([]);}} className="p-4 hover:bg-blue-50 cursor-pointer font-bold border-b last:border-0 text-sm">{c}</div>)}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Flight Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border-2 border-slate-50 p-6 rounded-[32px] flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Plane size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{flight.flightName}</h2>
                  <p className="text-sm font-bold text-slate-400">Class: Economy • Aircraft: Airbus A320</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] grid grid-cols-2 gap-4 text-sm font-bold">
                <div className="flex items-center gap-3 text-slate-600"><Luggage size={18}/> Cabin: 7kg</div>
                <div className="flex items-center gap-3 text-slate-600"><Clock size={18}/> Duration: 3h 0m</div>
              </div>
            </div>

            {/* Price Sidebar */}
            <div className="bg-blue-50/50 p-8 rounded-[40px] border border-blue-100">
              <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500">Tickets ({quantity})</span>
                  <span>₹{flight.price * quantity}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500">Taxes</span>
                  <span>₹{1374 * quantity}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-blue-600 border-t border-blue-200 pt-4">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full py-6 rounded-2xl font-black text-lg shadow-xl shadow-blue-200">PROCEED</Button>
                </DialogTrigger>
                <DialogContent className="bg-white rounded-[40px]">
                  <DialogHeader><DialogTitle className="text-2xl font-black">Confirm Booking</DialogTitle></DialogHeader>
                  <div className="py-6 space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-xs font-bold text-slate-400 uppercase">Route</p>
                      <p className="font-black text-slate-800">{from} ➔ {to}</p>
                    </div>
                    <div className="flex justify-between font-black text-xl"><span>Final Pay:</span><span>₹{grandTotal}</span></div>
                    <Button onClick={handleBooking} className="w-full py-6 rounded-2xl font-black">PAY NOW</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookFlightPage;
