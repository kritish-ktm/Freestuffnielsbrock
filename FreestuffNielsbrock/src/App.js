import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PostItem from "./pages/PostItem";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import MyRequests from "./pages/MyRequests";
import About from "./pages/About";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminItems from "./pages/AdminItems";
import AdminReports from "./pages/AdminReports";
import AuthCallback from "./pages/AuthCallback";
import SecurityAnalytics from "./pages/SecurityAnalytics";  
import Signup from "./pages/Signup";
import ManageRequests from "./pages/ManageRequests";
import Requests from "./pages/Requests";
import {AuthProvider} from "./context/AuthContext"; 
import {NotificationProvider} from "./context/NotificationContext"; 
import EditItem from "./pages/EditItem";
function App() {
  return (
    <>
    <AuthProvider>
    <NotificationProvider>  
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/post" element={<PostItem />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/my-requests" element={<MyRequests />} />
        <Route path="/about" element={<About />} />
        <Route path="/onboarding" element={<Onboarding />} /> 
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:userId" element={<UserProfile />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} /> 
        <Route path="/admin/items" element={<AdminItems />} />
        <Route path="/admin/reports" element={<AdminReports />} />  
        <Route path="/admin/security-analytics" element={<SecurityAnalytics />} />  
        <Route path="/auth/callback" element={<AuthCallback />} />  
        <Route path="/signup" element={<Signup />} />
        <Route path="/manage-requests" element={<ManageRequests />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/edit-item/:id" element={<EditItem />} />
      </Routes>
      </NotificationProvider>
      </AuthProvider>
    </>
  );
}

export default App;
