import axios from "axios";

const BACKEND_URL = "http://localhost:8080";

// --- USER AUTH & PROFILE ---

export const login = async (email, password) => {
  try {
    const url = `${BACKEND_URL}/user/login?email=${email}&password=${password}`;
    const res = await axios.post(url);
    return res.data;
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    throw error;
  }
};

export const signup = async (firstName, lastName, email, phoneNumber, password) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/signup`, {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
    });
    return res.data;
  } catch (error) {
    console.error("Signup Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getuserbyemail = async (email) => {
  try {
    const res = await axios.get(`${BACKEND_URL}/user/email?email=${email}`);
    return res.data;
  } catch (error) {
    console.error("Get User Error:", error);
    throw error;
  }
};

export const editprofile = async (id, firstName, lastName, email, phoneNumber) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/user/edit?id=${id}`, {
      firstName,
      lastName,
      email,
      phoneNumber,
    });
    return res.data;
  } catch (error) {
    console.error("Edit Profile Error:", error);
    throw error;
  }
};

// --- FLIGHTS ---

export const getflight = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/flight`);
    return res.data;
  } catch (error) {
    console.error("Fetch Flights Error:", error);
    throw error;
  }
};

export const addflight = async (flightName, from, to, departureTime, arrivalTime, price, availableSeats) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/flight`, {
      flightName, from, to, departureTime, arrivalTime, price, availableSeats,
    });
    return res.data;
  } catch (error) {
    console.error("Add Flight Error:", error);
    throw error;
  }
};

export const editflight = async (id, flightName, from, to, departureTime, arrivalTime, price, availableSeats) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/flight/${id}`, {
      flightName, from, to, departureTime, arrivalTime, price, availableSeats,
    });
    return res.data;
  } catch (error) {
    console.error("Edit Flight Error:", error);
    throw error;
  }
};

// --- HOTELS ---

export const gethotel = async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/hotel`);
    return res.data;
  } catch (error) {
    console.error("Fetch Hotels Error:", error);
    throw error; 
  }
};

export const addhotel = async (hotelName, location, pricePerNight, availableRooms, amenities) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/admin/hotel`, {
      hotelName, location, pricePerNight, availableRooms, amenities,
    });
    return res.data;
  } catch (error) {
    console.error("Add Hotel Error:", error);
    throw error;
  }
};

export const edithotel = async (id, hotelName, location, pricePerNight, availableRooms, amenities) => {
  try {
    const res = await axios.put(`${BACKEND_URL}/admin/hotel/${id}`, {
      hotelName, location, pricePerNight, availableRooms, amenities,
    });
    return res.data;
  } catch (error) {
    console.error("Edit Hotel Error:", error);
    throw error;
  }
};

// --- BOOKINGS ---

export const handleflightbooking = async (userId, flightId, seats, price) => {
  try {
    const url = `${BACKEND_URL}/booking/flight?userId=${userId}&flightId=${flightId}&seats=${seats}&price=${price}`;
    const res = await axios.post(url);
    return res.data;
  } catch (error) {
    console.error("Flight Booking Error:", error);
    throw error;
  }
};

export const handlehotelbooking = async (userId, hotelId, rooms, price) => {
  try {
    const url = `${BACKEND_URL}/booking/hotel?userId=${userId}&hotelId=${hotelId}&rooms=${rooms}&price=${price}`;
    const res = await axios.post(url);
    return res.data;
  } catch (error) {
    console.error("Hotel Booking Error:", error);
    throw error;
  }
};