import { useRouter } from "next/router";
import { Plane, MapPin, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

// KOLKATA REMOVED FROM LISTING
const ALL_CITIES = [
  "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, NCR", "Bangalore, Karnataka", 
  "Hyderabad, Telangana", "Goa", "Pune, Maharashtra", "Jaipur, Rajasthan", 
  "Kochi, Kerala", "Shimla, Himachal Pradesh", "Coimbatore, Tamil Nadu"
];

const BookFlightPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [flight, setFlight] = useState<any>(null);
  const [from, setFrom] = useState("Mumbai");
  const [to, setTo] = useState("Pune");
  const user = useSelector((state: any) => state.user.user);

  useEffect(() => {
    const fetchFlight = async () => {
      if (!id) return;
      const res = await fetch("https://makemytrip-backend-030l.onrender.com/api/flights");
      const data = await res.json();
      const found = data.find((f: any) => f.id === id);
      if (found) {
        setFlight(found);
      }
    };
    fetchFlight();
  }, [id]);

  const handleBooking = async () => {
    const userId = user?.id || user?._id || "user-123";
    
    // THE FIX: ONLY save the destination. No "From" city, no Kolkata.
    const destinationCity = to.split(',')[0].trim();
    const cleanTargetName = `Flight to ${destinationCity}`;
    
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
  };

  if (!flight) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-8 bg-blue-600 text-white text-center">
          <h1 className="text-xl font-black uppercase tracking-widest">Select Destination</h1>
          <div className="flex justify-center items-center gap-4 mt-6">
            <input value={from} onChange={(e)=>setFrom(e.target.value)} className="bg-white/10 p-3 rounded-xl border border-white/20 text-center font-bold" />
            <ArrowRight className="opacity-40" />
            <input value={to} onChange={(e)=>setTo(e.target.value)} className="bg-white/10 p-3 rounded-xl border border-white/20 text-center font-bold" />
          </div>
        </div>
        <div className="p-10 text-center">
          <h2 className="text-3xl font-black text-slate-800 mb-8">{flight.flightName}</h2>
          <Button onClick={handleBooking} className="w-full py-8 rounded-3xl bg-blue-600 text-white text-xl font-black shadow-xl hover:bg-blue-700">CONFIRM BOOKING</Button>
        </div>
      </div>
    </div>
  );
};
export default BookFlightPage;
