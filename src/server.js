const express = require("express");
const cors = require("cors");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDb = require("./config/connectDb");
const userRoutes = require("./routes/userRoute");
const blogRoutes = require("./routes/blogRoute");


//config dot env file
dotenv.config();


//rest object
const app = express();

//middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true })); // for form data



//routes
// user routes
app.use('/api/v1/users', userRoutes); // Corrected path
app.use("/api/v1/blogs", blogRoutes);

// error handler
app.use((err, req, res) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    return res.status(status).json({
        success: false,
        status,
        message,
    });
});

//ports
const PORT = 8080 || process.env.PORT;

//listen
const startServer = async () => {
    try {
        //database call
        connectDb();
        app.listen(PORT, () => {
            console.log(`listening on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();
