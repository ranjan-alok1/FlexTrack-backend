const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Blog title is required"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Blog content is required"],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        likes: {
            type: Number,
            default: 0,
        },
        comments: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
            text: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "published",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Add any virtual fields if needed
blogSchema.virtual('excerpt').get(function () {
    return this.content.substring(0, 200) + '...';
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog; 