import { useRouter } from "next/router";
import { Plane, Luggage, Clock, MapPin, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Loader from "@/components/Loader";

const ALL_CITIES = ["Chennai", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Kolkata", "Goa", "Pune", "Jaipur", "Kochi"];

const BookFlightPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const user = useSelector((state: any) => state.user.user);

  useEffect(() => {
    const fetchFlight = async () => {
      if (!id) return;
      const res = await fetch("https://makemytrip-backend-030l.onrender.com/api/flights");
      const data = await res.json();
      const found = data.find((f: any) => f.id === id);
      if (found) {
        setFlight(found);
        setFrom(found.from || "Mumbai");
        setTo(found.to || "Pune");
      }
      setLoading(false);
    };
    fetchFlight();
  }, [id]);

  const handleBooking = async () => {
    const userId = user?.id || user?._id || "user-123";
    // THIS LINE IS THE FIX: It creates a clean "City to City" name for the AI to read
    const cleanTargetName = `Flight: ${from} ➔ ${to}`;
    
    await fetch("https://makemytrip-backend-030l.onrender.com/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        serviceId: flight.id,
        serviceType: "FLIGHT",
        targetName: cleanTargetName,
        totalAmount: (flight.price + 1124),
        createdAt: new Date().toISOString()
      })
    });
    router.push("/profile");
  };

  if (loading || !flight) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-[40px] shadow-2xl overflow-hidden">
        <div className="p-8 bg-blue-600 text-white text-center">
          <h1 className="text-2xl font-black">Confirm Your Destination</h1>
          <div className="flex justify-center items-center gap-4 mt-4">
            <input value={from} onChange={(e)=>setFrom(e.target.value)} className="bg-white/10 p-3 rounded-xl border border-white/20 text-center font-bold" />
            <ArrowRight />
            <input value={to} onChange={(e)=>setTo(e.target.value)} className="bg-white/10 p-3 rounded-xl border border-white/20 text-center font-bold" />
          </div>
        </div>
        <div className="p-10 text-center">
          <h2 className="text-3xl font-black mb-6">{flight.flightName}</h2>
          <Button onClick={handleBooking} className="w-full py-8 rounded-3xl bg-blue-600 text-xl font-black shadow-xl hover:bg-blue-700">CONFIRM & BOOK</Button>
        </div>
      </div>
    </div>
  );
};
export default BookFlightPage;
