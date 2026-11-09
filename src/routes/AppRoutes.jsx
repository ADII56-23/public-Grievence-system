import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import SubmitComplaint from "../pages/Citizen/SubmitComplaint";
import TrackComplaint from "../pages/Citizen/TrackComplaint";
import Dashboard from "../pages/Officer/Dashboard";
import ComplaintDetails from "../pages/Officer/ComplaintDetails";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import Profile from "../pages/Citizen/Profile";
import NotFound from "../pages/Notfound/Notfound";
import Chatbot from "../components/chatbot/Chatbot";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<SubmitComplaint />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/complaint/:id" element={<ComplaintDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Global AI Navigation & Redressal Chatbot accessible across all routes */}
      <Chatbot />
    </BrowserRouter>
  );
}

export default AppRoutes;