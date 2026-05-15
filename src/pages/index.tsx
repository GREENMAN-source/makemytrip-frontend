import { getflight, gethotel } from "@/api";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Bus, Calendar, Car, CreditCard, HomeIcon, Hotel, MapPin, Plane, Shield, Train, Umbrella, Users, Star, X
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InteractiveSelection from '@/components/InteractiveSelection';
import ReviewSystem from '@/components/ReviewSystem'; 

// --- 1. MASTER LIST: KOLKATA DELETED ---
const ALL_CITIES = [
  "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, NCR", "Bangalore, Karnataka", 
  "Hyderabad, Telangana", "Goa", "Pune, Maharashtra", 
  "Jaipur, Rajasthan", "Kochi, Kerala", "Shimla, Himachal Pradesh", "Coimbatore, Tamil Nadu"
];

export default function Home() {
  const [bookingtype, setbookingtype] = useState("flights");
  const [from, setfrom] = useState("Mumbai, Maharashtra"); // Default: Mumbai
  const [to, setto] = useState("Pune, Maharashtra");
  const [date, setdate] = useState("");
  const [travelers, settravelers] = useState(1);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [searchresults, setsearchresult] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  
  const user = useSelector((state: any) => state.user?.user);
  const router = useRouter();
  
  const [checkoutStep, setCheckoutStep] = useState<0 | 1 | 2>(0); 
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [finalSelection, setFinalSelection] = useState<string | null>(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [reviewTarget, setReviewTarget] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const fetchdata = async () => {
      try {
        await Promise.all([gethotel(), getflight()]);
      } catch (error) {
        console.error("Fetch error");
      } finally {
        setloading(false);
      }
    };
    fetchdata();
  }, [user]);

  const handleFromChange = (val: string) => {
    setfrom(val);
    setFromSuggestions(val ? ALL_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())) : []);
  };

  const handleToChange = (val: string) => {
    setto(val);
    setToSuggestions(val ? ALL_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())) : []);
  };

  const handlesearch = () => {
    const results = [{
      id: `custom-${Math.random()}`,
      title: `${bookingtype === 'flights' ? 'Flight' : 'Stay'} to ${to.split(',')[0]}`,
      subtitle: `${from} ➔ ${to}`,
      price: Math.floor(Math.random() * 4000) + 3000,
      type: bookingtype === 'flights' ? 'FLIGHT' : 'HOTEL'
    }];
    setsearchresult(results);
  };

  const handlePayment = async () => {
    const destinationCity = to.split(',')[0].trim();
    const bookingData = {
      userId: user?.id || user?._id || "user-123",
      serviceType: selectedTrip.type,
      // SAVING LOGIC: Only save destination to prevent AI confusion
      targetName: `${selectedTrip.type === 'FLIGHT' ? 'Flight' : 'Hotel'} to ${destinationCity}`, 
      totalAmount: finalPrice,
      selectionId: finalSelection || "Standard",
      refundStatus: "ACTIVE",
      createdAt: new Date().toISOString()
    };

    try {
      await fetch("https://makemytrip-backend-030l.onrender.com/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookingData)
      });
      router.push('/profile'); 
    } catch (error) { alert("Booking Error"); }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="container mx-auto px-4 py-6">
        <nav className="bg-white rounded-2xl shadow-sm mx-auto max-w-5xl mb-6 p-4 flex justify-between overflow-x-auto">
          <NavItem icon={<Plane />} text="Flights" active={bookingtype === "flights"} onClick={() => setbookingtype("flights")} />
          <NavItem icon={<Hotel />} text="Hotels" active={bookingtype === "hotels"} onClick={() => setbookingtype("hotels")} />
          <NavItem icon={<Train />} text="Trains" active={bookingtype === "trains"} onClick={() => setbookingtype("trains")} />
          <NavItem icon={<Bus />} text="Buses" active={bookingtype === "buses"} onClick={() => setbookingtype("buses")} />
          <NavItem icon={<Car />} text="Cabs" active={bookingtype === "cabs"} onClick={() => setbookingtype("cabs")} />
        </nav>

        <div className="bg-white rounded-[32px] shadow-xl mx-auto max-w-5xl p-8 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="col-span-1 relative">
              <SearchInput icon={<MapPin />} placeholder="From" value={from} onChange={(e:any)=>handleFromChange(e.target.value)} />
              {fromSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-2xl z-[100] mt-2 border border-slate-100 overflow-hidden">
                  {fromSuggestions.map(city => <div key={city} onClick={()=>{setfrom(city); setFromSuggestions([]);}} className="p-4 hover:bg-blue-50 cursor-pointer font-bold text-sm border-b last:border-0">{city}</div>)}
                </div>
              )}
            </div>
            
            <div className="col-span-1 relative">
              <SearchInput icon={<MapPin />} placeholder="To" value={to} onChange={(e:any)=>handleToChange(e.target.value)} />
              {toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-2xl z-[100] mt-2 border border-slate-100 overflow-hidden">
                  {toSuggestions.map(city => <div key={city} onClick={()=>{setto(city); setToSuggestions([]);}} className="p-4 hover:bg-blue-50 cursor-pointer font-bold text-sm border-b last:border-0">{city}</div>)}
                </div>
              )}
            </div>

            <div className="col-span-1"><SearchInput type="date" icon={<Calendar />} placeholder="Date" value={date} onChange={(e:any)=>setdate(e.target.value)} /></div>
            <div className="col-span-1"><SearchInput type="number" icon={<Users />} placeholder="Travelers" value={travelers} onChange={(e:any)=>settravelers(e.target.value)} /></div>
            <Button className="col-span-1 h-full bg-blue-600 rounded-2xl font-black shadow-lg" onClick={handlesearch}>SEARCH</Button>
          </div>
          
          <div className="mt-12">
            <h2 className="text-xl font-black mb-6 text-slate-800">Available Options</h2>
            {searchresults.map((result) => (
              <div key={result.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-black text-xl text-slate-800">{result.title}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">{result.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600 mb-2">₹{result.price}</p>
                  <Button onClick={() => {setSelectedTrip(result); setFinalPrice(result.price); setCheckoutStep(1);}} className="rounded-xl font-bold">Book</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {checkoutStep === 2 && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200]">
           <div className="bg-white p-12 rounded-[50px] max-w-md w-full shadow-2xl text-center">
              <h2 className="text-3xl font-black mb-6">Confirm Pay</h2>
              <div className="bg-slate-50 p-8 rounded-3xl mb-8 font-black text-4xl text-blue-600">₹{finalPrice}</div>
              <Button onClick={handlePayment} className="w-full py-8 text-xl rounded-3xl font-black">PAY NOW</Button>
           </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, text, active, onClick }: any) {
  return (
    <button className={`flex flex-col items-center p-4 rounded-2xl transition-all ${active ? "bg-blue-600 text-white" : "text-slate-400"}`} onClick={onClick}>
      {icon} <span className="text-[10px] mt-2 font-black uppercase">{text}</span>
    </button>
  );
}

function SearchInput({ icon, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 h-full">
      <div className="flex items-center space-x-3">
        <div className="text-blue-500">{icon}</div>
        <div className="flex-1">
          <div className="text-[9px] text-slate-400 font-black uppercase mb-1">{placeholder}</div>
          <input type={type} value={value} onChange={onChange} className="font-bold w-full bg-transparent outline-none text-slate-800" />
        </div>
      </div>
    </div>
  );
}
