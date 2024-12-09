// routes/blogRoute.js
const express = require("express");
const { createBlog, getAllBlogs } = require("../controllers/blogController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Protected route: Create a new blog
router.post("/", verifyToken, createBlog);

// Public route: Get all blogs
router.get("/", getAllBlogs);


module.exports = router;
