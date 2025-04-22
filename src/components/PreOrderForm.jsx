import { useState, useEffect } from "react";
import axios from "axios";
import "./styles/PreOrderForm.css";
import {useNavigate} from "react-router-dom";

const PreOrderForm = () => {
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [arrivalTime, setArrivalTime] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [razorpayKey, setRazorpayKey] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/menu")
      .then(response => setMenu(response.data))
      .catch(error => console.error("Error fetching menu:", error));

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);

    axios.get("http://localhost:5000/get-razorpay-key")
      .then(response => {
        setRazorpayKey(response.data.key);
      })
      .catch(error => console.error("Error fetching Razorpay key:", error));
  }, []);

  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(prev => {
      const updatedItems = { ...prev };
      if (quantity > 0) updatedItems[itemId] = quantity;
      else delete updatedItems[itemId]; // ✅ Fix: Remove from selectedItems if quantity is 0
      updateTotalAmount(updatedItems);
      return updatedItems;
    });
  };

  const updateTotalAmount = (updatedItems) => {
    let total = Object.entries(updatedItems).reduce((acc, [itemId, quantity]) => {
      const item = menu.find(menuItem => menuItem.id.toString() === itemId);
      return item ? acc + item.price * quantity : acc;
    }, 0);
    console.log("Total Amount:", total); // ✅ Debugging
    setTotalAmount(total);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("User not logged in.");
      return;
    }

    const token = localStorage.getItem("token");
    const menuItems = Object.entries(selectedItems).map(([id, quantity]) => ({
      menuItemId: id, 
      quantity: Number(quantity),
    }));

    if (menuItems.length === 0) {
      setMessage("Please select at least one item.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/preorder",
        { arrivalTime, totalAmount, menuItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (razorpayKey) {
          console.log("Response data", response.data); // ✅ Debugging
          
          loadRazorpay(response.data);
        } else {
          setMessage("Razorpay Key not available. Try again later.");
        }
      } else {
        setMessage("Failed to initiate payment.");
      }
    } catch (error) {
      console.error("❌ Error placing pre-order:", error.response?.data || error.message);
      setMessage("Failed to place pre-order.");
    }
  };

  const loadRazorpay = (order) => {

    
    if (!razorpayKey) return; // ✅ Fix: Ensure Razorpay key is available

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
        handlePayment(order);  // ✅ Ensure order is passed correctly
    };
    document.body.appendChild(script);
  };

  const handlePayment = (order) => {
    
    
    if (!razorpayKey) {
      setMessage("Razorpay Key not loaded. Try again later.");
      return;
    }

    const options = {
      key: razorpayKey, 
      amount: order.order.amount,
      currency: order.order.currency,
      name: "Restaurant Pre-Order",
      description: "Payment for your order",
      order_id: order.order.id,
      handler: async (response) => {
        try {
          console.log("🔹 Sending request to `/verify-payment` with:", {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          userData: order.userData,
        });
          const verifyRes = await axios.post("http://localhost:5000/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userData: order.userData,
          },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

          console.log("Payment verification response:", verifyRes); // ✅ Debugging
          

          if (verifyRes.data.success) {
            // setMessage("✅ Payment successful! Your order has been placed.");
            navigate("/preorder-success");
          } else {
            setMessage("❌ Payment verification failed.");
          }
        } catch (error) {
          setMessage("Error verifying payment.");
        }
      },
      prefill: {
        name: order.userData.userName,
        email: order.userData.userEmail,
        contact: order.userData.userPhone,
      },
      // theme: { color: "#F37254" },
    };


    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="preorder-container">
      <h2>Place a Pre-Order</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Arrival Time:</label>
        <input 
          type="datetime-local" 
          value={arrivalTime} 
          onChange={(e) => setArrivalTime(e.target.value)} 
          required 
        />

        <h3>Select Menu Items:</h3>
        {menu.map(item => (
          <div key={item.id} className="menu-option">
            <span>{item.name} - ₹{item.price}</span>
            <input 
              type="number" 
              min="0"
              value={selectedItems[item.id] || ""}
              onChange={(e) => handleQuantityChange(item.id, Number(e.target.value) || 0)}
              placeholder="Qty"
            />
          </div>
        ))}

        <p className="total-amount"><strong>Total Amount:</strong> ₹{totalAmount}</p>

        <button type="submit">Proceed to Payment</button>
      </form>
    </div>
  );
};

export default PreOrderForm;



// import { useState, useEffect } from "react";
// import axios from "axios";
// import "./styles/PreOrderForm.css";

// const PreOrderForm = () => {
//   const [menu, setMenu] = useState([]);
//   const [selectedItems, setSelectedItems] = useState({});
//   const [arrivalTime, setArrivalTime] = useState("");
//   const [message, setMessage] = useState("");
//   const [user, setUser] = useState(null);
//   const [totalAmount, setTotalAmount] = useState(0);

//   useEffect(() => {
//     axios.get("http://localhost:5000/menu")
//       .then(response => setMenu(response.data))
//       .catch(error => console.error("Error fetching menu:", error));

//     const storedUser = JSON.parse(localStorage.getItem("user"));
//     if (storedUser) setUser(storedUser);
//   }, []);

//   const handleQuantityChange = (itemId, quantity) => {
//     console.log("Item ID:", itemId, "Quantity:", quantity);
    
//     const itemIdStr = itemId.toString(); // Ensure itemId is a string
//     console.log("Item ID String:", itemIdStr);
    
//     setSelectedItems(prev => {
//       const updatedItems = { ...prev };

//       if (quantity > 0) {
//         updatedItems[itemIdStr] = quantity;
//       } else {
//         delete updatedItems[itemIdStr];
//       }

//       updateTotalAmount(updatedItems);
//       console.log("Updated Items:", updatedItems);
      
//       return updatedItems;
//     });
//   };

//   const updateTotalAmount = (updatedItems) => {
//     let total = Object.entries(updatedItems).reduce((acc, [itemId, quantity]) => {
//       const item = menu.find(menuItem => menuItem.id.toString() === itemId);
//       return item ? acc + item.price * quantity : acc;
//     }, 0);
    
//     setTotalAmount(total);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       setMessage("User not logged in.");
//       return;
//     }

//     const token = localStorage.getItem("token");
//     console.log(selectedItems);
    

//     const menuItems = Object.entries(selectedItems).map(([id, quantity]) => ({
//       menuItemId: id, 
//       quantity: Number(quantity),
//     }));


//     if (menuItems.length === 0) {
//       setMessage("Please select at least one item.");
//       return;
//     }

//     console.log("Menu Items:", menuItems);

//     const preOrderData = {
//       userName: user.name,
//       userEmail: user.email,
//       userPhone: user.phone,
//       arrivalTime,
//       totalAmount,
//       menuItems,
//     };

//     try {
//       await axios.post(
//         "http://localhost:5000/preorder",
//         preOrderData,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setMessage("Pre-order placed successfully!");
//       setSelectedItems({});
//       setArrivalTime("");
//       setTotalAmount(0);
//     } catch (error) {
//       console.error("❌ Error placing pre-order:", error.response?.data || error.message);
//       setMessage("Failed to place pre-order.");
//     }
//   };

//   return (
//     <div className="preorder-container">
//       <h2>Place a Pre-Order</h2>
//       {message && <p className="message">{message}</p>}
//       <form onSubmit={handleSubmit}>
//         <label>Arrival Time:</label>
//         <input 
//           type="datetime-local" 
//           value={arrivalTime} 
//           onChange={(e) => setArrivalTime(e.target.value)} 
//           required 
//         />

//         <h3>Select Menu Items:</h3>
//         {menu.map(item => (
//           <div key={item.id} className="menu-option">
//             <span>{item.name} - ₹{item.price}</span>
//             <input 
//               type="number" 
//               min="0"
//               value={selectedItems[item.id] || ""}
//               onChange={(e) => handleQuantityChange(item.id, Number(e.target.value) || 0)}
//               placeholder="Qty"
//             />
//           </div>
//         ))}

//         <p><strong>Total Amount:</strong> ₹{totalAmount}</p>

//         <button type="submit">Submit Pre-Order</button>
//       </form>
//     </div>
//   );
// };

// export default PreOrderForm;



