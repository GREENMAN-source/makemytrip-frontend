import { useRouter } from "next/router";
import {
  Plane, Luggage, Clock, Calendar, MapPin, Gift, CreditCard, AlertCircle, 
  Star, Info, ArrowRight, Ticket, X, Loader2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";

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
  
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);

  const user = useSelector((state: any) => state.user.user);

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
          setFrom(found.from || "Mumbai"); 
          setTo(found.to || "Chennai");     
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
    // CRITICAL: We use a robust ID check to ensure the dashboard can find the booking
    const activeUserId = user?.id || user?._id || "user-123";

    try {
      const response = await fetch("https://makemytrip-backend-030l.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUserId,
          serviceId: flight.id,
          serviceType: "FLIGHT",
          // THE MASTER FIX: This specific format (From ➔ To) is what the AI Dashboard looks for.
          targetName: `${flight.flightName} (${from} ➔ ${to})`, 
          totalAmount: grandTotal,
          createdAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        setOpen(false);
        router.push("/profile");
      }
    } catch (error) {
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
          
          <div className="p-8 bg-blue-600 text-white">
            <h1 className="text-2xl font-black mb-6">Customize Your Route</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <Label className="text-blue-100 text-[10px] font-black uppercase mb-2 block tracking-widest">Origin</Label>
                <div className="flex items-center bg-white/10 rounded-2xl p-4 border border-white/20">
                  <MapPin className="mr-3 text-blue-200" size={20}/>
                  <input value={from} onChange={(e) => handleCitySearch(e.target.value, 'from')} className="bg-transparent outline-none w-full font-bold placeholder:text-white/50" placeholder="From City" />
                </div>
                {fromSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white text-slate-800 shadow-2xl rounded-2xl mt-2 z-50 border border-slate-100 overflow-hidden">
                    {fromSuggestions.map(c => <div key={c} onClick={()=>{setFrom(c); setFromSuggestions([]);}} className="p-4 hover:bg-blue-50 cursor-pointer font-bold border-b last:border-0 text-sm">{c}</div>)}
                  </div>
                )}
              </div>

              <div className="relative">
                <Label className="text-blue-100 text-[10px] font-black uppercase mb-2 block tracking-widest">Destination</Label>
                <div className="flex items-center bg-white/10 rounded-2xl p-4 border border-white/20">
                  <MapPin className="mr-3 text-blue-200" size={20}/>
                  <input value={to} onChange={(e) => handleCitySearch(e.target.value, 'to')} className="bg-transparent outline-none w-full font-bold placeholder:text-white/50" placeholder="To City" />
                </div>
                {toSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white text-slate-800 shadow-2xl rounded-2xl mt-2 z-50 border border-slate-100 overflow-hidden">
                    {toSuggestions.map(c => <div key={c} onClick={()=>{setTo(c); setToSuggestions([]);}} className="p-4 hover:bg-blue-50 cursor-pointer font-bold border-b last:border-0 text-sm">{c}</div>)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Plane size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{flight.flightName}</h2>
                  <p className="text-sm font-bold text-slate-400">Class: Economy • Aircraft: Airbus A320</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-6 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <Luggage className="text-blue-600" size={24}/>
                  <div><p className="text-[10px] uppercase font-black text-slate-400">Cabin</p><p className="font-bold">7kg Max</p></div>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <Clock className="text-blue-600" size={24}/>
                  <div><p className="text-[10px] uppercase font-black text-slate-400">Duration</p><p className="font-bold">3h 0m</p></div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/30 p-8 rounded-[40px] border border-blue-100 h-fit">
              <h3 className="font-black text-slate-400 mb-6 uppercase tracking-widest text-[10px]">Fare Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500">Base Fare ({quantity})</span>
                  <span>₹{flight.price * quantity}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500">Surcharge & Taxes</span>
                  <span>₹{1374 * quantity}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-blue-700 border-t border-blue-100 pt-6">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full py-7 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 bg-blue-600 hover:bg-blue-700 transition-all uppercase tracking-widest">Confirm Booking</Button>
                </DialogTrigger>
                <DialogContent className="bg-white rounded-[40px] border-none shadow-2xl p-8">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-slate-800">Final Confirmation</DialogTitle>
                  </DialogHeader>
                  <div className="py-6 space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirmed Route</p>
                      <div className="flex items-center gap-3">
                         <span className="font-black text-lg">{from.split(',')[0]}</span>
                         <ArrowRight className="text-blue-600" size={20}/>
                         <span className="font-black text-lg">{to.split(',')[0]}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-blue-600 p-6 rounded-3xl text-white">
                       <span className="font-bold">Amount to Pay</span>
                       <span className="text-2xl font-black">₹{grandTotal}</span>
                    </div>
                    <Button onClick={handleBooking} className="w-full py-8 rounded-3xl font-black text-lg bg-slate-900 hover:bg-black transition-all shadow-xl">PAY & RESERVE SEAT</Button>
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
