import { useRouter } from "next/router";
import { Plane, MapPin, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

// KOLKATA REMOVED
const ALL_CITIES = [
  "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, NCR", "Bangalore, Karnataka", 
  "Hyderabad, Telangana", "Goa", "Pune, Maharashtra", "Jaipur, Rajasthan", "Kochi, Kerala"
];

const BookFlightPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [flight, setFlight] = useState<any>(null);
  const [from, setFrom] = useState("Mumbai, Maharashtra");
  const [to, setTo] = useState("Pune, Maharashtra");
  const user = useSelector((state: any) => state.user.user);

  useEffect(() => {
    const fetchFlight = async () => {
      if (!id) return;
      const res = await fetch("https://makemytrip-backend-030l.onrender.com/api/flights");
      const data = await res.json();
      const found = data.find((f: any) => f.id === id);
      if (found) setFlight(found);
    };
    fetchFlight();
  }, [id]);

  const handleBooking = async () => {
    const destinationCity = to.split(',')[0].trim();
    await fetch("https://makemytrip-backend-030l.onrender.com/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id || "user-123",
        serviceType: "FLIGHT",
        targetName: `Flight to ${destinationCity}`, // No Kolkata saved
        totalAmount: (flight.price + 1124),
        createdAt: new Date().toISOString()
      })
    });
    router.push("/profile");
  };

  if (!flight) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-8 bg-blue-600 text-white text-center">
          <h1 className="text-xl font-black uppercase">Confirm Route</h1>
          <div className="flex justify-center items-center gap-4 mt-6">
            <input value={from} onChange={(e)=>setFrom(e.target.value)} className="bg-white/10 p-3 rounded-xl border border-white/20 text-center font-bold" />
            <ArrowRight className="opacity-40" />
            <input value={to} onChange={(e)=>setTo(e.target.value)} className="bg-white/10 p-3 rounded-xl border border-white/20 text-center font-bold" />
          </div>
        </div>
        <div className="p-10 text-center">
          <h2 className="text-3xl font-black text-slate-800 mb-8">{flight.flightName}</h2>
          <Button onClick={handleBooking} className="w-full py-8 rounded-3xl bg-blue-600 text-white text-xl font-black">BOOK NOW</Button>
        </div>
      </div>
    </div>
  );
};
export default BookFlightPage;
