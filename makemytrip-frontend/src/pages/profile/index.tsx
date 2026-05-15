import LiveFlightStatus from "@/components/LiveFlightStatus";
import Loader from "@/components/Loader";
import RecommendationPanel from "@/components/RecommendationPanel";
import { BACKEND_URL, destinationFromRouteText, getActiveUserId, isVisibleTravelItem } from "@/lib/travel";
import { editprofile } from "@/api";
import { clearUser, setUser } from "@/store";
import {
  Building2,
  Calendar,
  Check,
  CreditCard,
  Edit2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plane,
  RotateCcw,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const CANCELLATION_REASONS = [
  "Change of travel plan",
  "Found a better price",
  "Medical or emergency reason",
  "Booked by mistake",
  "Other",
];

const formatDate = (value?: string) => {
  if (!value) return "Not scheduled";
  const numeric = Number(value);
  const date = Number.isNaN(numeric) ? new Date(value) : new Date(numeric);
  return Number.isNaN(date.getTime()) ? "Not scheduled" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector((state: any) => state.user.user);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<Record<string, string>>({});
  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const loadBookings = async () => {
    const userId = getActiveUserId(user);
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/user/${userId}`);
      const data = await response.json();
      setBookings((data || []).filter(isVisibleTravelItem));
    } catch (error) {
      console.error("Unable to load bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  const logout = () => {
    dispatch(clearUser());
    router.push("/");
  };

  const handleSave = async () => {
    try {
      const data = await editprofile(user?.id || user?._id, userData.firstName, userData.lastName, userData.email, userData.phoneNumber);
      dispatch(setUser(data));
    } catch {
      dispatch(setUser({ ...user, ...userData }));
    } finally {
      setIsEditing(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const reason = selectedReasons[bookingId];
    if (!reason) {
      setActionMessage("Please select a cancellation reason first.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/cancel/${bookingId}?reason=${encodeURIComponent(reason)}`, { method: "POST" });
      if (!response.ok) throw new Error("Cancel failed");
      const updatedBooking = await response.json();
      setBookings(bookings.map((booking) => (booking.id === bookingId ? updatedBooking : booking)));
      setActionMessage("Cancellation submitted. Refund tracker has been updated.");
    } catch {
      setActionMessage("Cancellation failed. Please try again after backend deployment.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 px-3 pt-4 sm:px-4 sm:pt-8">
      <div className="mx-auto max-w-6xl">
        {actionMessage && <div className="mb-6 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">{actionMessage}</div>}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
          <div className="md:col-span-1">
            <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
              <div className="mb-6 flex items-start justify-between">
                <h2 className="text-2xl font-bold">Profile</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <ProfileInput label="First Name" value={userData.firstName} onChange={(value: string) => setUserData({ ...userData, firstName: value })} />
                  <ProfileInput label="Last Name" value={userData.lastName} onChange={(value: string) => setUserData({ ...userData, lastName: value })} />
                  <ProfileInput label="Email" value={userData.email} onChange={(value: string) => setUserData({ ...userData, email: value })} />
                  <ProfileInput label="Phone Number" value={userData.phoneNumber} onChange={(value: string) => setUserData({ ...userData, phoneNumber: value })} />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button onClick={handleSave} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-white hover:bg-red-700">
                      <Check className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button onClick={() => setIsEditing(false)} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 py-2 text-gray-700 hover:bg-gray-200">
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <ProfileLine icon={<User />} text={`${user?.firstName || "Guest"} ${user?.lastName || ""}`} />
                  <ProfileLine icon={<Mail />} text={user?.email || "guest@example.com"} />
                  <ProfileLine icon={<Phone />} text={user?.phoneNumber || "Not added"} />
                  <button className="mt-4 flex w-full items-center justify-center space-x-2 text-red-600 hover:text-red-700" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 md:col-span-2">
            <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
              <h2 className="mb-6 text-xl font-bold sm:text-2xl">My Bookings</h2>
              <div className="space-y-6">
                {bookings.length > 0 ? (
                  bookings.map((booking) => {
                    const isFlight = booking.serviceType === "FLIGHT";
                    const destination = destinationFromRouteText(booking.targetName || booking.serviceId || "Trip");
                    const canceled = booking.refundStatus && booking.refundStatus !== "ACTIVE";
                    return (
                      <div key={booking.id} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`${isFlight ? "bg-blue-100" : "bg-green-100"} rounded-lg p-2`}>
                              {isFlight ? <Plane className="h-6 w-6 text-blue-600" /> : <Building2 className="h-6 w-6 text-green-600" />}
                            </div>
                            <div>
                              <h3 className="font-semibold">{booking.serviceType || "TRIP"}</h3>
                              <p className="text-sm text-gray-500">Booking ID: {booking.id?.substring(0, 8) || "N/A"}</p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-semibold">Rs. {(booking.totalAmount || 0).toLocaleString("en-IN")}</p>
                            <p className="text-sm text-gray-500">{booking.refundStatus || "ACTIVE"}</p>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(booking.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{destination}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CreditCard className="h-4 w-4" />
                            <span>Paid</span>
                          </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h4 className="font-semibold">Refund Status Tracker</h4>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">{booking.refundStatus || "ACTIVE"}</span>
                          </div>
                          <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                            <span>Refund: Rs. {booking.refundAmount || 0}</span>
                            <span>Expected: {formatDate(booking.expectedRefundBy)}</span>
                            <span>Reason: {booking.cancellationReason || "None"}</span>
                          </div>
                          {booking.refundPolicy && <p className="mt-2 text-xs text-gray-500">{booking.refundPolicy}</p>}
                        </div>

                        {!canceled && (
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <select value={selectedReasons[booking.id] || ""} onChange={(event) => setSelectedReasons({ ...selectedReasons, [booking.id]: event.target.value })} className="min-w-0 flex-1 rounded-lg border p-2 text-sm">
                              <option value="">Select cancellation reason</option>
                              {CANCELLATION_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                            </select>
                            <button onClick={() => cancelBooking(booking.id)} className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                              <RotateCcw className="h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-gray-500">No bookings found yet.</div>
                )}
              </div>
            </div>

            <LiveFlightStatus compact />
            <RecommendationPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

const ProfileInput = ({ label, value, onChange }: any) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border px-3 py-2 focus:border-red-500 focus:ring-2 focus:ring-red-500" />
  </div>
);

const ProfileLine = ({ icon, text }: any) => (
  <div className="flex items-center space-x-3">
    <span className="h-5 w-5 text-gray-500">{icon}</span>
    <p>{text}</p>
  </div>
);
