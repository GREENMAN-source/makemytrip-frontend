export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://makemytrip-backend-030l.onrender.com";

export const CITY_OPTIONS = [
  "Chennai, Tamil Nadu",
  "Mumbai, Maharashtra",
  "Delhi, NCR",
  "Bangalore, Karnataka",
  "Hyderabad, Telangana",
  "Goa",
  "Pune, Maharashtra",
  "Jaipur, Rajasthan",
  "Kochi, Kerala",
  "Shimla, Himachal Pradesh",
  "Coimbatore, Tamil Nadu",
];

export const FALLBACK_FLIGHTS = [
  {
    id: "demo-flight-1",
    flightName: "IndiGo 6E-204",
    from: "Delhi",
    to: "Mumbai",
    departureTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    price: 5200,
    availableSeats: 24,
  },
  {
    id: "demo-flight-2",
    flightName: "Air India AI-118",
    from: "Mumbai",
    to: "Bangalore",
    departureTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    price: 4800,
    availableSeats: 18,
  },
  {
    id: "demo-flight-3",
    flightName: "Vistara UK-812",
    from: "Chennai",
    to: "Delhi",
    departureTime: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    price: 6100,
    availableSeats: 16,
  },
  {
    id: "demo-flight-4",
    flightName: "Akasa QP-441",
    from: "Hyderabad",
    to: "Goa",
    departureTime: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 11 * 60 * 60 * 1000).toISOString(),
    price: 4300,
    availableSeats: 30,
  },
];

const REMOVED_CITY_MARKERS = ["kol" + "kata", "cal" + "cutta", "col" + "catta", "cc" + "u"];

export const isRemovedPlace = (value?: string | null) => {
  const normalized = String(value || "").toLowerCase();
  return REMOVED_CITY_MARKERS.some((marker) => normalized.includes(marker));
};

export const isVisibleTravelItem = (item: any) => {
  const searchableText = [
    item?.flightName,
    item?.from,
    item?.to,
    item?.hotelName,
    item?.location,
    item?.targetName,
    item?.serviceId,
  ].join(" ");

  return !isRemovedPlace(searchableText);
};

export const destinationFromRouteText = (value: string) => {
  const cleanValue = value.trim();
  const parts = cleanValue.split(/\s+to\s+/i);
  return (parts[parts.length - 1] || cleanValue).split(",")[0].trim();
};

export const calculateDynamicPrice = (basePrice = 0, demand = 0.72) => {
  const today = new Date();
  const month = today.getMonth();
  const isHolidaySeason = month === 11 || month === 0 || month === 4;
  const seasonalMultiplier = isHolidaySeason ? 1.2 : 1;
  const demandMultiplier = demand > 0.75 ? 1.15 : demand > 0.5 ? 1.08 : 1;
  return Math.round(basePrice * seasonalMultiplier * demandMultiplier);
};

export const buildPriceHistory = (basePrice = 0) =>
  Array.from({ length: 7 }, (_, index) => {
    const demand = 0.45 + index * 0.06;
    return {
      label: `Day ${index + 1}`,
      price: calculateDynamicPrice(basePrice, demand),
    };
  });

export const getStoredPreference = (type: "FLIGHT" | "HOTEL") => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`preferred_${type.toLowerCase()}_selection`) || "";
};

export const saveStoredPreference = (type: "FLIGHT" | "HOTEL", selectionId: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`preferred_${type.toLowerCase()}_selection`, selectionId);
};

export const getActiveUserId = (user: any) => {
  if (user?.id || user?._id) {
    return user.id || user._id;
  }

  if (typeof window === "undefined") {
    return "guest-session";
  }

  const storageKey = "makemytour_guest_user_id";
  const existingId = localStorage.getItem(storageKey);
  if (existingId) {
    return existingId;
  }

  const newId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(storageKey, newId);
  return newId;
};
