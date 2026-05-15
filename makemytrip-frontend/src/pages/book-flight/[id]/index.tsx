import InteractiveSelection from "@/components/InteractiveSelection";
import LiveFlightStatus from "@/components/LiveFlightStatus";
import Loader from "@/components/Loader";
import PriceHistory from "@/components/PriceHistory";
import ReviewSystem from "@/components/ReviewSystem";
import { Button } from "@/components/ui/button";
import {
  BACKEND_URL,
  FALLBACK_FLIGHTS,
  calculateDynamicPrice,
  destinationFromRouteText,
  getActiveUserId,
  isRemovedPlace,
  isVisibleTravelItem,
} from "@/lib/travel";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  CreditCard,
  Gift,
  Info,
  Luggage,
  MapPin,
  Plane,
  Star,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const BookFlightPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [flight, setFlight] = useState<any>(null);
  const [recommendedHotels, setRecommendedHotels] = useState<any[]>([]);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [booking, setBooking] = useState(false);
  const [selectionId, setSelectionId] = useState("");
  const [selectionPrice, setSelectionPrice] = useState(0);
  const [frozenPrice, setFrozenPrice] = useState<number | null>(null);
  const user = useSelector((state: any) => state.user.user);

  useEffect(() => {
    const fetchFlight = async () => {
      if (!id) return;
      const res = await fetch(`${BACKEND_URL}/flight`);
      const data = await res.json();
      const visibleFlights = (data || []).filter(isVisibleTravelItem);
      const availableFlights = visibleFlights.length > 0 ? visibleFlights : FALLBACK_FLIGHTS;
      const found = availableFlights.find((item: any) => (item.id || item._id) === id);
      setFlight(found || null);
    };
    fetchFlight().catch(console.error);
  }, [id]);

  if (!flight) return <Loader />;

  const destination = destinationFromRouteText(flight.to || "");
  const liveBasePrice = frozenPrice || calculateDynamicPrice(flight.price || 0);
  const taxes = 1374;
  const otherServices = 249 + selectionPrice;
  const discounts = 250;
  const grandTotal = liveBasePrice + taxes + otherServices - discounts;

  const loadRecommendedHotels = async () => {
    const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const destinationKey = normalize(destination);

    const readJsonArray = async (response: Response) => {
      const text = await response.text();
      if (!response.ok || !text.trim()) return [];
      try {
        const data = JSON.parse(text);
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    };

    let hotels: any[] = [];

    try {
      const response = await fetch(`${BACKEND_URL}/hotel/recommendations?destination=${encodeURIComponent(destination)}`);
      hotels = await readJsonArray(response);
    } catch {
      hotels = [];
    }

    if (hotels.length === 0) {
      try {
        const response = await fetch(`${BACKEND_URL}/hotel`);
        const allHotels = await readJsonArray(response);
        hotels = allHotels.filter((hotel) => {
          const locationKey = normalize(hotel.location);
          return locationKey.includes(destinationKey) || destinationKey.includes(locationKey);
        });
        if (hotels.length === 0) {
          hotels = allHotels.filter((hotel) => normalize(hotel.hotelName).includes(destinationKey));
        }
        if (hotels.length === 0) {
          hotels = allHotels;
        }
      } catch {
        hotels = [];
      }
    }

    setRecommendedHotels(hotels.filter(isVisibleTravelItem).slice(0, 3));
  };

  const handleBooking = async () => {
    if (isRemovedPlace(destination)) return;
    setBooking(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: getActiveUserId(user),
          serviceType: "FLIGHT",
          targetName: `Flight to ${destination}`,
          selectionId: selectionId || flight.id || flight._id,
          totalAmount: grandTotal,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Booking failed");
      await loadRecommendedHotels();
      setBookingComplete(true);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa]">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-5 sm:space-y-6 lg:col-span-2">
            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-4">
                    <h2 className="flex flex-wrap items-center text-base font-bold sm:text-lg">
                      <span>{flight.from}</span>
                      <ArrowRight className="mx-2 h-5 w-5" />
                      <span>{flight.to}</span>
                    </h2>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
                      PARTIAL REFUND AVAILABLE
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>{flight.departureTime ? new Date(flight.departureTime).toLocaleString() : "Today"}</span>
                    <span className="mx-2">•</span>
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Non Stop - 3h 0m</span>
                  </div>
                </div>
                <button className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                  <Info className="mr-1 h-4 w-4" />
                  View Fare Rules
                </button>
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Plane className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">{flight.flightName}</div>
                  <div className="text-sm text-gray-600">MT 2747 • Airbus A320</div>
                </div>
                <div className="ml-auto text-sm">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">Economy</span>
                  <span className="ml-2 text-gray-600">MMTSPECIAL</span>
                </div>
              </div>

              <div className="flex flex-col items-start gap-6 border-t pt-6 sm:flex-row sm:flex-wrap sm:justify-between md:flex-nowrap">
                <AirportTime title={flight.departureTime} airport={`${flight.from} International Airport, Terminal T2`} />
                <div className="flex-shrink-0 text-center">
                  <div className="mb-1 text-sm text-gray-600">3h 0m</div>
                  <div className="relative my-2 h-0.5 w-24 bg-gray-300 sm:w-32">
                    <div className="absolute -top-2 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gray-300">
                      <Plane className="h-3 w-3 text-gray-600" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Non-stop</div>
                </div>
                <AirportTime title={flight.arrivalTime} airport={`${flight.to} International Airport, Terminal T3`} alignRight />
              </div>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Luggage className="mr-2 h-5 w-5 text-gray-500" />
                  Cabin Baggage: 7 Kgs / Adult
                </div>
                <div className="flex items-center">
                  <Luggage className="mr-2 h-5 w-5 text-gray-500" />
                  Check-in Baggage: 15 Kgs / Adult
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-6 flex items-center text-lg font-bold">
                <AlertCircle className="mr-2 h-5 w-5 text-orange-500" />
                Cancellation & Refund Policy
              </h2>
              <div className="rounded-xl bg-gray-50 p-6">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold">{flight.from} - {flight.to}</span>
                  <span className="text-lg font-bold">50% refund within 24h</span>
                </div>
                <div className="h-2.5 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                <div className="mt-2 flex justify-between text-xs text-gray-600">
                  <span>Now</span>
                  <span>24h partial refund</span>
                  <span>No refund</span>
                </div>
              </div>
            </div>

            <LiveFlightStatus flightName={flight.flightName} compact />
            <InteractiveSelection
              type="FLIGHT"
              onConfirm={(selectedSeat, extraPrice) => {
                setSelectionId(selectedSeat);
                setSelectionPrice(extraPrice);
              }}
            />

            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center text-lg font-bold">
                  <Gift className="mr-2 h-5 w-5 text-red-500" />
                  Book a Flight & unlock hotel recommendations
                </h2>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">Flyer Exclusive Deal</span>
              </div>
              {bookingComplete ? (
                recommendedHotels.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {recommendedHotels.map((hotel) => (
                      <button key={hotel.id || hotel._id} onClick={() => router.push(`/book-hotel/${hotel.id || hotel._id}`)} className="overflow-hidden rounded-xl border bg-white text-left transition-shadow hover:shadow-md">
                        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800" alt={hotel.hotelName} className="h-40 w-full object-cover" />
                        <div className="p-4">
                          <h3 className="mb-1 text-lg font-semibold">{hotel.hotelName}</h3>
                          <div className="mb-2 flex items-center text-sm text-gray-600">
                            <MapPin className="mr-1 h-4 w-4" />
                            {hotel.location}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex text-yellow-400">{[...Array(4)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                            <div className="font-bold">Rs. {hotel.pricePerNight}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600">No hotel recommendation found for this destination yet.</p>
                    <button onClick={loadRecommendedHotels} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Show available hotels
                    </button>
                  </div>
                )
              ) : (
                <p className="text-gray-600">Confirm the flight booking to see recommended hotels at your destination.</p>
              )}
            </div>

            <ReviewSystem targetId={flight.id || flight._id} targetName={flight.flightName} />
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-24">
              <h2 className="mb-6 flex items-center text-lg font-bold">
                <CreditCard className="mr-2 h-5 w-5 text-gray-600" />
                Fare Summary
              </h2>
              <div className="space-y-2">
                <FareRow label="Base Fare" value={liveBasePrice} />
                <FareRow label="Taxes and Surcharges" value={taxes} />
                <FareRow label="Seat / Other Services" value={otherServices} />
                <FareRow label="Discounts" value={-discounts} green />
                <div className="mt-2 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-lg font-bold">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Button disabled={booking || bookingComplete} onClick={handleBooking} className="mt-6 h-11 w-full bg-red-600 text-white hover:bg-red-700">
                {bookingComplete ? "Booked" : booking ? "Booking..." : "Book Now"}
              </Button>
              {bookingComplete && (
                <Button onClick={() => router.push("/profile")} className="mt-3 h-11 w-full bg-blue-600 text-white hover:bg-blue-700">
                  Go to Profile for Refund
                </Button>
              )}

              <div className="mt-8 rounded-xl bg-[#FFF8E7] p-6">
                <h3 className="mb-4 flex items-center font-bold">
                  <Gift className="mr-2 h-5 w-5 text-yellow-600" />
                  PROMO CODES
                </h3>
                <input className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-3" placeholder="Enter promo code here" />
                <div className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="font-semibold text-red-600">MMTSECURE</div>
                  <p className="mt-1 text-sm text-gray-600">Get instant discount and Trip Secure with this coupon.</p>
                </div>
              </div>
              <div className="mt-6">
                <PriceHistory basePrice={flight.price || 0} frozenPrice={frozenPrice} onFreeze={setFrozenPrice} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const AirportTime = ({ title, airport, alignRight = false }: any) => (
  <div className={alignRight ? "text-right" : ""}>
    <div className="text-lg font-bold sm:text-2xl">{title ? new Date(title).toLocaleString() : "Today"}</div>
    <div className={`mt-1 flex items-start text-sm text-gray-600 ${alignRight ? "sm:justify-end" : ""}`}>
      <MapPin className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0" />
      {airport}
    </div>
  </div>
);

const FareRow = ({ label, value, green = false }: any) => (
  <div className={`flex items-center justify-between ${green ? "text-green-600" : ""}`}>
    <span className={green ? "font-medium" : "text-gray-600"}>{label}</span>
    <span className="font-medium">{value < 0 ? "- " : ""}Rs. {Math.abs(value).toLocaleString()}</span>
  </div>
);

export default BookFlightPage;
