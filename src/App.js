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
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminItems from "./pages/AdminItems";
import AdminReports from "./pages/AdminReports";
import AuthCallback from "./pages/AuthCallback.tsx";
import AdminAnalytics from "./pages/AdminAnalytics";  

function App() {
  return (
    <>
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
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} /> 
        <Route path="/admin/items" element={<AdminItems />} />
        <Route path="/admin/reports" element={<AdminReports />} />  
        <Route path="/admin/analytics" element={<AdminAnalytics />} />  
        <Route path="/auth/callback" element={<AuthCallback />} />  

      </Routes>
    </>
  );
}

export default App;