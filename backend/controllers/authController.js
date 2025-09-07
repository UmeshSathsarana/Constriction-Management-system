// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Client = require("../models/Client");

// Generic login for ALL users (Admin, PM, Supervisor, Inventory Manager)
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in database
    let user = await User.findOne({ email });
    let client = null;

    // If no user found, check if it's a client
    if (!user) {
      client = await Client.findOne({ email });
    }

    // If no user or client found, check hardcoded credentials
    if (!user && !client) {
      const hardcodedUsers = [
        {
          email: "admin@gmail.com",
          password: "admin",
          name: "System Admin",
          role: "Admin",
        },
        {
          email: "pm@test.com",
          password: "pm123",
          name: "Project Manager",
          role: "Project Manager",
        },
        {
          email: "supervisor@test.com",
          password: "super123",
          name: "Site Supervisor",
          role: "Site Supervisor",
        },
        {
          email: "inventory@test.com",
          password: "inv123",
          name: "Inventory Manager",
          role: "Inventory Manager",
        },
      ];

      const hardcodedUser = hardcodedUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (hardcodedUser) {
        const token = jwt.sign(
          {
            userId: `hardcoded-${hardcodedUser.role}`,
            role: hardcodedUser.role,
            name: hardcodedUser.name,
          },
          process.env.JWT_SECRET || "yoursecretkey",
          { expiresIn: "1d" }
        );

        return res.json({
          token,
          user: {
            name: hardcodedUser.name,
            email: hardcodedUser.email,
            role: hardcodedUser.role,
          },
        });
      }

      return res.status(401).json({ message: "Invalid email or password" });
    }

    let isMatch = false;
    let authenticatedUser = null;
    let userRole = "";

    if (user) {
      // Check password for database user
      isMatch = await bcrypt.compare(password, user.password);
      authenticatedUser = user;
      userRole = user.role;
    } else if (client) {
      // Check password for client
      isMatch = await bcrypt.compare(password, client.password);
      authenticatedUser = client;
      userRole = "Client";
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: authenticatedUser._id,
        role: userRole,
        name: authenticatedUser.name,
      },
      process.env.JWT_SECRET || "yoursecretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: authenticatedUser._id,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
        role: userRole,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Keep existing adminLogin for backward compatibility
exports.adminLogin = async (req, res) => {
  // Your existing adminLogin code here
  const { email, password } = req.body;
  const hardcodedAdmin = {
    email: "admin@gmail.com",
    password: "admin",
    name: "Hardcoded Admin",
    role: "Admin",
  };

  try {
    let user = await User.findOne({ email, role: "Admin" });
    if (!user) {
      if (
        email === hardcodedAdmin.email &&
        password === hardcodedAdmin.password
      ) {
        const token = jwt.sign(
          {
            userId: "hardcoded-admin-id",
            role: hardcodedAdmin.role,
            name: hardcodedAdmin.name,
          },
          process.env.JWT_SECRET || "yoursecretkey",
          { expiresIn: "1d" }
        );
        return res.json({
          token,
          user: {
            name: hardcodedAdmin.name,
            email: hardcodedAdmin.email,
            role: hardcodedAdmin.role,
          },
        });
      }
      return res
        .status(401)
        .json({ message: "Invalid credentials or not an admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || "yoursecretkey",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
