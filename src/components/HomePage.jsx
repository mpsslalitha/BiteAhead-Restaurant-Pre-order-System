// import React from "react";
// import "./styles.css";

// const HomePage = () => {
//   return (
//     <>
//       {/* Navbar */}
//       <header>
//         <div className="container nav-container">
//           <h1 className="logo">Gourmet Bites</h1>
//           <nav>
//             <ul>
//               <li><a href="#menu">Menu</a></li>
//               <li><a href="#about">About</a></li>
//               <li><a href="#contact">Contact</a></li>
//               <li><button className="reserve-btn">Pre-Order</button></li>
//             </ul>
//           </nav>
//         </div>
//       </header>

//       {/* Hero Section */}
//       <section className="hero">
//         <div className="container">
//           <h2>Experience Fine Dining</h2>
//           <p>Pre-order your meal & enjoy a seamless dining experience.</p>
//           <button className="hero-btn">View Menu</button>
//         </div>
//       </section>

//       {/* Menu Section */}
//       <section id="menu" className="menu-section">
//         <div className="container">
//           <h2>Our Specialties</h2>
//           <div className="menu-grid">
//             {["Pizza Margherita", "Grilled Salmon", "Pasta Carbonara"].map((dish, index) => (
//               <div className="menu-item" key={index}>
//                 <img src={`https://via.placeholder.com/300?text=${dish}`} alt={dish} />
//                 <h3>{dish}</h3>
//                 <p>Delicious and freshly made.</p>
//                 <span className="price">$20</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer>
//         <p>&copy; 2025 Gourmet Bites. All rights reserved.</p>
//       </footer>
//     </>
//   );
// };

// export default HomePage;


import { useNavigate } from "react-router-dom";
import "./styles/HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <nav className="navbar">
                <div className="logo">BiteAhead</div>
                <div className="nav-links">
                    <li onClick={() => navigate("/menu")}>Menu</li>
                    <li onClick={() => navigate("/preorder-form")}>Preorder</li>
                    <li onClick={() => navigate("/my-preorders")}>My Preorders</li>
                    <li className="logout" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
                        Logout
                    </li>
                </div>
            </nav>

            <header className="home-header">
                <h1>Delicious Meals, Pre-Ordered</h1>
                <p>Enjoy a seamless dining experience by pre-ordering your favorite dishes.</p>
                <button className="primary-btn" onClick={() => navigate("/preorder-form")}>Order Now</button>
            </header>

            <section className="features">
                <div className="feature">
                    <img src="/images/order.png" alt="Pre-order" />
                    <h3>Easy Pre-Ordering</h3>
                    <p>Browse our menu, select your items, and pre-order in a few clicks.</p>
                </div>
                <div className="feature">
                    <img src="/images/payment.png" alt="Secure Payment" />
                    <h3>Secure Payments</h3>
                    <p>Pay securely online—only 40% in advance, the rest after dining.</p>
                </div>
                <div className="feature">
                    <img src="/images/fast_service.png" alt="Fast Service" />
                    <h3>Fast Service</h3>
                    <p>Your food is ready when you arrive—no more long waits.</p>
                </div>
            </section>

            <section className="testimonials">
                <h2>What Our Customers Say</h2>
                <div className="testi">
                    <div className="testimonial">
                        <p>"Amazing food and super convenient! Preordering saved me so much time."</p>
                        <span>- Rohan Sharma</span>
                    </div>
                    <div className="testimonial">
                        <p>"Loved the smooth experience from menu to payment. Highly recommend!"</p>
                        <span>- Ananya Mehta</span>
                    </div>
                    <div className="testimonial">
                        <p>"Loved the smooth experience from menu to payment. Highly recommend!"</p>
                        <span>- Ananya Mehta</span>
                    </div>
                </div>


            </section>

            <section className="about" id="about">
                <div className="about-container">
                    <h2>About Us</h2>
                    <p className="intro">
                        Welcome to <strong>BiteAhead</strong> — a place where taste meets technology.
                    </p>
                    <div className="about-content">
                        <div className="about-card">
                            <h3>⏳ Save Time</h3>
                            <p>Skip the wait! Pre-order your meals and have them ready when you arrive.</p>
                        </div>
                        <div className="about-card">
                            <h3>👨‍🍳 Crafted with Care</h3>
                            <p>Each dish is prepared fresh using quality ingredients and culinary expertise.</p>
                        </div>
                        <div className="about-card">
                            <h3>💳 Smart Payments</h3>
                            <p>Pay only 40% upfront with secure online payments—flexible and convenient.</p>
                        </div>
                        <div className="about-card">
                            <h3>⚡ Fast & Flexible</h3>
                            <p>Whether it’s lunch or dinner, your order is ready when you are.</p>
                        </div>
                    </div>
                    <p className="conclusion">
                        <strong>BiteAhead</strong> is more than just food—it's a fast, reliable, and delightful experience.
                    </p>
                </div>
            </section>


            <footer className="home-footer">
                <p>&copy; 2025 BiteAhead. All rights reserved.</p>
                <div className="footer-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Use</a>
                    <a href="/contact">Contact Us</a>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
