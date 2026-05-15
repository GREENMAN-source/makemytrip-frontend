// 1. MASTER LIST: REMOVE KOLKATA COMPLETELY
const ALL_CITIES = [
  "Chennai, Tamil Nadu", "Mumbai, Maharashtra", "Delhi, NCR", "Bangalore, Karnataka", 
  "Hyderabad, Telangana", "Goa", "Pune, Maharashtra", 
  "Jaipur, Rajasthan", "Kochi, Kerala", "Shimla, Himachal Pradesh", "Coimbatore, Tamil Nadu"
];

export default function Home() {
  const [bookingtype, setbookingtype] = useState("flights");
  
  // 2. DEFAULT CITIES: CHANGE TO MUMBAI/PUNE
  const [from, setfrom] = useState("Mumbai, Maharashtra");
  const [to, setto] = useState("Pune, Maharashtra");
  
  // ... (rest of your state)

  const handlePayment = async () => {
    const destinationCity = to.split(',')[0].trim();
    const bookingData = {
      userId: user?.id || "user-123",
      serviceType: selectedTrip.type,
      // 3. SAVING LOGIC: We save ONLY the destination. 
      // This prevents "Kolkata" from ever entering your database again.
      targetName: `${selectedTrip.type === 'FLIGHT' ? 'Flight' : 'Stay'} to ${destinationCity}`, 
      totalAmount: finalPrice,
      selectionId: finalSelection || "Standard",
      refundStatus: "ACTIVE",
      createdAt: new Date().toISOString()
    };

    await fetch("https://makemytrip-backend-030l.onrender.com/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookingData)
    });
    router.push('/profile'); 
  };
  // ... rest of code
}
