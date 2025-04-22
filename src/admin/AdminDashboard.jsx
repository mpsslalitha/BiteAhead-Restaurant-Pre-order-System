import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login"); 
          return;
        }

        const [usersRes, menuRes, preOrdersRes] = await Promise.all([
          fetch("http://localhost:5000/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/menu", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/admin/preorders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!usersRes.ok) throw new Error("Failed to fetch users");
        if (!menuRes.ok) throw new Error("Failed to fetch menu");
        if (!preOrdersRes.ok) throw new Error("Failed to fetch preorders");

        const usersData = await usersRes.json();
        const menuData = await menuRes.json();
        const preOrdersData = await preOrdersRes.json();

        setUsers(usersData || []);
        setMenuItems(menuData || []);
        setPreOrders(preOrdersData || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="admin-dashboard">
      {/* ✅ Navbar */}
      <nav className="navbar">
        <h1>Admin Dashboard</h1>
        <ul>
          <li onClick={() => navigate("/admin/preorders")}>Pre-Orders</li>
          <li onClick={() => navigate("/admin/menu")}>Menu</li>
          <li onClick={() => navigate("/admin/users")}>Users</li>
          <li className="logout" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
            Logout
          </li>
        </ul>
      </nav>

      {/* ✅ Stats Cards */}
      <div className="stats">
        <div className="stat-box">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
        <div className="stat-box">
          <h3>Menu Items</h3>
          <p>{menuItems.length}</p>
        </div>
        <div className="stat-box">
          <h3>Pre-Orders</h3>
          <p>{preOrders.length}</p>
        </div>
      </div>

      {/* ✅ Data Sections */}
      <div className="data-sections">
        <section>
          <h2>Recent Users</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.slice(0, 5).map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Recent Pre-Orders</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {preOrders.length > 0 ? (
                preOrders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>{order.userName}</td>
                    <td>{order.menuItems.length} items</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2">No pre-orders found.</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./styles/AdminDashboard.css"; // Ensure you have appropriate styles

// const AdminDashboard = () => {
//   const [users, setUsers] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);
//   const [preOrders, setPreOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(""); // New error state
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAdminData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           navigate("/login"); // Redirect if not authenticated
//           return;
//         }

//         const [usersRes, menuRes, preOrdersRes] = await Promise.all([
//           fetch("http://localhost:5000/admin/users", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           fetch("http://localhost:5000/menu", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           fetch("http://localhost:5000/admin/preorders", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         // Handle API errors before parsing JSON
//         if (!usersRes.ok) throw new Error("Failed to fetch users");
//         if (!menuRes.ok) throw new Error("Failed to fetch menu");
//         if (!preOrdersRes.ok) throw new Error("Failed to fetch preorders");

//         const usersData = await usersRes.json();
//         const menuData = await menuRes.json();
//         const preOrdersData = await preOrdersRes.json();

//         setUsers(usersData || []); // Prevent undefined errors
//         setMenuItems(menuData || []);
//         setPreOrders(preOrdersData || []);
//       } catch (error) {
//         console.error("Error fetching admin data:", error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAdminData();
//   }, [navigate]);

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p className="error">Error: {error}</p>;

//   return (
//     <div className="admin-dashboard">
//       <h1>Admin Dashboard</h1>
//       <div className="stats">
//         <div className="stat-box">
//           <h3>Total Users</h3>
//           <p>{users.length}</p>
//         </div>
//         <div className="stat-box">
//           <h3>Menu Items</h3>
//           <p>{menuItems.length}</p>
//         </div>
//         <div className="stat-box">
//           <h3>Pre-Orders</h3>
//           <p>{preOrders.length}</p>
//         </div>
//       </div>

//       <div className="buttons">
//         <button onClick={() => navigate("/admin/preorders")}>Manage Pre-Orders</button>
//         <button onClick={() => navigate("/admin/menu")}>Manage Menu</button>
//         <button onClick={() => navigate("/admin/users")}>Manage Users</button>
//       </div>

//       <div className="data-sections">
//         <section>
//           <h2>Recent Users</h2>
//           <ul>
//             {users.length > 0 ? (
//               users.slice(0, 5).map((user) => (
//                 <li key={user.id}>{user.name} ({user.email})</li>
//               ))
//             ) : (
//               <p>No users found.</p>
//             )}
//           </ul>
//         </section>

//         <section>
//           <h2>Recent Pre-Orders</h2>
//           <ul>
//             {preOrders.length > 0 ? (
                
//               preOrders.slice(0, 5).map((order) => (
                
                
//                 <li key={order.id}>{order.userName} - {order.menuItems.length} items</li>
//               ))
//             ) : (
//               <p>No pre-orders found.</p>
//             )}
//           </ul>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

