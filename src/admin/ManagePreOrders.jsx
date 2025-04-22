// import React, { useEffect, useState } from "react";
// import "./styles/ManagePreOrders.css";
//
// const ManagePreOrders = () => {
//   const [preOrders, setPreOrders] = useState([]);
//   const [filteredOrders, setFilteredOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [dateFilter, setDateFilter] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [currentAction, setCurrentAction] = useState(""); // 'accept' or 'reject'
//   const [selectedOrderId, setSelectedOrderId] = useState(null);
//   const [rejectionReason, setRejectionReason] = useState("");
//
//   const token = localStorage.getItem("token");
//
//   useEffect(() => {
//     fetchPreOrders();
//   }, []);
//
//   const fetchPreOrders = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/admin/preorders", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//
//       if (!response.ok) {
//         alert("Unauthorized! Please log in as Admin.");
//         return;
//       }
//
//       let data = await response.json();
//       data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//       setPreOrders(data);
//       setFilteredOrders(data); // Initialize with full data
//     } catch (error) {
//       console.error("Error fetching pre-orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const updateStatus = async (id, status) => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/admin/preorder/${id}/status`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({  status: status.toLowerCase(),
//             ...(status === "rejected" && rejectionReason ? { reason: rejectionReason } : {}) }),
//         }
//       );
//
//       if (response.ok) {
//         setPreOrders((prevOrders) =>
//           prevOrders.map((order) =>
//             order.id === id ? { ...order, status, reason } : order
//           )
//         );
//
//
//         applyFilters();
//       } else {
//         alert("Failed to update status. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };
//
//   const applyFilters = () => {
//     let filtered = preOrders;
//
//     if (searchQuery) {
//       filtered = filtered.filter(
//         (order) =>
//           order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           order.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           order.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }
//
//     if (statusFilter) {
//       filtered = filtered.filter((order) => order.status === statusFilter);
//     }
//
//     if (dateFilter) {
//       filtered = filtered.filter((order) => {
//         const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
//         return orderDate === dateFilter;
//       });
//     }
//
//     setFilteredOrders(filtered);
//   };
//
//   useEffect(() => {
//     applyFilters();
//   }, [searchQuery, statusFilter, dateFilter, preOrders]);
//
//   if (loading) return <p className="loading">Loading pre-orders...</p>;
//
//   return (
//
//     <div className="manage-preorders">
//       <h2>Manage Pre-Orders</h2>
//
//       {/* Search & Filters */}
//       <div className="filters">
//         <input
//           type="text"
//           placeholder="Search by Order ID, User Name, or Email"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//
//         <select onChange={(e) => setStatusFilter(e.target.value)}>
//           <option value="">All Statuses</option>
//           <option value="pending">Pending</option>
//           <option value="accepted">Accepted</option>
//           <option value="rejected">Rejected</option>
//         </select>
//
//         <input
//           type="date"
//           value={dateFilter}
//           onChange={(e) => setDateFilter(e.target.value)}
//         />
//       </div>
//
//       <div className="table-container">
//         <table>
//           <thead>
//             <tr>
//               <th>Order ID</th>
//               <th>User</th>
//               <th>Items</th>
//               <th>Arrival Time</th>
//               <th>Amount</th>
//               <th>Amount Paid</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredOrders.length > 0 ? (
//               filteredOrders.map((order) => (
//                 <tr key={order.id}>
//                   <td>{order.id}</td>
//                   <td>
//                     <strong>{order.user?.name}</strong>
//                     <br />
//                     <span className="email">{order.user?.email}</span>
//                   </td>
//                   <td>
//                     {order.menuItems && order.menuItems.length > 0 ? (
//                       <ul className="items-list">
//                         {order.menuItems.map((item, index) => (
//                           <li key={index}>
//                             {item.menuItem.name} x {item.quantity}
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <span className="no-items">No items</span>
//                     )}
//                   </td>
//                   <td>{new Date(order.arrivalTime).toLocaleString()}</td>
//                   <td>₹{order.totalAmount}</td>
//                   <td>₹{order.amountPaid}</td> {/* New Amount Paid Column */}
//                   <td>
//                     <span className={`status ${order.status.toLowerCase()}`}>
//                       {order.status}
//                     </span>
//                     {order.status === "rejected" && order.reason && (
//
//                         <p className="rejection-reason">Reason: {order.reason}</p>
//                     )}
//                   </td>
//
//                   <td>
//                     {order.status === "pending" && (
//                         <div className="action-buttons">
//                           <button
//                               className="approve-btn"
//                               onClick={() => {
//                                 setCurrentAction("accept");
//                                 setSelectedOrderId(order.id);
//                                 setShowModal(true);
//                               }}
//                           >
//                             Accept
//                           </button>
//                           <button
//                               className="reject-btn"
//                               onClick={() => {
//                                 setCurrentAction("reject");
//                                 setSelectedOrderId(order.id);
//                                 setShowModal(true);
//                               }}
//                           >
//                             Reject
//                           </button>
//                         </div>
//                     )}
//
//                     {order.status !== "pending" && <span>Finalized</span>}
//                   </td>
//                   <td>
//                     <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
//                     {order.status === "cancelled" && (
//                         <p className="cancel-note">Cancelled by user</p>
//                     )}
//                   </td>
//
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="8">No orders found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//         {showModal && (
//             <div className="modal-overlay">
//               <div className="modal">
//                 <h3>
//                   {currentAction === "accept"
//                       ? "Confirm Acceptance"
//                       : "Reject Pre-Order"}
//                 </h3>
//
//                 {currentAction === "reject" && (
//                     <textarea
//                         rows="4"
//                         placeholder="Enter rejection reason..."
//                         value={rejectionReason}
//                         onChange={(e) => setRejectionReason(e.target.value)}
//                     />
//                 )}
//
//                 <div className="modal-buttons">
//                   <button
//                       className="confirm-btn"
//                       onClick={() => {
//                         updateStatus(
//                             selectedOrderId,
//                             currentAction === "accept" ? "accepted" : "rejected"
//                         );
//                         setShowModal(false);
//                         setRejectionReason("");
//                       }}
//                   >
//                     Confirm
//                   </button>
//                   <button
//                       className="cancel-btn"
//                       onClick={() => {
//                         setShowModal(false);
//                         setRejectionReason("");
//                       }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//         )}
//
//       </div>
//     </div>
//   );
// };
//
// export default ManagePreOrders;


import React, { useEffect, useState } from "react";
import "./styles/ManagePreOrders.css";

const ManagePreOrders = () => {
  const [preOrders, setPreOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const fetchPreOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/admin/preorders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        alert("Unauthorized! Please log in as Admin.");
        return;
      }

      let data = await response.json();
      data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPreOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error fetching pre-orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setLoading(true);
      const response = await fetch(
          `http://localhost:5000/admin/preorder/${id}/status`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: status.toLowerCase(),
              ...(status === "rejected" && rejectionReason
                  ? { reason: rejectionReason }
                  : {}),
            }),
          }
      );

      if (response.ok) {
        await fetchPreOrders();
      } else {
        alert("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = preOrders;

    if (searchQuery) {
      filtered = filtered.filter(
          (order) =>
              order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              order.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              order.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === dateFilter;
      });
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, dateFilter, preOrders]);

  if (loading) {
    return (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading pre-orders...</p>
        </div>
    );
  }

  return (
      <div className="manage-preorders">
        <h2>Manage Pre-Orders</h2>

        <div className="filters">
          <input
              type="text"
              placeholder="Search by Order ID, User Name, or Email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Items</th>
              <th>Arrival Time</th>
              <th>Amount</th>
              <th>Amount Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        <strong>{order.user?.name}</strong>
                        <br />
                        <span className="email">{order.user?.email}</span>
                      </td>
                      <td>
                        {order.menuItems && order.menuItems.length > 0 ? (
                            <ul className="items-list">
                              {order.menuItems.map((item, index) => (
                                  <li key={index}>
                                    {item.menuItem.name} x {item.quantity}
                                  </li>
                              ))}
                            </ul>
                        ) : (
                            <span className="no-items">No items</span>
                        )}
                      </td>
                      <td>{new Date(order.arrivalTime).toLocaleString()}</td>
                      <td>₹{order.totalAmount}</td>
                      <td>₹{order.amountPaid}</td>
                      <td>
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                        {order.status === "rejected" && order.reason && (
                            <p className="rejection-reason">Reason: {order.reason}</p>
                        )}
                        {order.status === "cancelled" && (
                            <p className="cancel-note">Cancelled by user</p>
                        )}
                      </td>
                      <td>
                        {order.status === "pending" ? (
                            <div className="action-buttons">
                              <button
                                  className="approve-btn"
                                  onClick={() => {
                                    setCurrentAction("accept");
                                    setSelectedOrderId(order.id);
                                    setShowModal(true);
                                  }}
                              >
                                Accept
                              </button>
                              <button
                                  className="reject-btn"
                                  onClick={() => {
                                    setCurrentAction("reject");
                                    setSelectedOrderId(order.id);
                                    setShowModal(true);
                                  }}
                              >
                                Reject
                              </button>
                            </div>
                        ) : (
                            <span>Finalized</span>
                        )}
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td colSpan="8">No orders found.</td>
                </tr>
            )}
            </tbody>
          </table>

          {showModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h3>
                    {currentAction === "accept"
                        ? "Confirm Acceptance"
                        : "Reject Pre-Order"}
                  </h3>

                  {currentAction === "reject" && (
                      <textarea
                          rows="4"
                          placeholder="Enter rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                      />
                  )}

                  <div className="modal-buttons">
                    <button
                        className="confirm-btn"
                        onClick={() => {
                          updateStatus(
                              selectedOrderId,
                              currentAction === "accept" ? "accepted" : "rejected"
                          );
                          setShowModal(false);
                          setRejectionReason("");
                        }}
                    >
                      Confirm
                    </button>
                    <button
                        className="cancel-btn"
                        onClick={() => {
                          setShowModal(false);
                          setRejectionReason("");
                        }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default ManagePreOrders;
