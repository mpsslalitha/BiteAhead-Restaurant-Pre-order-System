import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import nodemailer from "nodemailer";
import Razorpay from "razorpay";
import crypto from "crypto";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();
const app = express();
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);    
    req.user = verified;
    console.log(req.user);    
    next();
  } catch (error) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


app.get("/get-razorpay-key", (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});


// ✅ Get menu items
app.get("/menu", async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// ✅ Add a menu item (Admin only)
app.post("/menu", authenticateUser, upload.single("imageFile"), async (req, res) => {
  try {
    console.log(req.headers.authorization)
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { name, description, price } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const restaurantId = "restaurant-1"; // Single restaurant

    const count = await prisma.menuItem.count();
    


    const newItem = await prisma.menuItem.create({
      data: { name, description, price: parseFloat(price), imageUrl,restaurantId },
    });

    res.json(newItem);
  } catch (error) {
    console.log("Menu error", error);
    
    res.status(500).json({ error: "Failed to add menu item" });
  }
});

// update menu - admin only
app.put("/menu/:id", authenticateUser, upload.single("imageFile"),async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { id } = req.params;
    const { name, description, price } = req.body;
    let imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    // ✅ Step 1: Update the menu item
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id },
      data: { name, description, price: parseFloat(price), ...(imageUrl && { imageUrl }) },
    });

    // ✅ Step 2: Find all pre-orders that contain this menu item
    const affectedPreOrders = await prisma.preOrder.findMany({
      where: { menuItems: { some: { menuItemId: id } } },
      include: { menuItems: true },
    });

    // ✅ Step 3: Notify the user/admin (if needed)
    console.log(`Updated menu item: ${name}, affecting ${affectedPreOrders.length} pre-orders`);

    res.json({
      message: "Menu item updated successfully",
      updatedMenuItem,
      affectedPreOrdersCount: affectedPreOrders.length,
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ error: "Failed to update menu item" });
  }
});

//delete menu - admin only
app.delete("/menu/:id", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { id } = req.params;

    await prisma.$transaction([
      prisma.preOrderMenuItem.deleteMany({ where: { menuItemId: id } }), // Remove item from pre-orders
      prisma.menuItem.delete({ where: { id } }), // Delete menu item
    ]);

    res.json({ message: "Menu item and related pre-orders updated successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
});

// ✅ Place a pre-order
app.post("/preorder", authenticateUser, async (req, res) => {
  try {

    const{arrivalTime, totalAmount, menuItems} = req.body;
    const {userId, name:userName, email:userEmail, phone:userPhone} = req.user;
    console.log("User", req.user);
    console.log("body", req.body);
    
    
    if(!userId){
      return res.status(400).json({ error: "User ID is missing. Check authentication." });
    }
    if (!menuItems || !Array.isArray(menuItems) || menuItems.some(item => !item.menuItemId || !item.quantity)) {
      return res.status(400).json({ error: "Invalid menu items data. Ensure each item has a menuItemId and quantity." });
    }
    const amount = Math.round(totalAmount * 0.4 * 100); // Convert to paise (Razorpay's smallest currency unit)
    const options = {
      amount,
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order:", order);
    

    res.json({ 
      success: true, 
      order, 
      userData: { userId, userName, userEmail, userPhone, arrivalTime, totalAmount, menuItems }
    });

    // const newOrder = await prisma.preOrder.create({
    //   data:{
    //     userId,
    //     userName,
    //     userEmail,
    //     userPhone,
    //     arrivalTime:new Date(arrivalTime),
    //     totalAmount,
    //     status: "pending",
    //     menuItems:{
    //       create: menuItems.map(({menuItemId, quantity}) => ({
    //         menuItem: { connect: { id: menuItemId } },
    //         quantity: quantity || 1, // Default to 1 if not provided
    //       })),
          
    //     },
        
    //   }
    // });
    // res.json(newOrder);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to create pre-order" });
  }
});

// app.post("/verify-payment", authenticateUser, async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData } = req.body;
//     console.log("response", req.body);
//     const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const generatedSignature = hmac.digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Payment verification failed" });
//     }

//     console.log("user", req.user);
    

//     // Ensure the request is being made by the authenticated user
//     if (req.user.userId !== userData.userId) {
//       return res.status(403).json({ error: "Unauthorized user" });
//     }

//     console.log("🔹 Authenticated User:", req.user);
//     console.log("🔹 Payment User:", userData);

//     // Store preorder in the database after payment success
//     const preorder = await prisma.preOrder.create({
//       data: {
//         user: { connect: { id: req.user.userId } },
//         userId: req.user.id, // Ensure it's the authenticated user
//         userName: req.user.name,
//         userEmail: req.user.email,
//         userPhone: req.user.phone,
//         arrivalTime: new Date(userData.arrivalTime),
//         totalAmount: userData.totalAmount,
//         paidAmount: userData.totalAmount * 0.4, // Assuming 40% is paid upfront
//         status: "pending",
//         menuItems: {
//           create: userData.menuItems.map(item => ({
//             menuItem: { connect: { id: item.menuItemId } },
//             quantity: item.quantity || 1,
//           })),
//         },
//       },
//     });
//     await prisma.payment.create({
//       data: {
//         preOrderId: preorder.id,
//         paymentId: razorpay_payment_id,
//         amountPaid: userData.totalAmount * 0.4, // Store only 40%
//         status: "captured",
//       },
//     });

//     res.json({ success: true, preorder });

    

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to verify payment and store preorder" });
//   }
// });


app.post("/verify-payment", authenticateUser, async (req, res) => {
  try {
    console.log("in verify-payment route");
    
    console.log("user", req.user);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userData } = req.body;

    // Verify Razorpay signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Ensure authenticated user matches the order user
    if (req.user.userId !== userData.userId) {
      return res.status(403).json({ error: "Unauthorized user" });
    }

    // Store payment details
    const preorder = await prisma.preOrder.create({
      data: {
        user: { connect: { id: req.user.userId } },
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        userPhone: req.user.phone,
        arrivalTime: new Date(userData.arrivalTime),
        totalAmount: userData.totalAmount,
        paidAmount: userData.totalAmount * 0.4, // 40% Advance Payment
        status: "pending",
        menuItems: {
          create: userData.menuItems.map(item => ({
            menuItem: { connect: { id: item.menuItemId } },
            quantity: item.quantity || 1,
          })),
        },
        payment: {
          create: {
            paymentId: razorpay_payment_id,
            amountPaid: userData.totalAmount * 0.4,
            status: "captured",
          },
        },
      },
    });

    res.json({ success: true, preorder });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify payment and store preorder" });
  }
});


//delete preorder - user
app.delete("/preorder/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    console.log("User", req.user);

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing. Check authentication." });
    }

    const existingOrder = await prisma.preOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "Pre-order not found" });
    }

    if (existingOrder.userId !== userId) {
      return res.status(403).json({ error: "Access denied. You can only delete your own pre-orders." });
    }
    if (existingOrder.status.toLowerCase() !== "pending") {
      return res.status(403).json({ error: "Only pending pre-orders can be deleted." });
    }

    // Delete the pre-order
    await prisma.preOrder.delete({
      where: { id },
    });

    res.json({ message: "Pre-order deleted successfully" });
  } catch (error) {
    console.error("Error deleting pre-order:", error);
    res.status(500).json({ error: "Failed to delete pre-order" });
  }
});


// ✅ Get all pre-orders (Admin only)
app.get("/admin/preorders", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const preOrders = await prisma.preOrder.findMany({
      include: {
        menuItems: { include: { menuItem: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        payment: true,
        refund: true,
      },
    });
    const formattedPreOrders = preOrders.map((order) => ({
      ...order,
      amountPaid: order.paidAmount || 0, // If `amountPaid` is missing, default to 0
    }));

    res.json(formattedPreOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pre-orders" });
  }
});

// ✅ Update pre-order status (Admin only)
// app.put("/admin/preorder/:id/status", authenticateUser, async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ error: "Access denied. Admins only." });
//     }
//     const { id } = req.params;    
//     let { status } = req.body;
//     status = status.toLowerCase();
//     if (!["accepted", "rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status" });
//     }
//     const preOrder = await prisma.preOrder.findUnique({
//       where: { id },
//       include: { user: true,
//         menuItems: { include: { menuItem: true } },
//        }, 
//     });

//     if (!preOrder) {
//       return res.status(404).json({ error: "Pre-order not found" });
//     }
//     const orderedItems = preOrder.menuItems.map(
//       item => `- ${item.menuItem.name} (x${item.quantity})`
//     ).join("\n");
//     const updatedPreOrder = await prisma.preOrder.update({
//       where: { id },
//       data: { status },
//     });    
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: preOrder.user.email, 
//       subject: `Your Pre-Order has been ${status.toUpperCase()}`,
//       text: `Hello ${preOrder.user.name},\n\n`
//           + `Your pre-order has been ${status.toUpperCase()}.\n\n`
//           + `📌 ***Ordered Items:***\n${orderedItems}\n\n`
//           + `Thank you for using our service!\n\n`
//           + `- The Restaurant Team`,
//     };
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error("Error sending email:", error);
//       } else {
//         console.log("Email sent: " + info.response);
//       }
//     });
//     res.json({ message: `Pre-order ${status}`, preOrder: updatedPreOrder });
//   } catch (error) {
//     if (error.code === "P2025") {
//       return res.status(404).json({ error: "Pre-order not found" });
//     }
//     console.error("Error updating pre-order status:", error);
//     res.status(500).json({ error: "Failed to update pre-order status" });
//   }
// });


// app.put("/admin/preorder/:id/status", authenticateUser, async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ error: "Access denied. Admins only." });
//     }
//
//     const { id } = req.params;
//     // console.log("Admin status", req.body);
//
//     let { status } = req.body;
//     status = status.toLowerCase(); // Normalize to lowercase
//
//     if (!["accepted", "rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status" });
//     }
//
//     // Fetch pre-order details (including payment)
//     const preOrder = await prisma.preOrder.findUnique({
//       where: { id },
//       include: { payment: true, user: true, menuItems: { include: { menuItem: true } } },
//     });
//
//     if (!preOrder) {
//       return res.status(404).json({ error: "Pre-order not found" });
//     }
//
//     const orderedItems = preOrder.menuItems.map(
//       item => `- ${item.menuItem.name} (x${item.quantity})`
//     ).join("\n");
//
//     let emailText = `Hello ${preOrder.user.name},\n\nYour pre-order has been ${status.toUpperCase()}.\n\n`
//       + `📌 ***Ordered Items:***\n${orderedItems}\n\n`;
//
//     if (status === "rejected") {
//       // ✅ If rejected, initiate refund
//       if (!preOrder.payment) {
//         return res.status(400).json({ error: "No payment found for this order." });
//       }
//
//       const razorpay = new Razorpay({
//         key_id: process.env.RAZORPAY_KEY_ID,
//         key_secret: process.env.RAZORPAY_KEY_SECRET,
//       });
//
//       try {
//         // ✅ Process Refund via Razorpay API
//         const refund = await razorpay.payments.refund(preOrder.payment.paymentId, {
//           amount: preOrder.payment.amountPaid * 100, // Convert to paise
//           speed: "optimum",
//         });
//
//         // ✅ Save refund details in DB
//         await prisma.refund.create({
//           data: {
//             preOrderId: preOrder.id,
//             paymentId: preOrder.payment.paymentId,
//             refundId: refund.id,
//             amountRefunded: preOrder.payment.amountPaid,
//             status: "processed",
//           },
//         });
//
//         console.log("Refund Successful:", refund);
//         emailText += "💰 Your payment has been refunded successfully.\n\n";
//       } catch (refundError) {
//         console.error("Refund Failed:", refundError);
//         return res.status(500).json({ error: "Refund processing failed." });
//       }
//     }
//
//     // ✅ Update pre-order status
//     const updatedPreOrder = await prisma.preOrder.update({
//       where: { id },
//       data: { status },
//     });
//
//     emailText += "Thank you for using our service!\n\n- The Restaurant Team";
//
//     // ✅ Send Email Notification (Updated)
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: preOrder.user.email,
//       subject: `Your Pre-Order has been ${status.toUpperCase()}`,
//       text: emailText,
//     };
//
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error("Error sending email:", error);
//       } else {
//         console.log("Email sent: " + info.response);
//       }
//     });
//
//     res.json({ message: `Pre-order ${status}`, preOrder: updatedPreOrder });
//
//   } catch (error) {
//     if (error.code === "P2025") {
//       return res.status(404).json({ error: "Pre-order not found" });
//     }
//     console.error("Error updating pre-order status:", error);
//     res.status(500).json({ error: "Failed to update pre-order status" });
//   }
// });
//
//
app.put("/admin/preorder/:id/status", authenticateUser, async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { id } = req.params;
    let { status, reason } = req.body;
    status = status.toLowerCase();

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const preOrder = await prisma.preOrder.findUnique({
      where: { id },
      include: {
        payment: true,
        user: true,
        menuItems: { include: { menuItem: true } },
      },
    });

    if (!preOrder) {
      return res.status(404).json({ error: "Pre-order not found" });
    }

    const orderedItems = preOrder.menuItems
        .map(item => `- ${item.menuItem.name} (x${item.quantity})`)
        .join("\n");

    let emailText = `Hello ${preOrder.user.name},\n\nYour pre-order has been ${status.toUpperCase()}.\n\n` +
        `📌 ***Ordered Items:***\n${orderedItems}\n\n`;

    // If rejected
    if (status === "rejected") {
      // If payment exists, process refund
      if (!preOrder.payment) {
        return res.status(400).json({ error: "No payment found for this order." });
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      try {
        const refund = await razorpay.payments.refund(preOrder.payment.paymentId, {
          amount: preOrder.payment.amountPaid * 100,
          speed: "optimum",
        });
        console.log(preOrder.payment)

        await prisma.refund.create({
          data: {
            preOrderId: preOrder.id,
            paymentId: preOrder.payment.paymentId,
            refundId: refund.id,
            amountRefunded: preOrder.payment.amountPaid,
            status: "processed",
          },
        });

        console.log("Refund Successful:", refund);
        emailText += `💬 Rejection Reason: ${reason || "Not specified"}\n\n`;
        emailText += "💰 Your payment has been refunded successfully.\n\n";
      } catch (refundError) {
        console.error("Refund Failed:", refundError);
        return res.status(500).json({ error: "Refund processing failed." });
      }
    }

    // Update the status
    const updatedPreOrder = await prisma.preOrder.update({
      where: { id },
      data: { status,
        ...(status === "rejected" && reason ? { reason } : {}), },
    });

    emailText += "Thank you for using our service!\n\n- The Restaurant Team";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: preOrder.user.email,
      subject: `Your Pre-Order has been ${status.toUpperCase()}`,
      text: emailText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    res.json({ message: `Pre-order ${status}`, preOrder: updatedPreOrder });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Pre-order not found" });
    }
    console.error("Error updating pre-order status:", error);
    res.status(500).json({ error: "Failed to update pre-order status" });
  }
});

// ✅ Cancel a pre-order after acceptance (partial refund of 20%)
app.delete("/cancel-preorder/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is missing." });
    }

    const preOrder = await prisma.preOrder.findUnique({
      where: { id },
      include: { payment: true, user: true },
    });

    if (!preOrder) {
      return res.status(404).json({ error: "Pre-order not found" });
    }

    if (preOrder.userId !== userId) {
      return res.status(403).json({ error: "Access denied. You can only cancel your own pre-orders." });
    }

    if (preOrder.status !== "accepted") {
      return res.status(403).json({ error: "Only accepted pre-orders can be cancelled." });
    }

    // ✅ Calculate refund: 20% of totalAmount
    const partialRefundAmount = Math.round(preOrder.totalAmount * 0.2 * 100); // in paise

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // ✅ Process refund
    const refund = await razorpay.payments.refund(preOrder.payment.paymentId, {
      amount: partialRefundAmount,
      speed: "optimum",
    });

    // ✅ Save refund info
    await prisma.refund.create({
      data: {
        preOrderId: preOrder.id,
        paymentId: preOrder.payment.paymentId,
        refundId: refund.id,
        amountRefunded: partialRefundAmount / 100,
        status: "processed",
      },
    });

    // ✅ Update status to 'cancelled'
    await prisma.preOrder.update({
      where: { id },
      data: { status: "cancelled" },
    });

    // ✅ Send cancellation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: preOrder.user.email,
      subject: `Your Pre-Order has been CANCELLED` ,
      text: `Hello ${preOrder.user.name},\n\nYour accepted pre-order has been cancelled as per your request.\n\n💰 A partial refund of ₹${partialRefundAmount / 100} (50% of paid amount) has been processed.\n\nThank you for using our service.\n\n- The Restaurant Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending cancellation email:", error);
      } else {
        console.log("Cancellation email sent:", info.response);
      }
    });

    res.json({ success: true, message: "Pre-order cancelled and partial refund issued." });
  } catch (error) {
    console.error("Cancellation failed:", error);
    res.status(500).json({ error: "Failed to cancel pre-order" });
  }
});


// ✅ Get user's pre-orders
app.get("/my-preorders", authenticateUser, async (req, res) => {
  try {
    const preOrders = await prisma.preOrder.findMany({
      where: { userId: req.user.userId },
      include: { menuItems: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(preOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pre-orders" });
  }
});

// ✅ User Signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || "user", // Default role
      },
    });

    res.json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });
    // const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("Logged in user: ", user);
    
    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ message: "Login successful", token, user:{name: user.name, email: user.email, phone: user.phone, role: user.role} });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// get all users (admin-only)

app.get("/admin/users", authenticateUser, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true, // Include role to check if admin
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.delete("/admin/users/:id", authenticateUser, async (req, res) => {
  const {id} = req.params;
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    console.log(user);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
