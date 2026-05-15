import { getflight, gethotel } from "@/api";
import LiveFlightStatus from "@/components/LiveFlightStatus";
import Loader from "@/components/Loader";
import RecommendationPanel from "@/components/RecommendationPanel";
import { SearchSelect } from "@/components/SearchSelect";
import { Button } from "@/components/ui/button";
import { CITY_OPTIONS, FALLBACK_FLIGHTS, isVisibleTravelItem } from "@/lib/travel";
import {
  Bus,
  Calendar,
  Car,
  CreditCard,
  HomeIcon,
  Hotel,
  MapPin,
  Plane,
  QrCode,
  Shield,
  Train,
  Umbrella,
  Users,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [bookingtype, setbookingtype] = useState("flights");
  const [from, setfrom] = useState("");
  const [to, setto] = useState("");
  const [date, setdate] = useState("");
  const [travelers, settravelers] = useState(1);
  const [searchresults, setsearchresult] = useState<any[]>([]);
  const [hotels, sethotels] = useState<any[]>([]);
  const [flights, setflights] = useState<any[]>([]);
  const [loading, setloading] = useState(true);
  const [resultMessage, setResultMessage] = useState("Available flights");
  const router = useRouter();

  const offers = [
    {
      title: "Domestic Flights",
      description: "Get up to 20% off on domestic flights",
      imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800",
    },
    {
      title: "Hotel Deals",
      description: "Book stays with smart recommendations",
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800",
    },
    {
      title: "Holiday Packages",
      description: "Exclusive deals on holiday packages",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
    },
  ];

  const collections = [
    {
      title: "Stays in & Around Delhi",
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Mumbai",
      imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800",
      tag: "TOP 8",
    },
    {
      title: "Stays in & Around Bangalore",
      imageUrl: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800",
      tag: "TOP 9",
    },
    {
      title: "Beach Destinations",
      imageUrl: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=800",
      tag: "TOP 11",
    },
  ];

  const wonders = [
    {
      title: "Shimla's Best Kept Secret",
      imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800",
    },
    {
      title: "Tamil Nadu's Charming Hill Town",
      imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800",
    },
    {
      title: "Goa Weekend Escape",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800",
    },
    {
      title: "A Pleasant Summer Retreat",
      imageUrl: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800",
    },
  ];

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const hotelData = await gethotel();
        const flightData = await getflight();
        const visibleFlights = (flightData || []).filter(isVisibleTravelItem);
        const visibleHotels = (hotelData || []).filter(isVisibleTravelItem);
        const availableFlights = visibleFlights.length > 0 ? visibleFlights : FALLBACK_FLIGHTS;
        sethotels(visibleHotels);
        setflights(availableFlights);
        setsearchresult(availableFlights);
      } catch (error) {
        console.error(error);
      } finally {
        setloading(false);
      }
    };

    fetchdata();
  }, []);

  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    flights.forEach((flight) => {
      if (flight.from) cities.add(flight.from);
      if (flight.to) cities.add(flight.to);
    });
    hotels.forEach((hotel) => {
      if (hotel.location) cities.add(hotel.location);
    });
    CITY_OPTIONS.forEach((city) => cities.add(city.split(",")[0]));
    return Array.from(cities).map((city) => ({ value: city, label: city }));
  }, [flights, hotels]);

  if (loading) return <Loader />;

  const selectBookingType = (type: "flights" | "hotels") => {
    setbookingtype(type);
    setfrom("");
    setto("");
    setsearchresult(type === "flights" ? flights : hotels);
    setResultMessage(type === "flights" ? "Available flights" : "Available hotels");
  };

  const handlesearch = () => {
    if (bookingtype === "flights") {
      const normalize = (value = "") => value.toLowerCase().split(",")[0].trim();
      const results = flights.filter(
        (flight) =>
          (!from || normalize(flight.from).includes(normalize(from)) || normalize(from).includes(normalize(flight.from))) &&
          (!to || normalize(flight.to).includes(normalize(to)) || normalize(to).includes(normalize(flight.to)))
      );
      setsearchresult(results.length > 0 ? results : flights);
      setResultMessage(results.length > 0 ? "Search Results" : "No exact match. Showing available flights.");
    } else {
      const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const cityKey = normalize(to);
      const results = hotels.filter((hotel) => {
        const locationKey = normalize(hotel.location);
        return !cityKey || locationKey.includes(cityKey) || cityKey.includes(locationKey);
      });
      setsearchresult(results.length > 0 ? results : hotels);
      setResultMessage(results.length > 0 ? "Search Results" : "No exact match. Showing available hotels.");
    }
  };

  const handlebooknow = (id: any) => {
    router.push(bookingtype === "flights" ? `/book-flight/${id}` : `/book-hotel/${id}`);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=2940&q=80")',
      }}
    >
      <main className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
        <nav className="no-scrollbar mx-auto mb-5 max-w-5xl overflow-x-auto rounded-xl bg-white p-3 shadow-lg sm:mb-6 sm:p-4">
          <div className="flex min-w-max items-center justify-between gap-3 sm:gap-6 lg:gap-8">
            <NavItem icon={<Plane />} text="Flights" active={bookingtype === "flights"} onClick={() => selectBookingType("flights")} />
            <NavItem icon={<Hotel />} text="Hotels" active={bookingtype === "hotels"} onClick={() => selectBookingType("hotels")} />
            <NavItem icon={<HomeIcon />} text="Homestays" />
            <NavItem icon={<Umbrella />} text="Holiday" />
            <NavItem icon={<Train />} text="Trains" />
            <NavItem icon={<Bus />} text="Buses" />
            <NavItem icon={<Car />} text="Cabs" />
            <NavItem icon={<CreditCard />} text="Forex" />
            <NavItem icon={<Shield />} text="Insurance" />
          </div>
        </nav>

        <div className="mx-auto max-w-5xl rounded-xl bg-white p-4 shadow-lg sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {bookingtype === "flights" && (
              <SearchSelect
                options={cityOptions}
                placeholder="From"
                value={from}
                onChange={setfrom}
                icon={<MapPin className="text-gray-400" />}
                subtitle="Enter city or airport"
              />
            )}
            <SearchSelect
              options={cityOptions}
              placeholder={bookingtype === "flights" ? "To" : "City"}
              value={to}
              onChange={setto}
              icon={<MapPin className="text-gray-400" />}
              subtitle={bookingtype === "flights" ? "Enter city or airport" : "Enter city"}
            />
            <SearchInput icon={<Calendar className="text-gray-400" />} placeholder="Date" value={date} onChange={(e: any) => setdate(e.target.value)} subtitle="Select a date" type="date" />
            <SearchInput icon={<Users className="text-gray-400" />} placeholder="Travelers" value={travelers.toString()} onChange={(e: any) => settravelers(parseInt(e.target.value) || 1)} subtitle="Number of travelers" type="number" />
            <Button className="h-12 bg-blue-600 lg:h-full" onClick={handlesearch}>
              SEARCH
            </Button>
          </div>

          <div className="mt-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">{resultMessage}</h2>
            {searchresults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {searchresults.map((result) => (
                  <div key={result.id || result._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow">
                    {bookingtype === "flights" ? (
                      <>
                        <p className="text-lg font-semibold">Flight Name: {result.flightName}</p>
                        <h3 className="text-lg font-semibold">
                          {result.from} to {result.to}
                        </h3>
                        <p className="mt-2 text-lg font-bold">Rs. {result.price}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold">{result.hotelName}</h3>
                        <p className="text-gray-600">City: {result.location}</p>
                        <p className="mt-2 text-lg font-bold">Rs. {result.pricePerNight} per night</p>
                      </>
                    )}
                    <Button className="mt-4 w-full" onClick={() => handlebooknow(result.id || result._id)}>
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No available {bookingtype} found yet.</p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl gap-5 sm:mt-8 sm:gap-6">
          <RecommendationPanel />
          <LiveFlightStatus compact />
        </div>

        <div className="mx-auto max-w-7xl px-0 sm:px-4">
          <section className="my-10 sm:my-16">
            <h2 className="mb-5 text-xl font-bold text-white sm:mb-8 sm:text-2xl">Best Offers</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
              {offers.map((offer, index) => (
                <OfferCard key={index} {...offer} />
              ))}
            </div>
          </section>

          <section className="my-10 sm:my-16">
            <h2 className="mb-5 text-xl font-bold text-white sm:mb-8 sm:text-2xl">Handpicked Collections for You</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {collections.map((collection, index) => (
                <ImageCard key={index} {...collection} />
              ))}
            </div>
          </section>

          <section className="my-10 sm:my-16">
            <h2 className="mb-5 text-xl font-bold text-white sm:mb-8 sm:text-2xl">Unlock Lesser-Known Wonders of India</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wonders.map((wonder, index) => (
                <ImageCard key={index} {...wonder} />
              ))}
            </div>
          </section>

          <DownloadApp />
        </div>
      </main>
    </div>
  );
}

const OfferCard = ({ title, description, imageUrl }: any) => (
  <div className="overflow-hidden rounded-lg bg-white shadow-md">
    <img src={imageUrl} alt={title} className="h-40 w-full object-cover sm:h-48" />
    <div className="p-4">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <button className="mt-4 rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">Book Now</button>
    </div>
  </div>
);

const ImageCard = ({ title, imageUrl, tag }: any) => (
  <div className="group relative cursor-pointer overflow-hidden rounded-lg">
    <img src={imageUrl} alt={title} className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-110 sm:h-64" />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
      {tag && <span className="absolute left-4 top-4 rounded bg-white px-2 py-1 text-sm font-semibold text-black">{tag}</span>}
      <h3 className="absolute bottom-4 left-4 right-4 text-lg font-semibold text-white">{title}</h3>
    </div>
  </div>
);

const DownloadApp = () => (
  <div className="mx-auto my-10 max-w-7xl rounded-lg bg-white p-4 shadow-md sm:my-12 sm:p-6">
    <div className="flex flex-col items-center justify-between md:flex-row">
      <div className="mb-6 md:mb-0">
        <h3 className="mb-2 text-xl font-bold">Download App Now!</h3>
        <p className="mb-4 text-gray-600">Get India's travel super app with best deals on flights and hotels.</p>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-10" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Play Store" className="h-10" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 md:mt-0">
        <QrCode className="h-24 w-24" />
        <p className="text-sm text-gray-600">Scan QR code to download the app</p>
      </div>
    </div>
  </div>
);

function NavItem({ icon, text, active = false, onClick }: any) {
  return (
    <button className={`flex min-w-[68px] flex-col items-center rounded-lg p-2 transition-colors ${active ? "text-blue-500" : "text-gray-600 hover:text-blue-500"}`} onClick={onClick}>
      {icon}
      <span className="mt-1 whitespace-nowrap text-sm">{text}</span>
    </button>
  );
}

function SearchInput({ icon, placeholder, value, onChange, subtitle, type = "text" }: any) {
  return (
    <div className="min-h-[72px] cursor-pointer rounded-lg border p-3 hover:border-blue-500">
      <div className="flex items-center space-x-2">
        {icon}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm text-gray-500">{placeholder}</div>
          <input type={type} value={value} onChange={onChange} className="w-full bg-transparent font-semibold outline-none" placeholder={placeholder} />
          <div className="truncate text-xs text-gray-400">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}
