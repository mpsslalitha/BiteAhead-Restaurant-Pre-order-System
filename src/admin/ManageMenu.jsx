// import React, { useEffect, useState } from "react";
// import "./styles/ManageMenu.css";
//
// const API_URL = "http://localhost:5000/menu"; // Backend URL
//
// function ManageMenu() {
//   const [menu, setMenu] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     price: "",
//     imageFile: null,
//   });
//   const [isEditing, setIsEditing] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//
//   // 🔹 Fetch menu items on mount
//   useEffect(() => {
//     fetchMenu();
//   }, []);
//
//   const fetchMenu = async () => {
//     const token = localStorage.getItem("token");
//
//     const response = await fetch(API_URL, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//
//     if (response.status === 401) {
//       alert("Unauthorized! Please login again.");
//       return;
//     }
//
//     const data = await response.json();
//     setMenu(data);
//   };
//
//   // 🔹 Handle form input changes
//   const handleChange = (e) => {
//     if (e.target.name === "imageFile") {
//       setFormData({ ...formData, imageFile: e.target.files[0] });
//     } else {
//       setFormData({ ...formData, [e.target.name]: e.target.value });
//     }
//   };
//
//   // 🔹 Open Add Form
//   const handleAdd = () => {
//     setFormData({ name: "", description: "", price: "", imageFile: null });
//     setIsEditing(false);
//     setShowForm(true);
//   };
//
//   // 🔹 Open Edit Form
//   const handleEdit = (item) => {
//     setIsEditing(true);
//     setEditId(item.id);
//     setFormData({ name: item.name, description: item.description, price: item.price, imageFile: null });
//     setShowForm(true);
//   };
//
//   // 🔹 Handle form submission (Add / Update)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const token = localStorage.getItem("token");
//
//     const formDataToSend = new FormData();
//     formDataToSend.append("name", formData.name);
//     formDataToSend.append("description", formData.description);
//     formDataToSend.append("price", formData.price);
//     if (formData.imageFile) {
//       formDataToSend.append("imageFile", formData.imageFile);
//     }
//
//     const method = isEditing ? "PUT" : "POST";
//     const url = isEditing ? `${API_URL}/${editId}` : API_URL;
//
//     const response = await fetch(url, {
//       method,
//       headers: { Authorization: `Bearer ${token}` },
//       body: formDataToSend,
//     });
//
//     if (response.status === 401) {
//       alert("Unauthorized! Please login again.");
//       return;
//     }
//
//     fetchMenu(); // Refresh menu list
//     setShowForm(false);
//   };
//
//   // 🔹 Delete Menu Item
//   const handleDelete = async (id) => {
//     const token = localStorage.getItem("token");
//
//     const response = await fetch(`${API_URL}/${id}`, {
//       method: "DELETE",
//       headers: { Authorization: `Bearer ${token}` },
//     });
//
//     if (response.status === 401) {
//       alert("Unauthorized! Please login again.");
//       return;
//     }
//
//     fetchMenu();
//   };
//
//   return (
//     <div className="manage-menu">
//       <h1>Manage Menu</h1>
//
//       {/* 🔹 Add Button */}
//       <button className="add-btn" onClick={handleAdd}>Add New Item</button>
//
//       {/* 🔹 Form Modal */}
//       {showForm && (
//         <div className="form-modal">
//           <div className="form-container">
//             <h2>{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</h2>
//             <form onSubmit={handleSubmit} encType="multipart/form-data">
//               <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
//               <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
//               <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
//               <input type="file" name="imageFile" onChange={handleChange} accept="image/*" required={!isEditing} />
//               <div className="form-buttons">
//                 <button type="submit" className="add-btn">{isEditing ? "Update Item" : "Add Item"}</button>
//                 <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//
//       {/* 🔹 Menu List */}
//       <div className="menu-grid">
//         {menu.map((item) => (
//           <div key={item.id} className="menu-card">
//             <img src={`http://localhost:5000${item.imageUrl}`} alt={item.name} className="menu-img" />
//             <div className="menu-details">
//               <h3>{item.name}</h3>
//               <p>{item.description}</p>
//               <p className="price">₹ {item.price}</p>
//               <div className="actions">
//                 <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
//                 <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
//
// export default ManageMenu;

import React, { useEffect, useState } from "react";
import "./styles/ManageMenu.css";

const API_URL = "http://localhost:5000/menu";

function ManageMenu() {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageFile: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      alert("Unauthorized! Please login again.");
      return;
    }

    const data = await response.json();
    setMenu(data);
    setFilteredMenu(data); // initialize
  };

  const handleChange = (e) => {
    if (e.target.name === "imageFile") {
      setFormData({ ...formData, imageFile: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleAdd = () => {
    setFormData({ name: "", description: "", price: "", imageFile: null });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormData({ name: item.name, description: item.description, price: item.price, imageFile: null });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    if (formData.imageFile) {
      formDataToSend.append("imageFile", formData.imageFile);
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${editId}` : API_URL;

    const response = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formDataToSend,
    });

    if (response.status === 401) {
      alert("Unauthorized! Please login again.");
      return;
    }

    fetchMenu();
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      alert("Unauthorized! Please login again.");
      return;
    }

    fetchMenu();
  };

  // 🔍 Filter menu items based on search
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = menu.filter((item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
    setFilteredMenu(filtered);
  }, [searchQuery, menu]);

  return (
      <div className="manage-menu">
        <h1>Manage Menu</h1>

        {/* 🔍 Search Input */}
        <input
            type="text"
            placeholder="Search menu items..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        <br/>
        <button className="add-btn" onClick={handleAdd}>Add New Item</button>

        {showForm && (
            <div className="form-modal">
              <div className="form-container">
                <h2>{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</h2>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
                  <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
                  <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
                  <input type="file" name="imageFile" onChange={handleChange} accept="image/*" required={!isEditing} />
                  <div className="form-buttons">
                    <button type="submit" className="add-btn">{isEditing ? "Update Item" : "Add Item"}</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
        )}

        <div className="menu-grid">
          {filteredMenu.map((item) => (
              <div key={item.id} className="menu-card">
                <img src={`http://localhost:5000${item.imageUrl}`} alt={item.name} className="menu-img" />
                <div className="menu-details">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <p className="price">₹ {item.price}</p>
                  <div className="actions">
                    <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>Delete</button>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </div>
  );
}

export default ManageMenu;
