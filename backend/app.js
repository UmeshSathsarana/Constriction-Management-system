// app.js or server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

// Import all routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./Routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const clientRoutes = require("./routes/clientRoutes"); // [[12]]
const materialRoutes = require("./routes/materialRoutes"); // [[13]]
const equipmentRoutes = require("./routes/equipmentRoutes"); // [[15]]

const progressRoutes = require("./routes/progressRoutes"); // [[16]]
const reportRoutes = require("./Routes/reportRoutes");
const adminRoutes = require("./Routes/admin");

const app = express();
const server = http.createServer(app);

// Set view engine
app.set("view engine", "ejs");
app.set("views", "./views");
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Make io accessible to routes
app.set("io", io);

// Middleware with increased payload limits
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Serve static files
app.use(express.static("public"));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user to their role-based room
  socket.on("join-role", (role) => {
    socket.join(role);
    console.log(`User joined ${role} room`);
  });

  // Join user to project-specific room
  socket.on("join-project", (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User joined project-${projectId} room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routes
app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/clients", clientRoutes);
app.use("/materials", materialRoutes);
app.use("/equipment", equipmentRoutes);
app.use("/equimpent", equipmentRoutes); // For typo compatibility

app.use("/progress", progressRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);
app.use("/getActiveProjects", projectRoutes);

// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb+srv://admin:IKVol2cBZr02I2Xn@cluster0.lv5lnin.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    // Only start server if this file is run directly (not when required as module)
    if (require.main === module) {
      server.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`📍 Login endpoint: http://localhost:${PORT}/login`);
        console.log(`🔌 Socket.IO enabled for real-time updates`);
      });
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
