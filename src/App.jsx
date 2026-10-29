import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SearchPage from "./pages/SearchPage";
import VerifyPage from "./pages/VerifyPage";
import ReportsPage from "./pages/ReportsPage";
import ReviewPage from "./pages/ReviewPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;