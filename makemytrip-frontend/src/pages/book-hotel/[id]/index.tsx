import InteractiveSelection from "@/components/InteractiveSelection";
import Loader from "@/components/Loader";
import PriceHistory from "@/components/PriceHistory";
import ReviewSystem from "@/components/ReviewSystem";
import { Button } from "@/components/ui/button";
import { BACKEND_URL, calculateDynamicPrice, getActiveUserId } from "@/lib/travel";
import {
  Camera,
  ChevronRight,
  CreditCard,
  Home,
  Image,
  MapPin,
  Power,
  School as Pool,
  Star,
  Ticket,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const BookHotelPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const user = useSelector((state: any) => state.user.user);
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [roomSelection, setRoomSelection] = useState("Standard Room");
  const [roomUpgradePrice, setRoomUpgradePrice] = useState(0);
  const [frozenPrice, setFrozenPrice] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;
      const res = await fetch(`${BACKEND_URL}/hotel/${id}`);
      const data = await res.json();
      setHotel(data);
      setLoading(false);
    };
    fetchHotel().catch(() => setLoading(false));
  }, [id]);

  if (loading || !hotel) return <Loader />;

  const hotelData = {
    rating: 4,
    propertyPhotos: 91,
    guestPhotos: 386,
    description: "A comfortable stay with modern amenities, great access to travel points, and flexible room upgrades.",
    amenities: [
      { icon: <Pool className="h-5 w-5" />, name: "Swimming Pool" },
      { icon: <UtensilsCrossed className="h-5 w-5" />, name: "Restaurant" },
      { icon: <Wine className="h-5 w-5" />, name: "Bar" },
      { icon: <Power className="h-5 w-5" />, name: "Power Backup" },
    ],
    roomFeatures: ["Free cancellation rules shown clearly", "Complimentary welcome drinks", "Room preference saved", "Dynamic price transparency"],
  };

  const nightlyPrice = frozenPrice || calculateDynamicPrice(hotel.pricePerNight || 0);
  const baseFare = (nightlyPrice + roomUpgradePrice) * quantity;
  const taxes = Math.floor(baseFare * 0.12);
  const discount = Math.floor(baseFare * 0.15);
  const grandTotal = baseFare + taxes - discount;

  const handleBooking = async () => {
    setBooking(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getActiveUserId(user),
          serviceType: "HOTEL",
          targetName: `Stay to ${hotel.location || hotel.hotelName}`,
          selectionId: roomSelection,
          totalAmount: grandTotal,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Booking failed");
      router.push("/profile");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <a href="/" className="text-blue-500">Home</a>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <a href="/" className="text-blue-500">{hotel.location}</a>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">{hotel.hotelName}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="mb-2 text-xl font-bold sm:text-2xl">{hotel.hotelName}</h1>
              <div className="flex items-center space-x-1">
                {[...Array(hotelData.rating)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />)}
                <span className="ml-3 text-sm text-gray-600">{hotel.location}</span>
              </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="group relative cursor-pointer sm:col-span-2">
                <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800" alt="Hotel Main" className="h-56 w-full rounded-lg object-cover sm:h-80" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 sm:bottom-4 sm:left-4">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">+{hotelData.propertyPhotos} Property Photos</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:block sm:space-y-4">
                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800" alt="Hotel Room" className="h-32 w-full rounded-lg object-cover sm:h-[152px]" />
                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800" alt="Hotel Amenity" className="h-32 w-full rounded-lg object-cover sm:h-[152px]" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 sm:bottom-4 sm:left-4 sm:px-3">
                    <Image className="h-4 w-4" />
                    <span className="text-sm">+{hotelData.guestPhotos} Guest Photos</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mb-6 text-gray-600">{hotelData.description}<button className="ml-2 text-blue-500">Read more</button></p>

            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">Amenities</h2>
              <div className="flex flex-wrap gap-6">
                {hotelData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-600">
                    {amenity.icon}
                    <span>{amenity.name}</span>
                  </div>
                ))}
                <button className="text-blue-500">+ 31 Amenities</button>
              </div>
            </div>

            <div className="grid gap-6">
              <InteractiveSelection
                type="HOTEL"
                onConfirm={(selection, extraPrice) => {
                  setRoomSelection(selection);
                  setRoomUpgradePrice(extraPrice);
                }}
              />
              <ReviewSystem targetId={hotel.id || hotel._id} targetName={hotel.hotelName} />
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
              <h3 className="mb-4 text-xl font-semibold">{roomSelection}</h3>
              <p className="mb-4 text-gray-600">Fits 2 Adults</p>
              <ul className="mb-6 space-y-3">
                {hotelData.roomFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-semibold text-gray-800">Rooms:</span>
                  <input className="w-20 rounded-lg border px-3 py-2" min={1} max={hotel.availableRooms || 5} type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Available Rooms:</span>
                  <span className="text-lg font-medium text-gray-800">{hotel.availableRooms}</span>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-gray-800">Amenities:</h4>
                  <p className="text-gray-600">{hotel.amenities || "WiFi, AC, breakfast, travel desk"}</p>
                </div>
              </div>

              <div className="mb-6 space-y-2">
                <FareRow label="Base Fare" value={baseFare} />
                <FareRow label="Taxes and Fees" value={taxes} />
                <FareRow label="Discounts" value={-discount} green />
                <div className="border-t pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xl font-bold sm:text-2xl">
                    <span>Rs. {grandTotal}</span>
                    <span className="text-sm font-normal text-gray-500">total</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleBooking} disabled={booking} className="mb-3 w-full bg-blue-500 py-3 text-white hover:bg-blue-600">
                <Home className="mr-2 h-4 w-4" />
                {booking ? "Booking..." : "BOOK THIS NOW"}
              </Button>
              <button className="w-full text-center text-blue-500">14 More Options</button>
            </div>

            <div className="mt-6">
              <PriceHistory basePrice={hotel.pricePerNight || 0} frozenPrice={frozenPrice} onFreeze={setFrozenPrice} />
            </div>

            <div className="mt-5 rounded-xl bg-white p-4 shadow-lg sm:mt-6 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-500 text-2xl font-bold text-white">4.2</div>
                  <div>
                    <div className="text-lg font-semibold">Very Good</div>
                    <div className="text-gray-500">(784 ratings)</div>
                  </div>
                </div>
                <a href="#" className="text-blue-500">All Reviews</a>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-white p-4 shadow-lg sm:mt-6 sm:p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{hotel.location}</h3>
                <button className="text-blue-500">See on Map</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const FareRow = ({ label, value, green = false }: any) => (
  <div className={`flex items-center justify-between ${green ? "text-green-600" : ""}`}>
    <span className={green ? "font-medium" : "text-gray-600"}>{label}</span>
    <span className="font-medium">{value < 0 ? "- " : ""}Rs. {Math.abs(value).toLocaleString()}</span>
  </div>
);

export default BookHotelPage;
