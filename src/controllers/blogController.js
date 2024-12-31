const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const createError = require("../error");

// Get all blogs
const getAllBlogs = async (req, res, next) => {
    try {
        const blogs = await Blog.find()
            .select('title content createdAt')  // Select specific fields
            .populate('author', 'name email')   // Populate only needed user fields
            .sort({ createdAt: -1 })
            .lean();

        // Transform the data to handle missing authors
        const formattedBlogs = blogs.map(blog => ({
            _id: blog._id,
            title: blog.title,
            content: blog.content,
            createdAt: blog.createdAt,
            author: blog.author || { name: 'Anonymous' }
        }));

        return res.status(200).json({
            success: true,
            blogs: formattedBlogs,
        });
    } catch (err) {
        console.error('Error in getAllBlogs:', err);
        return res.status(500).json({
            success: false,
            message: "Error fetching blogs",
            error: err.message
        });
    }
};

// Create a new blog
const createBlog = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return next(createError(400, "Title and content are required"));
        }

        // Create new blog
        const blog = new Blog({
            title,
            content,
            author: req.user.id,  // From verifyToken middleware
        });

        const savedBlog = await blog.save();

        // Populate author details before sending response
        const populatedBlog = await Blog.findById(savedBlog._id)
            .populate('author', 'name email')
            .lean();

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog: populatedBlog,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createBlog,
    getAllBlogs,
}; 