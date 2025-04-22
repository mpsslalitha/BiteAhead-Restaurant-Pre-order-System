import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import HomePage from "./components/HomePage";
import Menu from "./components/Menu";
import PreOrderForm from "./components/PreOrderForm";
import AllPreOrders from "./components/AllPreOrders";
import AdminDashboard from "./admin/AdminDashboard";
import ManagePreOrders from "./admin/ManagePreOrders";
import ManageMenu from "./admin/ManageMenu";
import ManageUsers from "./admin/ManageUsers";
import SuccessPage from "./components/SuccessPage.jsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // initially null
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        setIsAuthenticated(!!token);
        setUserRole(role);
    }, []);

    if (isAuthenticated === null || userRole === null) {
        // Still checking localStorage, don't render anything yet
        return <div style={{ textAlign: "center", paddingTop: "50px" }}>Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/home"
                element={isAuthenticated ? <HomePage /> : <Navigate replace to="/login" />}
            />
            <Route path="/menu" element={<Menu />} />
            <Route path="/preorder-form" element={<PreOrderForm />} />
            <Route path="/my-preorders" element={<AllPreOrders />} />
            <Route path="/preorder-success" element={<SuccessPage />} />

            {/* Admin Routes */}
            {isAuthenticated && userRole === "admin" && (
                <>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/preorders" element={<ManagePreOrders />} />
                    <Route path="/admin/menu" element={<ManageMenu />} />
                    <Route path="/admin/users" element={<ManageUsers />} />
                </>
            )}
        </Routes>
    );
}

export default App;
