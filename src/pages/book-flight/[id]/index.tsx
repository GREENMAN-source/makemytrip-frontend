import { useRouter } from "next/router";
import {
  Plane,
  Luggage,
  Clock,
  Calendar,
  MapPin,
  Gift,
  CreditCard,
  AlertCircle,
  ChevronRight,
  Star,
  Info,
  ArrowRight,
  Users,
  Ticket
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignupDialog from "@/components/SignupDialog";
import Loader from "@/components/Loader";
import { setUser } from "@/store";

interface Flight {
  id: string;
  flightName: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
}

const BookFlightPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [open, setopem] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const dispatch = useDispatch();

  // 1. FIXED: Direct Fetch for Flights (No more hidden API calls)
  useEffect(() => {
    const fetchFlights = async () => {
      if (!id) return;
      try {
        const res = await fetch("https://makemytrip-backend-030l.onrender.com/api/flights");
        if (!res.ok) throw new Error("Failed to fetch flights");
        const data = await res.json();
        const filteredData = data.filter((flight: any) => flight.id === id);
        setFlights(filteredData);
      } catch (error) {
        console.error("Error fetching flights:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [id]);

  if (loading) return <Loader />;
  if (flights.length === 0) return <div className="p-20 text-center">No flight data available for this ID.</div>;

  const flight = flights[0];
  
  // Mock details for UI
  const flightDetails = {
    duration: "3h 0m",
    flightNo: "IX 2747",
    aircraft: "Airbus A320",
    cabinBaggage: "7 Kgs / Adult",
    checkInBaggage: "15 Kgs / Adult",
  };

  const fareSummary = { taxes: 1374, otherServices: 249, discounts: -250 };
  const promoOffers = [
    { code: "MMTSECURE", description: "Get ₹299 instant discount!", amount: 299 },
    { code: "SPECIALUPI", description: "Get ₹362 discount via UPI!", amount: 362 },
  ];

  const hotels = [
    { name: "Hotel Park Tree", rating: 4, price: 9000, image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800", location: "Near Airport, New Delhi" },
    { name: "Lemon Tree Premier", rating: 4, price: 43875, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800", location: "Connaught Place, New Delhi" },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuantity(isNaN(value) ? 1 : Math.max(1, Math.min(value, flight.availableSeats)));
  };

  const totalPrice = flight.price * quantity;
  const grandTotal = totalPrice + (fareSummary.taxes * quantity) + (fareSummary.otherServices * quantity) + (fareSummary.discounts * quantity);

  // 2. FIXED: Direct Fetch for Booking (This removes the final localhost error)
  const handlebooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("https://makemytrip-backend-030l.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "user-123",
          serviceId: flight.id,
          serviceType: "FLIGHT",
          totalAmount: grandTotal,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error("Server rejected booking");
      const data = await response.json();

      const updateuser = { ...user, bookings: [...(user.bookings || []), data] };
      dispatch(setUser(updateuser));
      setopem(false);
      alert("Flight Booking Successful!");
      router.push("/profile");
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Booking failed. Please ensure your Render backend is not paused.");
    }
  };

  const BookingContent = () => (
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold flex items-center">
          <Plane className="w-6 h-6 mr-2" /> Flight Booking Details
        </DialogTitle>
      </DialogHeader>
      <div className="grid gap-6 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Flight</Label><Input value={flight.flightName} readOnly /></div>
          <div className="space-y-1"><Label>Tickets</Label><Input type="number" value={quantity} onChange={handleQuantityChange} /></div>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2 flex items-center"><CreditCard className="w-4 h-4 mr-2" /> Total: ₹ {grandTotal.toLocaleString()}</h3>
        </div>
      </div>
      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={handlebooking}>Confirm & Pay</Button>
    </DialogContent>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fa] pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center">{flight.from} <ArrowRight className="mx-2" /> {flight.to}</h2>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">ECONOMY</span>
              </div>
              <div className="grid grid-cols-3 items-center border-t pt-6 text-center">
                <div><div className="text-2xl font-bold">{formatDate(flight.departureTime)}</div><p className="text-xs text-gray-500">{flight.from}</p></div>
                <div className="text-gray-400">--- {flightDetails.duration} ---</div>
                <div><div className="text-2xl font-bold">{formatDate(flight.arrivalTime)}</div><p className="text-xs text-gray-500">{flight.to}</p></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-bold mb-4 flex items-center"><Luggage className="mr-2" /> Baggage Info</h2>
                <div className="text-sm text-gray-600">Cabin: {flightDetails.cabinBaggage} | Check-in: {flightDetails.checkInBaggage}</div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-6">Fare Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Base Fare</span><span>₹ {totalPrice.toLocaleString()}</span></div>
                <div className="flex justify-between border-t pt-3 font-bold text-lg"><span>Total</span><span>₹ {grandTotal.toLocaleString()}</span></div>
              </div>

              <Dialog open={open} onOpenChange={setopem}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-6 bg-red-600 hover:bg-red-700">Book Now</Button>
                </DialogTrigger>
                {user ? <BookingContent /> : (
                  <DialogContent className="bg-white">
                    <DialogHeader><DialogTitle>Login Required</DialogTitle></DialogHeader>
                    <SignupDialog trigger={<Button className="w-full">Sign In to Continue</Button>} />
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookFlightPage;
