import React, { useEffect, useState } from "react";
import { useToast } from "../useToast"; // Custom toast notification
import "./styles/ManageUsers.css"; // Import the CSS file

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const toast = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        toast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")){
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers(users.filter(user => user.id !== userId));
      toast("Success", "User has been deleted.", "success");
    } catch (error) {
      toast("Error", error.message, "error");
    }
}
  };

  return (
    <div className="manage-users">
      <h1>Manage Users</h1>

      <div className="search-bar1">
        <input 
          type="text" 
          placeholder="Search users..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(user => 
                user.name.toLowerCase().includes(search.toLowerCase()) || 
                user.email.toLowerCase().includes(search.toLowerCase())
              )
              .map((user, index) => (
                <tr key={user.id}>
                  <td>{index+1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select defaultValue={user.role}>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
