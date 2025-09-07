// routes/authRoutes.js
const express = require("express");
const { userLogin, adminLogin } = require("../controllers/authController");
const router = express.Router();

router.post("/login", userLogin); // Generic login for all users
router.post("/admin/login", adminLogin); // Keep admin login for backward compatibility

module.exports = router;
