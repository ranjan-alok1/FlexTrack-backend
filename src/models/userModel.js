const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "name is required"],
        },
        email: {
            type: String,
            required: [true, "email is required and should be unique"],
            unique: true,
        },
        img: {
            type: String,
            default: null,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
    },
    { timestamps: true }
);

//export
const userModel = mongoose.model("users", userSchema);
module.exports = userModel; 