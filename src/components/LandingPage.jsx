import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="overlay">
                {/*<header className="navbar">*/}
                {/*    <h2 className="logo">FoodieHub</h2>*/}
                {/*    <div className="nav-buttons">*/}
                {/*        <button onClick={() => navigate("/login")}>Login</button>*/}
                {/*        <button onClick={() => navigate("/signup")}>Sign Up</button>*/}
                {/*    </div>*/}
                {/*</header>*/}

                <main className="hero-content">
                    <h1 className="logo">BiteAhead</h1>
                    <h1>Pre-Order Your Favorite Meals</h1>
                    <p>Skip the line and get your food fresh and ready when you arrive.</p>
                    <div className="hero-buttons">
                        <button onClick={() => navigate("/login")}>Get Started</button>
                        <button className="secondary" onClick={() => navigate("/signup")}>
                            Create Account
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LandingPage;
