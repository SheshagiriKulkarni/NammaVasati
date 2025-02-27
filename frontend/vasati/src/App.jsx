import { React } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Advertise from "./components/Advertise";
import AdDetails from "./components/AdDetails";
import SearchedPage from "./components/SearchedPage";
import Myads from "./components/Myads";
import Profile from "./components/Profile";
import Wishlist from "./components/Wishlist";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/advertise" element={<Advertise />} />
        <Route path="/addetails/:adId" element={<AdDetails />} />
        <Route path="/searched/:search" element={<SearchedPage />} />
        <Route path="/myads" element={<Myads />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </Router>
  );
}

export default App;
