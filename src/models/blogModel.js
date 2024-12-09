// models/blogModel.js
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: [String],
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
