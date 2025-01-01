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
app.options("*", cors()); // Handle preflight requests globally

app.use(express.json({ limit: "50mb" })); // Allow JSON payloads up to 50MB
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/blogs", blogRoutes);

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    console.error(`[Error] ${status} - ${message}`.red);
    res.status(status).json({
        success: false,
        status,
        message,
    });
});

// Port
const PORT = process.env.PORT || 8080;

// Start Server
const startServer = async () => {
    try {
        await connectDb(); 
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`.green.bold);
        });
    } catch (error) {
        console.error(`Error while starting server: ${error.message}`.red.bold);
        process.exit(1);
    }
};

startServer();
