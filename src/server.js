const express = require("express");
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDb = require("./config/connectDb");
const userRoutes = require("./routes/userRoute");
const blogRoutes = require("./routes/blogRoute");

dotenv.config();

const app = express();

// Middleware
app.use(
    cors({
        origin: ["http://localhost:3000", "https://flex-track-frontend.vercel.app"], 
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true, 
    })
);

app.use(express.json({ limit: "50mb" })); // Allow JSON parsing with size limits
app.use(express.urlencoded({ extended: true })); // Allow form data

// Routes
// User routes
app.use("/api/v1/users", userRoutes);

// Blog routes
app.use("/api/v1/blogs", blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        success: false,
        status,
        message,
    });
});

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    try {
        // Connect to the database
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`.green);
        });
    } catch (error) {
        console.error(`Error while starting server: ${error.message}`.red);
    }
};

startServer();
