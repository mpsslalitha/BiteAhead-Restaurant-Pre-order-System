import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/AllPreOrders.css"; // Import the CSS file

const AllPreOrders = () => {
  const [preOrders, setPreOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const fetchPreOrders = () => {
    axios
      .get("http://localhost:5000/my-preorders", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const sortedOrders = response.data.sort(
          (a, b) => new Date(b.arrivalTime) - new Date(a.arrivalTime)
        );
        setPreOrders(sortedOrders);
      })
      .catch((error) => {
        console.error("Error fetching pre-orders:", error);
        alert("Failed to fetch pre-orders. Please try again.");
      });
  };

  // ✅ Improved Delete Pre-Order Function
  const handleDelete = (id, status) => {
    console.log("status", status);
    
    console.log("Delete button clicked for order:", id, "Status:", status);

    if (!status || status.trim().toLowerCase() !== "pending") {
      alert("❌ You can only delete pre-orders that are still pending.");
      return;
    }
    if (window.confirm("⚠️ Are you sure you want to delete this pre-order?")) {
      axios
        .delete(`http://localhost:5000/preorder/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setPreOrders(preOrders.filter((order) => order.id !== id));
          alert("✅ Pre-order deleted successfully!");
        })
        .catch((error) => {
          console.error("Error deleting pre-order:", error);
          alert("❌ Failed to delete pre-order. Please try again.");
        });
    }
  };

  // ✅ Filtering logic for Search, Status & Date
  const filteredOrders = preOrders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const orderDate = new Date(order.arrivalTime).toISOString().split("T")[0];

    return (
      (order.userName.toLowerCase().includes(searchLower) ||
        order.userEmail.toLowerCase().includes(searchLower) ||
        order.menuItems.some((item) =>
          item.menuItem.name.toLowerCase().includes(searchLower)
        )) &&
      (selectedStatus ? order.status.toLowerCase() === selectedStatus.toLowerCase() : true) &&
      (selectedDate ? orderDate === selectedDate : true)
    );
  });

  return (
    <div className="preorders-container">
      <h2>📌 All Pre-Orders</h2>
      <div className="all-filters">
        <input
          type="text"
          placeholder="🔍 Search by name, email, or item..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filters">
          <input
            type="date"
            className="filter-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <select
            className="filter-input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">📌 All Statuses</option>
            <option value="Pending">🕒 Pending</option>
            <option value="Accepted">✅ Accepted</option>
            <option value="Rejected">❌ Rejected</option>
          </select>
        </div>
      </div>

      <div className="preorder">
        {filteredOrders.length === 0 ? (
          <p className="no-orders">⚠️ No matching pre-orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="preorder-card">
              <div className="preorder-header">
                <div>
                  <p className="user-name">👤 {order.userName}</p>
                  <p className="user-email">📧 {order.userEmail}</p>
                  <p className="arrival-time">
                    📅 {new Date(order.arrivalTime).toLocaleString()}
                  </p>
                  <p className="total-amount">💰 Total: ₹{order.totalAmount}</p>
                </div>
                <div className="btns">
                  {order.status.toLowerCase() === "pending" && (
                      <button
                          className="delete-btn"
                          onClick={() => handleDelete(order.id, order.status)}
                      >
                        Delete
                      </button>
                  )}
                  <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>


                  {order.status.toLowerCase() === "rejected" && order.reason && (

                      <p className="rejection-reason">Reason: {order.reason}</p>
                  )}
                  {order.status === "accepted" && (
                      <button
                          className="cancel-btn"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel this accepted pre-order? You will receive only a 20% refund.")) {
                              axios
                                  .delete(`http://localhost:5000/cancel-preorder/${order.id}`, {
                                    headers: { Authorization: `Bearer ${token}` },
                                  })
                                  .then((res) => {
                                    alert(res.data.message);
                                    fetchPreOrders(); // refresh list
                                  })
                                  .catch((err) => {
                                    console.error("Cancel error:", err);
                                    alert("Failed to cancel the order.");
                                  });
                            }
                          }}
                      >
                        Cancel
                      </button>
                  )}

                </div>

              </div>

              <table className="items-table">
                <thead>
                  <tr>
                    <th>🍽️ Item Name</th>
                    <th>💵 Price (₹)</th>
                    <th>🔢 Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {order.menuItems.map((item) => (
                    <tr key={item.menuItem.id}>
                      <td>{item.menuItem.name}</td>
                      <td>₹{item.menuItem.price}</td>
                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllPreOrders;
