import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export default function BookHotel() {
  const router = useRouter();
  const { id } = router.query;
  
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roomsToBook, setRoomsToBook] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!id) return; 

    // Fetches from the /hotel/ doorway
   // Change Line 18 to this:
fetch(`https://makemytrip-backend-030l.onrender.com/hotel/${id}`) 
      .then((res) => {
          if(!res.ok) throw new Error("Network response was not ok");
          return res.json();
      })
      .then((data) => {
        setHotel(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hotel:", err);
        setLoading(false); 
      });
  }, [id]);

  if (loading || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Loading Details...</h2>
          <p className="text-gray-500">Please wait while we fetch the hotel data.</p>
        </div>
      </div>
    );
  }

  const baseFare = (hotel?.pricePerNight || 0) * roomsToBook;
  const taxes = Math.floor(baseFare * 0.12);
  const discount = Math.floor(baseFare * 0.15);
  const totalAmount = baseFare + taxes - discount;

  const handleProceedToPayment = async () => {
    setIsBooking(true);
    
    const bookingData = {
      userId: "user-123",
      serviceId: hotel.id,
      serviceType: "HOTEL",
      totalAmount: totalAmount,
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch("http://localhost:8080/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        alert("Booking Successful!");
        router.push("/");
      } else {
        alert("Something went wrong with the booking. Check backend.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Server error. Check your Spring Boot terminal.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{hotel?.hotelName || "Hotel Details"}</h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
            <span className="text-lg">{hotel?.location || "Location unavailable"}</span>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Booking Details</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms</label>
              <input 
                type="number" 
                min="1" 
                max={hotel?.availableRooms || 5} 
                value={roomsToBook} 
                onChange={(e) => setRoomsToBook(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-medium" 
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <p className="text-gray-700 mb-2">Price per night: <span className="font-bold text-gray-900">₹{hotel?.pricePerNight || 0}</span></p>
              <p className="text-gray-700">Available Rooms: <span className="font-bold text-gray-900">{hotel?.availableRooms || 0}</span></p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Price Summary</h3>
            <div className="space-y-3 mb-6 text-gray-600">
              <div className="flex justify-between">
                <span>Base Fare ({roomsToBook} Room{roomsToBook > 1 ? 's' : ''})</span>
                <span className="font-medium">₹{baseFare}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees (12%)</span>
                <span className="font-medium">₹{taxes}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount (15%)</span>
                <span className="font-medium">-₹{discount}</span>
              </div>
            </div>
            <div className="border-t border-gray-300 pt-5 flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-gray-800">Total Amount</span>
              <span className="text-3xl font-extrabold text-blue-600">₹{totalAmount}</span>
            </div>
            <button 
              onClick={handleProceedToPayment}
              disabled={isBooking}
              className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-all ${
                isBooking ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              {isBooking ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
