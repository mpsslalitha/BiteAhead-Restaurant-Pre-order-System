// src/components/SuccessPage.jsx
import { useNavigate } from "react-router-dom";
import "./styles/SuccessPage.css";

const SuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="success-container">
            <h2>🎉 Pre-Order Successful!</h2>
            <p>Your payment was successful and your order has been placed.</p>
            <button onClick={() => navigate("/home")}>Go to Home</button>
        </div>
    );
};

export default SuccessPage;
