import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Menu.css";

const Menu = () => {
    const [menu, setMenu] = useState([]);
    const [filteredMenu, setFilteredMenu] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:5000/menu")
            .then((response) => {
                setMenu(response.data);
                setFilteredMenu(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching menu:", error);
                setError("Failed to load menu");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = menu.filter(
            (item) =>
                item.name.toLowerCase().includes(lowerQuery) ||
                item.description.toLowerCase().includes(lowerQuery)
        );
        setFilteredMenu(filtered);
    }, [searchQuery, menu]);

    if (loading) return <div className="status-message">Loading menu...</div>;
    if (error) return <div className="status-message error">{error}</div>;

    return (
        <div className="menu-container">
            <h2 className="menu-heading">Our Menu</h2>

            {/* 🔍 Search Input */}
            <input
                type="text"
                className="menu-search"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="menu-grid">
                {filteredMenu.length > 0 ? (
                    filteredMenu.map((item) => (
                        <div key={item.id} className="menu-card">
                            <img
                                src={`http://localhost:5000${item.imageUrl}`}
                                alt={item.name}
                                className="menu-image"
                            />
                            <div className="menu-info">
                                <h3 className="menu-title">{item.name}</h3>
                                <p className="menu-description">{item.description}</p>
                                <p className="menu-price">₹{item.price}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="status-message">No menu items match your search.</p>
                )}
            </div>
        </div>
    );
};

export default Menu;
