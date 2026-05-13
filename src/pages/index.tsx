import { getflight, gethotel } from "@/api";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import {
  Bus, Calendar, Car, CreditCard, HomeIcon, Hotel, MapPin, Plane, QrCode, Shield, Train, Umbrella, Users, Star, X
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import InteractiveSelection from '@/components/InteractiveSelection';
import ReviewSystem from '@/components/ReviewSystem'; 

// --- LIST OF CITIES FOR DYNAMIC DROPDOWN ---
const ALL_CITIES = [
  "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, NCR", "Bangalore, Karnataka", 
  "Hyderabad, Telangana", "Kolkata, West Bengal", "Goa", "Pune, Maharashtra", 
  "Jaipur, Rajasthan", "Kochi, Kerala", "Shimla, Himachal Pradesh", "Coimbatore, Tamil Nadu"
];

export default function Home() {
  const [bookingtype, setbookingtype] = useState("flights");
  const [from, setfrom] = useState("");
  const [to, setto] = useState("");
  const [date, setdate] = useState("");
  const [travelers, settravelers] = useState(1);
  
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);

  const [searchresults, setsearchresult] = useState<any[]>([]);
  const [hotel, sethotel] = useState<any[]>([]);
  const [flight, setflight] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  
  const user = useSelector((state: any) => state.user?.user);
  const router = useRouter();
  
  const [checkoutStep, setCheckoutStep] = useState<0 | 1 | 2>(0); 
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [finalSelection, setFinalSelection] = useState<string | null>(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [reviewTarget, setReviewTarget] = useState<{id: string, name: string} | null>(null);

  // --- SMART MOCK DATA (Matches Dropdown) ---
  const defaultFlights = [
    { id: "mock-f1", flightName: "Air India AI-202", from: "Delhi, NCR", to: "Mumbai, Maharashtra", departureTime: "2026-05-15T10:00:00", price: 5000 },
    { id: "mock-f2", flightName: "IndiGo 6E-405", from: "Mumbai, Maharashtra", to: "Bangalore, Karnataka", departureTime: "2026-05-16T14:30:00", price: 4500 },
    { id: "mock-f3", flightName: "Vistara UK-995", from: "Bangalore, Karnataka", to: "Chennai, Tamil Nadu", departureTime: "2026-05-17T09:15:00", price: 3800 }
  ];

  const defaultHotels = [
    { id: "mock-h1", hotelName: "The Taj Mahal Palace", location: "Mumbai, Maharashtra", pricePerNight: 15000 },
    { id: "mock-h2", hotelName: "ITC Maurya", location: "Delhi, NCR", pricePerNight: 12000 },
    { id: "mock-h3", hotelName: "Taj Connemara", location: "Chennai, Tamil Nadu", pricePerNight: 9000 }
  ];

  const extraCategories: any = {
    homestays: [{ id: "hs1", title: "Serene Backwater Villa", subtitle: "Kerala • Entire Home", price: 4500, type: 'HOTEL' }],
    holiday: [{ id: "hol1", title: "Maldives 5N/6D Package", subtitle: "Flights & Hotel Included", price: 45000, type: 'FLIGHT' }],
    trains: [{ id: "tr1", title: "Vande Bharat Express", subtitle: "Delhi ➔ Varanasi", price: 1500, type: 'FLIGHT' }],
    buses: [{ id: "bs1", title: "Volvo Sleeper", subtitle: "Bangalore ➔ Chennai", price: 850, type: 'FLIGHT' }],
    cabs: [{ id: "cb1", title: "Outstation SUV", subtitle: "Mumbai ➔ Pune", price: 3000, type: 'FLIGHT' }],
    forex: [{ id: "fx1", title: "USD Travel Card", subtitle: "Zero Markup", price: 41500, type: 'OTHER' }],
    insurance: [{ id: "ins1", title: "Travel Shield", subtitle: "Medical Coverage", price: 499, type: 'OTHER' }]
  };

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const data = await gethotel();
        sethotel(data && data.length > 0 ? data : defaultHotels);
        const flightdata = await getflight();
        setflight(flightdata && flightdata.length > 0 ? flightdata : defaultFlights);
      } catch (error) {
        sethotel(defaultHotels);
        setflight(defaultFlights);
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
    const searchFrom = from.toLowerCase().split(',')[0].trim();
    const searchTo = to.toLowerCase().split(',')[0].trim();

    if (bookingtype === "flights") {
      const results = (flight.length > 0 ? flight : defaultFlights).filter(f => 
        (from === "" || f.from.toLowerCase().includes(searchFrom)) && 
        (to === "" || f.to.toLowerCase().includes(searchTo))
      ).map(f => ({
        id: f.id, title: `Flight: ${f.flightName}`, subtitle: `${f.from} ➔ ${f.to}`, price: f.price, type: 'FLIGHT'
      }));
      setsearchresult(results);
    } else if (bookingtype === "hotels") {
      const results = (hotel.length > 0 ? hotel : defaultHotels).filter(h => 
        (to === "" || h.location.toLowerCase().includes(searchTo))
      ).map(h => ({
        id: h.id, title: h.hotelName, subtitle: `Location: ${h.location}`, price: h.pricePerNight, type: 'HOTEL'
      }));
      setsearchresult(results);
    } else {
      setsearchresult(extraCategories[bookingtype] || []);
    }
  };

  const handlebooknow = (result: any) => {
    setSelectedTrip(result);
    setFinalPrice(result.price);
    setCheckoutStep(1); 
  };

  const handleSelectionConfirm = (selectionId: string, extraPrice: number) => {
    setFinalSelection(selectionId);
    setFinalPrice(selectedTrip.price + extraPrice);
    setCheckoutStep(2); 
  };

  const handlePayment = async () => {
    const bookingData = {
      userId: user?.id || "user123",
      serviceType: selectedTrip.type || "OTHER",
      targetName: selectedTrip.title,
      totalAmount: finalPrice,
      selectionId: finalSelection || "Standard",
      refundStatus: "ACTIVE"
    };

    try {
      await fetch("http://localhost:8080/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookingData)
      });
      alert(`Payment Successful!`);
      router.push('/profile'); 
    } catch (error) {
      alert("Error saving booking.");
    }
  };

  if (loading) return <Loader />;
  const isTravelType = bookingtype === "flights" || bookingtype === "trains" || bookingtype === "buses" || bookingtype === "cabs";

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat pb-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=2940&q=80")' }}>
      <main className="container mx-auto px-4 py-6">
        
        <nav className="bg-white rounded-xl shadow-lg mx-auto max-w-5xl mb-6 p-4 overflow-x-auto">
          <div className="flex justify-between items-center min-w-max space-x-8">
            <NavItem icon={<Plane />} text="Flights" active={bookingtype === "flights"} onClick={() => setbookingtype("flights")} />
            <NavItem icon={<Hotel />} text="Hotels" active={bookingtype === "hotels"} onClick={() => setbookingtype("hotels")} />
            <NavItem icon={<HomeIcon />} text="Homestays" active={bookingtype === "homestays"} onClick={() => setbookingtype("homestays")} />
            <NavItem icon={<Umbrella />} text="Holiday" active={bookingtype === "holiday"} onClick={() => setbookingtype("holiday")} />
            <NavItem icon={<Train />} text="Trains" active={bookingtype === "trains"} onClick={() => setbookingtype("trains")} />
            <NavItem icon={<Bus />} text="Buses" active={bookingtype === "buses"} onClick={() => setbookingtype("buses")} />
            <NavItem icon={<Car />} text="Cabs" active={bookingtype === "cabs"} onClick={() => setbookingtype("cabs")} />
            <NavItem icon={<CreditCard />} text="Forex" active={bookingtype === "forex"} onClick={() => setbookingtype("forex")} />
            <NavItem icon={<Shield />} text="Insurance" active={bookingtype === "insurance"} onClick={() => setbookingtype("insurance")} />
          </div>
        </nav>

        <div className="bg-white rounded-xl shadow-lg mx-auto max-w-5xl p-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {isTravelType && (
              <div className="col-span-1 relative">
                <SearchInput icon={<MapPin className="text-gray-400" />} placeholder="From" value={from} onChange={(e:any)=>handleFromChange(e.target.value)} />
                {fromSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-xl z-[100] border border-slate-100 mt-1 max-h-48 overflow-y-auto">
                    {fromSuggestions.map(city => (
                      <div key={city} onClick={()=>{setfrom(city); setFromSuggestions([]);}} className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-bold border-b border-slate-50 last:border-0">{city}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="col-span-1 relative">
              <SearchInput icon={<MapPin className="text-gray-400" />} placeholder={isTravelType ? "To" : "City / Location"} value={to} onChange={(e:any)=>handleToChange(e.target.value)} />
              {toSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-b-xl z-[100] border border-slate-100 mt-1 max-h-48 overflow-y-auto">
                  {toSuggestions.map(city => (
                    <div key={city} onClick={()=>{setto(city); setToSuggestions([]);}} className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-bold border-b border-slate-50 last:border-0">{city}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-1"><SearchInput type="date" icon={<Calendar className="text-gray-400" />} placeholder="Date" value={date} onChange={(e:any)=>setdate(e.target.value)} /></div>
            <div className="col-span-1"><SearchInput type="number" icon={<Users className="text-gray-400" />} placeholder="Travelers" value={travelers} onChange={(e:any)=>settravelers(e.target.value)} /></div>
            <Button className="col-span-1 h-full" onClick={handlesearch}>SEARCH</Button>
          </div>
          
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-6 text-white drop-shadow-md">Available Results</h2>
            {searchresults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchresults.map((result) => (
                  <div key={result.id} className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 hover:scale-[1.02] transition-transform">
                    <h3 className="font-black text-xl text-slate-800">{result.title}</h3>
                    <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-wider">{result.subtitle}</p>
                    <p className="text-3xl font-black mt-4 text-blue-600">₹{result.price}</p>
                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" className="flex-1 rounded-2xl border-blue-100 text-blue-600 font-bold hover:bg-blue-50" onClick={() => setReviewTarget({id: result.title, name: result.title})}>
                        <Star size={16} className="mr-2"/> Reviews
                      </Button>
                      <Button className="flex-1 rounded-2xl font-bold shadow-lg shadow-blue-200" onClick={() => handlebooknow(result)}>Book Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-black/20 backdrop-blur-md p-10 rounded-[40px] border border-white/20 text-center">
                 <p className="text-white text-lg font-bold">Use the search bar above to explore destinations</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* REVIEWS MODAL */}
      {reviewTarget && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-[40px] max-w-4xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => setReviewTarget(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800 bg-slate-100 p-2 rounded-full z-[210]"><X/></button>
             <div className="p-4 md:p-8">
                <ReviewSystem targetId={reviewTarget.id} targetName={reviewTarget.name} />
             </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODALS */}
      {checkoutStep === 1 && selectedTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[200]">
           <div className="bg-white p-10 rounded-[50px] max-w-lg w-full shadow-2xl relative my-auto animate-in zoom-in">
              <button onClick={() => setCheckoutStep(0)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-800"><X/></button>
              <div className="text-center mb-8">
                <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">Step 01</span>
                <h2 className="text-3xl font-black mt-4 text-slate-800">Select Options</h2>
                <p className="text-sm text-slate-400 font-bold mt-2 uppercase">{selectedTrip.title}</p>
              </div>
              <InteractiveSelection type={selectedTrip.type || 'FLIGHT'} onConfirm={handleSelectionConfirm} />
           </div>
        </div>
      )}

      {checkoutStep === 2 && selectedTrip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-[200]">
           <div className="bg-white p-12 rounded-[60px] max-w-md w-full shadow-2xl relative animate-in zoom-in">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="text-3xl font-black text-slate-800">Confirm</h2>
                 <button onClick={() => setCheckoutStep(1)} className="text-sm text-blue-600 font-black">← BACK</button>
              </div>
              <div className="bg-slate-50 p-8 rounded-[40px] mb-10 border border-slate-100">
                 <div className="flex justify-between mb-3 text-slate-500 font-bold"><span>Total Amount:</span></div>
                 <div className="text-5xl font-black text-slate-800 tracking-tighter">₹{finalPrice}</div>
              </div>
              <Button onClick={handlePayment} className="w-full py-8 text-xl rounded-[30px] font-black shadow-2xl shadow-blue-200">
                <Shield size={24} className="mr-2"/> CONFIRM PAYMENT
              </Button>
           </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, text, active = false, onClick }: any) {
  return (
    <button className={`flex flex-col items-center p-4 rounded-3xl transition-all ${active ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110" : "text-slate-400 hover:text-blue-500"}`} onClick={onClick}>
      <span className={active ? "scale-110" : ""}>{icon}</span>
      <span className="text-[10px] mt-2 font-black uppercase tracking-tighter">{text}</span>
    </button>
  );
}

function SearchInput({ icon, placeholder, value, onChange, type = "text" }: any) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border-2 border-transparent hover:border-blue-100 focus-within:border-blue-500 transition-all h-full">
      <div className="flex items-center space-x-3">
        <div className="text-blue-500">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-slate-400 font-black uppercase mb-1">{placeholder}</div>
          <input type={type} value={value} onChange={onChange} className="font-bold w-full bg-transparent outline-none text-slate-800" placeholder="..." />
        </div>
      </div>
    </div>
  );
}