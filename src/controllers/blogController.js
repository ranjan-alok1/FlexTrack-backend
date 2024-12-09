// controllers/blogController.js
const Blog = require("../models/blogModel");
const createError = require("../error");

// Create a new blog
const createBlog = async (req, res, next) => {
    try {
        const { title, content, tags } = req.body;

        if (!title || !content) {
            return next(createError(400, "Title and content are required"));
        }

        const blog = new Blog({
            title,
            content,
            tags,
            author: req.user.id, // From token middleware
        });

        const savedBlog = await blog.save();

        return res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog: savedBlog,
        });
    } catch (err) {
        next(err);
    }
};

// Get all blogs
const getAllBlogs = async (req, res, next) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name email img") // Populate author details
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            blogs,
        });
    } catch (err) {
        next(err);
    }
};

// // Get a blog by ID
// const getBlogById = async (req, res, next) => {
//     try {
//         const blogId = req.params.id;

//         const blog = await Blog.findById(blogId).populate("author", "name email img");

//         if (!blog) {
//             return next(createError(404, "Blog not found"));
//         }

//         return res.status(200).json({
//             success: true,
//             blog,
//         });
//     } catch (err) {
//         next(err);
//     }
// };

module.exports = {
    createBlog,
    getAllBlogs,
    // getBlogById,
};
