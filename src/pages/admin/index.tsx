import { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarCheck, IndianRupee, Hotel, Plane, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // --- 1. FETCH ALL BOOKINGS ---
  const fetchBookings = () => {
    fetch("http://localhost:8080/api/bookings")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // --- 2. THE 24-HOUR CANCELLATION LOGIC (Your Internship Task!) ---
  const handleCancelBooking = async (bookingId: string, bookingDateStr: string) => {
    
    // Check if the booking has a creation date saved
    if (bookingDateStr) {
      const bookingDate = new Date(bookingDateStr).getTime();
      const now = new Date().getTime();
      
      // Calculate how many hours have passed since the booking was created
      const hoursPassed = (now - bookingDate) / (1000 * 60 * 60);

      // THE 24 HOUR RULE
      if (hoursPassed > 24) {
        alert("Cancellation Failed: The 24-hour free cancellation window has expired for this booking.");
        return; // Stop the function here so it doesn't delete!
      }
    }

    // If within 24 hours (or if no date exists for testing), ask for confirmation
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    // Send the DELETE request to Spring Boot
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Booking cancelled successfully!");
        fetchBookings(); // Refresh the table automatically so the deleted row vanishes!
      } else {
        alert("Failed to cancel booking from the database.");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
      alert("Server error while cancelling. Is Spring Boot running?");
    }
  };

  // --- 3. DASHBOARD STATISTICS ---
  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  const totalBookings = bookings.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-2 animate-pulse">Loading Admin Portal...</h2>
          <p className="text-gray-500">Fetching database records.</p>
        </div>
      </div>
    );
  }

  // --- 4. THE UI ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" /> MakeMyTour Admin
        </h1>
        <button 
          onClick={() => router.push("/")} 
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Main Site
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Bookings</p>
              <h2 className="text-3xl font-bold text-gray-900">{totalBookings}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <IndianRupee className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Revenue</p>
              <h2 className="text-3xl font-bold text-gray-900">₹ {totalRevenue.toLocaleString()}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">System Status</p>
              <h2 className="text-xl font-bold text-green-500 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span> Online
              </h2>
            </div>
          </div>
        </div>

        {/* Bookings Data Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Recent Transactions</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              Live Data
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Booking ID</th>
                  <th className="px-6 py-4 font-semibold">Service Type</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount Paid</th>
                  <th className="px-6 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length > 0 ? (
                  bookings.map((booking, index) => (
                    <tr key={booking.id || index} className="hover:bg-gray-50 transition-colors">
                      
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{booking.id?.substring(0,8) || "N/A"}
                      </td>
                      
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.serviceType === 'HOTEL' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {booking.serviceType === 'HOTEL' ? <Hotel className="w-3 h-3"/> : <Plane className="w-3 h-3"/>}
                          {booking.serviceType || "N/A"}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                        ₹ {booking.totalAmount || 0}
                      </td>
                      
                      {/* CANCELLATION BUTTON */}
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleCancelBooking(booking.id, booking.createdAt)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-sm font-semibold"
                        >
                          <Trash2 className="w-4 h-4" /> Cancel
                        </button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      No bookings found in the database yet. Go book a hotel or flight!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}